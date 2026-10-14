import apiClient from './apiClient';
import { offlineQueue } from './offlineQueue';
import { tokenStore } from './tokenStore';
import { logger } from '../utils/logger';

/**
 * Consentimiento granular del paciente.
 *
 * Tres decisiones independientes, porque son tres tratamientos distintos y el
 * paciente tiene derecho a aceptar unos y rechazar otros:
 *
 *  - `datosClinicos`  — tratamiento de su historia y biomarcadores. Es el único
 *                       imprescindible: sin él la app no tiene nada que hacer.
 *  - `iaGenerativa`   — enviar contexto suyo a un modelo de lenguaje para el
 *                       asistente. Opcional; rechazarlo solo apaga el asistente.
 *  - `biometriaFacial`— analizar una foto de su rostro para estimar edad
 *                       aparente. Opcional; rechazarlo solo apaga el escaneo.
 *
 * Que los dos últimos sean opcionales no es un detalle de diseño: un
 * consentimiento que hay que dar para poder usar el servicio no es libre, y por
 * tanto no es consentimiento.
 */

/**
 * Versión de la política aceptada. Se guarda junto a la decisión para que un
 * registro antiguo no se confunda con la aceptación del texto actual: si el
 * texto cambia, esta constante sube y hay que volver a preguntar.
 */
export const VERSION_POLITICA = '2026-10-14';

export interface DecisionesConsentimiento {
    datosClinicos: boolean;
    iaGenerativa: boolean;
    biometriaFacial: boolean;
}

export interface RegistroConsentimiento extends DecisionesConsentimiento {
    /** Momento exacto en que el paciente pulsó aceptar. */
    timestamp: string;
    version: string;
}

const CLAVE_LOCAL = 'da_consentimiento_v2';

/** Ruta absoluta del endpoint, para poder encolarla si no hay red. */
const urlConsentimiento = (): string => {
    const base = apiClient.defaults.baseURL || '';
    return base.endsWith('/')
        ? `${base}mobile-profile-v1/consent`
        : `${base}/mobile-profile-v1/consent`;
};

/**
 * Registra el consentimiento en el servidor.
 *
 * Si no hay red, la decisión se encola: un consentimiento que solo existe en el
 * navegador del paciente no sirve como prueba de nada, así que tiene que acabar
 * llegando igual que cualquier otro registro clínico.
 *
 * El payload conserva `accepted` y `version` de la versión anterior para no
 * romper un backend que todavía lea solo esos campos, y añade el desglose.
 */
export const registrarConsentimiento = async (
    decisiones: DecisionesConsentimiento,
): Promise<RegistroConsentimiento> => {
    const registro: RegistroConsentimiento = {
        ...decisiones,
        timestamp: new Date().toISOString(),
        version: VERSION_POLITICA,
    };

    const payload = {
        accepted: decisiones.datosClinicos,
        version: VERSION_POLITICA,
        timestamp: registro.timestamp,
        consents: {
            clinicalData: decisiones.datosClinicos,
            generativeAI: decisiones.iaGenerativa,
            facialBiometrics: decisiones.biometriaFacial,
        },
    };

    guardarLocal(registro);

    try {
        await apiClient.post('/mobile-profile-v1/consent', payload);
        logger.audit('consent_recorded', { version: VERSION_POLITICA });
    } catch {
        await offlineQueue.enqueue({
            url: urlConsentimiento(),
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${tokenStore.getAccessToken() || ''}`,
            },
        });
        logger.warn('[Consent] Sin red: el consentimiento queda encolado', {
            reason: 'CONSENT_QUEUED',
            version: VERSION_POLITICA,
        });
    }

    return registro;
};

const guardarLocal = (registro: RegistroConsentimiento): void => {
    try {
        localStorage.setItem(CLAVE_LOCAL, JSON.stringify(registro));
    } catch {
        // Que no se pueda recordar la decisión no debe impedir darla.
    }
};

/** Lectura local de lo último aceptado. `null` si no hay registro. */
export const consentimientoGuardado = (): RegistroConsentimiento | null => {
    try {
        const raw = localStorage.getItem(CLAVE_LOCAL);
        return raw ? (JSON.parse(raw) as RegistroConsentimiento) : null;
    } catch {
        return null;
    }
};

/**
 * ¿Aceptó el paciente este tratamiento, bajo la política vigente?
 *
 * Un registro de una versión anterior no vale: el texto que aceptó ya no es el
 * que rige. Ante la duda, la respuesta es `false` — no se trata un dato sin
 * consentimiento vigente.
 */
export const tieneConsentimiento = (
    tratamiento: keyof DecisionesConsentimiento,
): boolean => {
    const registro = consentimientoGuardado();
    if (!registro || registro.version !== VERSION_POLITICA) return false;
    return registro[tratamiento] === true;
};

/** True si hay que volver a preguntar: no hay registro o es de otra política. */
export const requiereConsentimiento = (): boolean =>
    !tieneConsentimiento('datosClinicos');
