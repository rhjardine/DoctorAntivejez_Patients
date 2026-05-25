import { PatientProtocol, NutrigenomicPlan } from '../types';
import { tokenStore } from './tokenStore';
import apiClient from './apiClient';
import { offlineQueue } from './offlineQueue';
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
      console.error('[ProtocolService] Error fetching protocol:', error);

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
      console.error('[ProtocolService] Error fetching nutrition plan:', error);
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
  ): Promise<boolean> => {
    // Actualización optimista en caché
    const cached = getFromSession<PatientProtocol[]>(PROTOCOL_CACHE_KEY);
    if (cached) {
      const updated = cached.map((item) =>
        item.id === itemId ? { ...item, status } : item,
      );
      setToSession(PROTOCOL_CACHE_KEY, updated);
    }

    try {
      // Intentar sincronizar con backend
      // Si el endpoint no existe aún, falla silenciosamente (local-first)
      const response = await apiClient.patch(`/protocols/${itemId}/status`, {
        status,
      });
      return response.status === 200 || response.status === 204;
    } catch {
      // El caché local ya está actualizado — encolar en background sync
      console.warn(
        '[ProtocolService] Network failed, enqueueing protocol status update offline',
      );
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
          Authorization: `Bearer ${tokenStore.getAccessToken() || ''}`,
        },
      });

      return true;
    }
  },

  /**
   * Obtiene el perfil completo del paciente desde el backend.
   * ✅ FIX CRÍTICO: URL relativa para que el interceptor JWT funcione correctamente.
   * Antes: 'https://doctor-antivejez-web.onrender.com/mobile-profile-v1' (bypaseaba auth)
   * Ahora: '/mobile-profile-v1' (pasa por interceptor, agrega Bearer token automáticamente)
   */
  getMyProfile: async (): Promise<any> => {
    try {
      // Check if profile store has fresh data — avoid redundant API call
      const { profileData, isCacheValid } = useProfileStore.getState();
      if (profileData && isCacheValid()) {
        return profileData;
      }
      const response = await apiClient.get('/mobile-profile-v1');
      const profile = response.data;
      return {
        ...profile,
        alimentacion: normalizeAlimentacion(profile),
      };
    } catch (error) {
      console.error('[ProtocolService] Error fetching profile:', error);
      return null;
    }
  },

  /**
   * Limpia el caché de sesión (llamar en logout).
   */
  clearCache: clearSessionCache,
};
