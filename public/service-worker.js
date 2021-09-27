const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

const FILES_TO_CACHE = [
  "/",
  "index.html",
  "/manifest.webmanifest",
  "public/assets/css/style.css",
  "public/assets/js/index.js",
  "public/assets/icons/icon-192x192.png",
  "public/assets/icons/icon-512x512.png",
];

//open a cache
self.addEventListener("install", function (evt) {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("your files were precached sucessfully");
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

//manage old caches after activating the service worker
self.addEventListener("activate", function (evt) {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

//event listener for fetch
self.addEventListener("fetch", function (event) {
  if (event.request.url.includes("/api/transaction")) {
    console.log("fetching transaction data", event.request);
    // Will need to respond with local-first strategy
    event.respondWith(
      caches.match(event.request).then(function (response) {
        return response || fetch(event.request);
      })
    );
  }
});
