'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import type { Catalog } from '@/lib/catalog-types';
import { asset } from '@/lib/asset';
import { ProductCard } from '@/components/ProductCard';

type Turn = { page: number; under: number; destination: number; direction: 'next' | 'prev' };

export function BookTemplate({ catalog }: { catalog: Catalog }) {
  const [current, setCurrent] = useState(0);
  const [turn, setTurn]       = useState<Turn | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Swipe tracking — guardamos el puntero capturado
  const startX   = useRef<number | null>(null);
  const startY   = useRef<number | null>(null);
  const ptrId    = useRef<number | null>(null);

  const pages    = useMemo(() => catalog.sections, [catalog.sections]);
  const lastPage = pages.length + 1;   // contraportada
  const totalPages = lastPage + 1;

  /* ── Lógica de navegación ────────────────────────────────── */
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

  /* ── Swipe con Pointer Capture ───────────────────────────── */
  // Capturamos el puntero en el stage para recibirlo aunque el dedo
  // se salga del elemento mientras desliza.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, a, input, textarea, select')) return;
    // Solo primer toque
    if (ptrId.current !== null) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    ptrId.current = e.pointerId;
    startX.current = e.clientX;
    startY.current = e.clientY;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (ptrId.current !== e.pointerId) return;
    ptrId.current = null;
    if (startX.current === null || startY.current === null) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    startX.current = null;
    startY.current = null;
    // Activa solo si el movimiento horizontal domina y supera 35px
    if (Math.abs(dx) > Math.abs(dy) * 1.2 && Math.abs(dx) > 35)
      go(dx < 0 ? 'next' : 'prev');
  };

  const onPointerCancel = () => {
    ptrId.current  = null;
    startX.current = null;
    startY.current = null;
  };

  /* ── Visibilidad de página ───────────────────────────────── */
  const pageVisible = (i: number) =>
    i === current || Boolean(turn && (i === turn.page || i === turn.under));

  /* ── Clase de animación ──────────────────────────────────── */
  const turnClass = (i: number) => {
    if (!turn) return '';
    if (turn.direction === 'next' && turn.page === i)  return 'page-turn-next';
    if (turn.direction === 'prev' && turn.page === i)  return 'page-turn-prev';
    return '';
  };

  return (
    <div className="book-fullscreen">
      <div className="book-frame-fullscreen">
        {/* Puntos indicadores — dentro del frame para que no rompan el layout */}
        <div className="book-dots" aria-hidden="true">
          {Array.from({ length: totalPages }).map((_, i) => (
            <span key={i} className={`book-dot ${i === current ? 'book-dot-active' : ''}`} />
          ))}
        </div>

        <div
          ref={stageRef}
          className="notebook-stage-fullscreen"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        >
          <div className="notebook-spine" aria-hidden="true" />
          <div className="notebook-pages" aria-live="polite">

            {/* ── PORTADA ─────────────────────────────────── */}
            <div
              className={`notebook-page page-cover
                ${pageVisible(0) ? 'page-visible' : 'page-hidden'}
                ${turnClass(0)}`}
              onAnimationEnd={turn?.page === 0 ? finishTurn : undefined}
            >
              <div className="relative flex h-full flex-col overflow-hidden bg-stone-950 text-white">
                {/* Foto de fondo — sin overlay oscuro para que se vea clara */}
                <Image
                  src={asset(catalog.coverImage)}
                  alt=""
                  fill
                  sizes="100vw"
                  priority
                  className="absolute inset-0 object-cover"
                  style={{ opacity: 0.92 }}
                />
                {/* Gradiente solo en la parte inferior para legibilidad del texto */}
                <div className="absolute inset-x-0 bottom-0 h-3/5"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 100%)' }}
                />
                {/* Contenido */}
                <div className="relative z-10 flex h-full flex-col justify-end p-6 pb-8">
                  <Image
                    src={asset(catalog.logoImage)}
                    alt=""
                    width={120} height={120}
                    sizes="120px"
                    className="mb-auto h-16 w-16 object-contain drop-shadow-lg"
                  />
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-70">Menú Digital</p>
                  <h1 className="mt-1 font-serif text-3xl font-bold leading-tight drop-shadow">{catalog.name}</h1>
                  <p className="mt-1 text-sm text-orange-200 drop-shadow">{catalog.tagline}</p>
                  <div className="mt-6 flex items-center gap-1 text-xs opacity-55">
                    <span>Desliza para ver el menú</span>
                    <span className="animate-bounce-x">→</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── PÁGINAS DE CONTENIDO ─────────────────────── */}
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
                  <div className="h-full overflow-y-auto overflow-x-hidden bg-orange-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600">
                      {catalog.name}
                    </p>
                    <h2 className="mb-3 mt-1 font-serif text-xl font-bold text-stone-900">
                      {section.name}
                    </h2>
                    <div className="space-y-3 pb-8">
                      {section.products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          catalogSlug={catalog.slug}
                          compact
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ── CONTRAPORTADA ────────────────────────────── */}
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
