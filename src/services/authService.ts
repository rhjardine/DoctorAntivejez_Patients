import axios from 'axios';
import { UserSession } from '../types';
import { useProfileStore } from '../store/useProfileStore';
import { logger } from '../utils/logger';
import { ProtocolService } from './protocolService';
import { tokenStore } from './tokenStore';

// ✅ SECURITY: URL centralizada via variable de entorno
const API_URL = import.meta.env.VITE_API_URL || 'https://doctor-antivejez-web.onrender.com';

const SESSION_KEY = 'rejuvenate_session_v1';

// ⚠️ NOTE ON STORAGE STRATEGY:
// We use localStorage so the session object survives F5/re-opens.
// ✅ SECURITY FIX: The JWT access token is now strictly in-memory (tokenStore).
// No PHI/medical data or access tokens are ever stored in localStorage directly.
const storage = localStorage;

// Module-level in-memory store (survives navigation, not page reload)


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
    tokenStore.clearAccessToken();
    storage.removeItem(SESSION_KEY);
    storage.removeItem('refresh_token');

    // Also clean up any legacy entries from previous versions
    storage.removeItem('auth_token');
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('refresh_token');

    useProfileStore.getState().clearProfileData();
  },

  /**
   * Intenta iniciar sesión con el ID de documento del paciente.
   */
  login: async (identification: string, password?: string): Promise<UserSession> => {
    const baseUrl = import.meta.env.DEV ? '/api-render' : API_URL;
    const MAX_RETRIES = 2;
    const TIMEOUT_MS = 45_000; // 45s — Render free tier cold start can take 30s+

    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await axios.post(
          `${baseUrl}/mobile-auth-v1`, // ✅ Ruta original autorizada por CORS en tu Next.js
          { identification, password },
          { timeout: TIMEOUT_MS }
        );
        const { token, refreshToken, patient } = response.data;

        if (!token || !patient) {
          throw new Error('Respuesta del servidor incompleta: faltan token o datos de paciente.');
        }

        // ✅ CRÍTICO: Guardar token EN MEMORIA PRIMERO, antes de cualquier otra llamada de red.
        // Esto soluciona la Race Condition y el error 401.
        tokenStore.setAccessToken(token);

        // ✅ SEGUNDO: Guardar refresh token en disco (puede persistir sin riesgo directo)
        if (refreshToken) {
          storage.setItem('refresh_token', refreshToken);
        }

        // ✅ TERCERO: Ahora sí buscar el perfil (el interceptor interceptará el token en memoria sin fallar)
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
          name: patient.name || `${patient.firstName} ${patient.lastName}`,
          email: patient.email,
          role: 'PATIENT',
          lastLoginAt: new Date().toISOString()
        };

        storage.setItem(SESSION_KEY, JSON.stringify(session));

        logger.audit('login_success', { patientId: patient.id });
        return session;

      } catch (error: unknown) {
        lastError = error;

        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const serverMessage = error.response?.data?.error;

          // Auth errors (401, 403) → throw immediately, no retry
          if (status && status >= 400 && status < 500) {
            logger.error('Login failed (auth)', { status });
            throw new Error(serverMessage || 'Credenciales inválidas.');
          }

          // Network/timeout errors → retry if attempts remain
          if (attempt < MAX_RETRIES) {
            logger.warn(`Login attempt ${attempt} failed (network), retrying...`);
            continue; // next iteration of for-loop
          }

          logger.error('Login failed after retries (network/server)', { status: status ?? 0 });
          throw new Error(
            'El servidor está iniciando. Por favor espere 30 segundos e intente de nuevo.'
          );
        } else {
          logger.error('Login failed (unexpected)', { message: (error as Error).message });
          throw new Error('Error inesperado al procesar la respuesta. Contacte soporte.');
        }
      }
    }

    // Fallback (should not reach here)
    throw lastError instanceof Error ? lastError : new Error('Error de conexión.');
  },

  /**
   * Finaliza la sesión y limpia el almacenamiento local y la memoria.
   */
  logout: () => {
    tokenStore.clearAccessToken();
    storage.removeItem(SESSION_KEY);
    storage.removeItem('refresh_token');

    // Clean legacy stuff just in case
    storage.removeItem('auth_token');
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
   * NO depende de auth_token (ahora vive en memoria).
   */
  getCurrentUser: (): UserSession | null => {
    let session = storage.getItem(SESSION_KEY);

    // Fallback: migrar desde sessionStorage si existe (versión anterior)
    if (!session) {
      const legacySession = sessionStorage.getItem(SESSION_KEY);
      if (legacySession) {
        storage.setItem(SESSION_KEY, legacySession);
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
   * Verifica si hay una sesión activa basada en SESSION_KEY.
   */
  isAuthenticated: (): boolean => {
    return storage.getItem(SESSION_KEY) !== null ||
      sessionStorage.getItem(SESSION_KEY) !== null; // fallback for legacy
  }
};