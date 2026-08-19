'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Catalog, Product } from '@/lib/catalog-types';
import { asset } from '@/lib/asset';
import { ProductCard } from '@/components/ProductCard';
import { BusinessHeader } from '@/components/BusinessHeader';
import { computeIsOpen, formatBusinessHours } from '@/lib/delivery';

// Normaliza texto para buscar sin importar tildes/mayúsculas
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Filtros rápidos fijos
const QUICK_FILTERS = [
  { key: 'populares', label: '🔥 Más vendidos', type: 'badge',   value: 'Popular'  },
  { key: 'combos',    label: '🍱 Combos',       type: 'section', value: 'Combo'    },
  { key: 'bebidas',   label: '🥤 Bebidas',      type: 'section', value: 'Bebida'   },
  { key: 'mariscos',  label: '🦐 Mariscos',     type: 'badge',   value: 'Mariscos' },
];

const matchesFilter = (product: Product, sectionName: string, key: string): boolean => {
  if (key === 'todos') return true;
  const f = QUICK_FILTERS.find((q) => q.key === key);
  if (!f) return true;
  if (f.type === 'section') return sectionName.includes(f.value);
  return product.badge === f.value;
};

/* ══ Drawer lateral de categorías ══ */
function CategoryDrawer({
  sections,
  theme,
  open,
  onClose,
  onSelect,
}: {
  sections: { name: string; idx: number }[];
  theme: Catalog['theme'];
  open: boolean;
  onClose: () => void;
  onSelect: (idx: number) => void;
}) {
  // Bloquea scroll del body cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Overlay oscuro */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
        aria-hidden="true"
      />

      {/* Panel lateral */}
      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-[min(80vw,320px)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          backgroundColor: theme?.pageBg ?? '#ffffff',
        }}
        aria-label="Categorías del menú"
      >
        {/* Cabecera del drawer */}
        <div
          className="flex items-center justify-between px-5 py-4 shadow-sm"
          style={{ borderBottom: `2px solid ${theme?.headingSplash ?? '#e7e5e4'}` }}
        >
          <div className="flex items-center gap-2">
            <span
              className="grid h-8 w-8 place-items-center rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: theme?.heading ?? '#1c1917' }}
            >
              ☰
            </span>
            <span className="font-bold text-base" style={{ color: theme?.heading ?? '#1c1917' }}>
              Categorías
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
              style={{ backgroundColor: theme?.headingSplash ?? '#f97316' }}
            >
              {sections.length}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar categorías"
            className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-stone-100"
            style={{ color: theme?.pageText ?? '#57534e' }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Lista de categorías */}
        <nav className="flex-1 overflow-y-auto py-3">
          {sections.map((section, i) => (
            <button
              key={section.name}
              onClick={() => { onSelect(section.idx); onClose(); }}
              className="group flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-black/5 active:bg-black/10"
            >
              {/* Número de sección */}
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white transition-transform group-hover:scale-110"
                style={{ backgroundColor: theme?.heading ?? '#1c1917', opacity: 0.8 }}
              >
                {i + 1}
              </span>
              <span
                className="flex-1 text-sm font-semibold leading-snug"
                style={{ color: theme?.pageText ?? '#1c1917' }}
              >
                {section.name}
              </span>
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 opacity-30 transition-opacity group-hover:opacity-70" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ))}
        </nav>

        {/* Pie del drawer */}
        <div className="border-t px-5 py-4" style={{ borderColor: theme?.headingSplash ?? '#e7e5e4' }}>
          <p className="text-center text-[11px] font-semibold opacity-50" style={{ color: theme?.pageText ?? '#78716c' }}>
            Toca una sección para ir directo
          </p>
        </div>
      </aside>
    </>
  );
}

/* ══ Template principal ══ */
export function ListTemplate({ catalog }: { catalog: Catalog }) {
  const theme = catalog.theme;
  const isOpen = computeIsOpen(catalog);
  const hours = formatBusinessHours(catalog);

  const [query,    setQuery]    = useState('');
  const [filter,   setFilter]   = useState('todos');
  const [showTop,  setShowTop]  = useState(false);
  const [drawer,   setDrawer]   = useState(false);
  const filterScrollRef = useRef<HTMLDivElement>(null);

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
    // Offset del sticky header para que no tape el título
    const el = document.getElementById(`section-${idx}`);
    if (!el) return;
    const stickyH = document.getElementById('list-sticky-bar')?.offsetHeight ?? 0;
    const top = el.getBoundingClientRect().top + window.scrollY - stickyH - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Secciones para el drawer (todas, sin filtrar)
  const allSections = catalog.sections.map((s, idx) => ({ name: s.name, idx }));

  return (
    <main
      className="mx-auto max-w-4xl space-y-12 px-4 py-6"
      style={{ backgroundColor: theme?.pageBg, minHeight: '100vh', color: theme?.pageText }}
    >
      <BusinessHeader catalog={catalog} clean={!!catalog.theme} />

      {/* Banner negocio cerrado */}
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

      {/* Imagen informativa */}
      {catalog.infoImage && (
        <div className="overflow-hidden rounded-[2.2rem] shadow-2xl ring-1" style={{ backgroundColor: '#ffffff' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset(catalog.infoImage)} alt="Información" className="w-full object-contain" />
        </div>
      )}

      {/* ═══ BARRA STICKY COMPACTA ═══ */}
      {catalog.sections.length > 1 && (
        <div
          id="list-sticky-bar"
          className="sticky top-0 -mx-4 z-20 border-b px-4 py-3 shadow-sm"
          style={{
            backgroundColor: theme?.pageBg ?? '#fafaf9',
            borderColor: theme?.headingSplash ?? '#e7e5e4',
          }}
        >
          {/* Fila única: buscador + botón categorías */}
          <div className="flex items-center gap-2">
            {/* Buscador */}
            <div className="relative flex-1 min-w-0">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-40">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M10 2a8 8 0 1 0 4.9 14.3l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0 0 10 2Zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" />
                </svg>
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca tu plato…"
                className="w-full rounded-full border bg-white/80 py-2 pl-10 pr-8 text-sm outline-none focus:border-transparent focus:ring-2"
                style={{
                  borderColor: theme?.headingSplash ?? '#d6d3d1',
                  ['--tw-ring-color' as string]: theme?.headingSplash ?? '#f97316',
                }}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 grid h-5 w-5 place-items-center rounded-full bg-stone-200 text-stone-600 hover:bg-stone-300 text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {/* Botón abrir drawer de categorías */}
            <button
              onClick={() => setDrawer(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: theme?.heading ?? '#1c1917' }}
              aria-label="Ver categorías"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                <path d="M3 6h18v2H3V6Zm4 5h14v2H7v-2Zm4 5h10v2H11v-2Z" />
              </svg>
              <span className="hidden xs:inline">Categorías</span>
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black"
                style={{ backgroundColor: theme?.headingSplash ?? '#f97316' }}
              >
                {allSections.length}
              </span>
            </button>
          </div>

          {/* Filtros rápidos en fila scrollable */}
          <div ref={filterScrollRef} className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto pb-0.5">
            {[{ key: 'todos', label: '☰ Todo' }, ...QUICK_FILTERS].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold transition-colors ${
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

          {/* Contador de resultados al filtrar */}
          {isFiltering && (
            <p className="mt-1.5 text-[11px] font-semibold opacity-70">
              {totalShown} {totalShown === 1 ? 'resultado' : 'resultados'}
              {filter !== 'todos' && ` · ${QUICK_FILTERS.find((q) => q.key === filter)?.label ?? ''}`}
            </p>
          )}
        </div>
      )}

      {/* ═══ DRAWER LATERAL ═══ */}
      <CategoryDrawer
        sections={allSections}
        theme={theme}
        open={drawer}
        onClose={() => setDrawer(false)}
        onSelect={goTo}
      />

      {/* ═══ SECCIONES DE PRODUCTOS ═══ */}
      {sections.map((section) => (
        <section key={section.name} id={`section-${section.idx}`} className="scroll-mt-36">
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

      {/* Sin resultados */}
      {isFiltering && totalShown === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white/50 py-12 text-center text-sm text-stone-500">
          No encontramos platos que coincidan con tu búsqueda.
          <button onClick={() => { setQuery(''); setFilter('todos'); }} className="ml-2 font-bold underline">
            Ver todo el menú
          </button>
        </div>
      )}

      {/* Botón volver arriba */}
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