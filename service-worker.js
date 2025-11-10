// service-worker.js
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('borel-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/fotogalerie.html',
        '/minihra.html',
        '/style.css',
        '/main.js',
        '/theme.js',
        '/gallery.js'
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});