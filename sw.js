const CACHE_NAME = 'rapporto-v4'; // Incrementato per forzare l'aggiornamento
const ASSETS = [
  './',                // Fondamentale per far funzionare l'app se apri solo la cartella
  './index.html',
  './manifest.json',
  './rapporti.png',
  './rapporti-192.png',
  // Aggiungi qui eventuali file .css o .js se li hai separati
];

// Installazione e caching iniziale
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching assets...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); 
});

// Pulizia vecchie cache per evitare accumulo di file inutili
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Strategia Stale-While-Revalidate: mostra subito il vecchio, aggiorna in background
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(e.request).then((cachedResponse) => {
        const fetchPromise = fetch(e.request).then((networkResponse) => {
          // Se la rete risponde correttamente, aggiorna la cache con la nuova versione
          if (networkResponse && networkResponse.status === 200) {
            cache.put(e.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Se siamo offline e il file non è in cache, non crashare
          return cachedResponse;
        });

        // Ritorna la copia in cache se esiste, altrimenti aspetta la rete
        return cachedResponse || fetchPromise;
      });
    })
  );
});
