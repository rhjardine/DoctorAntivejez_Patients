import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import apiClient from '../services/apiClient';
import { tokenStore } from '../services/tokenStore';

/**
 * R-P0-2 — El access token debe vivir SOLO en memoria (tokenStore).
 *
 * Estos tests son guardas de regresión: la escritura del token en
 * localStorage ya se había introducido una vez en el interceptor de refresh,
 * dejando una sesión clínica activa al alcance de un XSS. Ver ADR-002.
 */

let capturedAuthHeader: string | null = null;

const server = setupServer(
    http.get('*/ping', ({ request }) => {
        capturedAuthHeader = request.headers.get('Authorization');
        return HttpResponse.json({ ok: true });
    }),
);

beforeAll(() => server.listen());
afterEach(() => {
    server.resetHandlers();
    localStorage.clear();
    sessionStorage.clear();
    tokenStore.clearAccessToken();
    capturedAuthHeader = null;
});
afterAll(() => server.close());

describe('apiClient — custodia del access token', () => {
    it('adjunta el token cuando está en memoria', async () => {
        tokenStore.setAccessToken('memory-token');

        await apiClient.get('/ping');

        expect(capturedAuthHeader).toBe('Bearer memory-token');
    });

    it('NO lee el token desde localStorage cuando la memoria está vacía', async () => {
        // Estado que dejaba la implementación anterior tras un refresh
        localStorage.setItem(
            'auth-storage',
            JSON.stringify({ state: { token: 'disk-token', isAuthenticated: true } }),
        );

        await apiClient.get('/ping');

        expect(capturedAuthHeader).toBeNull();
    });

    it('no deja el access token en localStorage tras adjuntarlo', async () => {
        tokenStore.setAccessToken('memory-token');

        await apiClient.get('/ping');

        const dump = JSON.stringify(localStorage);
        expect(dump).not.toContain('memory-token');
    });
});
