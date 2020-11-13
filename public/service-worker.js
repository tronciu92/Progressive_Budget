const CACHE_FILES = [
  '/',
  '/index.html',
  '/styles.css',
  '/db.js',
  '/index.js',
];

const CACHE_NAME = "static-cache-v2";
const DATA_NAME = "data-cache-v1";

// install
self.addEventListener('install', function(evt) {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Your files were pre-cached successfully!");
      return cache.addAll(CACHE_FILES);
    })
  );

  self.skipWaiting();
});


// The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", function(evt) {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener('fatch', event => {
  if(event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse => {
          if(cachedResponse) {
            return cachedResponse;
          }

          return caches.open(DATA_NAME).then(cache => {
            return fetch(event.request).then(response => {
              return cache.put(event.request, response.clone()).then(() => response);
            });
          });
        })
      )
    );
  }
});
