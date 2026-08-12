'use client';

import { useState } from 'react';
import type { Catalog, Product } from '@/lib/catalog-types';
import { useCart } from '@/store/cart';

function PremiumServiceCard({ product, catalogSlug }: { product: Product; catalogSlug: string }) {
  const add = useCart((state) => state.add);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    add(catalogSlug, product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const isPopular = !!product.badge;

  return (
    <div className={`relative flex flex-col overflow-hidden rounded-[2rem] border bg-white p-8 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(234,88,12,0.15)] ${
      isPopular 
        ? 'border-orange-400/50 shadow-orange-900/10 scale-[1.02] z-10' 
        : 'border-stone-200 shadow-stone-200 hover:border-orange-500/30'
    }`}>
      {/* Subtle Glow Effect */}
      <div className={`absolute -right-20 -top-20 h-48 w-48 rounded-full blur-3xl transition-opacity duration-500 group-hover:bg-orange-500/30 ${
        isPopular ? 'bg-orange-500/15' : 'bg-orange-500/5'
      }`}></div>
      
      <div className="mb-4 min-h-[24px]">
        {product.badge && (
          <span className="inline-block rounded-full bg-orange-100 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-orange-600 ring-1 ring-orange-500/20">
            {product.badge}
          </span>
        )}
      </div>
      
      <h3 className="text-2xl font-bold text-stone-900 tracking-tight">{product.name}</h3>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-600 to-orange-400">
          ${product.price.toFixed(0)}
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">USD</span>
      </div>
      
      <ul className="mt-8 mb-10 flex flex-1 flex-col gap-4">
        {product.description.split(/\.\s+/).filter(Boolean).map((line, i) => (
          <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-stone-600">
            <div className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-600">
              ✓
            </div>
            <span>{line.replace(/\.$/, '')}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-col gap-3 relative z-10">
        {product.demoUrl && (
          <a
            href={product.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white/50 px-5 py-3.5 text-sm font-bold text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900 shadow-sm"
          >
            <span className="text-lg">👀</span> Explorar demostración
          </a>
        )}
        <button
          onClick={handleAdd}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-black uppercase tracking-wide transition-all active:scale-95 shadow-md ${
            added 
              ? 'bg-green-500 text-white shadow-green-900/20' 
              : isPopular
                ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-900/30'
                : 'bg-stone-900 text-white hover:bg-stone-800 shadow-stone-900/20'
          }`}
        >
          {added ? '✅ ¡Añadido al pedido!' : '🛒 Elegir este plan'}
        </button>
      </div>
    </div>
  );
}

function TemplateShowcaseCard({ product }: { product: Product }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-lg border border-stone-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-stone-50 to-stone-200/50 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
      
      {/* Aspecto de "Navegador web" o Mockup para la demo */}
      <div className="relative h-48 w-full bg-stone-100 border-b border-stone-200 overflow-hidden flex items-center justify-center p-6">
        <div className="absolute top-3 left-4 flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-green-400"></div>
        </div>
        <div className="text-6xl group-hover:scale-110 transition-transform duration-500">
          {product.id === 'demo-libro' ? '📖' : product.id === 'demo-lista' ? '🍔' : '☕'}
        </div>
        {product.badge && (
          <span className="absolute bottom-4 right-4 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-stone-800 shadow-sm">
            {product.badge}
          </span>
        )}
      </div>

      <div className="relative z-10 flex flex-1 flex-col p-6">
        <h3 className="text-xl font-bold text-stone-900">{product.name}</h3>
        <p className="mt-3 flex-1 text-sm text-stone-600 leading-relaxed">{product.description}</p>
        
        {product.demoUrl && (
          <a
            href={product.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-stone-800 shadow-md"
          >
            <span>▶</span> Ver demostración en vivo
          </a>
        )}
      </div>
    </div>
  );
}

function AddonServiceCard({ product, catalogSlug }: { product: Product; catalogSlug: string }) {
  const add = useCart((state) => state.add);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    add(catalogSlug, product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm border border-stone-200 transition-all hover:border-orange-300 hover:shadow-md">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-stone-900">{product.name}</h4>
          {product.badge && (
            <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[9px] font-bold uppercase text-stone-500">
              {product.badge}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-stone-500 line-clamp-2">{product.description}</p>
      </div>
      <div className="text-right flex flex-col items-end gap-2">
        <div className="font-black text-orange-600">${product.price.toFixed(0)}</div>
        <button
          onClick={handleAdd}
          className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
            added ? 'bg-green-500 text-white' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
          }`}
        >
          {added ? '✓ Añadido' : '+ Agregar'}
        </button>
      </div>
    </div>
  );
}

export function PremiumServicesTemplate({ catalog }: { catalog: Catalog }) {
  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 selection:bg-orange-500/30 font-sans">
      {/* Hero Header */}
      <header className="relative overflow-hidden border-b border-stone-200 bg-stone-100/80 pb-24 pt-32 text-center backdrop-blur-sm">
        {/* Animated gradient background */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-200/50 via-stone-100 to-stone-100"></div>
        
        <div className="relative z-10 mx-auto max-w-4xl px-5 flex flex-col items-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-orange-700">
              {catalog.tagline}
            </span>
          </div>
          <h1 className="font-serif text-5xl font-black tracking-tight text-stone-900 md:text-7xl lg:text-8xl">
            {catalog.name}
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-stone-600 md:text-xl">
            {catalog.description}
          </p>
        </div>
      </header>

      {/* Sections */}
      <main className="mx-auto max-w-7xl px-5 py-24">
        <div className="space-y-24">
          {catalog.sections.map((section) => {
            const isTemplates = section.name.toLowerCase().includes('plantilla');
            const isAddons = section.name.toLowerCase().includes('servicio') || section.name.toLowerCase().includes('suscripcion');

            return (
              <section key={section.name} className="relative">
                <div className="mb-12 flex items-center justify-center gap-6">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-stone-300"></div>
                  <h2 className="text-2xl font-black uppercase tracking-[0.15em] text-stone-800">
                    {section.name}
                  </h2>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-stone-300"></div>
                </div>
                
                {isTemplates ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {section.products.map((product) => (
                      <TemplateShowcaseCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : isAddons ? (
                  <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
                    {section.products.map((product) => (
                      <AddonServiceCard key={product.id} product={product} catalogSlug={catalog.slug} />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 justify-center">
                    {section.products.map((product) => (
                      <PremiumServiceCard key={product.id} product={product} catalogSlug={catalog.slug} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>
      
      {/* Footer minimalista */}
      <footer className="border-t border-stone-200 bg-stone-100 py-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
          Powered by Catálogos Digitales
        </p>
      </footer>
    </div>
  );
}
