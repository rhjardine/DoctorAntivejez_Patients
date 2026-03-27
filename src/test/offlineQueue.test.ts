import { describe, it, expect, beforeEach } from 'vitest';
import { offlineQueue, QueuedWrite } from '../services/offlineQueue';

describe('offlineQueue', () => {
    beforeEach(async () => {
        const items = await offlineQueue.dequeueAll();
        for (const item of items) {
            if (item.id) await offlineQueue.remove(item.id);
        }
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
});
