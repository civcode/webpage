/* Self-contained service worker. No CDN imports or third-party requests.
   This site does not currently need offline caching. */
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.filter(name => name.startsWith('workbox')).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
