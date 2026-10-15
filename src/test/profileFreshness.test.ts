/**
 * Frescura del perfil clínico.
 *
 * El médico reportó que sus actualizaciones de la guía no llegaban al paciente.
 * Estas pruebas fijan la ventana durante la cual la PWA sirve datos ya
 * descargados sin volver a preguntar, para que nadie la alargue por descuido:
 * es el tiempo máximo que una indicación clínica puede tardar en verse.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useProfileStore } from '../store/useProfileStore';
import { describirFrescura } from '../components/PatientGuideView';

const perfil = (edad: number) => ({
    biologicalAge: edad,
    chronologicalAge: 86,
    guides: [],
    foodPlans: [],
    bloodType: 'A',
    latestNlr: null,
    fetchedAt: Date.now(),
});

beforeEach(() => {
    useProfileStore.getState().clearProfileData();
    vi.useRealTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

describe('ventana de frescura del perfil', () => {
    it('sin datos, el caché nunca es válido', () => {
        expect(useProfileStore.getState().isCacheValid()).toBe(false);
    });

    it('recién descargado, el caché es válido', () => {
        useProfileStore.getState().setProfileData(perfil(62));
        expect(useProfileStore.getState().isCacheValid()).toBe(true);
    });

    it('a los 59 s sigue siendo válido', () => {
        const ahora = Date.now();
        const reloj = vi.spyOn(Date, 'now');
        reloj.mockReturnValue(ahora);
        useProfileStore.getState().setProfileData(perfil(62));

        reloj.mockReturnValue(ahora + 59_000);
        expect(useProfileStore.getState().isCacheValid()).toBe(true);
        reloj.mockRestore();
    });

    it('pasados 60 s deja de ser válido: una actualización del médico no espera más', () => {
        const ahora = Date.now();
        const reloj = vi.spyOn(Date, 'now');
        reloj.mockReturnValue(ahora);
        useProfileStore.getState().setProfileData(perfil(62));

        reloj.mockReturnValue(ahora + 60_001);
        expect(useProfileStore.getState().isCacheValid()).toBe(false);
        reloj.mockRestore();
    });

    it('a los 2 minutos tampoco: la ventana de 5 min que ocultaba los cambios ya no existe', () => {
        const ahora = Date.now();
        const reloj = vi.spyOn(Date, 'now');
        reloj.mockReturnValue(ahora);
        useProfileStore.getState().setProfileData(perfil(62));

        reloj.mockReturnValue(ahora + 2 * 60_000);
        expect(useProfileStore.getState().isCacheValid()).toBe(false);
        reloj.mockRestore();
    });
});

describe('invalidación explícita', () => {
    it('el botón de recargar (forceRefresh) invalida el caché de inmediato', () => {
        useProfileStore.getState().setProfileData(perfil(62));
        expect(useProfileStore.getState().isCacheValid()).toBe(true);

        useProfileStore.getState().forceRefresh();
        expect(useProfileStore.getState().isCacheValid()).toBe(false);
        expect(useProfileStore.getState().profileData).toBeNull();
    });

    it('cerrar sesión deja el caché inválido para el siguiente paciente', () => {
        useProfileStore.getState().setProfileData(perfil(62));
        useProfileStore.getState().clearProfileData();

        expect(useProfileStore.getState().profileData).toBeNull();
        expect(useProfileStore.getState().isCacheValid()).toBe(false);
    });
});

/**
 * La cabecera de la guía decía «Sincronizado via Prisma»: el nombre del ORM
 * del backend, que no responde la única pregunta que el médico hace —«¿lo que
 * ve el paciente es lo último que indiqué?»—. Ahora muestra la antigüedad real
 * del plan, así que esa antigüedad tiene que contarse bien.
 */
describe('antigüedad visible del plan en la guía', () => {
    const ahora = new Date('2026-10-14T12:00:00Z').getTime();

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(ahora);
    });

    it('sin descarga previa no inventa una hora', () => {
        expect(describirFrescura(undefined)).toBe('Plan sin descargar');
        expect(describirFrescura(0)).toBe('Plan sin descargar');
    });

    it('recién descargado no dice «hace 0 min»', () => {
        expect(describirFrescura(ahora - 5_000)).toBe('Actualizado recién');
    });

    it('cuenta los minutos mientras caben en una hora', () => {
        expect(describirFrescura(ahora - 60_000)).toBe('Actualizado hace 1 min');
        expect(describirFrescura(ahora - 59 * 60_000)).toBe('Actualizado hace 59 min');
    });

    it('pasa a horas y luego a días sin saltarse el borde', () => {
        expect(describirFrescura(ahora - 60 * 60_000)).toBe('Actualizado hace 1 h');
        expect(describirFrescura(ahora - 23 * 3_600_000)).toBe('Actualizado hace 23 h');
        expect(describirFrescura(ahora - 24 * 3_600_000)).toBe('Actualizado hace 1 d');
        expect(describirFrescura(ahora - 9 * 24 * 3_600_000)).toBe('Actualizado hace 9 d');
    });

    it('un plan servido del caché declara su antigüedad, no se presenta como fresco', () => {
        // 50 s: dentro de la ventana de caché, así que la PWA lo sirve sin
        // volver a pedirlo. El paciente debe poder ver que no es de ahora mismo.
        expect(describirFrescura(ahora - 50_000)).toBe('Actualizado recién');
        // 70 s: fuera de la ventana; si aún se ve esto, es que la recarga falló.
        expect(describirFrescura(ahora - 70_000)).toBe('Actualizado hace 1 min');
    });
});
