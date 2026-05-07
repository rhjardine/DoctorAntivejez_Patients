import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// Importamos el store del perfil para poder limpiarlo al hacer logout
import { useProfileStore } from './useProfileStore';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: {
    id: string;
    role: string;
    name?: string;
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
            id: userData.id,
            role: userData.role || 'PATIENT',
            name: userData.name,
          },
        });
      },

      logout: () => {
        // 1. Limpiamos el estado de Auth
        set({ token: null, isAuthenticated: false, user: null });

        // 2. Limpiamos otros stores sensibles para evitar fugas de datos
        // Asegúrate de que useProfileStore tenga una acción clearProfile()
        const clearProfile = useProfileStore.getState().clearProfile;
        if (clearProfile) {
          clearProfile();
        }

        // 3. Purga adicional de localStorage por seguridad
        // (Opcional, pero recomendado si tienes datos cacheados manualmente)
        localStorage.removeItem('vytalix-funnel-v2');
        sessionStorage.clear();
      },
    }),
    {
      name: 'auth-storage', // Clave en localStorage
      storage: createJSONStorage(() => localStorage),
      // Solo persistimos los datos no sensibles estrictamente necesarios
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        user: state.user
      }),
    }
  )
);