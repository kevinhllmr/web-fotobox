const CACHE_NAME = 'web-fotobox-cache-v1';
const urlsToCache = [
  '/',
  '/web-fotobox#/home',
  '/web-fotobox#/photomode',
  '/images/de.svg',
  '/images/favicon.ico',
  '/images/gallery-icon.svg',
  '/images/gb.svg',
  '/images/home-bg.png',
  '/images/hsa-logo.png',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
  '/images/nfc-icon.svg',
  '/images/novotrend-logo.png',
  '/images/qr-codes.svg',
  '/images/tablet-icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => caches.match('/offline.html'))
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
