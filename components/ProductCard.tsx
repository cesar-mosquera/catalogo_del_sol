'use client';

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
  const src = asset(product.image);
  const isData = src.startsWith('data:');

  return (
    <article className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-orange-100`}>
      {/* Imagen: next/image para rutas estáticas, <img> para base64 */}
      {isData ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={product.name}
          className={compact ? 'h-32 w-full object-cover' : 'h-40 w-full object-cover'}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={product.name}
          className={compact ? 'h-32 w-full object-cover' : 'h-40 w-full object-cover'}
        />
      )}
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
        <button
          onClick={() => add(catalogSlug, product)}
          className="mt-auto rounded-xl bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700"
        >
          Agregar al pedido
        </button>
      </div>
    </article>
  );
}
