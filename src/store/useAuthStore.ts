import { create } from 'zustand';
import { UserSession } from '../types';
import { authService } from '../services/authService';
import { ProtocolService } from '../services/protocolService';

// ✅ SECURITY: Sin persist() — la sesión de un paciente NO debe sobrevivir
// al cierre de la pestaña. authService ya persiste en sessionStorage con
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

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: false,

  /**
   * Login del paciente.
   * Delega completamente a authService (única fuente de verdad).
   * authService guarda token y sesión en sessionStorage.
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
   * Limpia: sessionStorage (token + sesión), profileStore, protocolCache.
   * Preserva: userPreferences en ui-storage (localStorage, no es PHI).
   */
  logout: () => {
    authService.logout();          // limpia sessionStorage de sesión y token
    ProtocolService.clearCache();  // limpia caché de protocolo en sessionStorage
    set({ session: null });
  },

  /**
   * Recupera la sesión al montar la app (F5 / reopen tab mismo browser).
   * Lee desde sessionStorage via authService.
   * Si no hay sesión activa, queda en null → redirige a /login.
   */
  checkSession: () => {
    const session = authService.getCurrentUser();
    set({ session });
  },
}));
