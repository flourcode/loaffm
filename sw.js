/* Loaf FM · service worker. Caches the site so it opens offline and installs as an app. Everything Loaf FM plays
   is generated on the device, so it works fully offline. Requests to other sites (only Google Analytics, if it's
   switched on in analytics.js) are left alone and go straight to the network. */
const CACHE = 'loaffm-v52';
const SHELL = ['./', './index.html', './privacy.html', './terms.html', './404.html', './site.css', './board.css', './board.js', './analytics.js', './fonts/doto-700.woff2', './fonts/doto-900.woff2', './fonts/plex-400.woff2', './fonts/plex-400-italic.woff2', './fonts/plex-500.woff2', './fonts/plex-600.woff2', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/favicon-32.png', './icons/icon.svg', './icons/apple-touch-icon.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // Network first, so a new version shows up as soon as you're online; cache as the fallback.
  e.respondWith(fetch(e.request).then((res) => {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(e.request, copy));
    return res;
  }).catch(() => caches.match(e.request)));
});
