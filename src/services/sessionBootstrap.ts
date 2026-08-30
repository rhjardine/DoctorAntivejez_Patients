import { tokenStore } from './tokenStore';
import { clearPatientScopedStorage } from '../utils/storageCleanup';
import { logger } from '../utils/logger';

/**
 * Validación de sesión en arranque en frío.
 *
 * El problema que resuelve: el guard de rutas decidía si había sesión leyendo
 * `auth-storage` de localStorage. Ese valor es un dato persistido por el
 * cliente, no una credencial: sobrevive a desinstalar y reinstalar la PWA
 * —Chrome conserva el almacenamiento del origen— y basta para que el router
 * pintara el Dashboard con datos clínicos sin que nadie hubiera demostrado ser
 * el paciente.
 *
 * El access token vive solo en memoria (ADR-002), así que tras un arranque en
 * frío SIEMPRE está vacío. Lo único que puede reconstruir la sesión es el
 * refresh token. Por tanto:
 *
 *   sin refresh token           → la sesión es un huérfano: no hay forma de
 *                                 obtener credenciales. Se limpia y se exige
 *                                 iniciar sesión.
 *   con refresh token válido    → se canjea por un access token en memoria y se
 *                                 continúa (ADR-002).
 *   refresh rechazado (4xx)     → el servidor dice que no. Se limpia y se exige
 *                                 iniciar sesión.
 *   sin respuesta del servidor  → no se puede afirmar nada. NO se cierra la
 *                                 sesión: la app es una PWA y funcionar sin red
 *                                 es una capacidad buscada, no un fallo. Se
 *                                 continúa sin token; la primera petición que
 *                                 salga volverá a intentar el refresh y, si
 *                                 fracasa, el interceptor de apiClient cierra.
 *
 * Se hace ANTES de montar React, para que ninguna ruta protegida llegue a
 * pintarse sobre una sesión sin validar.
 */

const SESSION_KEY = 'rejuvenate_session_v1';
const AUTH_STORE_KEY = 'auth-storage';
const REFRESH_TOKEN_KEY = 'refresh_token';

/** Margen para no dejar el arranque colgado si el backend no responde. */
const REFRESH_TIMEOUT_MS = 6000;

export type SessionBootResult =
  /** No había ninguna sesión persistida: arranque anónimo normal. */
  | 'anonymous'
  /** Sesión reconstruida: hay access token en memoria. */
  | 'valid'
  /** Sesión inservible o rechazada: el almacenamiento quedó limpio. */
  | 'invalid'
  /** No se pudo verificar por falta de red; la sesión se conserva. */
  | 'unverified';

/** ¿Hay una sesión persistida que el router vaya a dar por buena? */
const haySesionPersistida = (): boolean => {
  try {
    if (localStorage.getItem(SESSION_KEY)) return true;
    const bruto = localStorage.getItem(AUTH_STORE_KEY);
    if (!bruto) return false;
    const estado = JSON.parse(bruto)?.state;
    return Boolean(estado?.isAuthenticated || estado?.session);
  } catch {
    // Un auth-storage ilegible no puede autorizar nada.
    return false;
  }
};

/** Deja el dispositivo sin rastro de la sesión rechazada. */
const descartarSesion = (motivo: string): 'invalid' => {
  const removedKeys = clearPatientScopedStorage();
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_STORE_KEY);
  sessionStorage.clear();
  tokenStore.clearAccessToken();
  logger.warn('[Boot] Sesión descartada en el arranque', { reason: motivo });
  logger.audit('cold_start_session_rejected', { reason: motivo, removedKeys });
  return 'invalid';
};

export const validateStoredSession = async (): Promise<SessionBootResult> => {
  if (!haySesionPersistida()) return 'anonymous';

  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  // Sesión huérfana: hay estado de "autenticado" pero ninguna credencial con la
  // que respaldarlo. Es el caso que abría el Dashboard sin pedir nada.
  if (!refreshToken) return descartarSesion('NO_REFRESH_TOKEN');

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), REFRESH_TIMEOUT_MS);

  try {
    // Se usa fetch y no apiClient a propósito: el interceptor de apiClient
    // redirige por su cuenta ante un 401, y aquí hace falta decidir el
    // resultado del arranque antes de que exista un router al que redirigir.
    const respuesta = await fetch(`${apiUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      signal: controlador.signal,
    });

    if (respuesta.status === 401 || respuesta.status === 403) {
      return descartarSesion(`REFRESH_REJECTED_${respuesta.status}`);
    }

    if (!respuesta.ok) {
      // 5xx, 404 o cualquier otra cosa: es un problema del servidor, no una
      // afirmación sobre esta sesión. Cerrarla castigaría al paciente por una
      // caída ajena.
      logger.warn('[Boot] El refresh no pudo completarse', {
        reason: 'REFRESH_UNAVAILABLE',
        status: respuesta.status,
      });
      return 'unverified';
    }

    const datos = await respuesta.json();
    if (!datos?.accessToken) return descartarSesion('REFRESH_SIN_TOKEN');

    tokenStore.setAccessToken(datos.accessToken);
    if (datos.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, datos.refreshToken);
    }
    return 'valid';
  } catch {
    // Aborto por tiempo o fallo de red: no hay veredicto del servidor.
    logger.warn('[Boot] Sesión no verificada: sin respuesta del servidor', {
      reason: 'REFRESH_NETWORK',
    });
    return 'unverified';
  } finally {
    clearTimeout(temporizador);
  }
};
