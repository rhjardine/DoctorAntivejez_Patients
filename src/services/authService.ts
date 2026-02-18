import axios from 'axios';
import { UserSession } from '../types';
import apiClient from './apiClient';
import { useProfileStore } from '../store/useProfileStore';
import { logger } from '../utils/logger';

// ✅ SECURITY: URL centralizada via variable de entorno
// Fallback hardcoded para garantizar funcionamiento en producción si la env var no está configurada
const API_URL = import.meta.env.VITE_API_URL || 'https://doctor-antivejez-web.onrender.com';

const SESSION_KEY = 'rejuvenate_session_v1';

/**
 * Servicio de Autenticación para la PWA Rejuvenate.
 * Maneja el inicio de sesión del paciente y la persistencia de la sesión.
 */
export const authService = {
  /**
   * Intenta iniciar sesión con el ID de documento del paciente.
   */
  login: async (identification: string, password?: string): Promise<UserSession> => {
    try {
      const baseUrl = import.meta.env.DEV ? '/api-render' : API_URL;
      const response = await axios.post(`${baseUrl}/mobile-auth-v1`, { identification, password });
      const { token, patient } = response.data;

      // Almacenamos los datos consolidados del perfil en el store global
      useProfileStore.getState().setProfileData({
        biologicalAge: patient.biophysicsTests?.[0]?.biologicalAge || null,
        chronologicalAge: patient.chronologicalAge,
        guides: patient.guides || [],
        foodPlans: patient.foodPlans || [],
        bloodType: patient.bloodType,
        latestNlr: null,
        fetchedAt: Date.now()
      });

      const session: UserSession = {
        id: patient.id,
        token: token,
        name: patient.name,
        email: patient.email,
        role: 'PATIENT',
        lastLoginAt: new Date().toISOString()
      };

      sessionStorage.setItem('auth_token', token);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

      // ✅ SECURITY: Log only the action, no PHI
      logger.audit('login_success', { patientId: patient.id });
      return session;
    } catch (error: any) {
      logger.error('Login failed', { status: error.response?.status });
      const message = error.response?.data?.error || "Error al iniciar sesión. Verifique sus credenciales.";
      throw new Error(message);
    }
  },

  /**
   * Finaliza la sesión y limpia el almacenamiento local.
   */
  logout: () => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('refresh_token');
    useProfileStore.getState().clearProfileData();
    logger.audit('logout');
  },

  /**
   * Recupera la sesión actual desde el almacenamiento persistente.
   */
  getCurrentUser: (): UserSession | null => {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (!session) return null;

    try {
      return JSON.parse(session);
    } catch (e) {
      logger.error('Error parsing persisted session');
      return null;
    }
  },

  /**
   * Verifica si hay una sesión activa.
   */
  isAuthenticated: (): boolean => {
    return sessionStorage.getItem(SESSION_KEY) !== null;
  }
};
