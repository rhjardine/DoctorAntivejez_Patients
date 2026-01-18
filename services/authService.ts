
import { UserSession } from '../types';

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
  login: async (documentId: string): Promise<UserSession> => {
    // Simulación de latencia de red
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Validamos IDs específicos para el piloto beta
    const isValidPilot = documentId === '5963578' || documentId === '12345678';
    
    if (!isValidPilot && documentId.length < 5) {
      throw new Error("ID de paciente no reconocido. Contacte a la clínica.");
    }

    const mockSession: UserSession = {
      id: documentId,
      token: `beta-token-${Math.random().toString(36).substr(2)}`,
      name: documentId === '5963578' ? "Rhys Jardine" : "Paciente Beta",
      email: documentId === '5963578' ? "rhjardine@gmail.com" : "paciente@ejemplo.com",
      role: 'PATIENT',
      lastLoginAt: new Date().toISOString()
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(mockSession));
    return mockSession;
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
