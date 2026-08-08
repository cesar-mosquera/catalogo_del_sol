# Catálogos digitales — Pinchos y Chuletas Del Sol

Menú digital para restaurantes con carrito y pedido por WhatsApp. Exportado como sitio estático (Next.js `output: 'export'`).

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS
- Zustand (carrito persistido en `localStorage`, aislado por catálogo)
- PWA: `manifest.json` + service worker en `public/`

## Scripts

```bash
npm run dev      # desarrollo
npm run build    # build estático en out/
npm run lint     # ESLint (flat config)
```

## Estructura

- `data/catalogs/` — datos de los catálogos (productos, secciones, horarios).
- `lib/` — tipos y acceso a catálogos.
- `components/templates/` — plantillas `book` (giro 3D), `list` y `minimal`.
- `store/cart.ts` — carrito Zustand por catálogo.
- `public/img/` — imágenes (la raíz no debe tener copias).

## Deploy

Export estático compatible con Vercel (raíz `/`) y GitHub Pages (bajo `/catalogo_del_sol`). El prefijo lo controla la variable de entorno `NEXT_PUBLIC_BASE_PATH`:

- **Vercel:** no configures nada — la app se sirve en la raíz del dominio.
- **GitHub Pages:** configura `NEXT_PUBLIC_BASE_PATH=/catalogo_del_sol` en el build.
- `NEXT_PUBLIC_SITE_URL` (opcional): dominio canónico para las imágenes de OpenGraph (silencia el warning de `metadataBase`).

