// Keeps the app working offline. The page itself is fetched fresh when
// there's a connection, so updates come through, and the saved copy is used
// when there isn't. The 3D library's files never change at a given version,
// so they're served from the saved copy once fetched.
const CACHE = 'cupboards-a60f37405b';
const THREE = 'https://cdn.jsdelivr.net/npm/three@0.160.0/';
const FILES = [
  './index.html',
  './room_3d.html',
  './room_3d.css',
  './floor.js',
  './bedroom_door.js',
  './living_room.js',
  './page/stage.js',
  './page/stored_controls.js',
  './page/controls.js',
  './page/colours.js',
  './page/piece_controls.js',
  './page/views.js',
  './page/tips.js',
  './page/view.js',
  './page/room_buttons.js',
  './flat_model.js',
  './model/state.js',
  './model/materials.js',
  './model/slider_ranges.js',
  './model/kitchen.js',
  './model/cupboards.js',
  './model/bench_wall.js',
  './model/colours.js',
  './model/front_wall.js',
  './model/dimensions.js',
  './model/stored.js',
  './model/loose_pieces.js',
  './model/settings.js',
  './corner_cupboard.js',
  './cupboard_controls.js',
  './living_room.views.js',
  './living_room.configurations.js',
  './other_room.js',
  './bookcase.js',
  './billy.js',
  './ivar.js',
  './knarrevik.js',
  './kvistbro.js',
  './laundry_basket.js',
  './tables.js',
  './castor_desk.js',
  './speakers.js',
  './desk_daybed.js',
  './work_chairs.js',
  './tornviken.js',
  './custom_island.js',
  './rosentorp.js',
  './loshult.js',
  './ekby_alex.js',
  './wicker_bench.js',
  './shoe_rack.js',
  './stair_walls.js',
  './shoe_boxes.js',
  './garage.js',
  './dressers.js',
  './larders.js',
  './sofas.js',
  './daybed.js',
  './kit/floor_kit.js',
  './kit/view_kit.js',
  './kit/configuration_kit.js',
  './kit/config_kit.js',
  './kit/controls_kit.js',
  './kit/tabs_kit.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  THREE + 'build/three.module.js',
  THREE + 'examples/jsm/controls/OrbitControls.js',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
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
  // The app's own files: fresh when online, saved copy when not. 'no-cache'
  // checks with the server every time: GitHub Pages lets the browser keep a
  // file for 10 minutes, and a new page with an old room_3d.css loses its
  // drawers and the cutting list.
  event.respondWith(fetch(request.url, { cache: 'no-cache' }).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(cache => cache.put(request, copy));
    return res;
  }).catch(() => caches.match(request, { ignoreSearch: true })));
});
