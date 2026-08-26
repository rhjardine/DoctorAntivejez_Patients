import { describe, it, expect, beforeEach } from 'vitest';
import { offlineQueue, QueuedWrite } from '../services/offlineQueue';

const iniciarSesion = (patientId: string) =>
    localStorage.setItem(
        'rejuvenate_session_v1',
        JSON.stringify({ id: patientId, name: 'Test', role: 'PATIENT' }),
    );

const cerrarSesion = () => localStorage.removeItem('rejuvenate_session_v1');

describe('offlineQueue', () => {
    beforeEach(async () => {
        const items = await offlineQueue.dequeueAll();
        for (const item of items) {
            if (item.id) await offlineQueue.remove(item.id);
        }
        localStorage.clear();
    });

    it('enqueue agrega un item a la cola', async () => {
        const write: any = { url: '/test', method: 'POST', body: '{}', headers: {} };
        await offlineQueue.enqueue(write);
        const count = await offlineQueue.count();
        expect(count).toBe(1);
    });

    it('dequeueAll retorna todos los items encolados', async () => {
        await offlineQueue.enqueue({ url: '/1', method: 'POST', body: '', headers: {} });
        await offlineQueue.enqueue({ url: '/2', method: 'POST', body: '', headers: {} });
        const items = await offlineQueue.dequeueAll();
        expect(items.length).toBe(2);
    });

    it('remove elimina un item por ID', async () => {
        await offlineQueue.enqueue({ url: '/test', method: 'POST', body: '', headers: {} });
        const items = await offlineQueue.dequeueAll();
        const id = items[0].id!;
        await offlineQueue.remove(id);
        const count = await offlineQueue.count();
        expect(count).toBe(0);
    });

    it('count retorna el número correcto de items', async () => {
        expect(await offlineQueue.count()).toBe(0);
        await offlineQueue.enqueue({ url: '/test', method: 'POST', body: '', headers: {} });
        expect(await offlineQueue.count()).toBe(1);
    });

    it('pruneExpired elimina items más viejos que el TTL', async () => {
        // IndexedDB timestamps are tricky to mock without vi.setSystemTime 
        // but let's assume it works or use a very small TTL if we can't mock time easily.
        await offlineQueue.enqueue({ url: '/old', method: 'POST', body: '', headers: {} });

        // Simular paso del tiempo es difícil con IndexedDB real (vía fake-indexeddb)
        // pero podemos probar con un TTL de 0.
        await offlineQueue.pruneExpired(0);
        expect(await offlineQueue.count()).toBe(0);
    });

    it('items recientes no son eliminados por pruneExpired', async () => {
        await offlineQueue.enqueue({ url: '/new', method: 'POST', body: '', headers: {} });
        await offlineQueue.pruneExpired(7 * 24 * 60 * 60 * 1000); // 7 dias
        expect(await offlineQueue.count()).toBe(1);
    });

    // ⚠️ INTEGRIDAD CLÍNICA — aislamiento entre pacientes.
    //
    // La cola vive en IndexedDB, que NO se borra al cerrar sesión, y el replay
    // (useSyncQueue) inyecta el token de la sesión activa. Sin filtrar por
    // paciente, en un dispositivo compartido la entrada del paciente A se
    // reenviaría con las credenciales de B y acabaría en la historia clínica
    // de B.
    describe('aislamiento entre pacientes', () => {
        it('sella cada escritura con el paciente que la originó', async () => {
            iniciarSesion('paciente-A');
            await offlineQueue.enqueue({
                url: '/mobile-adherence-v1',
                method: 'POST',
                body: JSON.stringify({ type: 'journal', notes: 'texto privado de A' }),
                headers: {},
            });

            const [item] = await offlineQueue.dequeueAll();
            expect(item.patientId).toBe('paciente-A');
        });

        it('NO reproduce las escrituras de otro paciente tras cambiar de sesión', async () => {
            iniciarSesion('paciente-A');
            await offlineQueue.enqueue({
                url: '/mobile-adherence-v1',
                method: 'POST',
                body: JSON.stringify({ notes: 'texto privado de A' }),
                headers: {},
            });

            // A cierra sesión y B entra en el mismo dispositivo.
            cerrarSesion();
            iniciarSesion('paciente-B');

            const paraB = await offlineQueue.dequeueForCurrentPatient();
            expect(paraB).toHaveLength(0);

            // La entrada de A sigue en la cola: es suya, no se descarta.
            expect(await offlineQueue.count()).toBe(1);
        });

        it('devuelve sus escrituras al paciente cuando vuelve a entrar', async () => {
            iniciarSesion('paciente-A');
            await offlineQueue.enqueue({
                url: '/mobile-adherence-v1',
                method: 'POST',
                body: '{}',
                headers: {},
            });

            cerrarSesion();
            iniciarSesion('paciente-B');
            expect(await offlineQueue.dequeueForCurrentPatient()).toHaveLength(0);

            cerrarSesion();
            iniciarSesion('paciente-A');
            expect(await offlineQueue.dequeueForCurrentPatient()).toHaveLength(1);
        });

        it('no deja el cuerpo legible en reposo, pero lo devuelve descifrado al drenar', async () => {
            iniciarSesion('paciente-A');
            const secreto = JSON.stringify({ notes: 'hoy me sentí ansioso' });

            await offlineQueue.enqueue({
                url: '/mobile-adherence-v1',
                method: 'POST',
                body: secreto,
                headers: {},
            });

            // En reposo: marcado como cifrado y sin el texto original.
            const [enReposo] = await offlineQueue.dequeueAll();
            expect(enReposo.body.startsWith('enc:v1:')).toBe(true);
            expect(enReposo.body).not.toContain('ansioso');

            // Al drenar: el cuerpo vuelve a ser el original para el replay.
            const [paraEnviar] = await offlineQueue.dequeueForCurrentPatient();
            expect(paraEnviar.body).toBe(secreto);
        });

        it('sin sesión no reproduce nada', async () => {
            iniciarSesion('paciente-A');
            await offlineQueue.enqueue({
                url: '/x',
                method: 'POST',
                body: '{}',
                headers: {},
            });

            cerrarSesion();
            expect(await offlineQueue.dequeueForCurrentPatient()).toHaveLength(0);
        });
    });
});
