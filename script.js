/* ═══════════════════════════════════════════════════════════
   PINCHOS Y CHULETAS DEL SOL — Flip Engine v7
   Deslizamiento con inclinación 3D leve (nunca cruza los 90°, así
   que no depende de backface-visibility ni de recortes 3D — ambas
   técnicas resultaron poco confiables entre navegadores/GPUs).
   'next' → la página actual sale hacia la izquierda.
   'prev' → la página anterior entra desde la izquierda.
   Misma fórmula para ambas: solo cambia CUÁL página se anima.
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    const notebook = document.getElementById('notebook');
    const pages = Array.from(document.querySelectorAll('.page'));
    const indicator = document.getElementById('pageIndicator');

    const totalPages = pages.length;
    let currentPage = 0;
    let isAnimating = false;

    /* ─── Dots ─── */
    pages.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'page-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        indicator.appendChild(dot);
    });
    const dots = Array.from(indicator.querySelectorAll('.page-dot'));

    /* ─── Reset visual: vuelve al estado definido por la hoja de estilos ─── */
    function resetFold(page) {
        const pi = page.querySelector('.page-inner');
        if (pi) { pi.style.cssText = ''; }
    }

    /* ─── Estado de página ─── */
    function setStates(activeIdx) {
        pages.forEach((p, i) => {
            resetFold(p);
            p.classList.remove('active', 'flipped-left', 'unread-right', 'folding', 'dragging');
            if (i < activeIdx) { p.classList.add('flipped-left'); p.style.zIndex = i; }
            else if (i === activeIdx) { p.classList.add('active'); p.style.zIndex = 500; }
            else { p.classList.add('unread-right'); p.style.zIndex = totalPages - i; }
        });
        dots.forEach((d, i) => d.classList.toggle('active', i === activeIdx));
        notebook.classList.remove('is-navigating');
    }
    setStates(0);

    /* ═══════════════════════════════════════════════════════
       MOTOR DE DOBLEZ (giro real, sin fold-layer ni clip-path)
       progress 0 = página en reposo (plana)
       progress 1 = página completamente girada (oculta)
       La página gira como una sola pieza rígida alrededor de su
       borde (como una hoja de cuaderno). Cerca de los 90° queda casi
       de canto por la perspectiva — ahí mismo se desvanece, dejando
       ver la página de abajo (que ya está quieta en su sitio). Así
       evitamos depender de backface-visibility, que resultó poco
       confiable entre navegadores/GPUs.
    ═══════════════════════════════════════════════════════ */
    function applyFold(page, progress, direction) {
        const pi = page.querySelector('.page-inner');
        if (!pi) return;

        const p = Math.max(0, Math.min(1, progress));
        const angle = p * 180;
        const hinge = direction === 'next' ? 'left' : 'right';
        const sign  = direction === 'next' ? -1 : 1;

        pi.style.transformOrigin = hinge + ' center';
        pi.style.transform = `rotateY(${sign * angle}deg)`;
        pi.style.boxShadow = `${sign * -1 * (14 + p * 16)}px 8px ${26 + p * 30}px rgba(0, 0, 0, ${0.15 + p * 0.35})`;

        const fadeStart = 80, fadeEnd = 100;
        const opacity = angle <= fadeStart ? 1 : angle >= fadeEnd ? 0 : 1 - (angle - fadeStart) / (fadeEnd - fadeStart);
        pi.style.opacity = String(opacity);
    }

    /* ─── Easing ágil tipo libro (cúbico: arranca antes que el quártico anterior) ─── */
    function easeInOutQuart(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /* ─── Animación entre dos valores de progress ─── */
    function animateFold(page, from, to, direction, durationMs, cb) {
        let start = null;
        function frame(ts) {
            if (!start) start = ts;
            const raw = Math.min((ts - start) / durationMs, 1);
            const eased = easeInOutQuart(raw);
            applyFold(page, from + (to - from) * eased, direction);
            if (raw < 1) {
                requestAnimationFrame(frame);
            } else {
                applyFold(page, to, direction);
                cb();
            }
        }
        requestAnimationFrame(frame);
    }

    /* ─── Ir a página ─── */
    function goTo(dest) {
        if (isAnimating || dest === currentPage || dest < 0 || dest >= totalPages) return;
        isAnimating = true;
        notebook.classList.add('is-navigating');

        dots[currentPage].classList.remove('active');
        dots[dest].classList.add('active');

        const fwd = dest > currentPage;

        if (fwd) {
            const page = pages[currentPage];
            const next = pages[dest];

            page.style.zIndex = 1000;
            page.classList.add('folding');
            next.classList.remove('unread-right');
            next.classList.add('active');
            next.style.zIndex = 500;

            applyFold(page, 0, 'next');
            animateFold(page, 0, 1, 'next', 400, () => {
                currentPage = dest;
                setStates(currentPage);
                isAnimating = false;
            });
        } else {
            const page = pages[dest];
            const curr = pages[currentPage];

            page.style.zIndex = 1000;
            page.classList.remove('flipped-left');
            page.classList.add('active', 'folding');
            curr.style.zIndex = 500;

            applyFold(page, 1, 'prev');
            animateFold(page, 1, 0, 'prev', 400, () => {
                currentPage = dest;
                setStates(currentPage);
                isAnimating = false;
            });
        }
    }

    const next = () => goTo(currentPage + 1);
    const prev = () => goTo(currentPage - 1);

    /* ─── Teclado ─── */
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev();
    });

    /* ═══════════════════════════════════════════════════════
       DRAG / SWIPE
    ═══════════════════════════════════════════════════════ */
    let txStart = 0, tyStart = 0, tStart = 0;
    let isH = null, hasMoved = false;
    let dragPage = null, dragDir = null, dragP = 0;
    let viewW = Math.min(document.body.clientWidth, 460);
    window.addEventListener('resize', () => { viewW = Math.min(document.body.clientWidth, 460); });

    function startDrag(x, y) {
        if (isAnimating || dragPage) return;
        txStart = x; tyStart = y; tStart = Date.now();
        isH = null; hasMoved = false; dragP = 0;
    }

    function moveDrag(x, y, prevent) {
        if (isAnimating) return;
        const dx = x - txStart, dy = y - tyStart;

        if (isH === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6))
            isH = Math.abs(dx) > Math.abs(dy);

        if (!isH) return;
        if (prevent) prevent();
        hasMoved = true;

        const W = notebook.offsetWidth || viewW;

        if (!dragPage) {
            if (dx < -8 && currentPage < totalPages - 1) {
                dragDir = 'next';
                dragPage = pages[currentPage];
                dragPage.style.zIndex = 1000;
                dragPage.classList.add('dragging');

                const nxt = pages[currentPage + 1];
                if (nxt) {
                    nxt.classList.remove('unread-right');
                    nxt.classList.add('active');
                    nxt.style.zIndex = 500;
                }
                notebook.classList.add('is-navigating');

            } else if (dx > 8 && currentPage > 0) {
                dragDir = 'prev';
                dragPage = pages[currentPage - 1];
                dragPage.style.zIndex = 1000;
                dragPage.classList.remove('flipped-left');
                dragPage.classList.add('active', 'dragging');
                pages[currentPage].style.zIndex = 500;
                notebook.classList.add('is-navigating');
            }
        }

        if (!dragPage) return;

        if (dragDir === 'next') {
            dragP = Math.max(0, Math.min(1, -dx / W * 1.6));
        } else {
            dragP = Math.max(0, Math.min(1, 1 - dx / W * 1.6));
        }
        applyFold(dragPage, dragP, dragDir);
    }

    function endDrag(x) {
        if (!dragPage) return;
        const dx = x - txStart;
        const fast = Date.now() - tStart < 280;
        const page = dragPage;
        const dir = dragDir;
        const fromP = dragP;
        dragPage = null; dragDir = null;

        let complete = false;
        if (dir === 'next') complete = fromP > 0.28 || (fast && dx < -18);
        else complete = fromP < 0.72 || (fast && dx > 18);

        const toP = (dir === 'next' && complete) || (dir === 'prev' && !complete) ? 1 : 0;
        const remaining = Math.abs(toP - fromP);
        const dur = Math.max(140, remaining * 400);

        isAnimating = true;
        animateFold(page, fromP, toP, dir, dur, () => {
            if (dir === 'next' && toP === 1) currentPage++;
            if (dir === 'prev' && toP === 0) currentPage--;
            setStates(currentPage);
            isAnimating = false;
        });
    }

    /* Bindings táctiles */
    notebook.addEventListener('touchstart', e => startDrag(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    window.addEventListener('touchmove', e => moveDrag(e.touches[0].clientX, e.touches[0].clientY, () => e.preventDefault()), { passive: false });
    window.addEventListener('touchend', e => endDrag(e.changedTouches[0].clientX), { passive: true });

    /* Bindings mouse */
    notebook.addEventListener('mousedown', e => {
        if (e.target.closest('button')) return;
        startDrag(e.clientX, e.clientY);
        const onMove = me => moveDrag(me.clientX, me.clientY, () => me.preventDefault());
        const onUp = me => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); endDrag(me.clientX); };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    });
});

