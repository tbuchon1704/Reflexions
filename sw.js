// Service worker générique pour l'app "Réflexions".
// Ce fichier n'a normalement jamais besoin d'être remplacé : à chaque
// mise à jour, il suffit de remplacer index.html sur le serveur.
// Stratégie : "réseau d'abord, sans cache HTTP" -> toujours la dernière
// version quand on est en ligne, et bascule sur la version mise en cache
// (Cache Storage, pas le cache HTTP du navigateur) quand on est hors-ligne.
const CACHE_NAME = 'reflexions-shell-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match('./index.html'))
      )
  );
});
