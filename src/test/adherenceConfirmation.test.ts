import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { ProtocolService } from '../services/protocolService';
import { offlineQueue } from '../services/offlineQueue';

/**
 * P1-1 — La adherencia nunca puede reportar éxito si el backend no confirmó.
 *
 * El defecto original: el `catch` encolaba y hacía `return true`. Como
 * `/protocols/{id}/status` no existe en el backend, cada intento devolvía 404,
 * se encolaba, y el paciente veía un check confirmado por un registro que
 * nadie iba a guardar y que la cola descartaba en silencio tras 3 reintentos.
 *
 * Solo `confirmed` autoriza a presentar la marca como registrada.
 */

const SESSION_KEY = 'rejuvenate_session_v1';
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
beforeEach(() => {
    localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ id: 'p1', name: 'Test', role: 'PATIENT' }),
    );
});
afterEach(async () => {
    server.resetHandlers();
    localStorage.clear();
    sessionStorage.clear();
    for (const item of await offlineQueue.dequeueAll()) {
        if (item.id) await offlineQueue.remove(item.id);
    }
});
afterAll(() => server.close());

const marcar = () => ProtocolService.updateItemStatus('p1', 'item-estable-1', 'completed');

describe('updateItemStatus — sin falsa confirmación', () => {
    it('2xx del backend → confirmed', async () => {
        server.use(
            http.patch('*/protocols/:id/status', () => new HttpResponse(null, { status: 200 })),
        );

        expect(await marcar()).toBe('confirmed');
    });

    it.each([400, 403, 404, 409, 500, 503])(
        'backend responde %i → NO es éxito',
        async (status) => {
            server.use(
                http.patch('*/protocols/:id/status', () => new HttpResponse(null, { status })),
            );

            const resultado = await marcar();

            expect(resultado).toBe('failed');
            expect(resultado).not.toBe('confirmed');
        },
    );

    // 401 es un caso aparte, y conviene dejarlo escrito: el interceptor de
    // apiClient lo captura para intentar refrescar el token y, al no haber
    // refresh token, rechaza con un Error plano SIN `.status`. Por eso aquí
    // llega como fallo de red y se reporta 'pending'. No es una falsa
    // confirmación —que es lo que este sprint debe impedir— pero el mensaje al
    // paciente habla de conexión cuando en realidad expiró la sesión.
    // Corregirlo exigiría tocar apiClient, que es dominio protegido.
    it('401 (sesión expirada) no confirma, aunque se reporte como pendiente', async () => {
        server.use(
            http.patch('*/protocols/:id/status', () => new HttpResponse(null, { status: 401 })),
        );

        expect(await marcar()).not.toBe('confirmed');
    });

    it('404 (el endpoint que hoy no existe) no encola ni confirma', async () => {
        server.use(
            http.patch('*/protocols/:id/status', () => new HttpResponse(null, { status: 404 })),
        );

        expect(await marcar()).toBe('failed');

        // Reintentar un 404 no lo arregla: no debe ocupar la cola.
        expect(await offlineQueue.count()).toBe(0);
    });

    it('error de red → pending, nunca confirmed', async () => {
        server.use(http.patch('*/protocols/:id/status', () => HttpResponse.error()));

        const resultado = await marcar();

        expect(resultado).toBe('pending');
        expect(resultado).not.toBe('confirmed');
    });

    it('sin conexión encola para reintentar, pero no lo presenta como registrado', async () => {
        server.use(http.patch('*/protocols/:id/status', () => HttpResponse.error()));

        expect(await marcar()).toBe('pending');
        expect(await offlineQueue.count()).toBe(1);
    });

    it('un ítem sin ID estable no puede sincronizar → failed', async () => {
        expect(
            await ProtocolService.updateItemStatus('p1', 'UNSTABLE_HASH_guide_123', 'completed'),
        ).toBe('failed');
    });

    it('ningún camino de fallo devuelve confirmed', async () => {
        const resultados: string[] = [];

        server.use(
            http.patch('*/protocols/:id/status', () => new HttpResponse(null, { status: 500 })),
        );
        resultados.push(await marcar());

        server.use(http.patch('*/protocols/:id/status', () => HttpResponse.error()));
        resultados.push(await marcar());

        resultados.push(
            await ProtocolService.updateItemStatus('p1', 'UNSTABLE_HASH_x', 'completed'),
        );

        expect(resultados).not.toContain('confirmed');
    });
});
