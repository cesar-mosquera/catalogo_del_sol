import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CatalogView } from '@/components/CatalogView';
import { getCatalog } from '@/lib/getCatalog';
import { BASE_PATH } from '@/lib/base-path';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export async function generateMetadata(): Promise<Metadata> {
  const catalog = getCatalog('mis-servicios');
  if (!catalog) return {};
  
  // Construir URLs absolutas para imágenes
  const baseUrl = siteUrl || 'http://localhost:3000';
  
  // Usar imagen personalizada de SEO si existe, si no usar coverImage
  const seoImage = catalog.seo?.image || catalog.coverImage;
  const coverUrl = seoImage.startsWith('http') 
    ? seoImage 
    : `${baseUrl}${BASE_PATH}${seoImage}`;
  const logoUrl = catalog.logoImage.startsWith('http')
    ? catalog.logoImage
    : `${baseUrl}${BASE_PATH}${catalog.logoImage}`;
  
  // Usar título y descripción personalizados de SEO si existen
  const seoTitle = catalog.seo?.title || `${catalog.name} | Menú digital`;
  const seoDescription = catalog.seo?.description || catalog.description;
  
  return {
    title: seoTitle,
    description: seoDescription,
    openGraph: {
      title: catalog.seo?.title || catalog.name,
      description: catalog.seo?.description || catalog.tagline,
      images: [
        { url: coverUrl, alt: catalog.name, width: 1200, height: 630 },
        ...(catalog.logoImage ? [{ url: logoUrl, alt: `${catalog.name} logo`, width: 512, height: 512 }] : []),
      ],
      type: 'website',
      siteName: catalog.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: catalog.seo?.title || catalog.name,
      description: catalog.seo?.description || catalog.tagline,
      images: [coverUrl],
    },
    alternates: {
      canonical: `${baseUrl}${BASE_PATH}/`,
    },
  };
}

export default function HomePage() {
  const catalog = getCatalog('mis-servicios');
  if (!catalog) notFound();
  return <CatalogView catalog={catalog} />;
}