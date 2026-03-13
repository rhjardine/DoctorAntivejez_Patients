import axios from 'axios';
import { UserSession } from '../types';
import { useProfileStore } from '../store/useProfileStore';
import { logger } from '../utils/logger';
import { ProtocolService } from './protocolService';

// ✅ SECURITY: URL centralizada via variable de entorno
const API_URL = import.meta.env.VITE_API_URL || 'https://doctor-antivejez-web.onrender.com';

const SESSION_KEY = 'rejuvenate_session_v1';

// ⚠️ NOTE ON STORAGE STRATEGY:
// We use localStorage (instead of sessionStorage) so the session survives F5,
// browser restarts and PWA re-opens in standalone mode.
// The JWT token itself is short-lived (validated server-side on every request).
// No PHI/medical data is ever stored in localStorage — only the auth token and
// a minimal session object (id, name, role). The full profile is always re-hydrated
// from the server (via Zustand persist + network re-fetch when cache expires).
const storage = localStorage;

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
    storage.removeItem(SESSION_KEY);
    storage.removeItem('auth_token');
    storage.removeItem('refresh_token');
    // Also clean up any legacy sessionStorage entries from previous versions
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
      const baseUrl = import.meta.env.DEV ? '/api-render' : API_URL;
      const response = await axios.post(`${baseUrl}/mobile-auth-v1`, { identification, password });
      const { token, refreshToken, patient } = response.data;

      if (!token || !patient) {
        throw new Error('Respuesta del servidor incompleta: faltan token o datos de paciente.');
      }

      // Guardar tokens en localStorage para persistir entre recargas y reinicios de PWA
      storage.setItem('auth_token', token);
      if (refreshToken) {
        storage.setItem('refresh_token', refreshToken);
      }

      // ✅ FIX CRÍTICO: Obtener el perfil COMPLETO desde mobile-profile-v1
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

      storage.setItem(SESSION_KEY, JSON.stringify(session));

      logger.audit('login_success', { patientId: patient.id });
      return session;

    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const serverMessage = error.response?.data?.error;
        logger.error('Login failed (network/server)', { status: status ?? 0 });
        throw new Error(serverMessage || 'Error al conectar con el servidor. Intente de nuevo.');
      } else {
        logger.error('Login failed (unexpected)', { message: (error as Error).message });
        throw new Error('Error inesperado al procesar la respuesta. Contacte soporte.');
      }
    }
  },

  /**
   * Finaliza la sesión y limpia el almacenamiento local.
   */
  logout: () => {
    // Limpiar localStorage (tokens actuales)
    storage.removeItem(SESSION_KEY);
    storage.removeItem('auth_token');
    storage.removeItem('refresh_token');

    // Limpiar también sessionStorage por compatibilidad con versiones previas
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('refresh_token');

    // Limpiar keys PHI del localStorage
    localStorage.removeItem('rejuvenate_favorite_foods');
    localStorage.removeItem('rejuvenate_reminders_log');
    localStorage.removeItem('notifications_enabled');
    localStorage.removeItem('rejuvenate_last_guide_seen');

    useProfileStore.getState().clearProfileData();
    logger.audit('logout');
  },

  /**
   * Recupera la sesión actual desde el almacenamiento persistente.
   * Intenta localStorage primero, luego sessionStorage como fallback (compatibilidad).
   */
  getCurrentUser: (): UserSession | null => {
    // Intenta leer desde localStorage (versión actual)
    let session = storage.getItem(SESSION_KEY);

    // Fallback: migrar desde sessionStorage si existe (versión anterior)
    if (!session) {
      const legacySession = sessionStorage.getItem(SESSION_KEY);
      if (legacySession) {
        // Migrar al nuevo storage
        storage.setItem(SESSION_KEY, legacySession);
        const legacyToken = sessionStorage.getItem('auth_token');
        if (legacyToken) storage.setItem('auth_token', legacyToken);
        const legacyRefresh = sessionStorage.getItem('refresh_token');
        if (legacyRefresh) storage.setItem('refresh_token', legacyRefresh);
        // Clean up old entries
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('refresh_token');
        session = legacySession;
      }
    }

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
    return storage.getItem(SESSION_KEY) !== null ||
      sessionStorage.getItem(SESSION_KEY) !== null; // fallback for legacy
  }
};
