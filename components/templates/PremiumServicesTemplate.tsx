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
    <div className="relative flex flex-col overflow-hidden rounded-[2rem] border border-orange-900/5 bg-white/70 p-8 backdrop-blur-xl shadow-xl shadow-orange-900/5 transition-all duration-300 hover:-translate-y-2 hover:border-orange-500/30 hover:shadow-[0_20px_40px_-15px_rgba(234,88,12,0.15)]">
      {/* Subtle Glow Effect */}
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl transition-opacity duration-300 group-hover:bg-orange-500/20"></div>
      
      {product.badge && (
        <span className="absolute right-5 top-5 rounded-full bg-orange-100 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-orange-600 ring-1 ring-orange-500/20">
          {product.badge}
        </span>
      )}
      
      <h3 className="text-2xl font-bold text-stone-900 tracking-tight">{product.name}</h3>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-600 to-orange-400">
          ${product.price.toFixed(0)}
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">USD</span>
      </div>
      
      <p className="mt-6 mb-10 flex-1 text-sm leading-relaxed text-stone-600">
        {product.description}
      </p>

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
          className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-black uppercase tracking-wide transition-colors shadow-md ${
            added 
              ? 'bg-green-500 text-white shadow-green-900/20' 
              : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-900/20'
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
    <div className="min-h-screen bg-[#fdf8f0] text-stone-800 selection:bg-orange-500/30 font-sans">
      {/* Hero Header */}
      <header className="relative overflow-hidden border-b border-orange-900/10 bg-[#fdf8f0]/80 pb-24 pt-32 text-center backdrop-blur-sm">
        {/* Animated gradient background */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-100 via-[#fdf8f0] to-[#fdf8f0]"></div>
        
        <div className="relative z-10 mx-auto max-w-4xl px-5">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-orange-600">
            {catalog.tagline}
          </p>
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
        <div className="space-y-32">
          {catalog.sections.map((section) => (
            <section key={section.name} className="relative">
              <div className="mb-14 flex items-center justify-center gap-6">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-stone-300"></div>
                <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-stone-900">
                  {section.name}
                </h2>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-stone-300"></div>
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
      <footer className="border-t border-stone-900/5 bg-[#fdf8f0] py-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
          Powered by Catálogos Digitales
        </p>
      </footer>
    </div>
  );
}
