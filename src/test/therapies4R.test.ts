/**
 * Contenido de las Terapias 4R.
 *
 * Estas pruebas no comprueban estética: fijan que las cuatro fases existan, que
 * estén en el orden clínico que publica la clínica y que ninguna se quede sin
 * descripción ni modalidades. Una fase vacía en producción sería una tarjeta en
 * blanco delante de un paciente.
 */

import { describe, it, expect } from 'vitest';
import { AVISO_4R, FASES_4R, TERAPIAS_4R } from '../config/therapies4R';

describe('las cuatro fases', () => {
    it('son exactamente cuatro', () => {
        expect(FASES_4R).toHaveLength(4);
    });

    it('siguen el orden clínico: remover, revitalizar, regenerar, restaurar', () => {
        expect(FASES_4R.map(f => f.id)).toEqual([
            'removal',
            'revitalization',
            'regeneration',
            'restoration',
        ]);
        expect(FASES_4R.map(f => f.orden)).toEqual([1, 2, 3, 4]);
    });

    it('ninguna se queda sin nombre, propósito, descripción ni modalidades', () => {
        for (const fase of FASES_4R) {
            expect(fase.nombre.trim().length).toBeGreaterThan(0);
            expect(fase.proposito.trim().length).toBeGreaterThan(0);
            expect(fase.descripcion.trim().length).toBeGreaterThan(0);
            expect(fase.modalidades.length).toBeGreaterThan(0);
            expect(fase.modalidades.every(m => m.trim().length > 0)).toBe(true);
        }
    });

    it('la clave del registro coincide con el id de la fase', () => {
        for (const [clave, fase] of Object.entries(TERAPIAS_4R)) {
            expect(fase.id).toBe(clave);
        }
    });
});

describe('fidelidad a lo que publica la clínica', () => {
    it('Remoción nombra las modalidades publicadas', () => {
        const m = TERAPIAS_4R.removal.modalidades.join(' ').toLowerCase();
        expect(m).toContain('ayunos');
        expect(m).toContain('purgas');
        expect(m).toContain('hidroterapias');
        expect(m).toContain('quelación');
    });

    it('Revitalización nombra sueros y shots organotrópicos', () => {
        const m = TERAPIAS_4R.revitalization.modalidades.join(' ').toLowerCase();
        expect(m).toContain('sueros');
        expect(m).toContain('organotrópicos');
    });

    it('Regeneración nombra los exosomas de cordón umbilical', () => {
        const m = TERAPIAS_4R.regeneration.modalidades.join(' ').toLowerCase();
        expect(m).toContain('exosomas');
        expect(m).toContain('cordón umbilical');
    });

    it('Restauración son las cinco claves 5A, no otra cosa', () => {
        expect(TERAPIAS_4R.restoration.modalidades).toHaveLength(5);
        const m = TERAPIAS_4R.restoration.modalidades.join(' ').toLowerCase();
        for (const clave of ['alimentación', 'actividad', 'asueto', 'actitud', 'ambiente']) {
            expect(m).toContain(clave);
        }
    });
});

describe('aviso clínico', () => {
    it('deja claro que las indica el médico y que la app no prescribe', () => {
        expect(AVISO_4R.toLowerCase()).toContain('médico');
        expect(AVISO_4R.toLowerCase()).toContain('no sustituye');
    });
});
