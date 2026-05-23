// ESTRATEGIA: Network first para HTML, Cache first para assets estáticos
// Cambiar el número de versión aquí fuerza a todos los navegadores a limpiar el caché
const CACHE_VERSION = 'v3';
const CACHE_NAME = `health-path-cache-${CACHE_VERSION}`;

// Solo cacheamos assets estáticos (imágenes, fuentes, etc.), NUNCA los HTML
const STATIC_ASSETS = [
  '/assets/logo.png'
];

// Al instalar, pre-cachea solo los assets estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activa este service worker inmediatamente sin esperar
  self.skipWaiting();
});

// Al activar, elimina TODOS los cachés viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Eliminando caché viejo:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // Toma control de todos los clientes abiertos inmediatamente
      return self.clients.claim();
    })
  );
});

// Estrategia de fetch: Network first para HTML/API, Cache first para imágenes
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Para las rutas de la API y HTML: siempre ir a la red (nunca cache)
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/registro') ||
    url.pathname.startsWith('/historial') ||
    url.pathname.startsWith('/guardar-entrenamiento') ||
    url.pathname.startsWith('/actualizar') ||
    url.pathname.endsWith('.html') ||
    url.pathname === '/'
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Para assets estáticos: Cache first, luego red
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(networkResponse => {
        // Solo cachea si la respuesta es válida
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});
