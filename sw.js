/* ═══════════════════════════════════════════════════════════
   FÊNIX v4.3 — sw.js
   Service Worker — Cache First + Offline Support
═══════════════════════════════════════════════════════════ */

const CACHE_NAME = 'fenix-v4.3';

const RESOURCES = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './db.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
];

/* ── INSTALL ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(['./index.html','./style.css','./app.js','./db.js','./manifest.json'])
        .then(() => Promise.allSettled(
          RESOURCES.filter(r=>r.startsWith('http')).map(url =>
            fetch(url).then(res=>cache.put(url,res)).catch(()=>{})
          )
        ))
      )
      .then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* ── FETCH: Cache First ── */
self.addEventListener('fetch', event => {
  if(event.request.method!=='GET') return;
  if(event.request.url.startsWith('chrome-extension')) return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request).then(res => {
        if(res&&res.status===200) {
          const clone=res.clone();
          caches.open(CACHE_NAME).then(c=>c.put(event.request,clone));
        }
        return res;
      }).catch(()=>{});
      return cached || network || caches.match('./index.html');
    })
  );
});
