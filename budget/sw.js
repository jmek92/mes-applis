/* Service worker — Budget du foyer (périmètre : ce dossier uniquement) */
const CACHE = 'budget-v4';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('budget-v') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const isPage = req.mode === 'navigate';
  const key = isPage ? './index.html' : req;
  e.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(key, { ignoreSearch: true }).then((cached) => {
        const network = fetch(req).then((res) => {
          if (res && res.ok && res.type === 'basic') cache.put(key, res.clone());
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    )
  );
});
