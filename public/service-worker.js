const CACHE_NAME = "borel-cache-v14";

const urlsToCache = [
  "/",
  "/fotogalerie",
  "/minihra",

  // CSS + JS (BEM verze s verzováním)
  "/style-bem.css?v=500",
  "/theme-bem.js?v=7",
  "/main-bem.js?v=120",
  "/gallery-bem.js?v=500",
  "/minihra-bem.js?v=400",
  "/sw-register.js?v=3",

  // Ikony pro nav + theme toggle
  "/icons/home.svg",
  "/icons/gallery.svg",
  "/icons/game.svg",
  "/icons/sun.svg",
  "/icons/moon.svg",

  // Základní assets
  "/logo.png",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/favicon.svg",
  "/favicon-32.png",
  "/favicon-16.png",
  "/apple-touch-icon.png"
];

// === Instalace SW a cacheování statických souborů ===
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(urlsToCache);
    } catch (err) {
      // tichý fail – SW se jen nainstaluje bez offline cache
      console.warn("[SW] Cache install failed", err);
    }
  })());

  // nová verze SW se aktivuje hned
  self.skipWaiting();
});

// === Aktivace SW, mazání starých verzí ===
self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
      // okamžitě převzít kontrolu nad klienty
      await self.clients.claim();
    })()
  );
});

// === Odpověď z cache nebo síť ===
self.addEventListener("fetch", event => {
  // nelezeme do ne-GET požadavků (formuláře, API POST...)
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;

      return fetch(event.request).catch(() => {
        // fallback – když je uživatel offline a naviguje na stránku
        if (event.request.mode === "navigate") {
          return caches.match("/");
        }
      });
    })
  );
});