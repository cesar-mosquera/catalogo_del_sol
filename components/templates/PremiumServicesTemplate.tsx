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

  return (
    <div className="relative flex flex-col overflow-hidden rounded-[2rem] border border-stone-800 bg-stone-900/40 p-8 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-orange-500/40 hover:shadow-[0_20px_40px_-15px_rgba(234,88,12,0.2)]">
      {/* Subtle Glow Effect */}
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-orange-600/10 blur-3xl transition-opacity duration-300 group-hover:bg-orange-600/20"></div>
      
      {product.badge && (
        <span className="absolute right-5 top-5 rounded-full bg-orange-500/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-orange-400 ring-1 ring-orange-500/30">
          {product.badge}
        </span>
      )}
      
      <h3 className="text-2xl font-bold text-white tracking-tight">{product.name}</h3>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-orange-200">
          ${product.price.toFixed(0)}
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-stone-500">USD</span>
      </div>
      
      <p className="mt-6 mb-10 flex-1 text-sm leading-relaxed text-stone-400">
        {product.description}
      </p>

      <div className="mt-auto flex flex-col gap-3 relative z-10">
        {product.demoUrl && (
          <a
            href={product.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-700 bg-stone-800/50 px-5 py-3.5 text-sm font-bold text-stone-300 transition-colors hover:bg-stone-700 hover:text-white"
          >
            <span className="text-lg">👀</span> Explorar demostración
          </a>
        )}
        <button
          onClick={handleAdd}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-black uppercase tracking-wide transition-colors ${
            added 
              ? 'bg-green-500 text-stone-950' 
              : 'bg-orange-500 text-stone-950 hover:bg-orange-400'
          }`}
        >
          {added ? '✅ ¡Añadido al pedido!' : '🛒 Elegir este plan'}
        </button>
      </div>
    </div>
  );
}

export function PremiumServicesTemplate({ catalog }: { catalog: Catalog }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-stone-300 selection:bg-orange-500/30 font-sans">
      {/* Hero Header */}
      <header className="relative overflow-hidden border-b border-stone-800/50 bg-[#0f0f0f] pb-24 pt-32 text-center">
        {/* Animated gradient background */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/30 via-[#0a0a0a] to-[#0a0a0a]"></div>
        
        <div className="relative z-10 mx-auto max-w-4xl px-5">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-orange-500">
            {catalog.tagline}
          </p>
          <h1 className="font-serif text-5xl font-black tracking-tight text-white md:text-7xl lg:text-8xl">
            {catalog.name}
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-stone-400 md:text-xl">
            {catalog.description}
          </p>
        </div>
      </header>

      {/* Sections */}
      <main className="mx-auto max-w-7xl px-5 py-24">
        <div className="space-y-32">
          {catalog.sections.map((section) => (
            <section key={section.name} className="relative">
              <div className="mb-14 flex items-center justify-center gap-6">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-stone-700"></div>
                <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-white">
                  {section.name}
                </h2>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-stone-700"></div>
              </div>
              
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 justify-center">
                {section.products.map((product) => (
                  <PremiumServiceCard key={product.id} product={product} catalogSlug={catalog.slug} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      
      {/* Footer minimalista */}
      <footer className="border-t border-stone-900 py-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-600">
          Powered by Catálogos Digitales
        </p>
      </footer>
    </div>
  );
}
