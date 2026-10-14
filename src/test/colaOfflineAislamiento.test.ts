/**
 * Lo que queda en el dispositivo cuando el paciente cierra sesión.
 *
 * La cola offline vive en IndexedDB, que ni `logout()` ni el reseteo de
 * emergencia `?clear=1` tocaban: las escrituras de un paciente seguían en el
 * aparato —cifradas, pero con clave ligada al dispositivo, de modo que el
 * siguiente usuario del mismo teléfono podría descifrarlas— hasta que
 * caducaran a los siete días.
 *
 * El arreglo tiene un límite deliberado: NO se borra lo que aún no se ha
 * sincronizado. Destruir un registro clínico que el paciente escribió sin
 * conexión, para resolver un problema de retención, sería un remedio peor que
 * la enfermedad. Primero se intenta enviarlo; solo lo ya enviado se retira.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { offlineQueue } from '../services/offlineQueue';
import { authService } from '../services/authService';
import { tokenStore } from '../services/tokenStore';

const SESSION_KEY = 'rejuvenate_session_v1';
const comoPaciente = (id: string) =>
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id, name: 'Paciente' }));

const encolar = (url: string) =>
  offlineQueue.enqueue({ url, method: 'POST', body: JSON.stringify({ notes: 'diario' }), headers: {} });

beforeEach(async () => {
  localStorage.clear();
  await offlineQueue.clearAll();
  vi.restoreAllMocks();
});

afterEach(async () => {
  await offlineQueue.clearAll();
});

describe('reseteo de emergencia', () => {
  it('clearAll deja la cola vacía', async () => {
    comoPaciente('A');
    await encolar('/mobile-adherence-v1');
    await encolar('/mobile-biometrics-v1');
    expect(await offlineQueue.count()).toBe(2);

    await offlineQueue.clearAll();
    expect(await offlineQueue.count()).toBe(0);
  });

  it('no falla si la cola ya está vacía', async () => {
    await expect(offlineQueue.clearAll()).resolves.toBeUndefined();
  });
});

describe('retirada de las escrituras ya sincronizadas', () => {
  it('quita las del paciente que se va', async () => {
    comoPaciente('A');
    await encolar('/mobile-adherence-v1');
    expect(await offlineQueue.count()).toBe(1);

    await offlineQueue.removeForPatient('A');
    expect(await offlineQueue.count()).toBe(0);
  });

  it('no toca las de otro paciente del mismo dispositivo', async () => {
    comoPaciente('A');
    await encolar('/mobile-adherence-v1');
    comoPaciente('B');
    await encolar('/mobile-biometrics-v1');

    await offlineQueue.removeForPatient('A');

    expect(await offlineQueue.count()).toBe(1);
    comoPaciente('B');
    const quedan = await offlineQueue.dequeueForCurrentPatient();
    expect(quedan).toHaveLength(1);
    expect(quedan[0].url).toBe('/mobile-biometrics-v1');
  });

  it('ignorar un paciente sin id no borra nada', async () => {
    comoPaciente('A');
    await encolar('/mobile-adherence-v1');
    await offlineQueue.removeForPatient('');
    expect(await offlineQueue.count()).toBe(1);
  });
});

describe('aislamiento entre pacientes al reproducir', () => {
  it('el paciente B nunca recibe las escrituras de A', async () => {
    comoPaciente('A');
    await encolar('/mobile-adherence-v1');

    comoPaciente('B');
    expect(await offlineQueue.dequeueForCurrentPatient()).toEqual([]);
  });
});

describe('cierre de sesión', () => {
  const esperarCola = () => new Promise((r) => setTimeout(r, 60));

  it('envía lo pendiente y lo retira del dispositivo', async () => {
    comoPaciente('A');
    await encolar('/mobile-adherence-v1');
    tokenStore.setAccessToken('token-de-A');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);

    authService.logout();
    await esperarCola();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer token-de-A');
    expect(await offlineQueue.count()).toBe(0);
  });

  it('sin conexión NO destruye lo que el paciente escribió', async () => {
    comoPaciente('A');
    await encolar('/mobile-adherence-v1');
    tokenStore.setAccessToken('token-de-A');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

    authService.logout();
    await esperarCola();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(await offlineQueue.count()).toBe(1);
  });

  it('si el servidor rechaza, la escritura se conserva para reintentar', async () => {
    comoPaciente('A');
    await encolar('/mobile-adherence-v1');
    tokenStore.setAccessToken('token-de-A');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);

    authService.logout();
    await esperarCola();

    expect(await offlineQueue.count()).toBe(1);
  });

  it('no toca la cola de otro paciente del dispositivo', async () => {
    comoPaciente('B');
    await encolar('/mobile-biometrics-v1');
    comoPaciente('A');
    await encolar('/mobile-adherence-v1');
    tokenStore.setAccessToken('token-de-A');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);

    authService.logout();
    await esperarCola();

    expect(await offlineQueue.count()).toBe(1);
    comoPaciente('B');
    expect(await offlineQueue.dequeueForCurrentPatient()).toHaveLength(1);
  });
});
