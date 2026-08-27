'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Catalog } from '@/lib/catalog-types';
import { asset } from '@/lib/asset';
import { computeIsOpen, formatBusinessHours } from '@/lib/delivery';

export function BusinessHeader({ catalog, clean = false }: { catalog: Catalog; clean?: boolean }) {
  const [open, setOpen] = useState(() => computeIsOpen(catalog));

  // Actualiza el estado "abierto/cerrado" en vivo (cada minuto)
  useEffect(() => {
    const id = setInterval(() => setOpen(computeIsOpen(catalog)), 60_000);
    return () => clearInterval(id);
  }, [catalog]);

  const hours = formatBusinessHours(catalog);

  // Modo "solo imagen": muestra la portada completa, sin texto superpuesto
  if (clean) {
    return (
      <header className="overflow-hidden rounded-[2.2rem] shadow-2xl">
        {catalog.coverImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={asset(catalog.coverImage)} alt={catalog.name} className="block w-full h-auto" style={{ width: '100%', height: 'auto' }} />
        ) : (
          <div className="grid aspect-[3/4] w-full place-items-center bg-stone-900">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/40">{catalog.name}</span>
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="relative overflow-hidden rounded-[2.2rem] text-white shadow-2xl">
      {/* Fondo: portada con degradado oscuro */}
      {catalog.coverImage && <Image src={asset(catalog.coverImage)} alt="" fill priority className="object-cover" sizes="100vw" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/30" />

      <div className="relative flex flex-col items-center gap-4 px-5 py-10 text-center sm:py-12">
        {catalog.logoImage ? (
          <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white/95 shadow-xl ring-4 ring-white/30">
            <Image src={asset(catalog.logoImage)} alt={catalog.name} fill priority className="object-contain" sizes="80px" />
          </div>
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-dashed border-white/40 bg-white/10 shadow-xl">
            <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current text-white/50" aria-hidden="true">
              <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2v6.6l3-2.2 3 3 4-4L20 14V7H5Zm4.5 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
            </svg>
          </div>
        )}

        <div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{catalog.name}</h1>
          {catalog.tagline && (
            <p className="mt-1.5 font-semibold" style={{ color: catalog.theme?.coverTagline ?? '#fed7aa' }}>{catalog.tagline}</p>
          )}
        </div>

        {/* Estado y datos del negocio */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-black uppercase tracking-wider shadow-lg ${
            open ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
          }`}>
            <span className={`relative flex h-2 w-2 ${open ? '' : ''}`}>
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${open ? 'bg-white' : 'bg-white/60'} opacity-70`} />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            {open ? 'Abierto ahora' : 'Cerrado ahora'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold backdrop-blur-md">
            🕗 {hours}
          </span>
          {catalog.address && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold backdrop-blur-md">
              📍 {catalog.address}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {(catalog.deliveryBaseFee ?? 0) > 0 && (
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur-md">
              🛵 Envío desde ${(catalog.deliveryBaseFee ?? 0).toFixed(2)} + ${(catalog.deliveryRatePerKm ?? 0).toFixed(2)}/km
            </span>
          )}
          {catalog.minimumOrder > 0 && (
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur-md">
              🛒 Pedido mínimo ${catalog.minimumOrder.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
