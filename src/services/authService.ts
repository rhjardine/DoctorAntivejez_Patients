import axios from 'axios';
import { UserSession } from '../types';
import apiClient from './apiClient';
import { useProfileStore } from '../store/useProfileStore';


const SESSION_KEY = 'rejuvenate_session_v1';

/**
 * Servicio de Autenticación para la PWA Rejuvenate.
 * Maneja el inicio de sesión del paciente y la persistencia de la sesión.
 */
export const authService = {
  /**
   * Intenta iniciar sesión con el ID de documento del paciente.
   * En esta fase beta, aceptamos el ID del piloto o generamos uno genérico para pruebas.
   */
  login: async (identification: string, password?: string): Promise<UserSession> => {
    try {
      const isDev = import.meta.env.DEV;
      const baseUrl = isDev ? '/api-render' : 'https://doctor-antivejez-web.onrender.com';
      const response = await axios.post(`${baseUrl}/mobile-auth-v1`, { identification, password });
      const { token, patient } = response.data;

      // Almacenamos los datos consolidados del perfil en el store global para evitar clusters de llamadas
      useProfileStore.getState().setProfileData({
        biologicalAge: patient.biophysicsTests?.[0]?.biologicalAge || null,
        chronologicalAge: patient.chronologicalAge,
        guides: patient.guides || [],
        foodPlans: patient.foodPlans || [],
        bloodType: patient.bloodType,
        fetchedAt: Date.now()
      });

      const session: UserSession = {
        id: patient.id,
        token: token,
        name: patient.name, // El backend ya envía el nombre concatenado
        email: patient.email,
        role: 'PATIENT',
        lastLoginAt: new Date().toISOString()
      };

      localStorage.setItem('auth_token', token);
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    } catch (error: any) {
      const message = error.response?.data?.error || "Error al iniciar sesión. Verifique sus credenciales.";
      throw new Error(message);
    }
  },


  /**
   * Finaliza la sesión y limpia el almacenamiento local.
   */
  logout: () => {
    localStorage.removeItem(SESSION_KEY);
    // Opcional: limpiar otros datos de caché si fuera necesario
  },

  /**
   * Recupera la sesión actual desde el almacenamiento persistente.
   */
  getCurrentUser: (): UserSession | null => {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return null;

    try {
      return JSON.parse(session);
    } catch (e) {
      console.error("Error al parsear la sesión persistente", e);
      return null;
    }
  },

  /**
   * Verifica si hay una sesión activa.
   */
  isAuthenticated: (): boolean => {
    return localStorage.getItem(SESSION_KEY) !== null;
  }
};
