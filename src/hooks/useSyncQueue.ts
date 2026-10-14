import { useEffect } from 'react';
import { offlineQueue } from '../services/offlineQueue';
import apiClient from '../services/apiClient';
import { logger } from '../utils/logger';

/** Intentos antes de abandonar una escritura que el servidor rechaza por su contenido. */
const MAX_REINTENTOS = 3;

const estadoDe = (error: unknown): number | undefined =>
  typeof error === 'object' && error !== null && 'status' in error
    ? (error as { status?: number }).status
    : undefined;

/**
 * Reproduce contra el servidor las escrituras que el paciente dejó encoladas
 * sin conexión.
 *
 * Sale por `apiClient` y no por `fetch` nativo a propósito. Tras recargar la
 * página el access token vive solo en memoria y está vacío hasta que algo
 * dispare el ciclo de refresco; con `fetch` las peticiones salían sin
 * `Authorization`, el servidor devolvía 401, y la cola contaba ese 401 como un
 * reintento fallido y BORRABA el registro al tercero. `apiClient` renueva el
 * token y repite la petición antes de que eso ocurra.
 *
 * Y aunque el refresco no llegue a tiempo, un 401 nunca consume reintentos: la
 * escritura no tiene nada de malo, es la sesión la que aún no está lista.
 */
export const drenarCola = async (): Promise<void> => {
  try {
    // Solo las del paciente con sesión abierta. `dequeueAll()` incluiría las de
    // sesiones anteriores en el mismo dispositivo, y se reenviarían con el
    // token del paciente actual.
    const pendientes = await offlineQueue.dequeueForCurrentPatient();
    if (pendientes.length === 0) return;

    for (const item of pendientes) {
      try {
        // `baseURL: ''` porque la URL encolada ya es absoluta: axios la
        // concatenaría de nuevo con la base y la dejaría inservible.
        await apiClient.request({
          url: item.url,
          baseURL: '',
          method: item.method,
          headers: item.headers,
          data: item.body ? JSON.parse(item.body) : undefined,
        });
        await offlineQueue.remove(item.id!);
      } catch (error) {
        const status = estadoDe(error);

        // Ya aplicada en el servidor: retirarla es lo correcto.
        if (status === 409) {
          await offlineQueue.remove(item.id!);
          continue;
        }

        // Sesión aún no lista. No se penaliza la escritura ni se toca la cola:
        // se reintentará cuando el token esté disponible.
        if (status === 401) {
          logger.warn('[SyncQueue] Sesión no disponible todavía; la cola espera', {
            reason: 'QUEUE_WAITING_FOR_SESSION',
          });
          continue;
        }

        // Sin código de estado es un fallo de red: se deja todo como está y se
        // corta el bucle para no golpear al servidor estando sin conexión.
        if (status === undefined) {
          logger.warn('[SyncQueue] Red caída durante el drenado; se reintentará', {
            reason: 'QUEUE_NETWORK_FAIL',
          });
          break;
        }

        // El servidor rechaza el contenido (400, 422, 500…). Eso sí se reintenta
        // un número acotado de veces antes de abandonar.
        if (item.retryCount >= MAX_REINTENTOS) {
          await offlineQueue.remove(item.id!);
          logger.warn('[SyncQueue] Escritura abandonada tras agotar reintentos', {
            reason: 'QUEUE_GAVE_UP',
            status,
            intentos: item.retryCount,
          });
        } else {
          await offlineQueue.updateRetryCount(item.id!, item.retryCount + 1);
        }
      }
    }

    // Caducan las entradas de más de 7 días.
    await offlineQueue.pruneExpired();
  } catch (error) {
    logger.error('[SyncQueue] Error ejecutando el drenado', {
      reason: 'QUEUE_DRAIN_ERROR',
    });
  }
};

export const useSyncQueue = () => {
  useEffect(() => {
    const drain = () => {
      void drenarCola();
    };

    if (navigator.onLine) {
      // Un respiro para que la app termine de arrancar. Ya no es crítico —
      // apiClient resuelve el token por su cuenta— pero evita competir con las
      // peticiones del primer render.
      setTimeout(drain, 2000);
    }

    window.addEventListener('online', drain);
    return () => window.removeEventListener('online', drain);
  }, []);
};
