/* ═══════════════════════════════════════════════════════════
   PINCHOS Y CHULETAS DEL SOL — Flip Engine v6
   Doblez real: derecha→izquierda al avanzar, izquierda→derecha al retroceder
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    const notebook = document.getElementById('notebook');
    const pages    = Array.from(document.querySelectorAll('.page'));
    const indicator = document.getElementById('pageIndicator');

    const totalPages = pages.length;
    let currentPage  = 0;
    let isAnimating  = false;

    /* ─── Dots ─── */
    pages.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'page-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        indicator.appendChild(dot);
    });
    const dots = Array.from(indicator.querySelectorAll('.page-dot'));

    /* ─── Clonar contenido en el fold-front (una sola vez) ─── */
    function prepareFold(page) {
        const inner  = page.querySelector('.page-inner');
        const front  = page.querySelector('.fold-front');
        if (inner && front && front.children.length === 0) {
            Array.from(inner.children).forEach(c => front.appendChild(c.cloneNode(true)));
        }
    }

    /* ─── Reset visual de pliegue ─── */
    function resetFold(page) {
        const fl = page.querySelector('.fold-layer');
        const fi = page.querySelector('.page-inner');
        if (fl) { fl.style.cssText = 'opacity:0;'; }
        if (fi) { fi.style.clipPath = ''; }
    }

    /* ─── Estado de página ─── */
    function setStates(activeIdx) {
        pages.forEach((p, i) => {
            resetFold(p);
            p.classList.remove('active', 'flipped-left', 'unread-right', 'folding', 'dragging');
            if      (i < activeIdx)  { p.classList.add('flipped-left'); p.style.zIndex = i; }
            else if (i === activeIdx){ p.classList.add('active');       p.style.zIndex = 500; }
            else                     { p.classList.add('unread-right'); p.style.zIndex = totalPages - i; }
        });
        dots.forEach((d, i) => d.classList.toggle('active', i === activeIdx));
        notebook.classList.remove('is-navigating');
    }
    setStates(0);

    /* ═══════════════════════════════════════════════════════
       MOTOR DE DOBLEZ
       direction 'next' → dobla de DERECHA a IZQUIERDA
       direction 'prev' → dobla de IZQUIERDA a DERECHA
       progress 0 = página completamente plana
       progress 1 = página completamente doblada/oculta
    ═══════════════════════════════════════════════════════ */
    function applyFold(page, progress, direction) {
        const fl = page.querySelector('.fold-layer');
        const fi = page.querySelector('.page-inner');
        if (!fl || !fi) return;
        const ffront = fl.querySelector('.fold-front');
        const fback  = fl.querySelector('.fold-back');

        const p = Math.max(0, Math.min(1, progress));
        const angle = p * 180;

        /* No confiar en backface-visibility (soporte inconsistente entre
           navegadores/GPUs): forzar a mano cuál cara se ve según el ángulo. */
        if (ffront && fback) {
            const pasadoElEcuador = angle > 90;
            ffront.style.opacity = pasadoElEcuador ? '0' : '1';
            fback.style.opacity  = pasadoElEcuador ? '1' : '0';
        }

        if (p < 0.002) {
            fl.style.opacity  = '0';
            fi.style.clipPath = '';
            return;
        }

        fl.style.opacity = '1';
        const pct = p * 100;

        /* El fold-layer clonado actúa como "ventana" 3D: su contenido (ffront)
           se dimensiona al ancho REAL de la página completa y se desplaza para
           compensar, en vez de reescalarse al ancho angosto de la tira que se
           dobla — así el texto/logo no se ve duplicado ni desalineado. */
        if (ffront) {
            ffront.style.width = (100 / pct * 100) + '%';
        }

        if (direction === 'next') {
            /* La página actual dobla desde el borde DERECHO hacia la izquierda */
            fi.style.clipPath = `inset(0 ${pct}% 0 0)`;

            fl.style.width           = pct + '%';
            fl.style.left            = (100 - pct) + '%';
            fl.style.right           = '';
            fl.style.transformOrigin = 'left center';
            fl.style.transform       = `rotateY(-${angle}deg)`;
            if (ffront) ffront.style.left = -((100 - pct) / pct * 100) + '%';
        } else {
            /* La página previa se "despliega" desde el borde IZQUIERDO hacia la derecha */
            fi.style.clipPath = `inset(0 0 0 ${pct}%)`;

            fl.style.width           = pct + '%';
            fl.style.left            = '0';
            fl.style.right           = '';
            fl.style.transformOrigin = 'right center';
            fl.style.transform       = `rotateY(${angle}deg)`;
            if (ffront) ffront.style.left = '0';
        }
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
            prepareFold(page);

            page.style.zIndex = 1000;
            page.classList.add('folding');
            next.classList.remove('unread-right');
            next.classList.add('active');
            next.style.zIndex = 500;

            applyFold(page, 0, 'next');
            animateFold(page, 0, 1, 'next', 260, () => {
                currentPage = dest;
                setStates(currentPage);
                isAnimating = false;
            });
        } else {
            const page = pages[dest];
            const curr = pages[currentPage];
            prepareFold(page);

            page.style.zIndex = 1000;
            page.classList.remove('flipped-left');
            page.classList.add('active', 'folding');
            curr.style.zIndex = 500;

            applyFold(page, 1, 'prev');
            animateFold(page, 1, 0, 'prev', 260, () => {
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
        if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prev();
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
                dragDir  = 'next';
                dragPage = pages[currentPage];
                prepareFold(dragPage);
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
                dragDir  = 'prev';
                dragPage = pages[currentPage - 1];
                prepareFold(dragPage);
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
        const dx    = x - txStart;
        const fast  = Date.now() - tStart < 280;
        const page  = dragPage;
        const dir   = dragDir;
        const fromP = dragP;
        dragPage = null; dragDir = null;

        let complete = false;
        if (dir === 'next') complete = fromP > 0.28 || (fast && dx < -18);
        else                complete = fromP < 0.72 || (fast && dx >  18);

        const toP = (dir === 'next' && complete) || (dir === 'prev' && !complete) ? 1 : 0;
        const remaining = Math.abs(toP - fromP);
        const dur = Math.max(90, remaining * 260);

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
    window.addEventListener('touchmove',    e => moveDrag(e.touches[0].clientX, e.touches[0].clientY, () => e.preventDefault()), { passive: false });
    window.addEventListener('touchend',     e => endDrag(e.changedTouches[0].clientX), { passive: true });

    /* Bindings mouse */
    notebook.addEventListener('mousedown', e => {
        if (e.target.closest('button')) return;
        startDrag(e.clientX, e.clientY);
        const onMove = me => moveDrag(me.clientX, me.clientY, () => me.preventDefault());
        const onUp   = me => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); endDrag(me.clientX); };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup',   onUp);
    });
});

