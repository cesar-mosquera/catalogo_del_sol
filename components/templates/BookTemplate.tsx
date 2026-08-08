'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import type { Catalog } from '@/lib/catalog-types';
import { asset } from '@/lib/asset';
import { ProductCard } from '@/components/ProductCard';

type Turn = { page: number; under: number; destination: number; direction: 'next' | 'prev' };

export function BookTemplate({ catalog }: { catalog: Catalog }) {
  const [current, setCurrent] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const pages = useMemo(() => catalog.sections, [catalog.sections]);
  const lastPage = pages.length + 1;

  const go = useCallback((direction: 'next' | 'prev') => {
    if (turn) return;
    if (direction === 'next' && current < lastPage)
      setTurn({ page: current, under: current + 1, destination: current + 1, direction });
    if (direction === 'prev' && current > 0)
      setTurn({ page: current - 1, under: current, destination: current - 1, direction });
  }, [current, lastPage, turn]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go('next');
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go('prev');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const finishTurn = () => {
    if (!turn) return;
    setCurrent(turn.destination);
    setTurn(null);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, a, input, textarea')) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startX.current === null || startY.current === null) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    startX.current = null;
    startY.current = null;
    // Solo activa si el deslizamiento horizontal domina al vertical
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) go(dx < 0 ? 'next' : 'prev');
  };

  const pageVisible = (index: number) =>
    index === current || Boolean(turn && (index === turn.page || index === turn.under));

  // Indicador de página (puntos)
  const totalPages = lastPage + 1;

  return (
    <div className="book-fullscreen">
      <div className="book-frame-fullscreen">
        <div
          className="notebook-stage-fullscreen"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => { startX.current = null; startY.current = null; }}
        >
          <div className="notebook-spine" aria-hidden="true" />
          <div className="notebook-pages" aria-live="polite">

            {/* Portada */}
            <div
              className={`notebook-page page-cover ${pageVisible(0) ? 'page-visible' : 'page-hidden'} ${turn?.page === 0 ? 'page-turn-next' : ''}`}
              onAnimationEnd={turn?.page === 0 ? finishTurn : undefined}
            >
              <div className="relative flex h-full flex-col justify-end overflow-hidden bg-stone-950 p-8 text-white">
                <Image src={asset(catalog.coverImage)} alt="" fill sizes="100vw" priority className="absolute inset-0 object-cover" />
                <div className="absolute inset-0 bg-black/55" />
                <div className="relative z-10 flex h-full flex-col justify-end">
                  <Image src={asset(catalog.logoImage)} alt="" width={160} height={160} sizes="160px" className="mb-auto h-20 w-20 object-contain" />
                  <p className="text-xs font-bold tracking-[0.2em] opacity-70">MENÚ DIGITAL</p>
                  <h1 className="mt-2 font-serif text-4xl font-bold leading-tight">{catalog.name}</h1>
                  <p className="mt-2 text-orange-200">{catalog.tagline}</p>
                  {/* Indicador de swipe */}
                  <div className="mt-10 flex items-center gap-2 opacity-60">
                    <span className="text-sm">Desliza para ver el menú</span>
                    <span className="animate-bounce-x">→</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Páginas de contenido */}
            {pages.map((section, sectionIndex) => {
              const index = sectionIndex + 1;
              const isTurning = turn?.page === index;
              return (
                <div
                  className={`notebook-page ${pageVisible(index) ? 'page-visible' : 'page-hidden'} ${isTurning ? `page-turn-${turn?.direction}` : ''}`}
                  key={section.name}
                  onAnimationEnd={isTurning ? finishTurn : undefined}
                >
                  <div className="h-full overflow-auto bg-orange-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">{catalog.name}</p>
                    <h2 className="mb-4 mt-1 font-serif text-2xl font-bold">{section.name}</h2>
                    <div className="space-y-3 pb-6">
                      {section.products.map((product) => (
                        <ProductCard key={product.id} product={product} catalogSlug={catalog.slug} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Contraportada */}
            <div
              className={`notebook-page page-back ${pageVisible(lastPage) ? 'page-visible' : 'page-hidden'} ${turn?.page === lastPage ? 'page-turn-next' : ''}`}
              onAnimationEnd={turn?.page === lastPage ? finishTurn : undefined}
            >
              <div className="flex h-full flex-col items-center justify-center bg-stone-900 p-8 text-center text-white">
                <Image src={asset(catalog.logoImage)} alt="" width={192} height={192} sizes="192px" className="h-24 w-24 object-contain" />
                <h2 className="mt-5 font-serif text-3xl">Gracias por visitarnos</h2>
                <p className="mt-3 text-stone-300">Agrega tus favoritos al carrito y confirma por WhatsApp.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Indicador de puntos */}
      <div className="book-dots" aria-hidden="true">
        {Array.from({ length: totalPages }).map((_, i) => (
          <span key={i} className={`book-dot ${i === current ? 'book-dot-active' : ''}`} />
        ))}
      </div>
    </div>
  );
}
