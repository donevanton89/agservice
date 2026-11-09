/* AGservice: программа открывается и без интернета (берётся последняя скачанная версия).
   Есть интернет — берём свежую версию, но ждём не больше 4 секунд, иначе открываем сохранённую. */
const C = 'ag-v7';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(['./', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-192.png', './icon-maskable-512.png', './apple-touch-icon.png']).catch(() => {}))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin) return;
  const cached = () => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./'));
  const net = fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return r; });
  e.respondWith(new Promise(resolve => {
    let done = false;
    const t = setTimeout(() => cached().then(r => { if (r && !done) { done = true; resolve(r); } }), 4000);
    net.then(r => { if (!done) { done = true; clearTimeout(t); resolve(r); } })
       .catch(() => cached().then(r => { if (!done) { done = true; clearTimeout(t); resolve(r || Response.error()); } }));
  }));
});
