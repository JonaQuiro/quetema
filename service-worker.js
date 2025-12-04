const CACHE = "quetema-cache-v4";

const FILES = [
  "./",
  "./index.html",
  "./preguntas.js",
  "./manifest.json",
  "./logo.png"
];

// INSTALACIÓN: Cachea los archivos base
self.addEventListener("install", evt => {
  evt.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
  self.skipWaiting();
});

// ACTIVACIÓN: Limpia cachés viejos
self.addEventListener("activate", evt => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// FETCH: Stale-While-Revalidate (rápido + mantiene actualizado)
self.addEventListener("fetch", evt => {
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      const fetchPromise = fetch(evt.request)
        .then(networkRes => {
          // actualizar caché con la respuesta nueva
          return caches.open(CACHE).then(cache => {
            cache.put(evt.request, networkRes.clone());
            return networkRes;
          });
        })
        .catch(() => cacheRes); // offline fallback

      return cacheRes || fetchPromise;
    })
  );
});
