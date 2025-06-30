// This service worker is designed to unregister itself and clear all related caches.
// This is a one-time operation to fix caching issues for users with the old service worker.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Unregister the service worker.
      await self.registration.unregister();
      
      // Delete all caches created by this origin.
      const keys = await caches.keys();
      await Promise.all(keys.map(key => {
        console.log(`[ServiceWorker] Deleting cache: ${key}`);
        return caches.delete(key);
      }));
      
      // Force-reload all clients to ensure they get the non-service-worker-controlled page.
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => {
        client.navigate(client.url);
      });
      
      console.log('Service Worker unregistered and all caches have been cleared.');
    })()
  );
});
