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
  const pages = useMemo(() => catalog.sections, [catalog.sections]);
  const lastPage = pages.length + 1;

  const go = useCallback((direction: 'next' | 'prev') => {
    if (turn) return;
    if (direction === 'next' && current < lastPage) setTurn({ page: current, under: current + 1, destination: current + 1, direction });
    if (direction === 'prev' && current > 0) setTurn({ page: current - 1, under: current, destination: current - 1, direction });
  }, [current, lastPage, turn]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') go('next');
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') go('prev');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const finishTurn = () => {
    if (!turn) return;
    setCurrent(turn.destination);
    setTurn(null);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button, a, input, textarea')) return;
    startX.current = event.clientX;
  };
  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (startX.current === null) return;
    const distance = event.clientX - startX.current;
    startX.current = null;
    if (Math.abs(distance) > 65) go(distance < 0 ? 'next' : 'prev');
  };

  const pageVisible = (index: number) => index === current || Boolean(turn && (index === turn.page || index === turn.under));

  return <div className="mx-auto max-w-5xl px-4 pb-16">
    <div className="hidden justify-center md:flex">
      <div className="book-frame">
        <div className="notebook-stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { startX.current = null; }}>
          <div className="notebook-spine" aria-hidden="true" />
          <div className="notebook-pages" aria-live="polite">
            <div className={`notebook-page page-cover ${pageVisible(0) ? 'page-visible' : 'page-hidden'} ${turn?.page === 0 ? 'page-turn-next' : ''}`} onAnimationEnd={turn?.page === 0 ? finishTurn : undefined}>
              <div className="relative flex h-full flex-col justify-end overflow-hidden bg-stone-950 p-10 text-white">
                <Image src={asset(catalog.coverImage)} alt="" fill sizes="460px" priority className="absolute inset-0 object-cover" /><div className="absolute inset-0 bg-black/50" /><div className="relative z-10 flex h-full flex-col justify-end"><Image src={asset(catalog.logoImage)} alt="" width={160} height={160} sizes="160px" className="mb-auto h-20 w-20 object-contain" /><p className="text-sm font-bold tracking-[0.25em]">MENÚ DIGITAL</p><h1 className="mt-2 font-serif text-4xl font-bold">{catalog.name}</h1><p className="mt-3 text-orange-200">{catalog.tagline}</p><p className="mt-10 text-sm">Desliza para ver el menú →</p></div>
              </div>
            </div>
            {pages.map((section, sectionIndex) => {
              const index = sectionIndex + 1;
              const isTurning = turn?.page === index;
              return <div className={`notebook-page ${pageVisible(index) ? 'page-visible' : 'page-hidden'} ${isTurning ? `page-turn-${turn?.direction}` : ''}`} key={section.name} onAnimationEnd={isTurning ? finishTurn : undefined}>
                <div className="h-full overflow-auto bg-orange-50 p-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">{catalog.name}</p><h2 className="mb-5 mt-2 font-serif text-3xl font-bold">{section.name}</h2><div className="space-y-4">{section.products.map((product) => <ProductCard key={product.id} product={product} catalogSlug={catalog.slug} />)}</div></div>
              </div>;
            })}
            <div className={`notebook-page page-back ${pageVisible(lastPage) ? 'page-visible' : 'page-hidden'} ${turn?.page === lastPage ? 'page-turn-next' : ''}`} onAnimationEnd={turn?.page === lastPage ? finishTurn : undefined}>
              <div className="flex h-full flex-col items-center justify-center bg-stone-900 p-8 text-center text-white"><Image src={asset(catalog.logoImage)} alt="" width={192} height={192} sizes="192px" className="h-24 w-24 object-contain" /><h2 className="mt-5 font-serif text-3xl">Gracias por visitarnos</h2><p className="mt-4 text-stone-300">Agrega tus favoritos al carrito y confirma por WhatsApp.</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="mt-4 flex items-center justify-center gap-4 md:hidden"><button disabled={current === 0 || Boolean(turn)} onClick={() => go('prev')} className="rounded-lg bg-stone-900 px-3 py-2 text-white disabled:opacity-40">←</button><span className="text-sm text-stone-600">Página {current + 1} de {lastPage + 1}</span><button disabled={current === lastPage || Boolean(turn)} onClick={() => go('next')} className="rounded-lg bg-stone-900 px-3 py-2 text-white disabled:opacity-40">→</button></div>
    <div className="mt-4 hidden items-center justify-center gap-4 md:flex"><button disabled={current === 0 || Boolean(turn)} onClick={() => go('prev')} className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">← Anterior</button><span className="text-sm text-stone-600">Página {current + 1} de {lastPage + 1}</span><button disabled={current === lastPage || Boolean(turn)} onClick={() => go('next')} className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Siguiente →</button></div>
    <div className="mt-7 space-y-7 md:hidden">{pages.map((section) => <section key={section.name}><h2 className="mb-3 font-serif text-2xl font-bold">{section.name}</h2><div className="space-y-3">{section.products.map((product) => <ProductCard product={product} key={product.id} catalogSlug={catalog.slug} />)}</div></section>)}</div>
  </div>;
}
