import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CatalogView } from '@/components/CatalogView';
import { asset } from '@/lib/asset';
import { getCatalog, getCatalogSlugs } from '@/lib/getCatalog';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return getCatalogSlugs().map((slug) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const catalog = getCatalog((await params).slug);
  if (!catalog) return {};
  return { title: `${catalog.name} | Menú digital`, description: catalog.description, openGraph: { title: catalog.name, description: catalog.tagline, images: [{ url: asset(catalog.coverImage), alt: catalog.name }] }, twitter: { card: 'summary_large_image', title: catalog.name, description: catalog.tagline, images: [asset(catalog.coverImage)] } };
}

export default async function MenuPage({ params }: Props) {
  const catalog = getCatalog((await params).slug);
  if (!catalog) notFound();
  return <CatalogView catalog={catalog} />;
}
