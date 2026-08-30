import { useEffect } from 'react';
import { offlineQueue } from '../services/offlineQueue';
import { tokenStore } from '../services/tokenStore';

export const useSyncQueue = () => {
    useEffect(() => {
        const drain = async () => {
            try {
                // Solo las del paciente con sesión abierta. `dequeueAll()` incluiría
                // las de sesiones anteriores en el mismo dispositivo, y la línea de
                // abajo las reenviaría con el token del paciente actual.
                const pending = await offlineQueue.dequeueForCurrentPatient();
                if (pending.length === 0) return;

                console.log(`[SyncQueue] Drain triggered. Found ${pending.length} pending items.`);

                for (const item of pending) {
                    try {
                        // Apply fresh token in real-time to avoid sending expired tokens stored offline
                        const currentToken = tokenStore.getAccessToken();
                        const headers = { ...item.headers };
                        if (currentToken) {
                            headers['Authorization'] = `Bearer ${currentToken}`;
                        }

                        // Attempt to replay the write
                        const response = await fetch(item.url, {
                            method: item.method,
                            headers: headers,
                            body: item.body,
                        });

                        if (response.ok || response.status === 409) {
                            // 409 Conflict = already applied = safe to remove
                            await offlineQueue.remove(item.id!);
                        } else {
                            // If it fails with an explicit code (e.g. 400 Bad Request, 401 Unauthorized), we increment the retry count
                            if (item.retryCount >= 3) {
                                // Give up after 3 attempts — remove and log
                                await offlineQueue.remove(item.id!);
                                console.warn('[SyncQueue] Abandoned after 3 retries:', item.url);
                            } else {
                                await offlineQueue.updateRetryCount(item.id!, item.retryCount + 1);
                            }
                        }
                    } catch (error) {
                        // Network failed again while draining — leave in queue and break loop to avoid pounding offline loop
                        console.warn('[SyncQueue] Network fail while draining, will retry later.');
                        break;
                    }
                }

                // Prune stale entries (> 7 days old)
                await offlineQueue.pruneExpired();
            } catch (err) {
                console.error('[SyncQueue] Drain execution error:', err);
            }
        };

        // Drain on mount if online
        if (navigator.onLine) {
            // slight delay to let the app finish booting and fetching critical tokens
            setTimeout(() => drain(), 2000);
        }

        // Drain when coming back online
        window.addEventListener('online', drain);
        return () => window.removeEventListener('online', drain);
    }, []);
};
