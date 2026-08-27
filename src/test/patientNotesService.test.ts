import { describe, it, expect, beforeEach, vi } from 'vitest';
import { patientNotesService } from '../services/patientNotesService';
import { clearPatientScopedStorage } from '../utils/storageCleanup';
import { logger } from '../utils/logger';

/**
 * Notas privadas del paciente por comida.
 *
 * Contrato que fijan estos tests:
 *  - viven solo en el dispositivo, bajo el namespace `da_`;
 *  - se aíslan por comida;
 *  - desaparecen al cerrar sesión;
 *  - nunca salen hacia el backend;
 *  - no filtran contenido del paciente al log.
 */

const STORAGE_KEY = 'da_meal_notes_v1';

beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
});

describe('patientNotesService', () => {
    it('guarda y recupera una nota', async () => {
        await patientNotesService.set('desayuno', 'Me sentó bien.');
        expect(await patientNotesService.get('desayuno')).toBe('Me sentó bien.');
    });

    it('devuelve cadena vacía si la comida no tiene nota', async () => {
        expect(await patientNotesService.get('cena')).toBe('');
    });

    it('actualiza una nota existente sin duplicarla', async () => {
        await patientNotesService.set('almuerzo', 'Primera versión');
        await patientNotesService.set('almuerzo', 'Versión corregida');

        expect(await patientNotesService.get('almuerzo')).toBe('Versión corregida');
        expect(Object.keys(await patientNotesService.getAll())).toEqual(['almuerzo']);
    });

    it('aísla las notas por comida', async () => {
        await patientNotesService.set('desayuno', 'Nota del desayuno');
        await patientNotesService.set('almuerzo', 'Nota del almuerzo');
        await patientNotesService.set('cena', 'Nota de la cena');
        await patientNotesService.set('meriendas', 'Nota de la merienda');

        expect(await patientNotesService.get('desayuno')).toBe('Nota del desayuno');
        expect(await patientNotesService.get('almuerzo')).toBe('Nota del almuerzo');
        expect(await patientNotesService.get('cena')).toBe('Nota de la cena');
        expect(await patientNotesService.get('meriendas')).toBe('Nota de la merienda');
    });

    it('borra la nota cuando el texto queda vacío', async () => {
        await patientNotesService.set('desayuno', 'Algo');
        await patientNotesService.set('desayuno', '   ');

        expect(await patientNotesService.get('desayuno')).toBe('');
        expect(await patientNotesService.getAll()).toEqual({});
    });

    // ⚠️ En un dispositivo compartido, la nota de un paciente no puede quedar
    // al alcance del siguiente.
    it('el logout elimina las notas del paciente anterior', async () => {
        await patientNotesService.set('desayuno', 'Contenido privado del paciente A');
        expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

        clearPatientScopedStorage();

        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
        expect(await patientNotesService.get('desayuno')).toBe('');
    });

    it('no persiste fuera del namespace da_', async () => {
        await patientNotesService.set('desayuno', 'Contenido');

        const claves = Object.keys(localStorage);
        expect(claves).toContain(STORAGE_KEY);
        expect(claves.every((k) => k.startsWith('da_'))).toBe(true);
    });

    it('no deja la nota legible en reposo', async () => {
        await patientNotesService.set('desayuno', 'hoy tuve náuseas');

        const enReposo = localStorage.getItem(STORAGE_KEY) ?? '';
        expect(enReposo).not.toContain('náuseas');
    });

    // No existe endpoint para enviar texto del paciente al backend. Si algún
    // día se añade, debe ser una decisión explícita, no un efecto colateral.
    it('no realiza ninguna llamada de red', async () => {
        const original = globalThis.fetch;
        const fetchSpy = vi.fn();
        globalThis.fetch = fetchSpy as unknown as typeof fetch;

        try {
            await patientNotesService.set('desayuno', 'Contenido');
            await patientNotesService.get('desayuno');
            expect(fetchSpy).not.toHaveBeenCalled();
        } finally {
            globalThis.fetch = original;
        }
    });

    it('no filtra el contenido de la nota al log', async () => {
        const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {});
        const error = vi.spyOn(logger, 'error').mockImplementation(() => {});

        await patientNotesService.set('desayuno', 'me duele el pecho por las noches');
        await patientNotesService.get('desayuno');

        const registrado = JSON.stringify([...warn.mock.calls, ...error.mock.calls]);
        expect(registrado).not.toContain('duele el pecho');

        warn.mockRestore();
        error.mockRestore();
    });
});
