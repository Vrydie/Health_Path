const CACHE_NAME = 'health-path-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/register.html',
  '/app.html',
  '/css/style.css',
  '/css/inicio.css',
  '/js/app.js',
  '/js/auth.js',
  '/assets/logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
