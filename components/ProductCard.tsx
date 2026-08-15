'use client';

import { useState } from 'react';
import type { Product, CardTheme } from '@/lib/catalog-types';
import { asset } from '@/lib/asset';
import { useCart } from '@/store/cart';

const DEFAULT_THEME: CardTheme = {
  accent: 'bg-orange-600',
  accentHover: 'hover:bg-orange-700',
  ring: 'ring-orange-100',
  price: 'text-orange-700',
  priceBox: '',
  badgeBg: 'bg-amber-100',
  badgeText: 'text-amber-800',
  name: 'text-stone-900',
};

export function ProductCard({
  product,
  compact = false,
  catalogSlug,
  theme,
}: {
  product: Product;
  compact?: boolean;
  catalogSlug: string;
  theme?: CardTheme;
}) {
  const add = useCart((state) => state.add);
  const remove = useCart((state) => state.remove);

  // Si tiene variantes empieza vacío (obligatorio elegir); si no, usa el id del producto
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants ? '' : product.id);
  const quantity = useCart((s) => {
    const id = selectedVariantId || product.id;
    return s.carts[catalogSlug]?.find(i => i.id === id)?.quantity ?? 0;
  });

  const src = product.image ? asset(product.image) : '';
  const [added, setAdded] = useState(false);
  const [error, setError] = useState(false);

  const t = { ...DEFAULT_THEME, ...theme };

  const currentVariant = product.variants?.find(v => v.id === selectedVariantId);
  const displayPrice = currentVariant ? currentVariant.price : product.price;

  const handleAdd = () => {
    // Validación obligatoria: debe elegir variante antes de agregar
    if (product.variants && !selectedVariantId) {
      setError(true);
      setTimeout(() => setError(false), 2000);
      return;
    }
    setError(false);
    add(catalogSlug, { ...product, id: selectedVariantId });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleRemove = () => {
    setAdded(false);
    remove(catalogSlug, selectedVariantId || product.id);
  };

  return (
    <article className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ${t.ring} flex flex-col h-full`}>
      {/* Imagen */}
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={product.name}
          className={compact ? 'h-32 w-full object-cover' : 'h-40 w-full object-cover'}
        />
      ) : (
        <div
          className={`grid w-full place-items-center border-b border-dashed ${compact ? 'h-32' : 'h-40'} ${
            t.priceBox ? 'border-[#e9b873]' : 'border-stone-200'
          }`}
          style={{ background: 'linear-gradient(180deg,#ffffff 0%,#f3e5c8 100%)' }}
        >
          <div className="flex flex-col items-center gap-1 text-stone-400">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current opacity-60" aria-hidden="true">
              <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2v6.6l3-2.2 3 3 4-4L20 14V7H5Zm4.5 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
            </svg>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em]">Imagen del plato</p>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Nombre y precio */}
        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-bold ${t.name}`}>{product.name}</h3>
          <span className={`whitespace-nowrap font-bold ${t.priceBox} ${t.price}`}>
            {product.variants && !selectedVariantId ? (
              // Rango de precios visible antes de elegir opción
              <span className="text-sm text-stone-500">
                ${Math.min(...product.variants.map(v => v.price)).toFixed(2)}
                {' – '}
                ${Math.max(...product.variants.map(v => v.price)).toFixed(2)}
              </span>
            ) : (
              <span className={`${product.priceNote && !product.variants ? 'text-sm' : 'text-base'}`}>
                ${displayPrice.toFixed(2)}
              </span>
            )}
            {product.priceNote && !product.variants && (
              <span className="block text-right font-semibold leading-tight" style={{ fontSize: '9px' }}>
                {product.priceNote}
              </span>
            )}
          </span>
        </div>

        {/* Badge */}
        {product.badge && (
          <span className={`w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${t.badgeBg} ${t.badgeText}`}>
            {product.badge}
          </span>
        )}

        {/* Descripción */}
        <p className="text-sm text-stone-600">{product.description}</p>

        <div className="mt-auto flex flex-col gap-3">
          {/* Selector de variantes (Medio / Completo) — obligatorio */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <select
                value={selectedVariantId}
                onChange={(e) => {
                  setSelectedVariantId(e.target.value);
                  setError(false);
                }}
                className={`w-full rounded-lg border bg-stone-50 px-3 py-1.5 text-sm font-semibold outline-none focus:ring-1 transition-colors ${
                  error
                    ? 'border-red-500 ring-1 ring-red-500 text-red-700'
                    : 'border-stone-200 text-stone-700 focus:border-orange-500 focus:ring-orange-500'
                }`}
              >
                <option value="" disabled>Seleccionar opción...</option>
                {product.variants.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} — ${v.price.toFixed(2)}
                  </option>
                ))}
              </select>
              {error && (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  ⚠ Elige Medio o Completo antes de agregar
                </p>
              )}
            </div>
          )}

          {/* Botón demo / carrito */}
          <div className="flex items-center gap-2">
            {product.demoUrl && (
              <a
                href={product.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl bg-stone-100 px-3 py-2 text-center text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-200"
              >
                👀 Ver Demo
              </a>
            )}
            {quantity > 0 ? (
              <div className={`flex flex-1 items-center justify-between gap-1 rounded-xl px-1.5 py-1 text-white shadow-sm transition-colors duration-100 ${added ? 'bg-green-600' : t.accent}`}>
                <button
                  onClick={handleRemove}
                  aria-label="Restar"
                  className="grid h-8 w-8 place-items-center rounded-lg text-lg font-bold transition-colors hover:bg-white/20 active:scale-90"
                >
                  −
                </button>
                <span className="min-w-6 text-center text-sm font-black">{added ? '✓' : quantity}</span>
                <button
                  onClick={handleAdd}
                  aria-label="Sumar"
                  className="grid h-8 w-8 place-items-center rounded-lg text-lg font-bold transition-colors hover:bg-white/20 active:scale-90"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-colors duration-100 ${
                  added
                    ? 'bg-green-600 text-white'
                    : `${t.accent} ${t.accentHover} text-white`
                }`}
              >
                {added ? '✅ Agregado' : '🛒 Agregar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
