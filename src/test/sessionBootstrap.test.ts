import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateStoredSession } from '../services/sessionBootstrap';
import { tokenStore } from '../services/tokenStore';

/**
 * P0 — Guard de sesión en arranque en frío.
 *
 * El estado persistido no es una credencial. Estos tests fijan la regla que
 * impedía el bypass: una sesión que no puede demostrarse con un refresh token
 * no autoriza nada, y el almacenamiento se limpia antes de que el router pueda
 * pintar una ruta protegida.
 */

const sesionPersistida = () => {
    localStorage.setItem(
        'auth-storage',
        JSON.stringify({
            state: {
                session: { id: 'p1', name: 'Ana X', role: 'PATIENT', lastLoginAt: new Date().toISOString() },
                isAuthenticated: true,
            },
            version: 0,
        }),
    );
    localStorage.setItem('rejuvenate_session_v1', JSON.stringify({ id: 'p1', name: 'Ana X' }));
};

const fetchOriginal = globalThis.fetch;

beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    tokenStore.clearAccessToken();
});

afterEach(() => {
    globalThis.fetch = fetchOriginal;
    vi.restoreAllMocks();
});

describe('validateStoredSession — arranque en frío', () => {
    it('sin sesión persistida es un arranque anónimo', async () => {
        expect(await validateStoredSession()).toBe('anonymous');
    });

    it('sesión huérfana (sin refresh token) se descarta sin tocar la red', async () => {
        sesionPersistida();
        let huboRed = false;
        globalThis.fetch = (async () => {
            huboRed = true;
            return new Response('{}', { status: 200 });
        }) as typeof fetch;

        expect(await validateStoredSession()).toBe('invalid');
        expect(huboRed).toBe(false);
        expect(localStorage.getItem('rejuvenate_session_v1')).toBeNull();
        expect(localStorage.getItem('auth-storage')).toBeNull();
    });

    it.each([401, 403])(
        'el servidor rechaza el refresh (%i) → sesión descartada',
        async (status) => {
            sesionPersistida();
            localStorage.setItem('refresh_token', 'caducado');
            globalThis.fetch = (async () => new Response('{}', { status })) as typeof fetch;

            expect(await validateStoredSession()).toBe('invalid');
            expect(localStorage.getItem('refresh_token')).toBeNull();
            expect(tokenStore.getAccessToken()).toBeNull();
        },
    );

    it('refresh válido reanuda la sesión y rota el token', async () => {
        sesionPersistida();
        localStorage.setItem('refresh_token', 'valido');
        globalThis.fetch = (async () =>
            new Response(JSON.stringify({ accessToken: 'at-fresco', refreshToken: 'rt-rotado' }), {
                status: 200,
            })) as typeof fetch;

        expect(await validateStoredSession()).toBe('valid');
        expect(tokenStore.getAccessToken()).toBe('at-fresco');
        expect(localStorage.getItem('refresh_token')).toBe('rt-rotado');
    });

    // Una caída del backend no es una afirmación sobre esta sesión concreta.
    // Cerrarla dejaría al paciente fuera de su tratamiento por un fallo ajeno,
    // y la app es una PWA: funcionar sin red es una capacidad buscada.
    it('sin respuesta del servidor la sesión se conserva, sin token', async () => {
        sesionPersistida();
        localStorage.setItem('refresh_token', 'valido');
        globalThis.fetch = (async () => {
            throw new TypeError('Failed to fetch');
        }) as typeof fetch;

        expect(await validateStoredSession()).toBe('unverified');
        expect(localStorage.getItem('refresh_token')).toBe('valido');
        expect(tokenStore.getAccessToken()).toBeNull();
    });

    it.each([500, 404])('un error de servidor (%i) no cierra la sesión', async (status) => {
        sesionPersistida();
        localStorage.setItem('refresh_token', 'valido');
        globalThis.fetch = (async () => new Response('{}', { status })) as typeof fetch;

        expect(await validateStoredSession()).toBe('unverified');
        expect(localStorage.getItem('refresh_token')).toBe('valido');
    });

    it('un refresh 200 sin accessToken no vale como sesión', async () => {
        sesionPersistida();
        localStorage.setItem('refresh_token', 'valido');
        globalThis.fetch = (async () =>
            new Response(JSON.stringify({ ok: true }), { status: 200 })) as typeof fetch;

        expect(await validateStoredSession()).toBe('invalid');
        expect(localStorage.getItem('refresh_token')).toBeNull();
    });

    it('un auth-storage corrupto no autoriza nada', async () => {
        localStorage.setItem('auth-storage', '{{{no es json');
        expect(await validateStoredSession()).toBe('anonymous');
    });
});
