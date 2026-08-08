import type { NextConfig } from 'next';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH;
const isStaticExport = Boolean(basePath);

const nextConfig: NextConfig = {
  images: { unoptimized: isStaticExport },
  ...(isStaticExport
    ? { output: 'export' as const, basePath, assetPrefix: basePath }
    : {}),
};

export default nextConfig;
