import axios from 'axios';
import { UserSession } from '../types';
import apiClient from './apiClient';
import { useProfileStore } from '../store/useProfileStore';
import { logger } from '../utils/logger';
import { cryptoService } from './cryptoService'; // ✅ SECURITY

// ✅ SECURITY: URL centralizada via variable de entorno
// Fallback hardcoded para evitar errores si la env var no está configurada en Render
const API_URL = import.meta.env.VITE_API_URL || 'https://doctor-antivejez-web.onrender.com';

const SESSION_KEY = 'rejuvenate_session_enc_v1'; // Renamed to indicate encryption

/**
 * Servicio de Autenticación para la PWA Rejuvenate.
 * Maneja el inicio de sesión del paciente y la persistencia de la sesión encriptada.
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

      // Almacenamos los datos consolidados del perfil en el store global (Memory Only)
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

      // ✅ SECURITY: Encrypt sensitive data before storage
      const encryptedToken = await cryptoService.encrypt(token);
      const encryptedSession = await cryptoService.encrypt(session);

      sessionStorage.setItem('auth_token', encryptedToken);
      sessionStorage.setItem(SESSION_KEY, encryptedSession);

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
    // Also remove old plaintext keys if they exist from previous version
    sessionStorage.removeItem('rejuvenate_session_v1');

    useProfileStore.getState().clearProfileData();
    logger.audit('logout');
  },

  /**
   * Recupera la sesión actual desde el almacenamiento persistente (Desencriptando).
   */
  getCurrentUser: async (): Promise<UserSession | null> => {
    const encryptedSession = sessionStorage.getItem(SESSION_KEY);
    if (!encryptedSession) return null;

    try {
      // ✅ SECURITY: Decrypt session data
      const session = await cryptoService.decrypt(encryptedSession);
      if (!session) {
        // Tampering detected or key mismatch
        authService.logout();
        return null;
      }
      return session as UserSession;
    } catch (e) {
      logger.error('Error decrypting persisted session');
      authService.logout();
      return null;
    }
  },

  /**
   * Verifica si hay una sesión activa (Existencia de llave encriptada).
   * Nota: No garantiza validez hasta desencriptar, pero sirve para chequeos rápidos de UI.
   */
  isAuthenticated: (): boolean => {
    return sessionStorage.getItem(SESSION_KEY) !== null;
  }
};
