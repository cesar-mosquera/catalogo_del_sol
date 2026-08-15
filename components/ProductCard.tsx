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
  const quantity = useCart((s) => s.carts[catalogSlug]?.find(i => i.id === product.id)?.quantity ?? 0);
  const src = product.image ? asset(product.image) : '';
  const [added, setAdded] = useState(false);

  const t = { ...DEFAULT_THEME, ...theme };

  const handleAdd = () => {
    add(catalogSlug, product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200); // 1.2s de feedback
  };

  return (
    <article className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ${t.ring}`}>
      {/* Imagen: next/image se usaría para optimizar rutas estáticas si tuvieran un loader configurado */}
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={product.name}
          className={compact ? 'h-32 w-full object-cover' : 'h-40 w-full object-cover'}
        />
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-bold ${t.name}`}>{product.name}</h3>
          <span className={`whitespace-nowrap font-bold ${t.priceBox} ${t.price}`}>
            <span className={`${product.priceNote ? 'text-sm' : 'text-base'}`}>${product.price.toFixed(2)}</span>
            {product.priceNote && (
              <span className="block text-right font-semibold leading-tight" style={{ fontSize: '9px' }}>
                {product.priceNote}
              </span>
            )}
          </span>
        </div>
        {product.badge && (
          <span className={`w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${t.badgeBg} ${t.badgeText}`}>
            {product.badge}
          </span>
        )}
        <p className="text-sm text-stone-600">{product.description}</p>
        <div className="mt-auto flex items-center gap-2">
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
            <div className={`flex flex-1 items-center justify-between gap-1 rounded-xl px-1.5 py-1 text-white shadow-sm ${t.accent}`}>
              <button
                onClick={() => remove(catalogSlug, product.id)}
                aria-label="Restar"
                className="grid h-8 w-8 place-items-center rounded-lg text-lg font-bold transition-colors hover:bg-white/20 active:scale-90"
              >
                −
              </button>
              <span className="min-w-6 text-center text-sm font-black">{quantity}</span>
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
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
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
    </article>
  );
}
