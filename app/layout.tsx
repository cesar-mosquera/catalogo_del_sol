import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://cesar-mosquera.github.io/catalogo_del_sol'),
  title: 'Catálogos digitales',
  description: 'Catálogos digitales interactivos para negocios.',
  manifest: '/catalogo_del_sol/manifest.json',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}<ServiceWorkerRegister /></body></html>;
}

function ServiceWorkerRegister() {
  return <script dangerouslySetInnerHTML={{ __html: `if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/catalogo_del_sol/sw.js').catch(function () {}); }` }} />;
}
