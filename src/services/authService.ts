
import axios from 'axios';
import { UserSession } from '../types';
import apiClient from './apiClient';


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
      // Using full URL as requested for this specific fix, though apiClient usually handles base URL.
      // However, since we are using a root level handler in the web app, and the apiClient might be pointing to /api,
      // we need to be careful. The user instruction said: "Update the Mobile App authService.ts to call https://doctor-antivejez-web.onrender.com/mobile-auth-v1"
      // But we also have the reverse proxy setup. 
      // If I use apiClient.post('/mobile-auth-v1'), it will append to baseURL.
      // If baseURL is /api-render/api, it becomes /api-render/api/mobile-auth-v1, which is WRONG because the route is at root /mobile-auth-v1.
      // So I should use the proxy path but without /api.

      // Wait, the user said: "Update the Mobile App authService.ts to call https://doctor-antivejez-web.onrender.com/mobile-auth-v1"
      // But earlier we set up a proxy.
      // If I use the full URL, I bypass the proxy and hit CORS again if on localhost.
      // If I use the proxy, I need to make sure it maps correctly.
      // The proxy maps /api-render to https://doctor-antivejez-web.onrender.com
      // So /api-render/mobile-auth-v1 -> https://doctor-antivejez-web.onrender.com/mobile-auth-v1

      // Let's use axios directly or modify how we call it.
      // Or better, just use the relative path if I can, but apiClient has baseURL set.

      // I will use a direct axios call or override baseURL for this call if possible, 
      // but to stick to the user's request of "call https://doctor-antivejez-web.onrender.com/mobile-auth-v1",
      // I should probably respect that, BUT they also said "We will implement a Reverse Proxy strategy to handle CORS".
      // Using the full URL breaks the proxy strategy for localhost.

      // I will assume the user wants me to use the proxy path that corresponds to that URL.
      // Proxy: /api-render -> https://doctor-antivejez-web.onrender.com
      // Target: https://doctor-antivejez-web.onrender.com/mobile-auth-v1
      // Proxy Path: /api-render/mobile-auth-v1

      // However, apiClient has baseURL: import.meta.env.DEV ? '/api-render/api' : '.../api'
      // So apiClient.post('/...') appends to .../api.
      // I cannot use apiClient for a root level route easily if it forces /api.

      // I will import axios directly for this call to ensure I can control the URL, 
      // OR I can use apiClient with a full URL (axios supports this).
      // If I pass a full URL to axios, it ignores baseURL.

      // In Dev: /api-render/mobile-auth-v1
      // In Prod: https://doctor-antivejez-web.onrender.com/mobile-auth-v1

      const isDev = import.meta.env.DEV;
      const baseUrl = isDev ? '/api-render' : 'https://doctor-antivejez-web.onrender.com';
      const response = await axios.post(`${baseUrl}/mobile-auth-v1`, { identification, password });
      const { token, patient } = response.data;

      const session: UserSession = {
        id: patient.id,
        token: token,
        name: patient.name,
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
