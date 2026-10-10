// Keeps the app working offline. The page itself is fetched fresh when
// there's a connection, so updates come through, and the saved copy is used
// when there isn't. The 3D library's files never change at a given version,
// so they're served from the saved copy once fetched.
const CACHE = 'cupboards-v2';
const THREE = 'https://cdn.jsdelivr.net/npm/three@0.160.0/';
const FILES = [
  './room_3d.html',
  './room_3d.views.js',
  './view_kit.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  THREE + 'build/three.module.js',
  THREE + 'examples/jsm/controls/OrbitControls.js',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (request.url.startsWith(THREE)) {
    // The library: saved copy first
    event.respondWith(caches.match(request).then(hit => hit || fetch(request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(cache => cache.put(request, copy));
      return res;
    })));
    return;
  }
  if (new URL(request.url).origin !== location.origin) return;
  // The app's own files: fresh when online, saved copy when not
  event.respondWith(fetch(request).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(cache => cache.put(request, copy));
    return res;
  }).catch(() => caches.match(request, { ignoreSearch: true })));
});
