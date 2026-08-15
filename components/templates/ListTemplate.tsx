import type { Catalog } from '@/lib/catalog-types';
import { asset } from '@/lib/asset';
import { ProductCard } from '@/components/ProductCard';
import { BusinessHeader } from '@/components/BusinessHeader';
import { computeIsOpen, formatBusinessHours } from '@/lib/delivery';

export function ListTemplate({ catalog }: { catalog: Catalog }) {
  const theme = catalog.theme;
  const isOpen = computeIsOpen(catalog);
  const hours = formatBusinessHours(catalog);
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

      {catalog.sections.map((section) => (
        <section key={section.name}>
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
    </main>
  );
}