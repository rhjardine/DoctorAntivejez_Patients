// public/sw-messages.js
self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Invalidar caché de manifest en SW anterior para forzar nuevo ícono
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k.includes('manifest') || k.includes('workbox-precache'))
                    .map(k => caches.delete(k))
            )
        )
    );
});
