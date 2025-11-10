const CACHE_NAME = 'borel-cache-v4';
const ASSETS = [
  '/',
  '/index.html',
  '/fotogalerie.html',
  '/minihra.html',
  '/style.css',
  '/main.js',
  '/gallery.js',
  '/game.js',
  '/foto/thumbnails/foto1.jpg',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp =>
      resp || fetch(event.request)
    )
  );
});