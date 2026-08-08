'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import type { Catalog } from '@/lib/catalog-types';
import { asset } from '@/lib/asset';
import { ProductCard } from '@/components/ProductCard';

type Turn = { page: number; under: number; destination: number; direction: 'next' | 'prev' };

export function BookTemplate({ catalog }: { catalog: Catalog }) {
  const [current, setCurrent] = useState(0);
  const [turn, setTurn]       = useState<Turn | null>(null);
  const stageRef              = useRef<HTMLDivElement>(null);

  // Seguimiento del toque
  const touchOrigin  = useRef<{ x: number; y: number } | null>(null);
  const swipeLocked  = useRef<'horiz' | 'vert' | null>(null); // dirección bloqueada

  const pages    = useMemo(() => catalog.sections, [catalog.sections]);
  const lastPage = pages.length + 1;
  const totalPages = lastPage + 1;

  /* ── Navegación ─────────────────────────────────────────── */
  const go = useCallback((dir: 'next' | 'prev') => {
    if (turn) return;
    if (dir === 'next' && current < lastPage)
      setTurn({ page: current, under: current + 1, destination: current + 1, direction: dir });
    if (dir === 'prev' && current > 0)
      setTurn({ page: current - 1, under: current, destination: current - 1, direction: dir });
  }, [current, lastPage, turn]);

  const finishTurn = useCallback(() => {
    if (!turn) return;
    setCurrent(turn.destination);
    setTurn(null);
  }, [turn]);

  /* ── Teclado ─────────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go('next');
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   go('prev');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  /* ── Touch con passive:false para interceptar swipe horizontal ── */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onStart = (e: TouchEvent) => {
      // Si el toque viene de un botón, link, etc. → no hacemos nada
      if ((e.target as HTMLElement).closest('button, a, input, textarea, select')) return;
      const t = e.touches[0];
      touchOrigin.current = { x: t.clientX, y: t.clientY };
      swipeLocked.current = null;
    };

    const onMove = (e: TouchEvent) => {
      if (!touchOrigin.current) return;
      const t  = e.touches[0];
      const dx = t.clientX - touchOrigin.current.x;
      const dy = t.clientY - touchOrigin.current.y;
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);

      // Si aún no hemos determinado la dirección, esperamos al menos 8px
      if (swipeLocked.current === null && (adx > 8 || ady > 8)) {
        swipeLocked.current = adx > ady ? 'horiz' : 'vert';
      }

      // Si es swipe horizontal → bloqueamos el scroll nativo
      if (swipeLocked.current === 'horiz') {
        e.preventDefault();
      }
      // Si es vertical → dejamos que el browser haga scroll normal
    };

    const onEnd = (e: TouchEvent) => {
      if (!touchOrigin.current || swipeLocked.current !== 'horiz') {
        touchOrigin.current = null;
        swipeLocked.current = null;
        return;
      }
      const t  = e.changedTouches[0];
      const dx = t.clientX - touchOrigin.current.x;
      touchOrigin.current = null;
      swipeLocked.current = null;

      if (Math.abs(dx) > 40) go(dx < 0 ? 'next' : 'prev');
    };

    const onCancel = () => {
      touchOrigin.current = null;
      swipeLocked.current = null;
    };

    // touchstart puede ser passive, touchmove NO (necesitamos preventDefault)
    el.addEventListener('touchstart',  onStart,  { passive: true  });
    el.addEventListener('touchmove',   onMove,   { passive: false }); // ← clave
    el.addEventListener('touchend',    onEnd,    { passive: true  });
    el.addEventListener('touchcancel', onCancel, { passive: true  });

    return () => {
      el.removeEventListener('touchstart',  onStart);
      el.removeEventListener('touchmove',   onMove);
      el.removeEventListener('touchend',    onEnd);
      el.removeEventListener('touchcancel', onCancel);
    };
  }, [go]);

  /* ── Helpers ─────────────────────────────────────────────── */
  const pageVisible = (i: number) =>
    i === current || Boolean(turn && (i === turn.page || i === turn.under));

  const turnClass = (i: number) => {
    if (!turn) return '';
    if (turn.page === i) return turn.direction === 'next' ? 'page-turn-next' : 'page-turn-prev';
    return '';
  };

  return (
    <div className="book-fullscreen">
      <div className="book-frame-fullscreen">

        {/* Puntos indicadores */}
        <div className="book-dots" aria-hidden="true">
          {Array.from({ length: totalPages }).map((_, i) => (
            <span key={i} className={`book-dot ${i === current ? 'book-dot-active' : ''}`} />
          ))}
        </div>

        {/* Stage — touch-action: pan-y permite scroll vertical nativo;
            nuestro JS intercepta el horizontal antes de que el browser actúe */}
        <div ref={stageRef} className="notebook-stage-fullscreen">
          <div className="notebook-spine" aria-hidden="true" />
          <div className="notebook-pages" aria-live="polite">

            {/* ── PORTADA ─────────────────────────────── */}
            <div
              className={`notebook-page page-cover
                ${pageVisible(0) ? 'page-visible' : 'page-hidden'}
                ${turnClass(0)}`}
              onAnimationEnd={turn?.page === 0 ? finishTurn : undefined}
            >
              <div className="relative flex h-full flex-col overflow-hidden bg-stone-950 text-white">
                <Image
                  src={asset(catalog.coverImage)}
                  alt=""
                  fill
                  sizes="100vw"
                  priority
                  className="absolute inset-0 object-cover"
                  style={{ opacity: 0.92 }}
                />
                {/* Gradiente solo abajo para legibilidad del texto */}
                <div
                  className="absolute inset-x-0 bottom-0 h-3/5"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}
                />
                <div className="relative z-10 flex h-full flex-col justify-end p-6 pb-8">
                  <Image
                    src={asset(catalog.logoImage)}
                    alt=""
                    width={120} height={120}
                    sizes="120px"
                    className="mb-auto h-16 w-16 object-contain drop-shadow-lg"
                  />
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-60">Menú Digital</p>
                  <h1 className="mt-1 font-serif text-3xl font-bold leading-tight drop-shadow">{catalog.name}</h1>
                  <p className="mt-1 text-sm text-orange-200 drop-shadow">{catalog.tagline}</p>
                  <div className="mt-6 flex items-center gap-1 text-xs opacity-50">
                    <span>Desliza para ver el menú</span>
                    <span className="animate-bounce-x ml-1">→</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── PÁGINAS DE CONTENIDO ─────────────────── */}
            {pages.map((section, si) => {
              const idx = si + 1;
              return (
                <div
                  key={section.name}
                  className={`notebook-page
                    ${pageVisible(idx) ? 'page-visible' : 'page-hidden'}
                    ${turnClass(idx)}`}
                  onAnimationEnd={turn?.page === idx ? finishTurn : undefined}
                >
                  {/* overflow-y-auto para scroll vertical dentro de la página */}
                  <div className="h-full overflow-y-auto overscroll-contain bg-orange-50 p-4 pb-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600">
                      {catalog.name}
                    </p>
                    <h2 className="mb-3 mt-1 font-serif text-xl font-bold text-stone-900">
                      {section.name}
                    </h2>
                    <div className="space-y-3">
                      {section.products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          catalogSlug={catalog.slug}
                          compact
                        />
                      ))}
                    </div>
                    <p className="mt-4 text-center text-[10px] text-stone-400 opacity-60">
                      ← desliza para cambiar página →
                    </p>
                  </div>
                </div>
              );
            })}

            {/* ── CONTRAPORTADA ────────────────────────── */}
            <div
              className={`notebook-page page-back
                ${pageVisible(lastPage) ? 'page-visible' : 'page-hidden'}
                ${turnClass(lastPage)}`}
              onAnimationEnd={turn?.page === lastPage ? finishTurn : undefined}
            >
              <div className="flex h-full flex-col items-center justify-center bg-stone-900 p-8 text-center text-white">
                <Image
                  src={asset(catalog.logoImage)}
                  alt=""
                  width={192} height={192}
                  sizes="192px"
                  className="h-20 w-20 object-contain"
                />
                <h2 className="mt-5 font-serif text-2xl">Gracias por visitarnos</h2>
                <p className="mt-3 text-sm text-stone-300">
                  Agrega tus favoritos al carrito y confirma por WhatsApp.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
