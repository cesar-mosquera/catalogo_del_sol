import type { Metadata } from 'next';
import { BASE_PATH } from '@/lib/base-path';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: 'Catálogos digitales',
  description: 'Catálogos digitales interactivos para negocios.',
  manifest: `${BASE_PATH}/manifest.json`,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}<ServiceWorkerRegister /></body></html>;
}

function ServiceWorkerRegister() {
  return <script dangerouslySetInnerHTML={{ __html: `if ('serviceWorker' in navigator) { navigator.serviceWorker.register('${BASE_PATH}/sw.js').catch(function () {}); }` }} />;
}
