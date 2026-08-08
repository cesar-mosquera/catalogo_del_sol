import type { Catalog } from '@/lib/catalog-types';
import { Cart } from './Cart';
import { BookTemplate } from './templates/BookTemplate';
import { ListTemplate } from './templates/ListTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';

export function CatalogView({ catalog }: { catalog: Catalog }) {
  const content = catalog.template === 'book'
    ? <BookTemplate catalog={catalog} />
    : catalog.template === 'list'
    ? <ListTemplate catalog={catalog} />
    : <MinimalTemplate catalog={catalog} />;
  return <>{content}<Cart catalog={catalog} /></>;
}
