const CACHE_NAME = "borel-cache-v1";
const ASSETS = [
  "/", // hlavní stránka
  "/index.html",
  "/fotogalerie.html",
  "/minihra.html",
  "/style.css",
  "/main.js",
  "/gallery.js",
  "/minihra.js",
  "/theme.js",
  "/icon-192.png",
  "/icon-512.png"
];

// === Instalace SW a cacheování statických souborů ===
self.addEventListener("install", event => {
  console.log("📦 Instalace service workeru...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// === Aktivace SW, mazání starých verzí ===
self.addEventListener("activate", event => {
  console.log("🔁 Aktivace service workeru...");
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});

// === Odpověď z cache nebo síť ===
self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(resp => {
        // volitelně ukládej nové věci do cache
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
        return resp;
      }).catch(() => caches.match("/index.html"));
    })
  );
});