/* ═══════════════════════════════════════════════════════════
   PINCHOS Y CHULETAS DEL SOL — Control del Cuaderno
   Realistic Fold Engine v4 — Doblez real de cuaderno
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    const notebook = document.getElementById('notebook');
    const pages = Array.from(document.querySelectorAll('.page'));
    const indicator = document.getElementById('pageIndicator');

    const totalPages = pages.length;
    let currentPage = 0;
    let isAnimating = false;

    // ─── Crear estructura de doblez para cada página ───
    pages.forEach(p => {
        const inner = p.querySelector('.page-inner');
        if (!inner) return;

        // Crear capas de doblez (sin contenido inicial para velocidad)
        const foldLayer = document.createElement('div');
        foldLayer.className = 'fold-layer';

        const foldFront = document.createElement('div');
        foldFront.className = 'fold-front';

        const foldBack = document.createElement('div');
        foldBack.className = 'fold-back';

        const foldShadow = document.createElement('div');
        foldShadow.className = 'fold-shadow';

        const baseShadow = document.createElement('div');
        baseShadow.className = 'fold-base-shadow';

        foldLayer.appendChild(foldFront);
        foldLayer.appendChild(foldBack);
        p.appendChild(foldLayer);
        p.appendChild(foldShadow);
        p.appendChild(baseShadow);
    });


    function prepareFoldContent(page) {
        const inner = page.querySelector('.page-inner');
        const foldFront = page.querySelector('.fold-front');
        if (inner && foldFront && foldFront.children.length === 0) {
            // Clonar nodos es más rápido que innerHTML
            const children = Array.from(inner.children);
            children.forEach(child => {
                foldFront.appendChild(child.cloneNode(true));
            });
        }
    }


    // ─── Inicializar estados ───
    function setPageStates(activeIndex) {
        const range = 2; // Solo actualizar páginas cercanas
        const start = Math.max(0, activeIndex - range);
        const end = Math.min(totalPages - 1, activeIndex + range);

        // Primero, asegurar que la página activa sea la correcta y visible
        pages.forEach((p, i) => {
            if (i < activeIndex) {
                if (!p.classList.contains('flipped-left')) {
                    p.className = 'page flipped-left';
                    p.style.zIndex = i;
                    resetFold(p);
                }
            } else if (i === activeIndex) {
                p.className = 'page active';
                p.style.zIndex = 500;
                resetFold(p);
                const inner = p.querySelector('.page-inner');
                if (inner) inner.style.clipPath = '';
            } else {
                if (!p.classList.contains('unread-right')) {
                    p.className = 'page unread-right';
                    p.style.zIndex = totalPages - i;
                    resetFold(p);
                }
            }
        });

        // Sincronizar indicadores
        if (typeof dots !== 'undefined' && dots.length > 0) {
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === activeIndex);
            });
        }

        notebook.classList.remove('is-navigating');
    }




    function resetFold(page) {
        const foldLayer = page.querySelector('.fold-layer');
        const foldShadow = page.querySelector('.fold-shadow');
        const baseShadow = page.querySelector('.fold-base-shadow');
        if (foldLayer) {
            foldLayer.style.transform = '';
            foldLayer.style.width = '';
            foldLayer.style.opacity = '0';
            foldLayer.style.transition = '';
        }
        if (foldShadow) {
            foldShadow.style.opacity = '0';
            foldShadow.style.left = '';
            foldShadow.style.transition = '';
        }
        if (baseShadow) {
            baseShadow.style.opacity = '0';
            baseShadow.style.width = '';
            baseShadow.style.transition = '';
        }
    }

    // ─── Indicadores (dots) ───
    pages.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'page-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => irAPagina(i));
        indicator.appendChild(dot);
    });
    const dots = Array.from(indicator.querySelectorAll('.page-dot'));

    setPageStates(0);

    function updateDots(newPage) {
        dots[currentPage].classList.remove('active');
        dots[newPage].classList.add('active');
    }

    // ─── Aplicar doblez visual (High-Performance Professional Flip) ───
    function applyFold(page, progress, direction) {
        const foldLayer = page.querySelector('.fold-layer');
        const foldShadow = page.querySelector('.fold-shadow');
        const baseShadow = page.querySelector('.fold-base-shadow');
        const inner = page.querySelector('.page-inner');
        if (!foldLayer || !inner) return;

        const clampedProgress = Math.max(0, Math.min(1, progress));

        if (clampedProgress < 0.001) {
            foldLayer.style.opacity = '0';
            if (foldShadow) foldShadow.style.opacity = '0';
            if (baseShadow) baseShadow.style.opacity = '0';
            inner.style.clipPath = '';
            return;
        }

        foldLayer.style.opacity = '1';

        // Ancho de la parte que se dobla (Horizontal puro para máxima velocidad)
        const foldWidth = clampedProgress * 100;
        const foldOriginX = 100 - foldWidth;

        // Clipping limpio (inset es el más rápido de procesar)
        inner.style.clipPath = `inset(0 ${foldWidth}% 0 0)`;

        // Posicionar y rotar la capa de doblez
        foldLayer.style.width = foldWidth + '%';
        foldLayer.style.left = foldOriginX + '%';

        // Rotación 3D fluida
        const rotateAngle = clampedProgress * 180;
        foldLayer.style.transform = `translate3d(0,0,10px) rotateY(-${rotateAngle}deg)`;

        // Sombras sutiles y elegantes (solo actualizar opacidad y posición variable)
        if (foldShadow && clampedProgress > 0.05) {
            foldShadow.style.opacity = (clampedProgress * 0.35).toFixed(2);
        }
        if (baseShadow && clampedProgress > 0.05) {
            baseShadow.style.opacity = (clampedProgress * 0.2).toFixed(2);
            baseShadow.style.right = foldWidth + '%';
        }
    }

    // ─── Ir a página con animación (INSTANTÁNEA) ───
    function irAPagina(destino) {
        if (isAnimating || destino === currentPage || destino < 0 || destino >= totalPages) return;
        isAnimating = true;
        notebook.classList.add('is-navigating');


        const avanzando = destino > currentPage;
        updateDots(destino);
        const oldPage = currentPage;

        if (avanzando) {
            const page = pages[oldPage];
            const nextP = pages[destino];
            // Asegurar que el contenido esté listo antes de empezar
            prepareFoldContent(page);

            // Elevación inmediata
            page.style.zIndex = 1000;
            nextP.classList.add('active');
            nextP.style.zIndex = 500;
            nextP.classList.remove('unread-right');

            // Sincronizar estado inicial (totalmente abierta)
            applyFold(page, 0, 'next');

            page.classList.add('folding');
            let start = null;
            // ⚠️ MODIFICA AQUÍ LA RAPIDEZ AL IR HACIA ADELANTE (Menos número = más rápido)
            const duration = 60; 

            function animate(timestamp) {
                if (!start) start = timestamp;
                const elapsed = timestamp - start;
                const t = Math.min(elapsed / duration, 1);
                // Power 4 Out para un inicio más agresivo
                const eased = t === 1 ? 1 : 1 - Math.pow(1 - t, 4);
                applyFold(page, eased, 'next');
                if (t < 1) requestAnimationFrame(animate);
                else {
                    currentPage = destino;
                    setPageStates(currentPage);
                    isAnimating = false;
                }
            }
            requestAnimationFrame(animate);
            return;

        } else {
            const page = pages[destino];
            const currentP = pages[oldPage];
            prepareFoldContent(page);

            // Elevación inmediata para que se vea el vire
            page.style.zIndex = 1000;
            currentP.style.zIndex = 500;

            // Aplicar estado inicial (totalmente plegada)
            applyFold(page, 1, 'prev');

            page.classList.remove('flipped-left');
            page.classList.add('active', 'folding');

            let start = null;
            // ⚠️ MODIFICA AQUÍ LA RAPIDEZ AL REGRESAR (Menos número = más rápido)
            const duration = 60; 

            function animate(timestamp) {
                if (!start) start = timestamp;
                const elapsed = timestamp - start;
                const t = Math.min(elapsed / duration, 1);
                const eased = t === 1 ? 1 : 1 - Math.pow(1 - t, 4);
                applyFold(page, 1 - eased, 'prev');
                if (t < 1) requestAnimationFrame(animate);
                else {
                    currentPage = destino;
                    setPageStates(currentPage);
                    isAnimating = false;
                }
            }
            requestAnimationFrame(animate);
            return;
        }
    }

    function siguientePagina() { irAPagina(currentPage + 1); }
    function paginaAnterior() { irAPagina(currentPage - 1); }

    // ─── Teclado ───
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') siguientePagina();
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') paginaAnterior();
    });

    // ═══════════ DESLIZAR TÁCTIL — MOTOR DE SWIPE ═══════════
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isHorizontalSwipe = null;
    let hasMoved = false;
    const DIRECTION_THRESHOLD = 2; // Súper instantáneo
    const SWIPE_THRESHOLD = 0.05; // Solo con tocar ya se pasa


    let dragPage = null;
    let dragDirection = null;
    let progress = 0;
    let viewWidth = Math.min(document.body.clientWidth, 460);

    window.addEventListener('resize', () => {
        viewWidth = Math.min(document.body.clientWidth, 460);
    });

    // ─── CONTROL DE ARRASTRE (DRAG & SWIPE) ───
    function startDrag(x, y) {
        if (isAnimating || dragPage) return;
        notebook.classList.add('is-navigating');
        touchStartX = x;
        touchStartY = y;
        touchStartTime = Date.now();
        isHorizontalSwipe = null;
        hasMoved = false;
        progress = 0;
    }

    function moveDrag(x, y, preventDefault) {
        if (isAnimating) return;
        updateDrag(x, y, preventDefault);
    }

    function updateDrag(x, y, preventDefault) {
        const dx = x - touchStartX;
        const dy = y - touchStartY;

        if (isHorizontalSwipe === null) {
            if (Math.abs(dx) > DIRECTION_THRESHOLD || Math.abs(dy) > DIRECTION_THRESHOLD) {
                isHorizontalSwipe = Math.abs(dx) > Math.abs(dy);
            }
        }

        if (!isHorizontalSwipe) return;
        if (preventDefault) preventDefault();
        hasMoved = true;

        const width = notebook.offsetWidth || 400;
        // Sensibilidad ultra-alta para respuesta fulminante
        const SENSITIVITY = 2.5;

        if (!dragPage) {
            if (dx < -DIRECTION_THRESHOLD && currentPage < totalPages - 1) {
                dragDirection = 'next';
                dragPage = pages[currentPage];
                prepareFoldContent(dragPage);
                dragPage.style.zIndex = 1000;
                if (pages[currentPage + 1]) {
                    pages[currentPage + 1].classList.add('active');
                    pages[currentPage + 1].style.zIndex = 500;
                }
                dragPage.classList.add('dragging');
            } else if (dx > DIRECTION_THRESHOLD && currentPage > 0) {
                dragDirection = 'prev';
                dragPage = pages[currentPage - 1];
                prepareFoldContent(dragPage);
                dragPage.style.zIndex = 1000;
                pages[currentPage].style.zIndex = 500;
                dragPage.classList.remove('flipped-left');
                dragPage.classList.add('active', 'dragging');

            }
        }

        if (!dragPage) return;

        if (dragDirection === 'next') {
            progress = Math.max(0, Math.min(1, (-dx * SENSITIVITY) / width));
            applyFold(dragPage, progress, 'next');
        } else {
            progress = Math.max(0, Math.min(1, 1 - (dx * SENSITIVITY) / width));
            applyFold(dragPage, progress, 'prev');
        }
    }

    function endDrag(x) {
        if (!dragPage) return;

        const dx = x - touchStartX;
        const width = notebook.offsetWidth || 400;
        const velocity = (Date.now() - touchStartTime) < 250;

        let shouldComplete = false;
        if (dragDirection === 'next') {
            shouldComplete = (progress > 0.15) || (velocity && dx < -15);
        } else {
            shouldComplete = (progress < 0.85) || (velocity && dx > 15);
        }


        isAnimating = true;
        const page = dragPage;
        const dir = dragDirection;

        if ((dir === 'next' && shouldComplete) || (dir === 'prev' && !shouldComplete)) {
            animateProgress(page, progress, 1, dir, 60, () => {
                if (dir === 'next') currentPage++;
                setPageStates(currentPage);
                isAnimating = false;
                dragPage = null;
            });
        } else {
            animateProgress(page, progress, 0, dir, 60, () => {
                if (dir === 'prev') currentPage--;
                setPageStates(currentPage);
                isAnimating = false;
                dragPage = null;
            });
        }
    }


    function animateProgress(page, from, to, dir, durationMs, callback) {
        let start = null;
        function step(timestamp) {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const t = Math.min(elapsed / durationMs, 1);
            // Curva de velocidad más agresiva para nitidez
            const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            const current = from + (to - from) * eased;
            applyFold(page, current, dir);
            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                callback();
            }
        }
        requestAnimationFrame(step);
    }

    // Bindings
    notebook.addEventListener('touchstart', (e) => {
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        moveDrag(e.touches[0].clientX, e.touches[0].clientY, () => e.preventDefault());
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
        endDrag(e.changedTouches[0].clientX);
    }, { passive: true });

    notebook.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) return;
        startDrag(e.clientX, e.clientY);
        const onMouseMove = (me) => moveDrag(me.clientX, me.clientY, () => me.preventDefault());
        const onMouseUp = (me) => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            endDrag(me.clientX);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    });
});

// ═══════════ INTEGRACIÓN CON WHATSAPP (SISTEMA DE CARRITO) ═══════════
let carrito = [];
const NUMERO_TELEFONO_RESTAURANTE = '593969581620';

window.pedirWsp = function (plato, precio, event) {
    if (event) event.stopPropagation();

    let item = carrito.find(i => i.plato === plato);
    if (item) {
        item.cantidad++;
    } else {
        carrito.push({ plato, precio, cantidad: 1 });
    }

    actualizarCarrito();

    // Feedback visual
    if (event && event.currentTarget) {
        let btn = event.currentTarget;
        let oldText = btn.innerHTML;
        btn.innerHTML = "¡Agregado! ✓";
        btn.classList.add('btn-added');
        setTimeout(() => {
            btn.innerHTML = oldText;
            btn.classList.remove('btn-added');
        }, 1000);
    }
};

window.cambiarCantidad = function (plato, delta, event) {
    if (event) event.stopPropagation();

    let item = carrito.find(i => i.plato === plato);
    if (item) {
        item.cantidad += delta;
        if (item.cantidad <= 0) {
            carrito = carrito.filter(i => i.plato !== plato);
        }
    }
    actualizarCarrito();
};

function actualizarCarrito() {
    const list = document.getElementById('cartList');
    const totalEl = document.getElementById('cartTotal');
    const badge = document.getElementById('cartFloat');
    const itemCount = document.getElementById('cartItemCount');

    list.innerHTML = '';
    let total = 0;

    carrito.forEach(item => {
        total += item.precio * item.cantidad;

        let li = document.createElement('li');
        li.className = 'cart-item';
        li.role = 'listitem';

        li.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-title">${item.plato}</div>
                <div class="cart-item-price">$${(item.precio * item.cantidad).toFixed(2)}</div>
            </div>
            <div class="cart-item-qty">
                <button onclick="cambiarCantidad('${item.plato}', -1, event)" aria-label="Reducir cantidad">-</button>
                <span aria-label="Cantidad" style="width: 30px; text-align: center;">${item.cantidad}</span>
                <button onclick="cambiarCantidad('${item.plato}', 1, event)" aria-label="Aumentar cantidad">+</button>
            </div>
        `;
        list.appendChild(li);
    });

    totalEl.textContent = total.toFixed(2);
    itemCount.textContent = carrito.length;

    if (carrito.length > 0) {
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
        cerrarCarrito();
    }
}

window.toggleCarrito = function () {
    const panel = document.getElementById('cartPanel');
    const btn = document.getElementById('cartFloat');
    if (panel.classList.contains('show')) {
        cerrarCarrito();
    } else {
        panel.classList.add('show');
        btn.setAttribute('aria-expanded', 'true');
    }
};

window.cerrarCarrito = function () {
    const panel = document.getElementById('cartPanel');
    const btn = document.getElementById('cartFloat');
    panel.classList.remove('show');
    btn.setAttribute('aria-expanded', 'false');
};

// ═══════════ CHECKOUT MODAL ═══════════
window.abrirCheckout = function () {
    cerrarCarrito();
    const modal = document.getElementById('checkoutModal');
    if (modal.tagName === 'DIALOG') {
        modal.showModal();
    } else {
        modal.classList.add('show');
    }
};

window.cerrarCheckout = function () {
    const modal = document.getElementById('checkoutModal');
    if (modal.tagName === 'DIALOG') {
        modal.close();
    } else {
        modal.classList.remove('show');
    }
};

window.enviarPedido = function (e) {
    if (e) e.preventDefault();
    const nombre = document.getElementById('clienteNombre').value.trim();
    const tipo = document.getElementById('pedidoTipo').value;
    const pago = document.getElementById('metodoPago').value;
    const direccion = document.getElementById('clienteDireccion').value.trim();

    if (!nombre) {
        alert('Por favor ingresa tu nombre.');
        return;
    }

    if (carrito.length === 0) {
        alert('Tu carrito está vacío.');
        return;
    }

    const textoPedido = renderizarTextoPedido(carrito, nombre, tipo, pago, direccion);
    const urlWhatsApp = `https://wa.me/${NUMERO_TELEFONO_RESTAURANTE}?text=${encodeURIComponent(textoPedido)}`;

    window.open(urlWhatsApp, '_blank');

    carrito = [];
    actualizarCarrito();
    cerrarCheckout();
    document.getElementById('checkoutForm').reset();
};

function renderizarTextoPedido(carrito, nombre, tipo, pago, direccion) {
    const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

    const texto = [
        `*🥩 NUEVO PEDIDO: Pinchos Del Sol*`,
        `*👤 Cliente:* ${nombre}`,
        `*🍽️ Tipo:* ${tipo}`,
        `*💸 Pago:* ${pago}`,
        ...(direccion ? [`*📍 Dir/Obs:* ${direccion}`] : []),
        ``,
        `*📝 DETALLE:*`,
        ...carrito.map((item) => `▪️ ${item.cantidad}x ${item.plato} ($${(item.precio * item.cantidad).toFixed(2)})`),
        ``,
        `*💰 TOTAL A PAGAR: $${total.toFixed(2)}*`,
    ].join('\n');

    return texto;
}

// ═══════════ MODAL DE DETALLE DEL PLATO ═══════════
window.verPlato = function (menuItem) {
    if (!menuItem) return;

    const nombre = menuItem.dataset.nombre;
    const precio = menuItem.dataset.precio;
    const desc = menuItem.dataset.desc;
    const img = menuItem.dataset.img;
    const tag = menuItem.dataset.tag || '';

    const modal = document.getElementById('dishModal');
    document.getElementById('dishModalImg').src = img;
    document.getElementById('dishModalImg').alt = nombre;
    document.getElementById('dishModalName').textContent = nombre;
    document.getElementById('dishModalPrice').textContent = '$' + precio;
    // Formatear la descripción para que se vea como una lista de contenidos
    const sentences = desc.split('.').map(s => s.trim()).filter(s => s);
    const formattedDesc = sentences.join('.<br><br>🔸 ');
    document.getElementById('dishModalDesc').innerHTML = '🔸 ' + formattedDesc + '.';

    const tagEl = document.getElementById('dishModalTag');
    if (tag) {
        tagEl.textContent = tag;
        tagEl.style.display = 'inline-block';
    } else {
        tagEl.style.display = 'none';
    }

    // Configurar botón pedir del modal
    const btnPedir = document.getElementById('dishModalBtn');
    btnPedir.onclick = function (e) {
        e.stopPropagation();
        pedirWsp(nombre, parseFloat(precio), e);
        setTimeout(() => cerrarDetallePlato(), 600);
    };

    // Mostrar modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
};

window.cerrarDetallePlato = function (event) {
    if (event && event.target !== event.currentTarget) return;

    const modal = document.getElementById('dishModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
};
