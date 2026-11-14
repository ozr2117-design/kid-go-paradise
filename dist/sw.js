const CACHE_NAME = 'weiqi-kids-offline-v9.53';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './favicon.svg',
  './manifest.json',
  './models/katago-human-sl-18k-15k.onnx',
  './ort-wasm-simd-threaded.wasm',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        // Fallback for missing optional local assets during offline install
        console.warn('[SW] Cache addAll warning:', err);
        return Promise.all(
          PRECACHE_ASSETS.map((asset) =>
            cache.add(asset).catch((e) => console.warn(`[SW] Failed caching ${asset}:`, e))
          )
        );
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Never intercept or cache API endpoints
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) return;

  // Cache-first for large ONNX models and WASM binaries, network-first for HTML
  const isHeavyStaticAsset =
    url.pathname.endsWith('.onnx') ||
    url.pathname.endsWith('.wasm');

  if (isHeavyStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Network-first with immediate offline cache fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          return caches.match('./index.html');
        });
      })
  );
});
