import { create } from 'zustand';
import { UserSession } from '../types';
import { authService } from '../services/authService';
import { ProtocolService } from '../services/protocolService';
import { tokenStore } from '../services/authService';
import apiClient from '../services/apiClient';

// ✅ SECURITY: Sin persist() — la sesión de un paciente NO debe sobrevivir
// al cierre de la pestaña. authService ya persiste en localStorage con
// la clave 'rejuvenate_session_v1'. checkSession() la recupera al montar.
//
// Eliminamos el persist de Zustand para evitar:
//   1. PHI (datos clínicos) almacenados en localStorage entre sesiones
//   2. Dos fuentes de verdad (Zustand localStorage vs authService sessionStorage)
//   3. logout() borrando preferencias UI al llamar localStorage.clear()

interface AuthState {
  session: UserSession | null;
  isLoading: boolean;
  login: (identification: string, password?: string) => Promise<void>;
  logout: () => void;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  // Inicialización sincrónica para evitar flashes de "sin sesión" en F5
  const initialSession = authService.getCurrentUser();

  return {
    session: initialSession,
    isLoading: false,

    /**
     * Login del paciente.
     * Delega completamente a authService (única fuente de verdad).
     */
    login: async (identification: string, password?: string) => {
      set({ isLoading: true });
      try {
        const session = await authService.login(identification, password);
        set({ session, isLoading: false });
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    /**
     * Logout del paciente.
     * ✅ FIX: Ya no llama localStorage.clear() (borraba preferencias UI).
     */
    logout: () => {
      authService.logout();          // limpia tokens y sesión
      ProtocolService.clearCache();  // limpia caché de protocolo
      set({ session: null });
    },

    /**
     * Recupera la sesión al montar la app (F5 / reopen tab mismo browser).
     * Lee desde storage via authService. Si hay sesión persistida pero NO hay token en memoria,
     * ejecuta un refresh silencioso antes de marcar la sesión como lista.
     */
    checkSession: async () => {
      const session = authService.getCurrentUser();

      if (session && !tokenStore.getAccessToken()) {
        const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            // Llamada directa al API de refresh (obviando apiClient setup inicial)
            const baseUrl = import.meta.env.DEV ? '/api-render/api' : `${import.meta.env.VITE_API_URL || 'https://doctor-antivejez-web.onrender.com'}/api`;
            const { data } = await apiClient.post(`${baseUrl}/auth/refresh`, { refreshToken });
            tokenStore.setAccessToken(data.accessToken);
            if (data.refreshToken) {
              localStorage.setItem('refresh_token', data.refreshToken);
            }
          } catch (error) {
            console.warn('[F5 Recovery] Refresh falló silenciosamente, forzando relogin.');
            authService.logout();
            set({ session: null });
            return;
          }
        }
      }

      set({ session });
    },
  };
});