/* ════════════════════════════════════════════════════════
   WHATSAPP + CARRITO
════════════════════════════════════════════════════════ */
let carrito = [];
const TEL = '593980118603';

/* ═══════════ COSTO DE ENVÍO POR GEOLOCALIZACIÓN ═══════════
   $1.50 fijo hasta 2 km, luego $0.50 por cada km adicional. */
const LOCAL_LAT = -0.3229875;
const LOCAL_LNG = -78.556484375;
const ENVIO_BASE = 1.50;
const ENVIO_KM_INCLUIDOS = 2;
const ENVIO_POR_KM = 0.50;

/* Estado único de la ubicación de entrega: un solo lugar que actualizar
   (fijarUbicacionEntrega) sin importar de dónde venga el punto (GPS
   automático hoy, un pin arrastrable en un mapa mañana) — todo lo demás
   (tarifa, total, mensaje de WhatsApp) lee de aquí, así que agregar una
   nueva forma de fijar la ubicación no obliga a tocar el resto del flujo. */
let ubicacionEntrega = null; // { lat, lng, distanciaKm, costo } | null

function calcularTarifaEnvio(km) {
    if (km <= ENVIO_KM_INCLUIDOS) return ENVIO_BASE;
    return ENVIO_BASE + (km - ENVIO_KM_INCLUIDOS) * ENVIO_POR_KM;
}

function distanciaKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const toRad = d => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* Único punto de entrada para fijar dónde se entrega el pedido.
   Recalcula tarifa y distancia y deja todo listo para el resto del
   flujo (checkout, WhatsApp). Cualquier forma futura de obtener la
   ubicación (mapa manual, favoritos guardados, etc.) solo necesita
   llamar a esta función con un lat/lng. */
function fijarUbicacionEntrega(lat, lng) {
    const km = distanciaKm(LOCAL_LAT, LOCAL_LNG, lat, lng);
    ubicacionEntrega = { lat, lng, distanciaKm: km, costo: calcularTarifaEnvio(km) };
    return ubicacionEntrega;
}

function limpiarUbicacionEntrega() {
    ubicacionEntrega = null;
}

/* Sugiere (sin forzar) una dirección a partir de la ubicación, vía Nominatim/OSM.
   Solo rellena si el cliente no ha escrito nada — es un borrador editable, no un dato fijo,
   porque el direccionamiento formal en muchos barrios de Quito es incompleto/impreciso. */
async function sugerirDireccion(lat, lng) {
    const dirEl = document.getElementById('clienteDireccion');
    if (dirEl.value.trim()) return;
    try {
        const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'es' }, signal: AbortSignal.timeout(6000) }
        );
        if (!resp.ok) return;
        const data = await resp.json();
        if (dirEl.value.trim()) return; // el cliente pudo haber escrito mientras esperábamos la respuesta
        const a = data.address || {};
        const partes = [
            [a.road, a.house_number].filter(Boolean).join(' '),
            a.suburb || a.neighbourhood,
            a.city_district || a.city || a.town,
        ].filter(Boolean);
        const sugerida = partes.length ? partes.join(', ') : data.display_name;
        if (sugerida) {
            dirEl.value = sugerida;
            document.getElementById('direccionSugeridaHint').style.display = 'block';
        }
    } catch (_) {
        /* silencioso: si falla, el cliente simplemente escribe su dirección */
    }
}

/* ═══ MAPA LEAFLET — PIN ARRASTRABLE ═══
   Estado interno del mapa (se crea una sola vez por sesión de checkout). */
let _mapaLeaflet = null;
let _mapaPin = null;
let _mapaAbierto = false;

/* Centra el mapa y el pin en lat/lng y recalcula tarifa */
function _actualizarPinMapa(lat, lng) {
    const u = fijarUbicacionEntrega(lat, lng);
    if (_mapaPin) _mapaPin.setLatLng([lat, lng]);
    if (_mapaLeaflet) _mapaLeaflet.panTo([lat, lng]);
    _mostrarResultadoEnvio(u);
}

