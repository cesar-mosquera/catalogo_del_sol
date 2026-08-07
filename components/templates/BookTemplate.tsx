'use client';

import HTMLFlipBook from 'react-pageflip';
import type { Catalog } from '@/lib/catalog-types';
import { ProductCard } from '@/components/ProductCard';

export function BookTemplate({ catalog }: { catalog: Catalog }) {
  return <div className="mx-auto max-w-5xl px-4 pb-16"><div className="hidden justify-center md:flex">
    <HTMLFlipBook width={460} height={650} size="stretch" minWidth={320} maxWidth={460} minHeight={460} maxHeight={650} showCover mobileScrollSupport className="shadow-2xl" style={{}} startPage={0} drawShadow flippingTime={560} usePortrait startZIndex={0} autoSize maxShadowOpacity={0.22} clickEventForward useMouseEvents swipeDistance={70} showPageCorners disableFlipByClick>
      <div className="flex h-full flex-col justify-end overflow-hidden bg-stone-950 p-10 text-white" style={{ backgroundImage: `linear-gradient(#0008,#0008), url(${catalog.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}><img src={catalog.logoImage} alt="" className="mb-auto h-20 w-20 object-contain" /><p className="text-sm font-bold tracking-[0.25em]">MENÚ DIGITAL</p><h1 className="mt-2 font-serif text-4xl font-bold">{catalog.name}</h1><p className="mt-3 text-orange-200">{catalog.tagline}</p><p className="mt-10 text-sm">Desliza para ver el menú →</p></div>
      {catalog.sections.map((section) => <div className="h-full overflow-auto bg-orange-50 p-6" key={section.name}><p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">{catalog.name}</p><h2 className="mb-5 mt-2 font-serif text-3xl font-bold">{section.name}</h2><div className="space-y-4">{section.products.map((product) => <ProductCard key={product.id} product={product} />)}</div></div>)}
      <div className="flex h-full flex-col items-center justify-center bg-stone-900 p-8 text-center text-white"><img src={catalog.logoImage} alt="" className="h-24 w-24 object-contain" /><h2 className="mt-5 font-serif text-3xl">Gracias por visitarnos</h2><p className="mt-4 text-stone-300">Agrega tus favoritos al carrito y confirma por WhatsApp.</p></div>
    </HTMLFlipBook>
  </div><div className="space-y-7 md:hidden">{catalog.sections.map((section) => <section key={section.name}><h2 className="mb-3 font-serif text-2xl font-bold">{section.name}</h2><div className="space-y-3">{section.products.map((product) => <ProductCard product={product} key={product.id} />)}</div></section>)}</div></div>;
}
