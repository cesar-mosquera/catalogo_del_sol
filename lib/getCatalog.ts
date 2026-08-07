import { delSol } from '@/data/catalogs/del-sol';
import type { Catalog } from './catalog-types';

const catalogs: Record<string, Catalog> = { [delSol.slug]: delSol };

export function getCatalog(slug: string) { return catalogs[slug]; }
export function getCatalogSlugs() { return Object.keys(catalogs); }
export function getCatalogs() { return Object.values(catalogs); }
