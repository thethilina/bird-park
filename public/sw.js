const CACHE_NAME = "bird-park-v1";

const STATIC_ASSETS = [
  "/",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];


self.addEventListener("install", (event) => {
  console.log("Service Worker Installed");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );

  self.skipWaiting();
});


self.addEventListener("activate", (event) => {
  console.log("Service Worker Activated");

  event.waitUntil(
    self.clients.claim()
  );
});


self.addEventListener("fetch", (event) => {

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {

        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request);

      })
  );

});