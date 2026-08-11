import { delSol } from '@/data/catalogs/del-sol';
import { servicios } from '@/data/catalogs/servicios';
import type { Catalog } from './catalog-types';

const catalogs: Record<string, Catalog> = { 
  [delSol.slug]: delSol,
  [servicios.slug]: servicios
};

export function getCatalog(slug: string) { return catalogs[slug]; }
export function getCatalogSlugs() { return Object.keys(catalogs); }
export function getCatalogs() { return Object.values(catalogs); }
