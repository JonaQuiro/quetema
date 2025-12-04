const CACHE = "quetema-cache-v3";
const PRECACHE = [
  "./",
  "./index.html",
  "./preguntas.js",
  "./manifest.json",
  "./logo.png"
];

// INSTALACIÓN
self.addEventListener("install", event => {
  console.log("[SW] Instalando…");

  event.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(PRECACHE);
    })
  );

  self.skipWaiting();
});

// ACTIVACIÓN
self.addEventListener("activate", event => {
  console.log("[SW] Activado");

  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    )
  );

  clients.claim();
});

// FETCH
self.addEventListener("fetch", event => {
  const req = event.request;

  // 1) No cachear llamadas a chrome-extension o analytics
  if (req.url.startsWith("chrome-extension") || req.url.includes("analytics")) {
    return event.respondWith(fetch(req));
  }

  // 2) HTML → Network First
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(res => {
          caches.open(CACHE).then(cache => cache.put(req, res.clone()));
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // 3) Otros archivos → Cache First
  event.respondWith(
    caches.match(req).then(cached => {
      return (
        cached ||
        fetch(req).then(res => {
          // NO guardar imágenes dinámicas (para evitar problemas)
          if (!req.url.endsWith(".jpg") && !req.url.endsWith(".png")) {
            caches.open(CACHE).then(cache => cache.put(req, res.clone()));
          }
          return res;
        })
      );
    })
  );
});

// MENSAJE skipWaiting
self.addEventListener("message", event => {
  if (event.data === "skipWaiting") self.skipWaiting();
});
