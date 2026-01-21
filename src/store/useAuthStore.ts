import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSession } from '../types';
import { authService } from '../services/authService';

interface AuthState {
  session: UserSession | null;
  isLoading: boolean;
  login: (identification: string, password?: string) => Promise<void>;
  logout: () => void;
  checkSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      isLoading: false,
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

      logout: () => {
        authService.logout();
        set({ session: null });
      },
      checkSession: () => {
        const session = authService.getCurrentUser();
        set({ session });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ session: state.session }),
    }
  )
);
