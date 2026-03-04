import { PatientProtocol, NutrigenomicPlan } from '../types';
import { authService } from './authService';
import apiClient from './apiClient';

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
  fetchActiveProtocol: async (patientId: string): Promise<PatientProtocol[]> => {
    try {
      const profile = await ProtocolService.getMyProfile();

      if (!profile?.guides?.length) return [];

      // ✅ El backend devuelve `protocol` ya serializado como PatientProtocol[]
      // Si el backend aún devuelve `selections` raw, usar el fallback de mapeo
      const guide = profile.guides[0];

      // Caso A: backend ya devuelve protocol serializado (nuevo comportamiento)
      if (guide.protocol && Array.isArray(guide.protocol)) {
        const items = guide.protocol as PatientProtocol[];
        setToSession(PROTOCOL_CACHE_KEY, items);
        return items;
      }

      // Caso B: backend devuelve selections raw (comportamiento actual)
      // Mapeo local hasta que el endpoint se actualice (Bloque A paso 2)
      if (guide.selections && typeof guide.selections === 'object') {
        const items: PatientProtocol[] = [];
        Object.keys(guide.selections).forEach(category => {
          const categoryItems = (guide.selections as any)[category];
          if (Array.isArray(categoryItems)) {
            categoryItems.forEach((item: any) => {
              items.push({
                id: item.id || `${category}_${Math.random().toString(36).substr(2, 6)}`,
                category: category as any,
                itemName: item.name || item.itemName || 'Sin nombre',
                dose: item.dose || '',
                schedule: item.schedule || '',
                observations: item.observations || '',
                status: item.status || 'pending',
                timeSlot: item.timeSlot || 'ANYTIME',
                prescribedAt: guide.createdAt || new Date().toISOString(),
                updatedAt: guide.updatedAt || guide.createdAt || new Date().toISOString(),
              });
            });
          }
        });
        setToSession(PROTOCOL_CACHE_KEY, items);
        return items;
      }

      return [];

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
  fetchNutrigenomicPlan: async (patientId: string): Promise<NutrigenomicPlan | null> => {
    try {
      const profile = await ProtocolService.getMyProfile();
      if (!profile?.foodPlans?.length) return null;

      const foodPlan = profile.foodPlans[0];
      const foods: any[] = (foodPlan.items ?? []).map((item: any) => ({
        id: item.id,
        name: item.name,
        category: 'General',
        mealTypes: [item.mealType],
        isClinicalPriority: false,
        notes: '',
      }));

      const plan: NutrigenomicPlan = {
        bloodType: profile.bloodType as any,
        dietTypes: profile.selectedDiets || [],
        forbidden: [],
        foods,
        updatedAt: foodPlan.updatedAt,
      };

      setToSession(NUTRITION_CACHE_KEY, plan);
      return plan;

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
    status: 'pending' | 'completed'
  ): Promise<boolean> => {
    // Actualización optimista en caché
    const cached = getFromSession<PatientProtocol[]>(PROTOCOL_CACHE_KEY);
    if (cached) {
      const updated = cached.map(item =>
        item.id === itemId ? { ...item, status } : item
      );
      setToSession(PROTOCOL_CACHE_KEY, updated);
    }

    try {
      // Intentar sincronizar con backend
      // Si el endpoint no existe aún, falla silenciosamente (local-first)
      const response = await apiClient.patch(`/protocols/${itemId}/status`, { status });
      return response.status === 200 || response.status === 204;
    } catch {
      // El caché local ya está actualizado — aceptable para piloto
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
      const response = await apiClient.get('/mobile-profile-v1');
      return response.data;
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
