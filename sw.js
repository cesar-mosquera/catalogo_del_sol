/* ═══════════════════════════════════════════════════════════
   Service Worker — Pinchos y Chuletas Del Sol
   Objetivo: carga instantánea en visitas repetidas + que el menú
   siga siendo usable con conexión mala/intermitente.

   Reglas para no repetir el problema de "quedó viejo" que ya
   tuvimos con el deploy:
   - El HTML SIEMPRE se pide primero a la red (network-first). Si no
     hay red, recién ahí se usa la copia guardada.
   - CSS/JS usan "stale-while-revalidate": se sirve la copia guardada
     al instante, pero en paralelo se pide la versión nueva y se
     guarda para la PRÓXIMA visita. Como el proyecto ya versiona estos
     archivos con ?v=N, un cambio de versión automáticamente pide (y
     cachea) una URL distinta — no hace falta tocar este archivo cada
     vez que cambian styles.css o script.js.
   - Imágenes propias: cache-first (rara vez cambian).
   - Todo lo que NO es de este sitio (fuentes, Leaflet, Nominatim,
     tiles de OpenStreetMap, WhatsApp) se deja pasar directo a la red,
     sin interferir — cachear eso podría dar direcciones o mapas
     viejos.
   ═══════════════════════════════════════════════════════════ */

const CACHE_NAME = 'catalogo-del-sol-v2';

const PRECACHE_URLS = [
    './',
    'index.html',
    'styles.css?v=13',
    'script.js?v=18',
    'manifest.json',
    'img/cover.webp',
    'img/logo.webp',
    'img/hero.webp',
    'img/gold_coin.webp',
    'img/pincho_pollo.webp',
    'img/pincho_carne.webp',
    'img/chuleta.webp',
    'img/guatita.webp',
    'img/seco.webp',
    'img/choclo.webp',
    'img/icons/icon-192.png',
    'img/icons/icon-512.png',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

function esImagenPropia(url) {
    return url.origin === self.location.origin && /\.(webp|png|jpe?g|svg)$/i.test(url.pathname);
}

function esCssOJs(url) {
    return url.origin === self.location.origin && /\.(css|js)$/i.test(url.pathname);
}

self.addEventListener('fetch', event => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);

    // Fuera de este origen (fuentes, Leaflet, Nominatim, tiles OSM, WhatsApp...): no tocar.
    if (url.origin !== self.location.origin) return;

    // Navegación (el HTML): red primero, caché solo si no hay conexión.
    if (req.mode === 'navigate') {
        event.respondWith(
            fetch(req)
                .then(res => {
                    const copia = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(req, copia));
                    return res;
                })
                .catch(() => caches.match(req).then(r => r || caches.match('index.html')))
        );
        return;
    }

    // CSS/JS propios: stale-while-revalidate.
    if (esCssOJs(url)) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache =>
                cache.match(req).then(cached => {
                    const fresh = fetch(req).then(res => {
                        cache.put(req, res.clone());
                        return res;
                    }).catch(() => cached);
                    return cached || fresh;
                })
            )
        );
        return;
    }

    // Imágenes propias: cache-first.
    if (esImagenPropia(url)) {
        event.respondWith(
            caches.match(req).then(cached => cached || fetch(req).then(res => {
                caches.open(CACHE_NAME).then(c => c.put(req, res.clone()));
                return res;
            }))
        );
        return;
    }

    // Cualquier otro request propio (manifest.json, etc.): red con fallback a caché.
    event.respondWith(
        fetch(req).catch(() => caches.match(req))
    );
});
