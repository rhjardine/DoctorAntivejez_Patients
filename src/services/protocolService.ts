import { PatientProtocol, NutrigenomicPlan } from '../types';
import { tokenStore } from './tokenStore';
import apiClient from './apiClient';
import { offlineQueue } from './offlineQueue';
import { logger } from '../utils/logger';
import { useProfileStore } from '../store/useProfileStore';
import {
  buildNutrigenomicPlan,
  normalizeAlimentacion,
  normalizePatientProtocol,
} from './clinicalPayloadNormalizer';

// ✅ SECURITY: Cache de protocolo en sessionStorage (se limpia al cerrar tab)
// Los datos clínicos NO deben persistir entre sesiones distintas
const PROTOCOL_CACHE_KEY = 'rejuvenate_protocol_cache';
const NUTRITION_CACHE_KEY = 'rejuvenate_nutrition_cache';

// ─── Helpers de caché ────────────────────────────────────────────────────────

const getFromSession = <T>(key: string): T | null => {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setToSession = (key: string, data: unknown): void => {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch {
    // sessionStorage lleno o no disponible — continuar sin caché
  }
};

const clearSessionCache = (): void => {
  sessionStorage.removeItem(PROTOCOL_CACHE_KEY);
  sessionStorage.removeItem(NUTRITION_CACHE_KEY);
};

/**
 * Resultado de registrar adherencia.
 *
 * `confirmed` es el ÚNICO valor que autoriza a mostrar la marca como registrada.
 * Un booleano no bastaba: obligaba a colapsar «encolado sin conexión» y
 * «rechazado por el servidor» en el mismo valor, y ahí nacía la falsa
 * confirmación.
 */
export type AdherenceResult = 'confirmed' | 'pending' | 'failed';

// ─── Control de peticiones del perfil ────────────────────────────────────────

/** Petición de perfil en curso, para que varias pantallas compartan una sola. */
let inFlightProfile: Promise<any> | null = null;

/** Instante hasta el que no se vuelve a pedir el perfil tras un fallo. */
let profileCooldownUntil = 0;

/** Pausa tras un fallo. Corta la tormenta sin dejar la app clavada: el paciente
 *  recupera sus datos en la siguiente navegación pasado este tiempo, y el botón
 *  de recargar de la cabecera sigue funcionando en cualquier momento. */
const PROFILE_COOLDOWN_MS = 30_000;

/** Reinicia el control de peticiones. Se llama en logout: la pausa de un
 *  paciente no debe heredarla el siguiente que entre en el mismo dispositivo. */
const resetProfileFetchState = (): void => {
  inFlightProfile = null;
  profileCooldownUntil = 0;
};

// ─── ProtocolService ─────────────────────────────────────────────────────────

export const ProtocolService = {
  /**
   * Obtiene el protocolo activo del paciente.
   * El backend (mobile-profile-v1) ya devuelve PatientProtocol[] serializados.
   * Caché en sessionStorage — se limpia automáticamente al cerrar la pestaña.
   */
  fetchActiveProtocol: async (
    patientId: string,
  ): Promise<PatientProtocol[]> => {
    try {
      const profile = await ProtocolService.getMyProfile();
      const items = normalizePatientProtocol(profile);

      if (items.length > 0) {
        setToSession(PROTOCOL_CACHE_KEY, items);
        return items;
      }

      return getFromSession<PatientProtocol[]>(PROTOCOL_CACHE_KEY) ?? [];
    } catch (error) {
      logger.warn('[ProtocolService] Protocolo no disponible; se usa el caché de sesión', {
        reason: 'PROTOCOL_FETCH_FAILED',
      });

      // ✅ Fallback a caché de sesión (NO localStorage)
      const cached = getFromSession<PatientProtocol[]>(PROTOCOL_CACHE_KEY);
      return cached ?? [];
    }
  },

  /**
   * Obtiene el plan nutrigenómico del paciente.
   */
  fetchNutrigenomicPlan: async (
    patientId: string,
  ): Promise<NutrigenomicPlan | null> => {
    try {
      const profile = await ProtocolService.getMyProfile();
      const plan = buildNutrigenomicPlan(profile);

      if (plan) {
        setToSession(NUTRITION_CACHE_KEY, plan);
        return plan;
      }

      return getFromSession<NutrigenomicPlan>(NUTRITION_CACHE_KEY);
    } catch (error) {
      logger.warn('[ProtocolService] Plan nutricional no disponible; se usa el caché de sesión', {
        reason: 'NUTRITION_FETCH_FAILED',
      });
      return getFromSession<NutrigenomicPlan>(NUTRITION_CACHE_KEY);
    }
  },

  /**
   * Actualiza el estado de un ítem del protocolo.
   * Local-first: actualiza caché en sessionStorage y luego sincroniza con backend.
   */
  updateItemStatus: async (
    patientId: string,
    itemId: string,
    status: 'pending' | 'completed',
  ): Promise<AdherenceResult> => {
    // ⚠️ SEGURIDAD CLÍNICA: el guard va ANTES de tocar el caché.
    // Un ítem sin ID estable NO puede sincronizarse con el backend, así que
    // tampoco debe quedar marcado como completado en el caché local: dejaría al
    // paciente viendo un check que su médico nunca recibirá.
    // Deuda de backend documentada en docs/adr/ADR-005.
    if (itemId.startsWith('UNSTABLE_HASH_')) {
      logger.warn(
        '[ProtocolService] Adherencia descartada: el backend no emitió un ID estable para este ítem',
        { reason: 'UNSTABLE_ITEM_ID', status },
      );
      logger.audit('adherence_rejected_unstable_id', { status });
      return 'failed';
    }

    // Actualización optimista en caché (solo para ítems sincronizables)
    const cached = getFromSession<PatientProtocol[]>(PROTOCOL_CACHE_KEY);
    if (cached) {
      const updated = cached.map((item) =>
        item.id === itemId ? { ...item, status } : item,
      );
      setToSession(PROTOCOL_CACHE_KEY, updated);
    }

    try {
      const response = await apiClient.patch(`/protocols/${itemId}/status`, {
        status,
      });
      return response.status === 200 || response.status === 204
        ? 'confirmed'
        : 'failed';
    } catch (error) {
      // ⚠️ Distinción crítica: NO todo fallo es «sin conexión».
      //
      // Si el servidor RESPONDIÓ con un error (4xx/5xx), la petición llegó y fue
      // rechazada: reintentarla no la va a arreglar. Es el caso real hoy, porque
      // /protocols/{id}/status no existe en el backend y devuelve 404 — antes se
      // encolaba y se devolvía `true`, de modo que el paciente veía un check
      // confirmado por una adherencia que nadie iba a registrar nunca y que la
      // cola descartaba en silencio tras 3 reintentos.
      // El interceptor de apiClient normaliza el error de axios a un Error
      // plano y traslada el código a `.status` (apiClient.ts:78-79); `.response`
      // no sobrevive. Se contemplan ambas formas para que esto siga siendo
      // correcto si alguien llama sin pasar por el interceptor.
      const httpStatus =
        (error as any)?.status ?? (error as any)?.response?.status;

      if (typeof httpStatus === 'number') {
        logger.warn('[ProtocolService] El servidor rechazó la adherencia', {
          reason: 'ADHERENCE_REJECTED_BY_SERVER',
          status: httpStatus,
        });
        return 'failed';
      }

      // Caso 401 (sesión expirada). El interceptor de apiClient lo atiende para
      // refrescar el token y, si no puede, limpia el almacenamiento y redirige a
      // /acceso, rechazando con un Error plano SIN `.status`. Sin esta guarda
      // llegaría aquí disfrazado de fallo de red y se reportaría 'pending'.
      //
      // Se detecta por su efecto —ya no hay sesión— en lugar de inspeccionar el
      // mensaje del error, que es frágil, y sin tocar apiClient (protegido).
      // Encolar aquí sería además contraproducente: el almacenamiento ya está
      // vacío, así que la entrada nacería sin paciente y nunca se reproduciría.
      if (!sessionStorage.length && !localStorage.getItem('rejuvenate_session_v1')) {
        logger.warn('[ProtocolService] Adherencia descartada: la sesión expiró', {
          reason: 'ADHERENCE_SESSION_EXPIRED',
        });
        return 'failed';
      }

      // Sin respuesta del servidor: falta de red. Encolar es legítimo, pero
      // sigue SIN ser una confirmación — se informa como 'pending'.
      const baseUrl = apiClient.defaults.baseURL || '';
      const fullUrl = baseUrl.endsWith('/')
        ? `${baseUrl}protocols/${itemId}/status`
        : `${baseUrl}/protocols/${itemId}/status`;

      await offlineQueue.enqueue({
        url: fullUrl,
        method: 'PATCH',
        body: JSON.stringify({ status }),
        headers: {
          'Content-Type': 'application/json',
          // NOTA: offlineQueue elimina este header inmediatamente por seguridad para no guardarlo en IndexedDB.
          // Se pasa aquí para mantener la firma completa de la petición. Cuando useSyncQueue hace el replay,
          // inyecta un token fresco desde tokenStore/localStorage justo antes de enviar la petición.
          Authorization: `Bearer ${tokenStore.getAccessToken() || ''}`,
        },
      });

      return 'pending';
    }
  },

  /**
   * Obtiene el perfil completo del paciente desde el backend.
   * ✅ FIX CRÍTICO: URL relativa para que el interceptor JWT funcione correctamente.
   * Antes: 'https://doctor-antivejez-web.onrender.com/mobile-profile-v1' (bypaseaba auth)
   * Ahora: '/mobile-profile-v1' (pasa por interceptor, agrega Bearer token automáticamente)
   */
  getMyProfile: async (): Promise<any> => {
    // Check if profile store has fresh data — avoid redundant API call
    const { profileData, isCacheValid } = useProfileStore.getState();
    if (profileData && isCacheValid()) {
      return profileData;
    }

    // Una sola petición en vuelo. Varias pantallas piden el perfil a la vez
    // —HomePage lo pide y además llama a fetchActiveProtocol, que lo vuelve a
    // pedir—, y sin esto cada montaje disparaba peticiones duplicadas
    // simultáneas contra el mismo endpoint.
    if (inFlightProfile) return inFlightProfile;

    // Tras un fallo, no volver a preguntar durante un rato. Sin esta pausa, con
    // el backend caído cada navegación entre la Guía y Alimentación lanzaba otra
    // petición: el paciente no gana nada y el servidor recibe una tormenta justo
    // cuando peor está.
    if (Date.now() < profileCooldownUntil) {
      return null;
    }

    inFlightProfile = (async () => {
      try {
        const response = await apiClient.get('/mobile-profile-v1');
        const profile = response.data;
        return {
          ...profile,
          alimentacion: normalizeAlimentacion(profile),
        };
      } catch (error) {
        profileCooldownUntil = Date.now() + PROFILE_COOLDOWN_MS;
        // Log compacto y sin PHI: apiClient ya registra el código y la ruta, así
        // que aquí basta con dejar constancia de que se entra en pausa.
        logger.warn('[ProtocolService] No se pudo obtener el perfil', {
          reason: 'PROFILE_FETCH_FAILED',
          status: (error as any)?.status,
          cooldownMs: PROFILE_COOLDOWN_MS,
        });
        return null;
      } finally {
        inFlightProfile = null;
      }
    })();

    return inFlightProfile;
  },

  /**
   * Limpia el caché de sesión (llamar en logout).
   */
  clearCache: () => {
    clearSessionCache();
    resetProfileFetchState();
  },
};