function _mostrarResultadoEnvio(u) {
    const resultEl = document.getElementById('envioFeeResult');
    resultEl.classList.remove('error');
    resultEl.innerHTML = `📍 <strong>${u.distanciaKm.toFixed(1)} km</strong> del local &mdash; Envío: <strong>$${u.costo.toFixed(2)}</strong>`;
    resultEl.style.display = 'block';
    actualizarTotalCheckout();
}

/* Inicializa el mapa Leaflet la primera vez que se abre */
function initMapaEntrega(centerLat, centerLng) {
    if (_mapaLeaflet) {
        // Ya inicializado: solo recentrar
        _mapaLeaflet.invalidateSize();
        _mapaLeaflet.setView([centerLat, centerLng], 16);
        _mapaPin.setLatLng([centerLat, centerLng]);
        return;
    }

    _mapaLeaflet = L.map('mapaEntrega', { zoomControl: true }).setView([centerLat, centerLng], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
    }).addTo(_mapaLeaflet);

    /* Pin de entrega (arrastrable) */
    const pinIcono = L.divIcon({
        html: `<div class="leaflet-pin-entrega">📍</div>`,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
    });

    _mapaPin = L.marker([centerLat, centerLng], {
        draggable: true,
        icon: pinIcono,
        title: 'Arrastra para ajustar tu punto de entrega',
    }).addTo(_mapaLeaflet);

    /* También marcar el local */
    const localIcono = L.divIcon({
        html: `<div class="leaflet-pin-local">🏪</div>`,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
    });
    L.marker([LOCAL_LAT, LOCAL_LNG], { icon: localIcono, title: 'Pinchos y Chuletas Del Sol' })
        .bindPopup('🏪 <strong>Pinchos Del Sol</strong>')
        .addTo(_mapaLeaflet);

    /* Actualizar costo al terminar de arrastrar */
    _mapaPin.on('dragend', e => {
        const { lat, lng } = e.target.getLatLng();
        const u = fijarUbicacionEntrega(lat, lng);
        _mostrarResultadoEnvio(u);
        sugerirDireccion(lat, lng);
    });

    /* Clic en el mapa mueve el pin (alternativa al drag en móvil) */
    _mapaLeaflet.on('click', e => {
        const { lat, lng } = e.latlng;
        _mapaPin.setLatLng([lat, lng]);
        const u = fijarUbicacionEntrega(lat, lng);
        _mostrarResultadoEnvio(u);
        sugerirDireccion(lat, lng);
    });

    // Calcular costo inicial desde el centro dado
    _actualizarPinMapa(centerLat, centerLng);
}

/* Abre/cierra el mapa. Intenta obtener GPS primero para centrar. */
window.toggleMapaEntrega = function () {
    const wrap = document.getElementById('mapaEntregaWrap');
    const btnMapa = document.getElementById('btnAbrirMapa');

    if (_mapaAbierto) {
        wrap.style.display = 'none';
        btnMapa.textContent = '🗺️ Ajustar en mapa';
        _mapaAbierto = false;
        return;
    }

    wrap.style.display = 'block';
    btnMapa.textContent = '✖️ Cerrar mapa';
    _mapaAbierto = true;

    // Intentar GPS para centrar (pero no bloquear si falla)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => initMapaEntrega(pos.coords.latitude, pos.coords.longitude),
            ()   => initMapaEntrega(LOCAL_LAT, LOCAL_LNG), // fallback al local
            { enableHighAccuracy: true, timeout: 6000 }
        );
    } else {
        initMapaEntrega(LOCAL_LAT, LOCAL_LNG);
    }
};

