// Cambiá la versión cuando quieras forzar actualización
const CACHE = "impostores-v2";

const FILES = [
  "./",
  "./index.html",
  "./content/personajes.js",
  "./manifest.json",
  "./logo.png"
];

// INSTALACIÓN
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
});

// ACTIVACIÓN
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  clients.claim();
});

// ESTRATEGIA:
// - HTML → NETWORK FIRST (para que actualice diseño)
// - JS, JSON, IMÁGENES → CACHE FIRST + actualización silenciosa
self.addEventListener("fetch", event => {
  if (event.request.mode === "navigate") {
    // HTML siempre se trae fresco
    event.respondWith(
      fetch(event.request).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // cache first para assets
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request)
        .then(networkResp => {
          caches.open(CACHE).then(cache => {
            cache.put(event.request, networkResp.clone());
          });
          return networkResp;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
