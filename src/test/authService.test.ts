import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { authService, tokenStore } from '../services/authService';

const server = setupServer(
    http.post('*/mobile-auth-v1', async ({ request }) => {
        const body = (await request.json()) as any;
        if (body.identification === '123' && body.password === 'pass') {
            return HttpResponse.json({
                token: 'test-token',
                refreshToken: 'test-refresh',
                patient: { id: 'p1', firstName: 'Test', lastName: 'User', email: 'test@test.com' }
            });
        }
        return new HttpResponse(JSON.stringify({ error: 'Credenciales inválidas' }), { status: 401 });
    }),
    // Mock profile fetch
    http.get('*/mobile-profile-v1', () => {
        return HttpResponse.json({ id: 'p1', firstName: 'Test' });
    })
);

beforeAll(() => server.listen());
afterEach(() => {
    server.resetHandlers();
    localStorage.clear();
});
afterAll(() => server.close());

describe('authService', () => {
    it('login exitoso almacena sesión en localStorage', async () => {
        await authService.login('123', 'pass');
        const session = localStorage.getItem('rejuvenate_session_v1');
        expect(session).not.toBeNull();
        expect(JSON.parse(session!).id).toBe('p1');
    });

    it('login exitoso retorna UserSession con los campos correctos', async () => {
        const session = await authService.login('123', 'pass');
        expect(session.name).toBe('Test User');
        expect(session.role).toBe('PATIENT');
    });

    it('login con credenciales incorrectas (401) lanza Error con mensaje amigable', async () => {
        await expect(authService.login('wrong', 'pass')).rejects.toThrow('Credenciales inválidas');
    });

    it('logout limpia todos los campos de localStorage relevantes', async () => {
        localStorage.setItem('rejuvenate_session_v1', '{}');
        localStorage.setItem('refresh_token', 'rt');
        authService.logout();
        expect(localStorage.getItem('rejuvenate_session_v1')).toBeNull();
        expect(localStorage.getItem('refresh_token')).toBeNull();
    });

    it('getCurrentUser retorna null si no hay sesión', () => {
        expect(authService.getCurrentUser()).toBeNull();
    });

    it('getCurrentUser retorna la sesión si existe en localStorage', () => {
        const mockSession = { id: 'p1', name: 'Test' };
        localStorage.setItem('rejuvenate_session_v1', JSON.stringify(mockSession));
        const user = authService.getCurrentUser();
        expect(user!.id).toBe('p1');
    });
});
