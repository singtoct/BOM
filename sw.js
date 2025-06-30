const CACHE_NAME = 'bom-app-cache-v11';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
  '/src/index.tsx',
  '/src/index.css',
  '/metadata.json',
  '/src/types.ts',
  '/src/App.tsx',
  '/src/context/BomContext.tsx',
  '/src/components/Header.tsx',
  '/src/components/Modal.tsx',
  '/src/components/icons.tsx',
  '/src/components/Sidebar.tsx',
  '/src/pages/DashboardPage.tsx',
  '/src/pages/MaterialsPage.tsx',
  '/src/pages/ProductDetailPage.tsx',
  '/src/pages/ProductsPage.tsx',
  '/src/pages/ProductionCalculatorPage.tsx',
  '/src/pages/ReceiptReportPage.tsx',
  '/src/pages/DispatchPage.tsx',
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react-dom@^19.1.0/client',
  'https://esm.sh/xlsx@^0.18.5',
  'https://esm.sh/chart.js@^4.5.0',
  'https://esm.sh/react-chartjs-2@^5.3.0',
  'https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap',
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline resources');
      // Use addAll with a new Request object to bypass cache for the initial caching
      const cachePromises = FILES_TO_CACHE.map((fileToCache) => {
        return cache.add(new Request(fileToCache, {cache: 'reload'}));
      });
      return Promise.all(cachePromises);
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