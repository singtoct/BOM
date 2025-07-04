const CACHE_NAME = 'bom-app-cache-v9';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
  '/index.tsx',
  '/metadata.json',
  '/types.ts',
  '/App.tsx',
  '/context/BomContext.tsx',
  '/components/Header.tsx',
  '/components/Modal.tsx',
  '/components/icons.tsx',
  '/pages/DashboardPage.tsx',
  '/pages/MaterialsPage.tsx',
  '/pages/ProductDetailPage.tsx',
  '/pages/ProductsPage.tsx',
  '/pages/ProductionCalculatorPage.tsx',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap',
  'https://esm.sh/react@19',
  'https://esm.sh/react-dom@19',
  'https://esm.sh/react-dom@19/client',
  'https://esm.sh/xlsx@0.18.5',
  'https://esm.sh/chart.js@4.4.2',
  'https://esm.sh/react-chartjs-2@5.2.0',
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline resources');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
   if (evt.request.method !== 'GET') {
      return;
   }
  // Strategy: Network falling back to cache
  evt.respondWith(
    fetch(evt.request).then((networkResponse) => {
        // If the fetch is successful, clone the response and cache it.
        if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(evt.request, responseToCache);
            });
        }
        return networkResponse;
    }).catch(() => {
        // If the network fails, try to serve from cache.
        return caches.match(evt.request).then((cachedResponse) => {
            return cachedResponse || Response.error();
        });
    })
  );
});