/* GPS rápido: usa la posición automática sin abrir el mapa */
window.usarGpsRapido = function () {
    const resultEl = document.getElementById('envioFeeResult');
    const btn = document.getElementById('btnGpsRapido');

    if (!navigator.geolocation) {
        resultEl.textContent = 'Tu navegador no soporta geolocalización. El costo se confirmará por WhatsApp.';
        resultEl.classList.add('error');
        resultEl.style.display = 'block';
        limpiarUbicacionEntrega();
        actualizarTotalCheckout();
        return;
    }

    btn.disabled = true;
    btn.textContent = '📡 Calculando...';

    navigator.geolocation.getCurrentPosition(
        pos => {
            const u = fijarUbicacionEntrega(pos.coords.latitude, pos.coords.longitude);
            _mostrarResultadoEnvio(u);
            sugerirDireccion(u.lat, u.lng);
            btn.textContent = '📡 Recalcular GPS';
            btn.disabled = false;
            // Si el mapa ya estaba abierto, sincronizar el pin
            if (_mapaLeaflet && _mapaPin) {
                _mapaPin.setLatLng([u.lat, u.lng]);
                _mapaLeaflet.panTo([u.lat, u.lng]);
            }
        },
        () => {
            resultEl.classList.add('error');
            resultEl.textContent = 'No se pudo obtener tu ubicación. Usa el mapa o confirma por WhatsApp.';
            resultEl.style.display = 'block';
            btn.textContent = '📡 Reintentar GPS';
            btn.disabled = false;
            limpiarUbicacionEntrega();
            actualizarTotalCheckout();
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
};

/* Compatibilidad retroactiva: calcularCostoEnvio ahora abre el mapa */
window.calcularCostoEnvio = window.toggleMapaEntrega;


function actualizarTotalCheckout() {
    const subtotal = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
    const tipo = document.getElementById('pedidoTipo').value;
    const envioLine = document.getElementById('checkoutEnvioLine');
    document.getElementById('checkoutSubtotal').textContent = subtotal.toFixed(2);

    let total = subtotal;
    if (tipo === 'Envío a Domicilio' && ubicacionEntrega) {
        document.getElementById('checkoutEnvioMonto').textContent = ubicacionEntrega.costo.toFixed(2);
        envioLine.style.display = 'inline';
        total += ubicacionEntrega.costo;
    } else {
        envioLine.style.display = 'none';
    }
    document.getElementById('checkoutTotalFinal').textContent = total.toFixed(2);
}

function actualizarVisibilidadEnvio() {
    const tipo = document.getElementById('pedidoTipo').value;
    document.getElementById('envioFeeGroup').style.display = tipo === 'Envío a Domicilio' ? 'block' : 'none';
    actualizarTotalCheckout();
}

window.pedirWsp = function (plato, precio, event) {
    if (event) event.stopPropagation();
    const item = carrito.find(i => i.plato === plato);
    if (item) item.cantidad++;
    else carrito.push({ plato, precio, cantidad: 1 });
    actualizarCarrito();
    if (event?.currentTarget) {
        const btn = event.currentTarget;
        const old = btn.innerHTML;
        btn.innerHTML = '¡Agregado! ✓';
        btn.classList.add('btn-added');
        setTimeout(() => { btn.innerHTML = old; btn.classList.remove('btn-added'); }, 1000);
    }
};

window.cambiarCantidad = function (plato, delta, event) {
    if (event) event.stopPropagation();
    const item = carrito.find(i => i.plato === plato);
    if (item) {
        item.cantidad += delta;
        if (item.cantidad <= 0) carrito = carrito.filter(i => i.plato !== plato);
    }
    actualizarCarrito();
};

function actualizarCarrito() {
    const list = document.getElementById('cartList');
    const totalEl = document.getElementById('cartTotal');
    const badge = document.getElementById('cartFloat');
    const count = document.getElementById('cartItemCount');
    list.innerHTML = '';
    let total = 0;
    carrito.forEach(item => {
        total += item.precio * item.cantidad;
        const li = document.createElement('li');
        li.className = 'cart-item'; li.role = 'listitem';
        li.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-title">${item.plato}</div>
                <div class="cart-item-price">$${(item.precio * item.cantidad).toFixed(2)}</div>
            </div>
            <div class="cart-item-qty">
                <button onclick="cambiarCantidad('${item.plato}',-1,event)">-</button>
                <span style="width:30px;text-align:center">${item.cantidad}</span>
                <button onclick="cambiarCantidad('${item.plato}',1,event)">+</button>
            </div>`;
        list.appendChild(li);
    });
    totalEl.textContent = total.toFixed(2);
    count.textContent = carrito.length;
    if (carrito.length > 0) badge.classList.remove('hidden');
    else { badge.classList.add('hidden'); cerrarCarrito(); }
}

window.toggleCarrito = () => {
    const p = document.getElementById('cartPanel');
    p.classList.contains('show') ? cerrarCarrito() : (p.classList.add('show'), document.getElementById('cartFloat').setAttribute('aria-expanded', 'true'));
};
window.cerrarCarrito = () => {
    document.getElementById('cartPanel').classList.remove('show');
    document.getElementById('cartFloat').setAttribute('aria-expanded', 'false');
};

window.abrirCheckout = () => {
    cerrarCarrito();
    const m = document.getElementById('checkoutModal');
    m.tagName === 'DIALOG' ? m.showModal() : m.classList.add('show');
    actualizarVisibilidadEnvio();
};
window.cerrarCheckout = () => { const m = document.getElementById('checkoutModal'); m.tagName === 'DIALOG' ? m.close() : m.classList.remove('show'); };

document.getElementById('pedidoTipo').addEventListener('change', actualizarVisibilidadEnvio);

window.enviarPedido = function (e) {
    if (e) e.preventDefault();
    const nombre = document.getElementById('clienteNombre').value.trim();
    const tipo = document.getElementById('pedidoTipo').value;
    const pago = document.getElementById('metodoPago').value;
    const dir = document.getElementById('clienteDireccion').value.trim();
    if (!nombre) { alert('Por favor ingresa tu nombre.'); return; }
    if (!carrito.length) { alert('Tu carrito está vacío.'); return; }

    const subtotal = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
    const esEnvio = tipo === 'Envío a Domicilio';
    let total = subtotal;
    let lineasEnvio = [];
    if (esEnvio) {
        if (ubicacionEntrega) {
            total += ubicacionEntrega.costo;
            const mapsLink = `https://www.google.com/maps?q=${ubicacionEntrega.lat},${ubicacionEntrega.lng}`;
            lineasEnvio = [
                `*🛵 Envío:* $${ubicacionEntrega.costo.toFixed(2)} (${ubicacionEntrega.distanciaKm.toFixed(1)} km aprox.)`,
                `*📍 Ubicación exacta (pin en mapa):* ${mapsLink}`,
            ];
        } else {
            lineasEnvio = [`*🛵 Envío:* A confirmar (no se pudo calcular la distancia)`];
        }
    }

    const texto = [
        `*🥩 NUEVO PEDIDO: Pinchos Del Sol*`,
        `*👤 Cliente:* ${nombre}`,
        `*🍽️ Tipo:* ${tipo}`,
        `*💸 Pago:* ${pago}`,
        ...(dir ? [`*📍 Dir/Obs:* ${dir}`] : []),
        ``, `*📝 DETALLE:*`,
        ...carrito.map(i => `▪️ ${i.cantidad}x ${i.plato} ($${(i.precio * i.cantidad).toFixed(2)})`),
        ``, `*💵 Subtotal: $${subtotal.toFixed(2)}*`,
        ...lineasEnvio,
        `*💰 TOTAL A PAGAR: $${total.toFixed(2)}*`,
    ].join('\n');
    window.open(`https://wa.me/${TEL}?text=${encodeURIComponent(texto)}`, '_blank');
    carrito = []; actualizarCarrito(); cerrarCheckout();
    document.getElementById('checkoutForm').reset();
    limpiarUbicacionEntrega();
    // Resetear estado del mapa
    document.getElementById('envioFeeResult').style.display = 'none';
    const mapaWrap = document.getElementById('mapaEntregaWrap');
    if (mapaWrap) mapaWrap.style.display = 'none';
    const btnMapa = document.getElementById('btnAbrirMapa');
    if (btnMapa) btnMapa.textContent = '🗺️ Ajustar en mapa';
    const btnGps = document.getElementById('btnGpsRapido');
    if (btnGps) { btnGps.textContent = '📡 Usar mi GPS'; btnGps.disabled = false; }
    _mapaAbierto = false;
    document.getElementById('direccionSugeridaHint').style.display = 'none';
};

/* ─── Modal plato ─── */
window.verPlato = function (el) {
    if (!el) return;
    const { nombre, precio, desc, img, tag } = el.dataset;
    document.getElementById('dishModalImg').src = img;
    document.getElementById('dishModalImg').alt = nombre;
    document.getElementById('dishModalName').textContent = nombre;
    document.getElementById('dishModalPrice').textContent = '$' + precio;
    const sents = desc.split('.').map(s => s.trim()).filter(Boolean);
    document.getElementById('dishModalDesc').innerHTML = '🔸 ' + sents.join('.<br><br>🔸 ') + '.';
    const tagEl = document.getElementById('dishModalTag');
    if (tag) { tagEl.textContent = tag; tagEl.style.display = 'inline-block'; }
    else tagEl.style.display = 'none';
    document.getElementById('dishModalBtn').onclick = ev => {
        ev.stopPropagation();
        pedirWsp(nombre, parseFloat(precio), ev);
        setTimeout(cerrarDetallePlato, 600);
    };
    document.getElementById('dishModal').classList.add('show');
    document.body.style.overflow = 'hidden';
};

window.cerrarDetallePlato = function (event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('dishModal').classList.remove('show');
    document.body.style.overflow = '';
};
