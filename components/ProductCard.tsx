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
  alternate = false,
}: {
  product: Product;
  compact?: boolean;
  catalogSlug: string;
  theme?: CardTheme;
  alternate?: boolean;
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
    <article className={`relative overflow-hidden rounded-2xl shadow-sm ring-1 flex ${compact ? (alternate ? 'flex-row-reverse' : 'flex-row') + ' h-full items-stretch p-1.5 gap-2 bg-white/80 backdrop-blur-md' : 'flex-col h-full bg-white overflow-y-auto no-scrollbar'} ${t.ring}`}>
      {/* Imagen */}
      {src ? (
        <div className={compact ? 'relative w-[90px] shrink-0 self-center' : 'w-full shrink-0'}>
          <div className={`relative overflow-hidden w-full h-full ${compact ? `rounded-lg shadow-md border-2 border-white ${alternate ? 'rotate-[1.5deg]' : 'rotate-[-1.5deg]'} bg-white transition-transform hover:rotate-0` : 'aspect-[4/3] rounded-t-xl'}`}>
            {compact && (
              <>
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-orange-300/30 to-yellow-100/50 blur-sm pointer-events-none"></div>
              </>
            )}
            <Image
              src={src}
              alt={product.name}
              className={`object-cover ${compact ? 'absolute inset-0 h-full w-full' : 'w-full h-auto max-h-56'}`}
              width={400}
              height={400}
              loading="lazy"
            />
          </div>
        </div>
      ) : (
        <div
          className={`grid shrink-0 place-items-center border-dashed ${compact ? 'w-[90px] h-[90px] self-center rounded-lg border-2 border-white' : 'w-full h-40 border-b'} ${
            t.priceBox ? 'border-[#e9b873]' : 'border-stone-200'
          }`}
          style={{ background: 'linear-gradient(180deg,#ffffff 0%,#f3e5c8 100%)' }}
        >
          <div className="flex flex-col items-center gap-0.5 text-stone-400">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current opacity-60" aria-hidden="true">
              <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2v6.6l3-2.2 3 3 4-4L20 14V7H5Zm4.5 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
            </svg>
            <p className="text-[7px] font-bold uppercase tracking-[0.2em]">Foto</p>
          </div>
        </div>
      )}

      {/* Info */}
      <div className={`flex flex-1 flex-col min-h-0 min-w-0 ${compact ? 'py-0.5 justify-center' : 'p-4 gap-2'}`}>
        <div className={`flex ${compact ? 'flex-col items-start gap-0' : 'items-start justify-between gap-1'}`}>
          <h3 className={`font-bold leading-tight ${compact ? 'text-[11px] font-serif line-clamp-2' : 'text-base line-clamp-2'} ${t.name}`}>
            {product.name}
          </h3>
          
          <span className={`whitespace-nowrap font-bold shrink-0 ${compact ? 'mt-0.5' : ''} ${t.priceBox} ${t.price}`}>
            {product.variants && !selectedVariantId ? (
              <span className="text-[10px] text-stone-500">
                ${Math.min(...product.variants.map(v => v.price)).toFixed(2)} - ${Math.max(...product.variants.map(v => v.price)).toFixed(2)}
              </span>
            ) : (
              <span className={`${product.priceNote && !product.variants ? 'text-xs' : (compact ? 'text-xs' : 'text-base')}`}>
                ${displayPrice.toFixed(2)}
              </span>
            )}
          </span>
        </div>

        {product.description && (
          <p className={`text-stone-600 leading-snug flex-1 ${compact ? 'text-[10px] mt-1 line-clamp-3 italic opacity-90' : 'text-sm mb-2 line-clamp-2'}`}>
            {product.description}
          </p>
        )}

        {/* Variantes & Botón */}
        <div className={`mt-auto flex flex-col gap-1`}>
          {product.variants && product.variants.length > 0 && (
            <div>
              <select
                value={selectedVariantId}
                onChange={(e) => {
                  setSelectedVariantId(e.target.value);
                  setError(false);
                }}
                className={`w-full rounded-md border bg-stone-50 font-semibold outline-none focus:ring-1 transition-colors ${
                  compact ? 'px-1 py-0.5 text-[9px] truncate' : 'px-3 py-1.5 text-sm'
                } ${
                  error
                    ? 'border-red-500 ring-1 ring-red-500 text-red-700'
                    : 'border-stone-200 text-stone-700 focus:border-orange-500 focus:ring-orange-500'
                }`}
              >
                <option value="" disabled>Opción...</option>
                {product.variants.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} - ${v.price.toFixed(2)}
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

          <div className={`flex items-center gap-1`}>
            {!compact && product.demoUrl && (
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
              <div className={`flex-1 flex items-center justify-between rounded-md px-1 py-0.5 text-white shadow-sm transition-colors duration-100 ${added ? 'bg-green-600' : t.accent}`}>
                <button onClick={handleRemove} className={`grid ${compact ? 'h-5 w-5 text-xs' : 'h-8 w-8 text-lg'} rounded place-items-center font-bold transition-colors hover:bg-white/20 active:scale-90`}>−</button>
                <span className={`text-center font-black ${compact ? 'text-[10px]' : 'text-sm'}`}>{added ? '✓' : quantity}</span>
                <button onClick={handleAdd} className={`grid ${compact ? 'h-5 w-5 text-xs' : 'h-8 w-8 text-lg'} rounded place-items-center font-bold transition-colors hover:bg-white/20 active:scale-90`}>+</button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className={`flex-1 font-bold rounded-md transition-colors duration-100 whitespace-nowrap ${compact ? 'py-0.5 text-[10px]' : 'px-3 py-2 text-sm'} ${added ? 'bg-green-600 text-white shadow-sm' : `${t.accent} ${t.accentHover} text-white shadow-sm`}`}
              >
                {added ? (compact ? '✓' : '✓ ¡Agregado!') : '+ Agregar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
