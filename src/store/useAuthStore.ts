import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '../services/authService';
import { clearPatientScopedStorage } from '../utils/storageCleanup';
import { logger } from '../utils/logger';
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
  logout: () => Promise<void>;
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

      logout: async () => {
        // STEP 1 — Zero Zustand in-memory state immediately.
        // Must happen FIRST to prevent re-hydration from reading a stale session
        // before the storage keys below are removed.
        set({ session: null, isAuthenticated: false, token: null });

        // STEP 2 — Atomically destroy all persisted patient state.
        // Barrido por prefijo, no por lista: el proyecto arrastra tres
        // generaciones de claves ('rejuvenate_*', 'vx_*'/'vytalix*', 'da_*') y
        // la enumeración manual dejaba fuera las más recientes — entre ellas
        // 'da_pending_leads', con nombre y correo en texto plano.
        // Incluye 'auth-storage', la clave de persist de ESTE store: sin
        // eliminarla, el middleware recargaría la sesión muerta en el
        // siguiente tick del event loop.
        const removedKeys = clearPatientScopedStorage();
        logger.audit('logout_storage_cleared', { removedKeys });

        // STEP 3 — Run tokenStore clear + backend-side logout last.
        // authService.logout() is currently synchronous but awaited for
        // forward-compatibility if it ever becomes async.
        await authService.logout();
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
      // 🔐 `token` NO se persiste: el access token vive solo en memoria
      // (tokenStore). Persistirlo aquí lo expondría a XSS vía localStorage.
      // Ver ADR-002.
      partialize: (state) => ({
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);