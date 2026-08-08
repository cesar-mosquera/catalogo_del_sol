'use client';

import type { Catalog } from '@/lib/catalog-types';
import { useMergedCatalog } from '@/lib/use-merged-catalog';
import { Cart } from './Cart';
import { BookTemplate } from './templates/BookTemplate';
import { ListTemplate } from './templates/ListTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';

export function CatalogView({ catalog }: { catalog: Catalog }) {
  // Fusiona datos estáticos con lo que el admin guardó en localStorage
  const merged = useMergedCatalog(catalog);

  const content = merged.template === 'book'
    ? <BookTemplate catalog={merged} />
    : merged.template === 'list'
    ? <ListTemplate catalog={merged} />
    : <MinimalTemplate catalog={merged} />;

  return <>{content}<Cart catalog={merged} /></>;
}
