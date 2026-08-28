import type { Metadata } from 'next';
import Script from 'next/script';
import { BASE_PATH } from '@/lib/base-path';
import ErrorBoundary from '@/components/ErrorBoundary';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: 'Catálogos Digitales | Menú digital con panel de administración',
  description: 'Creo catálogos digitales para restaurantes: carrito de pedidos, confirmación por WhatsApp, mapa de envío y panel de administración.',
  manifest: `${BASE_PATH}/manifest.json`,
  openGraph: {
    type: 'website',
    locale: 'es_EC',
    siteName: 'Catálogos Digitales',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('${BASE_PATH}/sw.js').catch(function () {});
          }
        `}</Script>
      </body>
    </html>
  );
}

