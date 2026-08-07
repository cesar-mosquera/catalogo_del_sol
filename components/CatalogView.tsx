import type { Catalog } from '@/lib/catalog-types';
import { Cart } from './Cart';
import { BookTemplate } from './templates/BookTemplate';
import { ListTemplate } from './templates/ListTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';

export function CatalogView({ catalog }: { catalog: Catalog }) {
  const content = catalog.template === 'book' ? <BookTemplate catalog={catalog} /> : catalog.template === 'list' ? <ListTemplate catalog={catalog} /> : <MinimalTemplate catalog={catalog} />;
  return <><header className="relative isolate overflow-hidden bg-stone-950 px-5 py-10 text-center text-white"><div className="absolute inset-0 -z-10 opacity-30" style={{ backgroundImage: `url(${catalog.coverImage})`, backgroundPosition: 'center', backgroundSize: 'cover' }} /><img src={catalog.logoImage} alt={`Logo de ${catalog.name}`} className="mx-auto h-20 w-20 object-contain" /><h1 className="mt-3 font-serif text-3xl font-bold">{catalog.name}</h1><p className="mt-2 text-orange-200">{catalog.tagline}</p></header>{content}<Cart catalog={catalog} /></>;
}
