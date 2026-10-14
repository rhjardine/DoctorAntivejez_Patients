/**
 * Consentimiento granular y auditable.
 *
 * El modal anterior ofrecía un único «Acepto y Continuar» bajo un texto que
 * prometía «encriptación militar», cifrado «de extremo a extremo» y
 * «confidencialidad absoluta» — tres afirmaciones que el sistema no cumple y
 * que ninguna aplicación clínica debería firmar.
 *
 * Estas pruebas fijan lo que sí debe cumplirse: tres decisiones separadas, un
 * registro con marca de tiempo y versión de política, y que una política
 * antigua no se confunda con la aceptación de la actual.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import apiClient from '../services/apiClient';
import { offlineQueue } from '../services/offlineQueue';
import {
    registrarConsentimiento,
    consentimientoGuardado,
    tieneConsentimiento,
    requiereConsentimiento,
    VERSION_POLITICA,
} from '../services/consentService';

const TODO_SI = { datosClinicos: true, iaGenerativa: true, biometriaFacial: true };
const SOLO_CLINICOS = { datosClinicos: true, iaGenerativa: false, biometriaFacial: false };

beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('rejuvenate_session_v1', JSON.stringify({ id: 'A' }));
    await offlineQueue.clearAll();
    vi.restoreAllMocks();
});

afterEach(async () => {
    await offlineQueue.clearAll();
});

describe('registro auditable', () => {
    it('envía al servidor la marca de tiempo y la versión de política', async () => {
        const post = vi.spyOn(apiClient, 'post').mockResolvedValue({} as never);

        const registro = await registrarConsentimiento(TODO_SI);

        expect(post).toHaveBeenCalledTimes(1);
        const [ruta, payload] = post.mock.calls[0] as [string, Record<string, unknown>];
        expect(ruta).toBe('/mobile-profile-v1/consent');
        expect(payload.version).toBe(VERSION_POLITICA);
        expect(typeof payload.timestamp).toBe('string');
        expect(new Date(registro.timestamp).toString()).not.toBe('Invalid Date');
    });

    it('desglosa las tres decisiones, no una sola casilla', async () => {
        const post = vi.spyOn(apiClient, 'post').mockResolvedValue({} as never);

        await registrarConsentimiento(SOLO_CLINICOS);

        const payload = post.mock.calls[0][1] as { consents: Record<string, boolean> };
        expect(payload.consents).toEqual({
            clinicalData: true,
            generativeAI: false,
            facialBiometrics: false,
        });
    });

    it('mantiene `accepted` para no romper un backend que solo lea ese campo', async () => {
        const post = vi.spyOn(apiClient, 'post').mockResolvedValue({} as never);
        await registrarConsentimiento(SOLO_CLINICOS);
        expect((post.mock.calls[0][1] as { accepted: boolean }).accepted).toBe(true);
    });

    it('sin red lo encola: un consentimiento que no llega al servidor no prueba nada', async () => {
        vi.spyOn(apiClient, 'post').mockRejectedValue(new Error('sin red'));

        await registrarConsentimiento(TODO_SI);

        expect(await offlineQueue.count()).toBe(1);
        const [encolado] = await offlineQueue.dequeueForCurrentPatient();
        expect(encolado.url).toContain('/mobile-profile-v1/consent');
        expect(JSON.parse(encolado.body).version).toBe(VERSION_POLITICA);
    });
});

describe('cada tratamiento se consulta por separado', () => {
    beforeEach(() => {
        vi.spyOn(apiClient, 'post').mockResolvedValue({} as never);
    });

    it('aceptar lo clínico no activa la IA ni la biometría', async () => {
        await registrarConsentimiento(SOLO_CLINICOS);

        expect(tieneConsentimiento('datosClinicos')).toBe(true);
        expect(tieneConsentimiento('iaGenerativa')).toBe(false);
        expect(tieneConsentimiento('biometriaFacial')).toBe(false);
    });

    it('se puede aceptar la IA y rechazar la biometría', async () => {
        await registrarConsentimiento({ datosClinicos: true, iaGenerativa: true, biometriaFacial: false });

        expect(tieneConsentimiento('iaGenerativa')).toBe(true);
        expect(tieneConsentimiento('biometriaFacial')).toBe(false);
    });

    it('queda registrado localmente para poder consultarlo', async () => {
        await registrarConsentimiento(TODO_SI);
        expect(consentimientoGuardado()?.version).toBe(VERSION_POLITICA);
    });
});

describe('vigencia de la política', () => {
    it('sin registro, hay que preguntar', () => {
        expect(requiereConsentimiento()).toBe(true);
    });

    it('un registro de una política anterior no vale como aceptación de la actual', () => {
        localStorage.setItem(
            'da_consentimiento_v2',
            JSON.stringify({ ...TODO_SI, timestamp: new Date().toISOString(), version: '1.0' }),
        );

        expect(requiereConsentimiento()).toBe(true);
        expect(tieneConsentimiento('iaGenerativa')).toBe(false);
    });

    it('un registro corrupto no se interpreta como aceptación', () => {
        localStorage.setItem('da_consentimiento_v2', 'esto no es json');
        expect(requiereConsentimiento()).toBe(true);
    });
});
