import { create } from 'zustand';
import { UserSession } from '../types';
import { authService } from '../services/authService';
import { ProtocolService } from '../services/protocolService';

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
  checkSession: () => void;
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
     * Lee desde storage via authService.
     */
    checkSession: () => {
      const session = authService.getCurrentUser();
      set({ session });
    },
  };
});
