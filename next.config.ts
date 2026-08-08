import type { NextConfig } from 'next';

// Vercel siempre publica este catálogo en la raíz del dominio. El prefijo
// solo se usa para GitHub Pages u otro hosting bajo una subcarpeta.
const basePath = process.env.VERCEL === '1' ? '' : process.env.NEXT_PUBLIC_BASE_PATH;

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
