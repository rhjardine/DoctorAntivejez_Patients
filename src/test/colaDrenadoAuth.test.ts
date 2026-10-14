/**
 * El drenado de la cola no puede destruir registros clínicos por un 401.
 *
 * Tras recargar la página el access token vive solo en memoria y está vacío
 * hasta que alguna petición dispare el ciclo de refresco. `drain()` salía con
 * `fetch` nativo —sin pasar por el interceptor de apiClient—, así que enviaba
 * sin cabecera `Authorization`, recibía 401, contaba un reintento y al tercero
 * BORRABA la escritura. Un paciente que anota su diario sin conexión y luego
 * recarga la app podía perderlo sin enterarse.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { offlineQueue } from '../services/offlineQueue';
import { drenarCola } from '../hooks/useSyncQueue';
import apiClient from '../services/apiClient';

const SESSION_KEY = 'rejuvenate_session_v1';
const comoPaciente = (id: string) =>
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id, name: 'Paciente' }));

const encolar = () =>
  offlineQueue.enqueue({
    url: 'https://backend/api/mobile-adherence-v1',
    method: 'POST',
    body: JSON.stringify({ notes: 'diario del paciente' }),
    headers: {},
  });

const error = (status: number) => Object.assign(new Error('fallo'), { status });

beforeEach(async () => {
  localStorage.clear();
  await offlineQueue.clearAll();
  comoPaciente('A');
  vi.restoreAllMocks();
});

afterEach(async () => {
  await offlineQueue.clearAll();
});

describe('sale por apiClient, no por fetch', () => {
  it('usa apiClient para que el interceptor renueve el token caducado', async () => {
    await encolar();
    const peticion = vi.spyOn(apiClient, 'request').mockResolvedValue({ status: 200 } as never);
    const fetchNativo = vi.fn();
    vi.stubGlobal('fetch', fetchNativo);

    await drenarCola();

    expect(peticion).toHaveBeenCalledTimes(1);
    expect(fetchNativo).not.toHaveBeenCalled();
    expect(await offlineQueue.count()).toBe(0);
  });
});

describe('un 401 nunca cuenta como reintento', () => {
  it('conserva la escritura intacta tras tres 401 seguidos', async () => {
    await encolar();
    vi.spyOn(apiClient, 'request').mockRejectedValue(error(401));

    await drenarCola();
    await drenarCola();
    await drenarCola();

    expect(await offlineQueue.count()).toBe(1);
    const [item] = await offlineQueue.dequeueForCurrentPatient();
    expect(item.retryCount).toBe(0);
  });

  it('cuando el token se renueva, la escritura por fin se envía', async () => {
    await encolar();
    const peticion = vi
      .spyOn(apiClient, 'request')
      .mockRejectedValueOnce(error(401))
      .mockResolvedValueOnce({ status: 200 } as never);

    await drenarCola();
    expect(await offlineQueue.count()).toBe(1);

    await drenarCola();
    expect(await offlineQueue.count()).toBe(0);
    expect(peticion).toHaveBeenCalledTimes(2);
  });
});

describe('errores que sí son del contenido', () => {
  it('un 400 sigue contando reintentos y se abandona al tercero', async () => {
    await encolar();
    vi.spyOn(apiClient, 'request').mockRejectedValue(error(400));

    await drenarCola();
    await drenarCola();
    await drenarCola();
    expect(await offlineQueue.count()).toBe(1);

    await drenarCola();
    expect(await offlineQueue.count()).toBe(0);
  });

  it('un 409 se considera ya aplicado y se retira', async () => {
    await encolar();
    vi.spyOn(apiClient, 'request').mockRejectedValue(error(409));

    await drenarCola();
    expect(await offlineQueue.count()).toBe(0);
  });

  it('una caída de red deja todo en la cola para más tarde', async () => {
    await encolar();
    vi.spyOn(apiClient, 'request').mockRejectedValue(new Error('Network Error'));

    await drenarCola();

    expect(await offlineQueue.count()).toBe(1);
    const [item] = await offlineQueue.dequeueForCurrentPatient();
    expect(item.retryCount).toBe(0);
  });
});
