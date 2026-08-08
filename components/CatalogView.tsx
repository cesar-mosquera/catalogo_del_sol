import type { Catalog } from '@/lib/catalog-types';
import Image from 'next/image';
import { asset } from '@/lib/asset';
import { Cart } from './Cart';
import { BookTemplate } from './templates/BookTemplate';
import { ListTemplate } from './templates/ListTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';

export function CatalogView({ catalog }: { catalog: Catalog }) {
  const content = catalog.template === 'book' ? <BookTemplate catalog={catalog} /> : catalog.template === 'list' ? <ListTemplate catalog={catalog} /> : <MinimalTemplate catalog={catalog} />;
  return <><header className="relative isolate overflow-hidden bg-stone-950 px-5 py-10 text-center text-white"><Image src={asset(catalog.coverImage)} alt="" fill sizes="100vw" priority className="absolute inset-0 -z-10 object-cover opacity-30" /><Image src={asset(catalog.logoImage)} alt={`Logo de ${catalog.name}`} width={160} height={160} sizes="160px" className="mx-auto h-20 w-20 object-contain" /><h1 className="mt-3 font-serif text-3xl font-bold">{catalog.name}</h1><p className="mt-2 text-orange-200">{catalog.tagline}</p></header>{content}<Cart catalog={catalog} /></>;
}
