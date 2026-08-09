import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import {
    fetchPatientGuide,
    fetchNutrigenomicPlan,
    fetchConsultationHistory,
} from '../services/patientDataService';

/**
 * R-P0-5 — Nunca fabricar datos clínicos.
 *
 * Guardas de regresión. Estas funciones devolvían, ante un fallo del backend:
 *  - una pauta de tratamiento inventada ("Aceite de ricino, 4 cucharadas"),
 *  - un plan nutricional demo con alimentos prohibidos ficticios.
 *
 * Ambos eran indistinguibles de datos reales para el paciente. El contrato
 * ahora es: fallar de forma explícita, nunca inventar. Ver §6.2 del Informe
 * de Gobernanza Pre-Beta.
 */

const server = setupServer(
    http.get('*/patients/:id/guide', () => HttpResponse.error()),
    http.get('*/patients/:id/nutrition-plan', () => HttpResponse.error()),
    http.get('*/patients/:id/consultations', () => HttpResponse.error()),
);

beforeAll(() => server.listen());
beforeEach(() => {
    localStorage.setItem(
        'rejuvenate_session_v1',
        JSON.stringify({ id: 'p1', name: 'Test', role: 'PATIENT' }),
    );
});
afterEach(() => {
    server.resetHandlers();
    localStorage.clear();
    sessionStorage.clear();
});
afterAll(() => server.close());

describe('patientDataService — integridad de datos clínicos', () => {
    it('fetchPatientGuide falla en vez de devolver una pauta fabricada', async () => {
        await expect(fetchPatientGuide()).rejects.toThrow(
            /No pudimos cargar tu guía/i,
        );
    });

    it('fetchNutrigenomicPlan falla en vez de devolver un plan demo', async () => {
        await expect(fetchNutrigenomicPlan()).rejects.toThrow(
            /No hay un plan de nutrición/i,
        );
    });

    it('fetchConsultationHistory devuelve vacío, nunca consultas inventadas', async () => {
        await expect(fetchConsultationHistory()).resolves.toEqual([]);
    });
});
