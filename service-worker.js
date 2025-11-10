const CACHE_NAME = "borel-cache-v11";
const urlsToCache = [
  '/',
  '/fotogalerie',
  '/minihra',
  '/style.css',
  '/main.js',
  '/gallery.js',
  '/minihra.js',
  '/logo.png',
  '/manifest.json',
  "/theme.js",
  "/icon-192.png",
  "/icon-512.png"
];

// === Instalace SW a cacheování statických souborů ===
self.addEventListener("install", event => {
  console.log("📦 Instalace service workeru...");
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => cache.addAll(urlsToCache))
    .catch(err => console.warn("Chyba při cacheování:", err))
  );
});

// === Aktivace SW, mazání starých verzí ===
self.addEventListener("activate", event => {
  console.log("🔁 Aktivace service workeru...");
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
      keys
      .filter(key => key !== CACHE_NAME)
      .map(key => caches.delete(key))
    ))
  );
});

// === Odpověď z cache nebo síť ===
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        // fallback – kdyby uživatel byl offline
        if (event.request.mode === "navigate") {
          return caches.match("/");
        }
      });
    })
  );
});