/* ════════════════════════════════════════════════════════
   WHATSAPP + CARRITO
════════════════════════════════════════════════════════ */
let carrito = [];
const TEL = '593969581620';

/* ═══════════ COSTO DE ENVÍO POR GEOLOCALIZACIÓN ═══════════
   $1.50 fijo hasta 2 km, luego $0.50 por cada km adicional. */
const LOCAL_LAT = -0.3229875;
const LOCAL_LNG = -78.556484375;
const ENVIO_BASE = 1.50;
const ENVIO_KM_INCLUIDOS = 2;
const ENVIO_POR_KM = 0.50;

let envioDistanciaKm = null;
let envioCosto = null;

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

window.calcularCostoEnvio = function() {
    const resultEl = document.getElementById('envioFeeResult');
    const btn = document.getElementById('btnCalcularEnvio');

    if (!navigator.geolocation) {
        resultEl.textContent = 'Tu navegador no soporta geolocalización. El costo de envío se confirmará por WhatsApp.';
        resultEl.classList.add('error');
        resultEl.style.display = 'block';
        envioDistanciaKm = null; envioCosto = null;
        actualizarTotalCheckout();
        return;
    }

    btn.disabled = true;
    btn.textContent = '📡 Calculando...';

    navigator.geolocation.getCurrentPosition(
        pos => {
            const km = distanciaKm(LOCAL_LAT, LOCAL_LNG, pos.coords.latitude, pos.coords.longitude);
            envioDistanciaKm = km;
            envioCosto = calcularTarifaEnvio(km);
            resultEl.classList.remove('error');
            resultEl.textContent = `📍 ${km.toFixed(1)} km del local — Envío: $${envioCosto.toFixed(2)}`;
            resultEl.style.display = 'block';
            btn.textContent = '📍 Recalcular ubicación';
            btn.disabled = false;
            actualizarTotalCheckout();
            sugerirDireccion(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
            resultEl.classList.add('error');
            resultEl.textContent = 'No se pudo obtener tu ubicación. El costo de envío se confirmará por WhatsApp.';
            resultEl.style.display = 'block';
            btn.textContent = '📍 Reintentar';
            btn.disabled = false;
            envioDistanciaKm = null; envioCosto = null;
            actualizarTotalCheckout();
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
};

function actualizarTotalCheckout() {
    const subtotal = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
    const tipo = document.getElementById('pedidoTipo').value;
    const envioLine = document.getElementById('checkoutEnvioLine');
    document.getElementById('checkoutSubtotal').textContent = subtotal.toFixed(2);

    let total = subtotal;
    if (tipo === 'Envío a Domicilio' && envioCosto != null) {
        document.getElementById('checkoutEnvioMonto').textContent = envioCosto.toFixed(2);
        envioLine.style.display = 'inline';
        total += envioCosto;
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

window.pedirWsp = function(plato, precio, event) {
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

window.cambiarCantidad = function(plato, delta, event) {
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
    count.textContent   = carrito.length;
    if (carrito.length > 0) badge.classList.remove('hidden');
    else { badge.classList.add('hidden'); cerrarCarrito(); }
}

window.toggleCarrito = () => {
    const p = document.getElementById('cartPanel');
    p.classList.contains('show') ? cerrarCarrito() : (p.classList.add('show'), document.getElementById('cartFloat').setAttribute('aria-expanded','true'));
};
window.cerrarCarrito = () => {
    document.getElementById('cartPanel').classList.remove('show');
    document.getElementById('cartFloat').setAttribute('aria-expanded','false');
};

window.abrirCheckout = () => {
    cerrarCarrito();
    const m = document.getElementById('checkoutModal');
    m.tagName==='DIALOG' ? m.showModal() : m.classList.add('show');
    actualizarVisibilidadEnvio();
};
window.cerrarCheckout = () => { const m = document.getElementById('checkoutModal'); m.tagName==='DIALOG' ? m.close() : m.classList.remove('show'); };

document.getElementById('pedidoTipo').addEventListener('change', actualizarVisibilidadEnvio);

window.enviarPedido = function(e) {
    if (e) e.preventDefault();
    const nombre = document.getElementById('clienteNombre').value.trim();
    const tipo   = document.getElementById('pedidoTipo').value;
    const pago   = document.getElementById('metodoPago').value;
    const dir    = document.getElementById('clienteDireccion').value.trim();
    if (!nombre)         { alert('Por favor ingresa tu nombre.'); return; }
    if (!carrito.length) { alert('Tu carrito está vacío.'); return; }

    const subtotal = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
    const esEnvio = tipo === 'Envío a Domicilio';
    let total = subtotal;
    let lineasEnvio = [];
    if (esEnvio) {
        if (envioCosto != null) {
            total += envioCosto;
            lineasEnvio = [`*🛵 Envío:* $${envioCosto.toFixed(2)} (${envioDistanciaKm.toFixed(1)} km aprox.)`];
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
        ``,`*📝 DETALLE:*`,
        ...carrito.map(i => `▪️ ${i.cantidad}x ${i.plato} ($${(i.precio*i.cantidad).toFixed(2)})`),
        ``,`*💵 Subtotal: $${subtotal.toFixed(2)}*`,
        ...lineasEnvio,
        `*💰 TOTAL A PAGAR: $${total.toFixed(2)}*`,
    ].join('\n');
    window.open(`https://wa.me/${TEL}?text=${encodeURIComponent(texto)}`, '_blank');
    carrito = []; actualizarCarrito(); cerrarCheckout();
    document.getElementById('checkoutForm').reset();
    envioDistanciaKm = null; envioCosto = null;
    document.getElementById('envioFeeResult').style.display = 'none';
    document.getElementById('btnCalcularEnvio').textContent = '📍 Calcular costo de envío';
    document.getElementById('direccionSugeridaHint').style.display = 'none';
};

/* ─── Modal plato ─── */
window.verPlato = function(el) {
    if (!el) return;
    const { nombre, precio, desc, img, tag } = el.dataset;
    document.getElementById('dishModalImg').src   = img;
    document.getElementById('dishModalImg').alt   = nombre;
    document.getElementById('dishModalName').textContent  = nombre;
    document.getElementById('dishModalPrice').textContent = '$' + precio;
    const sents = desc.split('.').map(s=>s.trim()).filter(Boolean);
    document.getElementById('dishModalDesc').innerHTML = '🔸 ' + sents.join('.<br><br>🔸 ') + '.';
    const tagEl = document.getElementById('dishModalTag');
    if (tag) { tagEl.textContent = tag; tagEl.style.display = 'inline-block'; }
    else       tagEl.style.display = 'none';
    document.getElementById('dishModalBtn').onclick = ev => {
        ev.stopPropagation();
        pedirWsp(nombre, parseFloat(precio), ev);
        setTimeout(cerrarDetallePlato, 600);
    };
    document.getElementById('dishModal').classList.add('show');
    document.body.style.overflow = 'hidden';
};

window.cerrarDetallePlato = function(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('dishModal').classList.remove('show');
    document.body.style.overflow = '';
};
