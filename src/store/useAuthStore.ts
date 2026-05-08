import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '../services/authService';
import { UserSession } from '../types';

// ✅ CONTRATO CORRECTO: Compatible con Drawer, MainLayout, AppRouter, LoginPage
// 🚀 SIN importar useProfileStore (dependencia circular eliminada)
// 🔐 Limpia profile-storage directamente desde localStorage en logout()

interface AuthState {
  session: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;

  login: (identification: string, password: string) => Promise<void>;
  logout: () => void;
  checkSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,

      login: async (identification: string, password: string) => {
        set({ isLoading: true });
        try {
          const session = await authService.login(identification, password);
          set({
            session,
            isAuthenticated: true,
            isLoading: false,
            token: null, // el token vive en memoria (tokenStore), no aquí
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        authService.logout();

        // Limpiar stores de perfil DIRECTAMENTE sin importarlos
        localStorage.removeItem('rejuvenate_profile_v1');
        localStorage.removeItem('profile-storage');
        localStorage.removeItem('vytalix-funnel-v2');
        sessionStorage.clear();

        set({
          session: null,
          isAuthenticated: false,
          token: null,
        });
      },

      checkSession: () => {
        const currentSession = authService.getCurrentUser();
        if (currentSession) {
          set({ session: currentSession, isAuthenticated: true });
        } else {
          set({ session: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
    }
  )
);