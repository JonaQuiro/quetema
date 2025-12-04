const CACHE = "quetema-cache-v1";
const FILES = [
  "./",
  "./index.html",
  "./preguntas.js",
  "./manifest.json"
];

// Instala SW
self.addEventListener("install", evt => {
  evt.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
});

// Activa SW
self.addEventListener("activate", evt => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => (k !== CACHE ? caches.delete(k) : null))
      )
    )
  );
});

// Intercepta requests
self.addEventListener("fetch", evt => {
  evt.respondWith(
    caches.match(evt.request).then(r => r || fetch(evt.request))
  );
});
