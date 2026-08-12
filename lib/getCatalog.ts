import { delSol } from '@/data/catalogs/del-sol';
import { servicios } from '@/data/catalogs/servicios';
import { demoLista } from '@/data/catalogs/demo-lista';
import { demoMinimal } from '@/data/catalogs/demo-minimal';
import type { Catalog } from './catalog-types';

const catalogs: Record<string, Catalog> = { 
  [delSol.slug]: delSol,
  [servicios.slug]: servicios,
  [demoLista.slug]: demoLista,
  [demoMinimal.slug]: demoMinimal
};

export function getCatalog(slug: string) { return catalogs[slug]; }
export function getCatalogSlugs() { return Object.keys(catalogs); }
export function getCatalogs() { return Object.values(catalogs); }
