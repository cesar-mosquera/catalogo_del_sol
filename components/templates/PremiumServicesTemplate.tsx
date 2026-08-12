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

  const isPopular = !!product.badge && product.badge.toLowerCase().includes('vendido');
  const mockupType = product.id.includes('basico') ? 'lista' : product.id.includes('pro') ? 'libro' : 'minimal';

  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-[2.5rem] transition-all duration-700 hover:-translate-y-4 ${
      isPopular 
        ? 'bg-white/80 backdrop-blur-3xl border border-white shadow-[0_30px_60px_-15px_rgba(249,115,22,0.3)] scale-[1.03] z-10' 
        : 'bg-white/50 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:bg-white/80 hover:shadow-[0_20px_40px_rgb(0,0,0,0.1)]'
    }`}>
      
      {/* Decorative Glow inside popular card */}
      {isPopular && (
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-orange-400/20 to-pink-400/20 blur-3xl transition-transform duration-700 hover:scale-150"></div>
      )}
      
      {/* Interactive Mockup Area (Integrated Demo) */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 flex items-end justify-center border-b border-white/50">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_0%,rgba(120,119,198,0.3),rgba(255,255,255,0))] transition-opacity duration-700 group-hover:opacity-60"></div>
        
        {/* Mobile Phone Mockup */}
        <div className="relative z-10 w-32 h-[120%] rounded-t-[1.5rem] border-[5px] border-b-0 border-slate-800 bg-white shadow-2xl transition-all duration-700 transform translate-y-6 group-hover:translate-y-2 group-hover:scale-105 group-hover:rotate-2 flex flex-col overflow-hidden">
          <div className="w-10 h-3 bg-slate-800 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-lg z-20"></div>
          
          <div className="flex-1 w-full bg-slate-50 relative mt-4 p-2 flex flex-col gap-2">
            {mockupType === 'libro' && (
              <div className="flex flex-col h-full gap-2 mt-1">
                <div className="w-full h-1/2 bg-gradient-to-br from-orange-800 to-orange-950 rounded-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full bg-white/20"></div>
                </div>
                <div className="w-full h-1/2 bg-[#f8ead6] rounded-md p-1.5 flex flex-col gap-1 shadow-inner relative">
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-stone-300 shadow-md"></div>
                  <div className="w-full h-1.5 bg-stone-300 rounded-full mt-1 ml-1.5"></div>
                  <div className="w-3/4 h-1.5 bg-stone-300 rounded-full ml-1.5"></div>
                </div>
              </div>
            )}
            {mockupType === 'lista' && (
              <div className="flex flex-col gap-1.5 w-full mt-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-1.5 items-center bg-white p-1 rounded-md shadow-sm border border-slate-100">
                    <div className="w-5 h-5 bg-orange-100 rounded flex-shrink-0"></div>
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="w-full h-1 bg-slate-200 rounded-full"></div>
                      <div className="w-1/2 h-1 bg-slate-100 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {mockupType === 'minimal' && (
              <div className="flex flex-wrap gap-1.5 w-full mt-1 justify-between">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-[46%] aspect-square bg-slate-200 rounded-md overflow-hidden relative">
                    <div className="absolute bottom-1 left-1 w-3/4 h-1 bg-white/80 rounded-full"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {product.badge && (
          <span className="absolute top-4 right-4 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-orange-500/30">
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-6 relative z-10">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{product.name}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600">
            ${product.price.toFixed(0)}
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">USD (Pago Único)</span>
        </div>
        
        <ul className="mt-6 mb-8 flex flex-1 flex-col gap-3">
          {product.description.split(/\.\s+/).filter(Boolean).map((line, i) => (
            <li key={i} className="flex items-start gap-3 text-sm font-medium leading-relaxed text-slate-700">
              <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-[9px] font-bold text-white shadow-sm">
                ✓
              </div>
              <span>{line.replace(/\.$/, '')}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-2 relative z-10">
          {product.demoUrl && (
            <a
              href={product.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-indigo-100 bg-indigo-50/50 px-5 py-3 text-xs font-black uppercase tracking-widest text-indigo-700 transition-colors hover:bg-indigo-100 hover:border-indigo-200"
            >
              <span>👀</span> Probar Demostración
            </a>
          )}
          {product.id === 'plan-admin' && (
            <a
              href="/admin"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-stone-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-stone-700 transition-colors hover:bg-stone-100 hover:border-stone-300"
            >
              <span>⚙️</span> Probar Panel Admin
            </a>
          )}
          <button
            onClick={handleAdd}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
              added 
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                : isPopular
                  ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/20'
                  : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20'
            }`}
          >
            {added ? '✅ ¡Añadido!' : '🛒 Comprar Ahora'}
          </button>
        </div>
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
    <div className="group flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-[2rem] bg-white/50 backdrop-blur-md p-6 shadow-sm border border-white transition-all duration-500 hover:bg-white hover:border-orange-200 hover:shadow-xl hover:-translate-y-1">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h4 className="text-lg font-black text-slate-900">{product.name}</h4>
          {product.badge && (
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-700">
              {product.badge}
            </span>
          )}
        </div>
        <p className="mt-2 text-sm font-medium text-slate-600 leading-relaxed">{product.description}</p>
      </div>
      <div className="text-left md:text-right flex flex-col items-start md:items-end gap-3 md:border-l md:border-slate-200 md:pl-6 pt-4 md:pt-0 border-t border-slate-200 md:border-t-0 mt-2 md:mt-0">
        <div className="text-2xl font-black text-slate-900">${product.price.toFixed(0)}</div>
        <button
          onClick={handleAdd}
          className={`rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
            added ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white'
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-indigo-50 animate-mesh text-slate-900 selection:bg-orange-500/30 font-sans overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-20 w-[500px] h-[500px] bg-pink-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

      {/* Hero Header */}
      <header className="relative z-10 pt-32 pb-24 text-center px-5 animate-fade-in-up">
        <div className="mx-auto max-w-4xl flex flex-col items-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/40 backdrop-blur-md px-5 py-2 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-slate-800">
              {catalog.tagline}
            </span>
          </div>
          <h1 className="font-serif text-5xl font-black tracking-tight text-slate-900 md:text-7xl lg:text-8xl leading-tight">
            {catalog.name}
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-slate-600 md:text-xl">
            {catalog.description}
          </p>
        </div>
      </header>

      {/* Sections */}
      <main className="relative z-10 mx-auto max-w-7xl px-5 py-12">
        <div className="space-y-32">
          {catalog.sections.map((section, idx) => {
            const isTemplates = section.name.toLowerCase().includes('plantilla');
            const isAddons = section.name.toLowerCase().includes('servicio') || section.name.toLowerCase().includes('suscripcion');

            return (
              <section key={section.name} className="relative animate-fade-in-up" style={{ animationDelay: `${idx * 0.2}s` }}>
                <div className="mb-16 text-center">
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                    {section.name}
                  </h2>
                  <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-orange-400 to-pink-500"></div>
                </div>
                
                {isAddons ? (
                  <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
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
          
          {/* FAQ Interactiva Automática */}
          <section className="relative animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <div className="mb-16 text-center">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                Preguntas Frecuentes
              </h2>
              <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-orange-400 to-pink-500"></div>
              <p className="mt-4 text-slate-600 font-medium">Resolvemos tus dudas en lenguaje claro, sin términos informáticos.</p>
            </div>
            
            <div className="mx-auto max-w-4xl flex flex-col gap-4">
              <details className="group rounded-[2rem] bg-white/60 backdrop-blur-md border border-white p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer">
                <summary className="text-xl font-bold text-slate-900 flex justify-between items-center outline-none list-none">
                  ¿Me cobran comisiones por cada pedido que me hagan?
                  <span className="transition-transform group-open:rotate-180 text-orange-500 text-2xl font-light">↓</span>
                </summary>
                <p className="mt-4 text-slate-600 leading-relaxed font-medium">
                  ¡Para nada! A diferencia de aplicaciones de delivery que te cobran hasta el 30%, aquí los pedidos llegan directo a tu WhatsApp. Todas las ganancias son tuyas y no intervenimos en tus pagos.
                </p>
              </details>
              
              <details className="group rounded-[2rem] bg-white/60 backdrop-blur-md border border-white p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer">
                <summary className="text-xl font-bold text-slate-900 flex justify-between items-center outline-none list-none">
                  No sé nada de computadoras, ¿cómo le hago para cambiar los precios?
                  <span className="transition-transform group-open:rotate-180 text-orange-500 text-2xl font-light">↓</span>
                </summary>
                <p className="mt-4 text-slate-600 leading-relaxed font-medium">
                  Tienes dos opciones muy sencillas: si eliges el <strong>Catálogo Administrable</strong>, te damos una pantalla especial en tu celular que funciona igual que publicar en Facebook (sólo escribes el precio nuevo y guardas). O si prefieres, puedes contratar nuestro servicio de actualización por $10 y nosotros lo hacemos todo por ti.
                </p>
              </details>

              <details className="group rounded-[2rem] bg-white/60 backdrop-blur-md border border-white p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer">
                <summary className="text-xl font-bold text-slate-900 flex justify-between items-center outline-none list-none">
                  ¿Qué es eso de que &quot;se instala como aplicación&quot;?
                  <span className="transition-transform group-open:rotate-180 text-orange-500 text-2xl font-light">↓</span>
                </summary>
                <p className="mt-4 text-slate-600 leading-relaxed font-medium">
                  Es una función espectacular del Plan Avanzado. Cuando tus clientes abran el enlace de tu restaurante, el celular les preguntará si desean añadirlo a su pantalla. Si dicen que sí, el logo de tu negocio quedará instalado junto a su app de WhatsApp o Facebook, listo para pedir comida con un solo toque.
                </p>
              </details>
            </div>
          </section>

        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-white/30 bg-white/20 backdrop-blur-xl py-12 text-center">
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">
          Powered by Catálogos Digitales
        </p>
      </footer>
    </div>
  );
}
