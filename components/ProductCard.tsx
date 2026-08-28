'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Product, CardTheme } from '@/lib/catalog-types';
import { asset } from '@/lib/asset';
import { BASE_PATH } from '@/lib/base-path';
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
  };  return (
    <article className={`relative overflow-hidden rounded-2xl shadow-sm ring-1 flex ${compact ? 'flex-row min-h-[150px] h-auto items-center p-3 gap-3 bg-white/70 backdrop-blur-md ' + t.ring : 'flex-col h-full bg-white overflow-y-auto no-scrollbar ' + t.ring}`}>
      {/* Imagen */}
      {src ? (
        <div className={compact ? 'relative w-[110px] h-[110px] shrink-0' : 'w-full'}>
          {compact && (
            <>
              {/* Adorno dinámico de fondo */}
              <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-orange-300/40 to-yellow-100/60 blur-md pointer-events-none"></div>
              {/* Detalle tipo hoja/sol */}
              <svg className="absolute -bottom-3 -left-2 w-8 h-8 text-orange-400 rotate-[-15deg] opacity-70 pointer-events-none z-10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M11.644 1.59a.75.75 0 01.712 0l9.75 5.25a.75.75 0 010 1.32l-9.75 5.25a.75.75 0 01-.712 0l-9.75-5.25a.75.75 0 010-1.32l9.75-5.25z" />
                <path d="M3.265 10.602l7.668 4.129a2.25 2.25 0 002.134 0l7.668-4.13a.75.75 0 01.712 1.32l-7.668 4.13a3.75 3.75 0 01-3.556 0l-7.668-4.13a.75.75 0 01.712-1.32z" />
              </svg>
            </>
          )}
          <div className={`relative overflow-hidden w-full h-full ${compact ? 'rounded-xl border-[3px] border-white shadow-md rotate-[-2deg] transition-transform hover:rotate-0' : ''}`}>
            <Image
              src={src}
              alt={product.name}
              className={`w-full object-cover ${compact ? 'absolute inset-0 h-full' : 'h-auto max-h-56'}`}
              width={400}
              height={400}
              loading="lazy"
            />
          </div>
        </div>
      ) : (
        <div
          className={`grid shrink-0 place-items-center border-dashed ${compact ? 'w-[110px] h-[110px] rounded-xl border' : 'w-full h-40 border-b'} ${
            t.priceBox ? 'border-[#e9b873]' : 'border-stone-200'
          }`}
          style={{ background: 'linear-gradient(180deg,#ffffff 0%,#f3e5c8 100%)' }}
        >
          <div className="flex flex-col items-center gap-1 text-stone-400">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current opacity-60" aria-hidden="true">
              <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2v6.6l3-2.2 3 3 4-4L20 14V7H5Zm4.5 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
            </svg>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em]">Foto</p>
          </div>
        </div>
      )}

      <div className={`flex flex-1 flex-col min-h-0 ${compact ? 'py-1 justify-center h-full z-10' : 'p-4 gap-2'}`}>
        {/* Nombre y precio */}
        <div className={`flex ${compact ? 'flex-col items-start gap-0.5' : 'items-start justify-between gap-1'}`}>
          <h3 className={`font-bold leading-tight line-clamp-2 ${compact ? 'text-[13px] font-serif tracking-tight' : 'text-base'} ${t.name}`}>{product.name}</h3>
          
          {/* Descripción en móvil y desktop */}
          {product.description && (
            <p className={`${compact ? 'text-[10px] italic leading-tight text-stone-600 line-clamp-2 mb-1.5' : 'text-sm text-stone-600 leading-snug mb-2'}`}>
              {product.description}
            </p>
          )}

          <span className={`whitespace-nowrap font-bold ${compact ? 'w-fit' : ''} ${t.priceBox} ${t.price}`}>
            {product.variants && !selectedVariantId ? (
              <span className="text-[11px] text-stone-500">
                ${Math.min(...product.variants.map(v => v.price)).toFixed(2)} - ${Math.max(...product.variants.map(v => v.price)).toFixed(2)}
              </span>
            ) : (
              <span className={`${product.priceNote && !product.variants ? 'text-xs' : (compact ? 'text-[11px] px-1.5 py-0.5 rounded-md' : 'text-base')}`}>
                ${displayPrice.toFixed(2)}
              </span>
            )}
          </span>
        </div>

        {/* Variantes & Botón */}
        <div className="mt-auto flex flex-col gap-2">
          {product.variants && product.variants.length > 0 && (
            <div>
              <select
                value={selectedVariantId}
                onChange={(e) => {
                  setSelectedVariantId(e.target.value);
                  setError(false);
                }}
                className={`w-full rounded-lg border bg-stone-50 font-semibold outline-none focus:ring-1 transition-colors ${
                  compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'
                } ${
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
              {error && !compact && (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  ⚠ Elige una opción
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            {product.demoUrl && !compact && (
              <a
                href={`/menu${product.demoUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl bg-stone-100 px-3 py-2 text-center text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-200"
              >
                👀 Ver Demo
              </a>
            )}
            {quantity > 0 ? (
              <div className={`flex flex-1 items-center justify-between gap-1 ${compact ? 'rounded-lg px-1.5 py-1' : 'rounded-xl px-1.5 py-1'} text-white shadow-sm transition-colors duration-100 ${added ? 'bg-green-600' : t.accent}`}>
                <button onClick={handleRemove} className={`grid ${compact ? 'h-6 w-6 text-base rounded' : 'h-8 w-8 text-lg rounded-lg'} place-items-center font-bold transition-colors hover:bg-white/20 active:scale-90`}>−</button>
                <span className={`min-w-4 text-center font-black ${compact ? 'text-xs' : 'text-sm'}`}>{added ? '✓' : quantity}</span>
                <button onClick={handleAdd} className={`grid ${compact ? 'h-6 w-6 text-base rounded' : 'h-8 w-8 text-lg rounded-lg'} place-items-center font-bold transition-colors hover:bg-white/20 active:scale-90`}>+</button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className={`flex-1 font-bold transition-colors duration-100 ${compact ? 'rounded-lg px-2 py-1.5 text-xs' : 'rounded-xl px-3 py-2 text-sm'} ${added ? 'bg-green-600 text-white' : `${t.accent} ${t.accentHover} text-white`}`}
              >
                {added ? (compact ? 'Agregado ✓' : '¡Agregado!') : 'Agregar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
