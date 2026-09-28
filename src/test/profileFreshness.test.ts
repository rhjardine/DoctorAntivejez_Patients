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
