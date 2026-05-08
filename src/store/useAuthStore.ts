import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 🚀 CIRUGÍA: Eliminamos la importación de useProfileStore para romper el bucle infinito.

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: {
    id: string;
    role: string;
    name?: string;
    tenantId?: string;
  } | null;
  login: (token: string, userData: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      user: null,

      login: (token, userData) => {
        set({
          token,
          isAuthenticated: true,
          user: {
            id: userData.id || userData.uid,
            role: userData.role || 'PATIENT',
            name: userData.name,
            tenantId: userData.tenantId || 'default-tenant',
          },
        });
      },

      logout: () => {
        // 1. Limpiamos el estado de Auth
        set({ token: null, isAuthenticated: false, user: null });

        // 2. Limpieza directa de caché
        // Como ya no importamos useProfileStore, limpiamos su persistencia a mano.
        localStorage.removeItem('profile-storage');
        localStorage.removeItem('vytalix-funnel-v2');
        sessionStorage.clear();

        // 3. Redirección forzada
        if (typeof window !== 'undefined') {
          window.location.href = '/acceso';
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        user: state.user
      }),
    }
  )
);