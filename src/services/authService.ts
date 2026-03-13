import axios from 'axios';
import { UserSession } from '../types';
import { useProfileStore } from '../store/useProfileStore';
import { logger } from '../utils/logger';
import { ProtocolService } from './protocolService';

// ✅ SECURITY: URL centralizada via variable de entorno
const API_URL = import.meta.env.VITE_API_URL || 'https://doctor-antivejez-web.onrender.com';

const SESSION_KEY = 'rejuvenate_session_v1';

/**
 * Servicio de Autenticación para la PWA Rejuvenate.
 * Maneja el inicio de sesión del paciente y la persistencia de la sesión.
 */
export const authService = {
  /**
   * Limpieza dirigida de datos de sesión previos.
   * Seguro para llamar ANTES del login — no dispara redirecciones ni logs de audit.
   */
  clearSession: () => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('refresh_token');
    useProfileStore.getState().clearProfileData();
  },

  /**
   * Intenta iniciar sesión con el ID de documento del paciente.
   */
  login: async (identification: string, password?: string): Promise<UserSession> => {
    try {
      // El endpoint mobile-auth-v1 vive fuera de /api, por lo tanto usamos axios directamente
      const baseUrl = import.meta.env.DEV ? '/api-render' : API_URL;
      const response = await axios.post(`${baseUrl}/mobile-auth-v1`, { identification, password });
      const { token, refreshToken, patient } = response.data;

      if (!token || !patient) {
        throw new Error('Respuesta del servidor incompleta: faltan token o datos de paciente.');
      }

      // Guardar tokens primero para que getMyProfile() pueda autenticarse
      sessionStorage.setItem('auth_token', token);
      if (refreshToken) {
        sessionStorage.setItem('refresh_token', refreshToken);
      }

      // ✅ FIX CRÍTICO: Obtener el perfil COMPLETO desde mobile-profile-v1
      // (incluye alimentacion, guides, foodPlans, etc. con todos los campos del médico)
      // Nunca poblar el store con datos parciales del login, siempre usar el perfil completo.
      try {
        const fullProfile = await ProtocolService.getMyProfile();
        if (fullProfile) {
          useProfileStore.getState().setProfileData({
            biologicalAge: fullProfile.biophysics?.biologicalAge ?? fullProfile.biologicalAge ?? null,
            chronologicalAge: fullProfile.chronologicalAge ?? null,
            guides: fullProfile.guides || [],
            foodPlans: fullProfile.foodPlans || [],
            bloodType: fullProfile.bloodType || patient.bloodType || null,
            latestNlr: fullProfile.latestNlr || null,
            firstName: fullProfile.firstName || patient.firstName,
            alimentacion: fullProfile.alimentacion ?? null,
            fetchedAt: Date.now()
          });
        }
      } catch (profileError) {
        // Si falla el fetch del perfil completo, almacenar datos mínimos del login
        logger.error('Profile fetch after login failed', { message: (profileError as Error).message });
        useProfileStore.getState().setProfileData({
          biologicalAge: null,
          chronologicalAge: patient.chronologicalAge,
          guides: patient.guides || [],
          foodPlans: patient.foodPlans || [],
          bloodType: patient.bloodType,
          latestNlr: null,
          firstName: patient.firstName,
          alimentacion: null,
          fetchedAt: Date.now()
        });
      }

      const session: UserSession = {
        id: patient.id,
        token: token,
        name: patient.name || `${patient.firstName} ${patient.lastName}`,
        email: patient.email,
        role: 'PATIENT',
        lastLoginAt: new Date().toISOString()
      };

      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

      // ✅ SECURITY: Log only the action, no PHI
      logger.audit('login_success', { patientId: patient.id });
      return session;

    } catch (error: unknown) {
      // Diferenciamos entre error de red y error de procesamiento
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const serverMessage = error.response?.data?.error;
        logger.error('Login failed (network/server)', { status: status ?? 0 });
        throw new Error(serverMessage || 'Error al conectar con el servidor. Intente de nuevo.');
      } else {
        // Error inesperado en el procesamiento de la respuesta (bug en el código)
        logger.error('Login failed (unexpected)', { message: (error as Error).message });
        throw new Error('Error inesperado al procesar la respuesta. Contacte soporte.');
      }
    }
  },

  /**
   * Finaliza la sesión y limpia el almacenamiento local.
   */
  logout: () => {
    // Limpia sessionStorage (token + sesión)
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('refresh_token');

    // ✅ FIX: Limpieza selectiva de localStorage — solo claves PHI 
    // Preserva: 'ui-storage' (preferencias visuales del dashboard, no es PHI)
    localStorage.removeItem('rejuvenate_favorite_foods');
    localStorage.removeItem('rejuvenate_reminders_log');
    localStorage.removeItem('notifications_enabled');
    localStorage.removeItem('rejuvenate_last_guide_seen');

    // Limpia store de perfil en memoria
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

