import { describe, it, expect, afterEach } from 'vitest';
import { clearPatientScopedStorage } from '../utils/storageCleanup';

/**
 * Fuga de PII en logout.
 *
 * `da_pending_leads` guarda nombre y correo de leads en texto plano y NO se
 * borraba al cerrar sesión: la lista de claves era manual y se quedó en la
 * generación anterior de marca. En un dispositivo compartido, el PII de un
 * paciente quedaba al alcance del siguiente.
 */

afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
});

describe('clearPatientScopedStorage', () => {
    it('borra las tres generaciones de claves de marca', () => {
        localStorage.setItem('rejuvenate_favorite_foods', 'x');   // Gen 1
        localStorage.setItem('vytalix-funnel-v2', 'x');           // Gen 2
        localStorage.setItem('vx_lead_email', 'x');               // Gen 2
        localStorage.setItem('da_streak_v1', 'x');                // Gen 3

        clearPatientScopedStorage();

        expect(localStorage.getItem('rejuvenate_favorite_foods')).toBeNull();
        expect(localStorage.getItem('vytalix-funnel-v2')).toBeNull();
        expect(localStorage.getItem('vx_lead_email')).toBeNull();
        expect(localStorage.getItem('da_streak_v1')).toBeNull();
    });

    it('borra da_pending_leads, que contiene nombre y correo en texto plano', () => {
        localStorage.setItem(
            'da_pending_leads',
            JSON.stringify([{ name: 'Paciente Uno', email: 'paciente@ejemplo.com' }]),
        );

        clearPatientScopedStorage();

        expect(localStorage.getItem('da_pending_leads')).toBeNull();
        expect(JSON.stringify(localStorage)).not.toContain('paciente@ejemplo.com');
    });

    it('borra las claves de sesión y token que no siguen convención de prefijo', () => {
        localStorage.setItem('auth-storage', 'x');
        localStorage.setItem('profile-storage', 'x');
        localStorage.setItem('refresh_token', 'x');
        localStorage.setItem('auth_token', 'x');

        clearPatientScopedStorage();

        expect(localStorage.getItem('auth-storage')).toBeNull();
        expect(localStorage.getItem('profile-storage')).toBeNull();
        expect(localStorage.getItem('refresh_token')).toBeNull();
        expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('conserva las preferencias de interfaz (no son PII)', () => {
        localStorage.setItem('ui-storage', '{"theme":"dark"}');

        clearPatientScopedStorage();

        expect(localStorage.getItem('ui-storage')).toBe('{"theme":"dark"}');
    });

    it('vacía sessionStorage por completo', () => {
        sessionStorage.setItem('vx_test_result', 'x');
        sessionStorage.setItem('rejuvenate_protocol_cache', 'x');

        clearPatientScopedStorage();

        expect(sessionStorage.length).toBe(0);
    });

    it('elimina todas las claves aunque haya varias consecutivas', () => {
        // Guarda contra el bug clásico de mutar localStorage mientras se
        // itera por índice: las claves se desplazan y algunas sobreviven.
        for (let i = 0; i < 10; i += 1) localStorage.setItem(`da_item_${i}`, 'x');

        const removed = clearPatientScopedStorage();

        expect(removed).toBe(10);
        expect(localStorage.length).toBe(0);
    });
});
