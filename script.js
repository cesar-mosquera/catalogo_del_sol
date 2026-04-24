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

        // Clonar contenido para la mitad que se dobla
        const foldLayer = document.createElement('div');
        foldLayer.className = 'fold-layer';

        const foldFront = document.createElement('div');
        foldFront.className = 'fold-front';

        const foldBack = document.createElement('div');
        foldBack.className = 'fold-back';

        // Sombra del doblez
        const foldShadow = document.createElement('div');
        foldShadow.className = 'fold-shadow';

        // Sombra en la página base
        const baseShadow = document.createElement('div');
        baseShadow.className = 'fold-base-shadow';

        foldFront.innerHTML = inner.innerHTML;
        
        foldLayer.appendChild(foldFront);
        foldLayer.appendChild(foldBack);
        p.appendChild(foldLayer);
        p.appendChild(foldShadow);
        p.appendChild(baseShadow);
    });

    // ─── Inicializar estados ───
    function setPageStates(activeIndex) {
        pages.forEach((p, i) => {
            p.classList.remove('active', 'flipped-left', 'unread-right', 'folding', 'dragging');
            
            if (i < activeIndex) {
                p.classList.add('flipped-left');
                p.style.zIndex = i;
            } else if (i === activeIndex) {
                p.classList.add('active');
                p.style.zIndex = 100;
            } else {
                p.classList.add('unread-right');
                p.style.zIndex = totalPages - i;
            }
            
            // Limpiar estilos inline de animación si existen
            const inner = p.querySelector('.page-inner');
            if (inner) inner.style.clipPath = '';
            resetFold(p);
        });
        
        // Sincronizar indicadores
        if (dots.length > 0) {
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === activeIndex);
            });
        }
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

        // Rotación 3D limpia
        const rotateAngle = clampedProgress * 180;
        foldLayer.style.transformOrigin = 'left center';
        foldLayer.style.transform = `rotateY(-${rotateAngle}deg)`;

        // Sombras sutiles y elegantes
        if (foldShadow) {
            foldShadow.style.opacity = String(clampedProgress * 0.4);
            foldShadow.style.left = '0';
            foldShadow.style.width = '20px';
        }
        if (baseShadow) {
            baseShadow.style.opacity = String(clampedProgress * 0.2);
            baseShadow.style.right = foldWidth + '%';
            baseShadow.style.width = '30px';
        }
    }

    // ─── Ir a página con animación (INSTANTÁNEA) ───
    function irAPagina(destino) {
        if (isAnimating || destino === currentPage || destino < 0 || destino >= totalPages) return;
        isAnimating = true;

        const avanzando = destino > currentPage;
        updateDots(destino);
        const oldPage = currentPage;

        if (avanzando) {
            const page = pages[oldPage];
            page.style.zIndex = 20;

            pages[destino].classList.remove('unread-right');
            pages[destino].classList.add('active');
            pages[destino].style.zIndex = 10;

            page.classList.add('folding');

            let start = null;
            const duration = 250; // Ultra rápido

            function animate(timestamp) {
                if (!start) start = timestamp;
                const elapsed = timestamp - start;
                const t = Math.min(elapsed / duration, 1);
                // Ease Out Expo para profesionalismo
                const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

                applyFold(page, eased, 'next');

                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    currentPage = destino;
                    setPageStates(currentPage);
                    isAnimating = false;
                }
            }
            requestAnimationFrame(animate);

        } else {
            const page = pages[destino];
            page.style.zIndex = 20;
            page.classList.remove('flipped-left');
            page.classList.add('active', 'folding');

            let start = null;
            const duration = 250;

            function animate(timestamp) {
                if (!start) start = timestamp;
                const elapsed = timestamp - start;
                const t = Math.min(elapsed / duration, 1);
                const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

                applyFold(page, 1 - eased, 'prev');

                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    currentPage = destino;
                    setPageStates(currentPage);
                    isAnimating = false;
                }
            }
            requestAnimationFrame(animate);
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
    const DIRECTION_THRESHOLD = 5; // Más sensible
    const SWIPE_THRESHOLD = 0.1; // Más fácil de pasar la página

    let dragPage = null;
    let dragDirection = null;
    let progress = 0;
    let viewWidth = Math.min(document.body.clientWidth, 460);

    window.addEventListener('resize', () => {
        viewWidth = Math.min(document.body.clientWidth, 460);
    });

    function startDrag(x, y) {
        if (isAnimating) return;
        touchStartX = x;
        touchStartY = y;
        touchStartTime = Date.now();
        isHorizontalSwipe = null;
        hasMoved = false;
        dragPage = null;
        dragDirection = null;
        progress = 0;
    }

    function moveDrag(x, y, preventDefault) {
        if (isAnimating) return;
        const dx = x - touchStartX;
        const dy = y - touchStartY;

        if (isHorizontalSwipe === null) {
            if (Math.abs(dx) > DIRECTION_THRESHOLD || Math.abs(dy) > DIRECTION_THRESHOLD) {
                isHorizontalSwipe = Math.abs(dx) > Math.abs(dy);
                if (!isHorizontalSwipe) return;
            } else {
                return;
            }
        }

        if (!isHorizontalSwipe) return;
        if (preventDefault) preventDefault();
        hasMoved = true;

        if (!dragPage) {
            if (dx < 0 && currentPage < totalPages - 1) {
                dragDirection = 'next';
                dragPage = pages[currentPage];
                dragPage.style.zIndex = 20;
                dragPage.classList.add('folding');

                pages[currentPage + 1].classList.remove('unread-right');
                pages[currentPage + 1].classList.add('active');
                pages[currentPage + 1].style.zIndex = 10;

            } else if (dx > 0 && currentPage > 0) {
                dragDirection = 'prev';
                dragPage = pages[currentPage - 1];
                dragPage.style.zIndex = 20;
                dragPage.classList.remove('flipped-left');
                dragPage.classList.add('active', 'folding');
            }
        }

        if (!dragPage) return;

        if (dragDirection === 'next') {
            progress = Math.min(Math.abs(dx) / viewWidth, 1);
            applyFold(dragPage, progress, 'next');
        } else {
            progress = 1 - Math.min(dx / viewWidth, 1);
            applyFold(dragPage, progress, 'prev');
        }
    }

    function endDrag() {
        isHorizontalSwipe = null;

        if (!dragPage || isAnimating) {
            dragPage = null;
            return;
        }

        const elapsed = Date.now() - touchStartTime;
        const isQuickFlick = elapsed < 300 && progress > 0.08;
        const passedThreshold = progress > SWIPE_THRESHOLD;
        const shouldComplete = (dragDirection === 'next')
            ? (passedThreshold || isQuickFlick)
            : (progress < (1 - SWIPE_THRESHOLD) || (isQuickFlick && progress < 0.92));

        isAnimating = true;
        const page = dragPage;
        const dir = dragDirection;
        const startProgress = (dir === 'next') ? progress : progress;

        if ((dir === 'next' && shouldComplete) || (dir === 'prev' && !shouldComplete)) {
            // Completar paso de página
            const targetProgress = 1;
            animateProgress(page, startProgress, targetProgress, dir, 150, () => {
                if (dir === 'next') currentPage++;
                setPageStates(currentPage);
                isAnimating = false;
                dragPage = null;
            });
        } else {
            // Regresar a la página actual
            const targetProgress = 0;
            animateProgress(page, startProgress, targetProgress, dir, 150, () => {
                if (dir === 'prev') currentPage--; // Corregido: abrir página en prev completado
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
            const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
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

    // ─── TOUCH EVENTS ───
    notebook.addEventListener('touchstart', (e) => {
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    notebook.addEventListener('touchmove', (e) => {
        moveDrag(
            e.touches[0].clientX,
            e.touches[0].clientY,
            () => e.preventDefault()
        );
    }, { passive: false });

    notebook.addEventListener('touchend', () => {
        endDrag();
    }, { passive: true });

    // ─── MOUSE EVENTS ───
    let mouseDown = false;

    notebook.addEventListener('mousedown', (e) => {
        if (e.target.closest('button') || e.target.closest('a')) return;
        mouseDown = true;
        startDrag(e.clientX, e.clientY);
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!mouseDown) return;
        moveDrag(e.clientX, e.clientY);
    });

    document.addEventListener('mouseup', () => {
        if (!mouseDown) return;
        mouseDown = false;
        endDrag();
    });
});

// ═══════════ INTEGRACIÓN CON WHATSAPP (SISTEMA DE CARRITO) ═══════════
let carrito = [];
const NUMERO_TELEFONO_RESTAURANTE = '593999999999';

window.pedirWsp = function(plato, precio, event) {
    if (event) event.stopPropagation();
    
    let item = carrito.find(i => i.plato === plato);
    if (item) {
        item.cantidad++;
    } else {
        carrito.push({ plato, precio, cantidad: 1 });
    }
    
    actualizarCarrito();
    
    // Feedback visual
    if(event && event.currentTarget) {
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

window.cambiarCantidad = function(plato, delta, event) {
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

window.toggleCarrito = function() {
    const panel = document.getElementById('cartPanel');
    const btn = document.getElementById('cartFloat');
    if (panel.classList.contains('show')) {
        cerrarCarrito();
    } else {
        panel.classList.add('show');
        btn.setAttribute('aria-expanded', 'true');
    }
};

window.cerrarCarrito = function() {
    const panel = document.getElementById('cartPanel');
    const btn = document.getElementById('cartFloat');
    panel.classList.remove('show');
    btn.setAttribute('aria-expanded', 'false');
};

// ═══════════ CHECKOUT MODAL ═══════════
window.abrirCheckout = function() {
    cerrarCarrito(); 
    const modal = document.getElementById('checkoutModal');
    if (modal.tagName === 'DIALOG') {
        modal.showModal();
    } else {
        modal.classList.add('show');
    }
};

window.cerrarCheckout = function() {
    const modal = document.getElementById('checkoutModal');
    if (modal.tagName === 'DIALOG') {
        modal.close();
    } else {
        modal.classList.remove('show');
    }
};

window.enviarPedido = function(e) {
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
    ].join('%0A');

    return texto;
}

// ═══════════ MODAL DE DETALLE DEL PLATO ═══════════
window.verPlato = function(menuItem) {
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
    btnPedir.onclick = function(e) {
        e.stopPropagation();
        pedirWsp(nombre, parseFloat(precio), e);
        setTimeout(() => cerrarDetallePlato(), 600);
    };
    
    // Mostrar modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
};

window.cerrarDetallePlato = function(event) {
    if (event && event.target !== event.currentTarget) return;
    
    const modal = document.getElementById('dishModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
};
