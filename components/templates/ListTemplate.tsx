'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Catalog, Product } from '@/lib/catalog-types';
import { asset } from '@/lib/asset';
import { ProductCard } from '@/components/ProductCard';
import { BusinessHeader } from '@/components/BusinessHeader';
import { computeIsOpen, formatBusinessHours } from '@/lib/delivery';

// Normaliza texto para buscar sin importar tildes/mayúsculas
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Filtros rápidos fijos que siempre existen en el catálogo
const QUICK_FILTERS = [
  { key: 'populares', label: '🔥 Más vendidos', type: 'badge', value: 'Popular' },
  { key: 'combos',    label: '🍱 Combos',      type: 'section', value: 'Combo' },
  { key: 'bebidas',   label: '🥤 Bebidas',     type: 'section', value: 'Bebida' },
  { key: 'mariscos',  label: '🦐 Mariscos',    type: 'badge', value: 'Mariscos' },
];

const matchesFilter = (product: Product, sectionName: string, key: string): boolean => {
  if (key === 'todos') return true;
  const f = QUICK_FILTERS.find((q) => q.key === key);
  if (!f) return true;
  if (f.type === 'section') return sectionName.includes(f.value);
  return product.badge === f.value;
};

export function ListTemplate({ catalog }: { catalog: Catalog }) {
  const theme = catalog.theme;
  const isOpen = computeIsOpen(catalog);
  const hours = formatBusinessHours(catalog);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('todos');
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isFiltering = query.trim() !== '' || filter !== 'todos';
  const nq = norm(query.trim());

  const sections = useMemo(() => {
    if (!isFiltering) return catalog.sections.map((section, idx) => ({ ...section, idx }));
    return catalog.sections
      .map((section, idx) => ({
        ...section,
        idx,
        products: section.products.filter((product) => {
          if (!matchesFilter(product, section.name, filter)) return false;
          if (!nq) return true;
          const haystack = norm([
            product.name,
            product.description,
            product.badge ?? '',
            section.name,
            ...(product.variants?.map((v) => v.name) ?? []),
          ].join(' '));
          return haystack.includes(nq);
        }),
      }))
      .filter((section) => section.products.length > 0);
  }, [catalog.sections, isFiltering, filter, nq]);

  const totalShown = sections.reduce((n, s) => n + s.products.length, 0);

  const goTo = (idx: number) => {
    document.getElementById(`section-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <main
      className="mx-auto max-w-4xl space-y-12 px-4 py-6"
      style={{ backgroundColor: theme?.pageBg, minHeight: '100vh', color: theme?.pageText }}
    >
      <BusinessHeader catalog={catalog} clean={!!catalog.theme} />

      {/* Banner de negocio cerrado — visible antes de que el cliente elija platos */}
      {!isOpen && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
          <span className="text-lg">🔴</span>
          <div>
            <p className="font-bold text-amber-900">Estamos cerrados ahora</p>
            <p className="text-amber-700 mt-0.5">
              Horario: {hours}. Puedes hacer tu pedido con anticipación y lo confirmamos al abrir.
            </p>
          </div>
        </div>
      )}

      {/* Página informativa: imagen que sigue a la portada */}
      {catalog.infoImage && (
        <div className="overflow-hidden rounded-[2.2rem] shadow-2xl ring-1" style={{ backgroundColor: '#ffffff' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset(catalog.infoImage)} alt="Información" className="w-full object-contain" />
        </div>
      )}

      {/* ═══ BARRA STICKY: buscador + filtros + índice ═══ */}
      {catalog.sections.length > 1 && (
        <div
          className="sticky top-0 -mx-4 z-20 border-b px-4 py-3 shadow-sm"
          style={{
            backgroundColor: theme?.pageBg ?? '#fafaf9',
            borderColor: theme?.headingSplash ?? '#e7e5e4',
          }}
        >
          {/* Buscador */}
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-50">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M10 2a8 8 0 1 0 4.9 14.3l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0 0 10 2Zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" />
              </svg>
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca tu plato…"
              className="w-full rounded-full border bg-white/80 py-2.5 pl-12 pr-10 text-sm outline-none focus:border-transparent focus:ring-2"
              style={{ borderColor: theme?.headingSplash ?? '#d6d3d1', ['--tw-ring-color' as string]: theme?.headingSplash ?? '#f97316' }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 -translate-y-1/2 grid h-6 w-6 place-items-center rounded-full bg-stone-200 text-stone-600 hover:bg-stone-300"
              >
                ×
              </button>
            )}
          </div>

          {/* Filtros rápidos */}
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
            {[
              { key: 'todos', label: '☰ Todo el menú' },
              ...QUICK_FILTERS,
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  filter === f.key
                    ? 'text-white shadow'
                    : 'bg-white/70 text-stone-700 ring-1 ring-stone-300 hover:bg-white'
                }`}
                style={filter === f.key ? { backgroundColor: theme?.heading ?? '#1c1917' } : undefined}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Índice de categorías */}
          {catalog.sections.length > 1 && (
            <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
              {catalog.sections.map((section, idx) => (
                <button
                  key={section.name}
                  onClick={() => goTo(idx)}
                  className="whitespace-nowrap rounded-full bg-white/60 px-3 py-1 text-[11px] font-semibold ring-1 ring-stone-300 hover:bg-white"
                  style={{ color: theme?.heading ?? '#44403c' }}
                >
                  {section.name}
                </button>
              ))}
            </div>
          )}

          {isFiltering && (
            <p className="mt-2 text-xs font-semibold opacity-80">
              {totalShown} {totalShown === 1 ? 'resultado' : 'resultados'}
              {filter !== 'todos' && ` · ${QUICK_FILTERS.find((q) => q.key === filter)?.label ?? ''}`}
            </p>
          )}
        </div>
      )}

      {sections.map((section) => (
        <section key={section.name} id={`section-${section.idx}`} className="scroll-mt-40">
          <div className="relative mb-4 w-fit">
            {theme && (
              <span
                className="absolute -inset-x-2 -inset-y-1 -rotate-2 rounded-lg"
                style={{ backgroundColor: theme.headingSplash }}
                aria-hidden="true"
              />
            )}
            <h2 className="relative font-serif text-3xl font-bold" style={{ color: theme?.heading ?? '#1c1917' }}>
              {section.name}
            </h2>
          </div>
          {section.note && (
            <p className="-mt-2 mb-4 text-sm italic opacity-70" style={{ color: theme?.pageText ?? '#57534e' }}>
              {section.note}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {section.products.map((product) => (
              <ProductCard key={product.id} product={product} catalogSlug={catalog.slug} theme={catalog.theme?.card} />
            ))}
          </div>
        </section>
      ))}

      {isFiltering && totalShown === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white/50 py-12 text-center text-sm text-stone-500">
          No encontramos platos que coincidan con tu búsqueda.
          <button onClick={() => { setQuery(''); setFilter('todos'); }} className="ml-2 font-bold underline">
            Ver todo el menú
          </button>
        </div>
      )}

      {/* ═══ BOTÓN VOLVER ARRIBA ═══ */}
      {showTop && (
        <button
          onClick={scrollTop}
          aria-label="Volver arriba"
          className="fixed bottom-24 left-6 z-20 grid h-12 w-12 place-items-center rounded-full bg-stone-900 text-white shadow-2xl ring-4 ring-white/20 transition-transform hover:scale-110 dark:bg-orange-600"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
            <path d="M12 4l8 8-1.4 1.4L13 8.8V21h-2V8.8L5.4 13.4 4 12l8-8Z" />
          </svg>
        </button>
      )}
    </main>
  );
}