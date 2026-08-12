'use client';

import { useState } from 'react';
import type { Product } from '@/lib/catalog-types';
import { asset } from '@/lib/asset';
import { useCart } from '@/store/cart';

export function ProductCard({
  product,
  compact = false,
  catalogSlug,
}: {
  product: Product;
  compact?: boolean;
  catalogSlug: string;
}) {
  const add = useCart((state) => state.add);
  const remove = useCart((state) => state.remove);
  const quantity = useCart((s) => s.carts[catalogSlug]?.find(i => i.id === product.id)?.quantity ?? 0);
  const src = asset(product.image);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    add(catalogSlug, product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200); // 1.2s de feedback
  };

  return (
    <article className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-orange-100`}>
      {/* Imagen: next/image se usaría para optimizar rutas estáticas si tuvieran un loader configurado */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={product.name}
        className={compact ? 'h-32 w-full object-cover' : 'h-40 w-full object-cover'}
      />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-stone-900">{product.name}</h3>
          <span className="font-bold text-orange-700 whitespace-nowrap">${product.price.toFixed(2)}</span>
        </div>
        {product.badge && (
          <span className="w-fit rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
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
            <div className="flex flex-1 items-center justify-between gap-1 rounded-xl bg-orange-600 px-1.5 py-1 text-white shadow-sm">
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
                  : 'bg-orange-600 text-white hover:bg-orange-700'
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
