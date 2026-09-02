import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { ProtocolService } from '../services/protocolService';
import { useProfileStore } from '../store/useProfileStore';

/**
 * Tormenta de peticiones contra un backend caído.
 *
 * Con `mobile-profile-v1` devolviendo 500, cada pantalla que montaba volvía a
 * preguntar: moverse entre la Guía y Alimentación disparaba una petición por
 * navegación, y varias pantallas pedían el perfil a la vez. El paciente no
 * ganaba nada y el servidor recibía una tormenta justo cuando peor estaba.
 *
 * Estos tests fijan las dos reglas que lo cortan: una sola petición en vuelo, y
 * una pausa tras el fallo.
 */

let peticiones = 0;

const server = setupServer(
    http.get('*/mobile-profile-v1', () => {
        peticiones++;
        return new HttpResponse(JSON.stringify({ error: 'boom' }), { status: 500 });
    }),
);

beforeAll(() => server.listen());
afterEach(() => {
    server.resetHandlers();
    peticiones = 0;
    ProtocolService.clearCache(); // reinicia también la pausa
    useProfileStore.setState({ profileData: null });
    vi.useRealTimers();
});
afterAll(() => server.close());

describe('getMyProfile — no repetir contra un backend caído', () => {
    it('varias llamadas simultáneas comparten una sola petición', async () => {
        const [a, b, c] = await Promise.all([
            ProtocolService.getMyProfile(),
            ProtocolService.getMyProfile(),
            ProtocolService.getMyProfile(),
        ]);

        expect(peticiones).toBe(1);
        expect(a).toBeNull();
        expect(b).toBeNull();
        expect(c).toBeNull();
    });

    it('tras un fallo no se vuelve a preguntar de inmediato', async () => {
        await ProtocolService.getMyProfile();
        expect(peticiones).toBe(1);

        // Equivale a navegar entre la Guía y Alimentación varias veces.
        for (let i = 0; i < 5; i++) {
            expect(await ProtocolService.getMyProfile()).toBeNull();
        }

        expect(peticiones).toBe(1);
    });

    it('pasada la pausa vuelve a intentarlo: no se queda clavado', async () => {
        await ProtocolService.getMyProfile();
        expect(peticiones).toBe(1);

        vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 31_000);
        await ProtocolService.getMyProfile();

        expect(peticiones).toBe(2);
    });

    it('un backend sano no queda afectado por la pausa', async () => {
        server.use(
            http.get('*/mobile-profile-v1', () => {
                peticiones++;
                return HttpResponse.json({ id: 'p1', firstName: 'Ana', chronologicalAge: 52 });
            }),
        );

        const perfil = await ProtocolService.getMyProfile();

        expect(peticiones).toBe(1);
        expect(perfil).not.toBeNull();
        expect(perfil.firstName).toBe('Ana');
    });

    it('el logout limpia la pausa: no la hereda el siguiente paciente', async () => {
        await ProtocolService.getMyProfile();
        expect(peticiones).toBe(1);

        ProtocolService.clearCache();
        await ProtocolService.getMyProfile();

        expect(peticiones).toBe(2);
    });
});
