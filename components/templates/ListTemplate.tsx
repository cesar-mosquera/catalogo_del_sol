import type { Catalog } from '@/lib/catalog-types';
import { ProductCard } from '@/components/ProductCard';
import { BusinessHeader } from '@/components/BusinessHeader';

export function ListTemplate({ catalog }: { catalog: Catalog }) {
  return (
    <main className="mx-auto max-w-4xl space-y-10 px-4 py-6">
      <BusinessHeader catalog={catalog} />
      {catalog.sections.map((section) => (
        <section key={section.name}>
          <h2 className="mb-4 border-b-2 border-orange-300 pb-2 font-serif text-3xl font-bold">{section.name}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {section.products.map((product) => <ProductCard key={product.id} product={product} catalogSlug={catalog.slug} />)}
          </div>
        </section>
      ))}
    </main>
  );
}
