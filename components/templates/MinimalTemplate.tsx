import type { Catalog } from '@/lib/catalog-types';
import { ProductCard } from '@/components/ProductCard';

export function MinimalTemplate({ catalog }: { catalog: Catalog }) {
  return <main className="mx-auto max-w-3xl space-y-12 px-5 py-10">{catalog.sections.map((section) => <section key={section.name}><h2 className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-orange-700">{section.name}</h2><div className="space-y-3">{section.products.map((product) => <ProductCard compact key={product.id} product={product} catalogSlug={catalog.slug} />)}</div></section>)}</main>;
}
