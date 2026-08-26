/* ═══════════════════════════════════════════════════════════
   Service Worker — Catálogos Digitales
   
   Nivel: PWA BÁSICO (instalable + caché para visitas repetidas)
   - El catálogo se carga la primera vez con conexión
   - En visitas repetidas, se sirve desde caché (carga instantánea)
   - Con conexión mala/intermitente, funciona con lo cacheado
   - NO garantiza catálogo 100% offline desde la primera visita
   
   Estrategias:
   - HTML: network-first (siempre intenta red primero)
   - CSS/JS: stale-while-revalidate (caché instantáneo + actualización en fondo)
   - Imágenes: cache-first (rara vez cambian)
   - Datos de catálogos: stale-while-revalidate (importantes para offline)
   ═══════════════════════════════════════════════════════════ */

const CACHE_NAME = 'catalogos-digitales-v1';

// Páginas y datos críticos para precarga (se cargan después de la primera visita)
const PRECACHE_URLS = [
    './',
    'manifest.json',
    // Iconos PWA
    'img/icons/icon-192.png',
    'img/icons/icon-512.png',
    // Páginas de menú (catálogos más importantes)
    'menu/del-sol',
    'menu/mis-servicios',
    'menu/demo-lista',
    'menu/demo-minimal',
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

function esDatoCatalogo(url) {
    // Archivos de datos de catálogos o páginas de menú
    return url.origin === self.location.origin && 
           (url.pathname.includes('/menu/') || url.pathname.includes('/api/'));
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
                .catch(() => caches.match(req).then(r => r || caches.match('./')))
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

    // Datos de catálogos y páginas de menú: stale-while-revalidate
    if (esDatoCatalogo(url)) {
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
