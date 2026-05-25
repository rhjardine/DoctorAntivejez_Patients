// src/services/offlineQueue.ts
const DB_NAME = 'rejuvenate-offline-queue';
const STORE_NAME = 'pending-writes';
const DB_VERSION = 1;

export interface QueuedWrite {
    id?: number;          // auto-increment IDB key
    url: string;          // full endpoint path e.g. '/mobile-adherence-v1'
    method: 'POST' | 'PATCH';
    body: string;         // JSON.stringify of payload
    headers: Record<string, string>;  // include Authorization header
    timestamp: number;    // Date.now() — for TTL enforcement
    retryCount: number;   // increment on each failed retry
}

class OfflineQueue {
    private async openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);

            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = request.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    async enqueue(write: Omit<QueuedWrite, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            // Cierre de Brecha de Seguridad Offline: No guardar Authorization header en IndexedDB
            const safeHeaders = { ...write.headers };
            delete safeHeaders['Authorization'];
            delete safeHeaders['authorization'];

            const fullWrite: QueuedWrite = {
                ...write,
                headers: safeHeaders,
                timestamp: Date.now(),
                retryCount: 0,
            };

            const request = store.add(fullWrite);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async updateRetryCount(id: number, retryCount: number): Promise<void> {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const getRequest = store.get(id);
            getRequest.onsuccess = () => {
                const data = getRequest.result as QueuedWrite;
                if (data) {
                    data.retryCount = retryCount;
                    const putRequest = store.put(data);
                    putRequest.onsuccess = () => resolve();
                    putRequest.onerror = () => reject(putRequest.error);
                } else {
                    resolve();
                }
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async dequeueAll(): Promise<QueuedWrite[]> {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async remove(id: number): Promise<void> {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async count(): Promise<number> {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.count();

            request.onsuccess = () => resolve(request.result || 0);
            request.onerror = () => reject(request.error);
        });
    }

    async pruneExpired(ttlMs: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('timestamp');

            const expirationTime = Date.now() - ttlMs;
            const range = IDBKeyRange.upperBound(expirationTime);

            const request = index.openCursor(range);

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
                if (cursor) {
                    store.delete(cursor.primaryKey);
                    cursor.continue();
                } else {
                    resolve();
                }
            };

            request.onerror = () => reject(request.error);
        });
    }
}

export const offlineQueue = new OfflineQueue();
