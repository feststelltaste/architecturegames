/* Einfacher Service Worker: legt die Spieldateien beim ersten Besuch ab, damit die App auch offline startet. */
var CACHE = 'archi-spiele-v1';
var FILES = [
  './', 'index.html', 'manifest.webmanifest',
  'assets/retro.css', 'assets/icons/icon-192.png', 'assets/icons/icon-512.png',
  'assets/fonts/press-start-2p-latin-400-normal.woff2', 'assets/fonts/vt323-latin-400-normal.woff2',
  'games/quality-workshop/', 'games/quality-workshop/index.html', 'games/quality-workshop/style.css',
  'games/quality-workshop/data.js', 'games/quality-workshop/sprites.js', 'games/quality-workshop/game.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// Netz zuerst (damit Updates ankommen), Cache als Rückfall für Offline.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(function (res) {
    var copy = res.clone();
    if (res.ok && new URL(e.request.url).origin === location.origin) caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
    return res;
  }).catch(function () { return caches.match(e.request); }));
});
