'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import type { Catalog, Product } from '@/lib/catalog-types';
import { asset } from '@/lib/asset';
import { ProductCard } from '@/components/ProductCard';

/* Colores por defecto (look clásico naranja/piedra) si el catálogo no trae `theme` */
const T = {
  coverBg: '#1c1917',       // stone-900
  coverTitle: '#ffffff',
  coverTagline: '#fcd34d',  // amber-300
  pageBg: '#fffbeb',        // amber-50
  pageText: '#451a03',      // amber-950
  heading: '#b45309',       // amber-700
  headingSplash: 'rgba(253,224,132,0.7)', // amber-200/70
};

/* ────────────────────────────────────────────────────────── */
type FlipState = {
  dir: 'next' | 'prev';
  movingPage: number;   // la página que fisicamente gira
  underPage:  number;   // la página que queda debajo
  progress: number;     // 0 → 1 (cuánto se ha girado)
  phase: 'drag' | 'completing' | 'snapping';
};

export function BookTemplate({ catalog }: { catalog: Catalog }) {
  const [current, setCurrent] = useState(0);

  // Para rendering usamos estado React; para los handlers usamos refs
  const [flip, _setFlip]  = useState<FlipState | null>(null);
  const flipRef           = useRef<FlipState | null>(null);
  const currentRef        = useRef(0);

  const setFlip = (next: FlipState | null) => {
    flipRef.current = next;
    _setFlip(next);
  };
  const setCurrentBoth = (n: number) => {
    currentRef.current = n;
    setCurrent(n);
  };

  const stageRef  = useRef<HTMLDivElement>(null);
  const touchRef  = useRef<{ x: number; y: number; locked: 'h'|'v'|null } | null>(null);

  const pages = useMemo(() => {
    const pgs: { sectionName: string; products: Product[]; isContinued: boolean; note?: string }[] = [];
    catalog.sections.forEach(sec => {
      const chunkSize = 3; // 3 productos por página como pidió el usuario
      for (let i = 0; i < sec.products.length; i += chunkSize) {
        pgs.push({
          sectionName: sec.name,
          products: sec.products.slice(i, i + chunkSize),
          isContinued: i > 0,
          note: sec.note
        });
      }
    });
    return pgs;
  }, [catalog.sections]);
  const hasInfo   = !!catalog.infoImage;
  const secOffset = hasInfo ? 1 : 0;
  const lastPage  = pages.length + 1 + secOffset;
  const total     = lastPage + 1;

  const theme = catalog.theme;
  const themed = !!theme;
  const t = {
    coverBg:      theme?.coverBg      ?? T.coverBg,
    coverTitle:   theme?.coverTitle   ?? T.coverTitle,
    coverTagline: theme?.coverTagline ?? T.coverTagline,
    pageBg:       theme?.pageBg      ?? T.pageBg,
    pageText:     theme?.pageText    ?? T.pageText,
    heading:      theme?.heading     ?? T.heading,
    headingSplash: theme?.headingSplash ?? T.headingSplash,
  };

  /* ── Helpers ─────────────────────────────────── */
  const canGo = (dir: 'next' | 'prev') => {
    const cur = currentRef.current;
    return dir === 'next' ? cur < lastPage : cur > 0;
  };

  const beginFlip = (dir: 'next' | 'prev') => {
    if (flipRef.current) return;
    if (!canGo(dir)) return;
    const cur = currentRef.current;
    const movingPage = dir === 'next' ? cur : cur - 1;
    const underPage  = dir === 'next' ? cur + 1 : cur;
    setFlip({ dir, movingPage, underPage, progress: 0, phase: 'drag' });
  };

  const commitFlip = (complete: boolean) => {
    const f = flipRef.current;
    if (!f || f.phase !== 'drag') return;
    setFlip({ ...f, progress: complete ? 1 : 0, phase: complete ? 'completing' : 'snapping' });
  };

  /* ── Inline style para la página que gira ─────── */
  const movingStyle = (f: FlipState): React.CSSProperties => {
    // Para 'next', gira de 0 a -180.
    // Para 'prev', el rango de -180 a -90 queda fuera de la pantalla (a la izquierda del lomo).
    // Para que emerja al instante y no haya lag táctil, mapeamos el progreso a -90 -> 0.
    const angle = f.dir === 'next'
      ? -(f.progress * 180)
      : -90 + (f.progress * 90);
    
    const origin = 'left center';
    
    // Cálculo de sombra más fluido
    const p = f.progress;
    const shadowSize = Math.round(Math.sin(p * Math.PI) * 30);
    const shadowX = f.dir === 'next' 
      ? `-${Math.round(Math.sin(p * Math.PI) * 18)}px`
      : `${Math.round(Math.sin(p * Math.PI) * 18)}px`;
    
    const shadow = `inset 0 0 0 1px rgba(255,255,255,0.1), ${shadowX} 0 ${shadowSize}px rgba(0,0,0,0.25)`;

    return {
      transform: `rotateY(${angle}deg)`,
      transformOrigin: origin,
      boxShadow: shadow,
      transition: f.phase !== 'drag' ? 'transform 0.4s cubic-bezier(0.25,0.8,0.35,1), box-shadow 0.4s ease' : 'none',
    };
  };

  /* ── Fin de transición ────────────────────────── */
  const onTransitionEnd = () => {
    const f = flipRef.current;
    if (!f) return;
    if (f.phase === 'completing') {
      setCurrentBoth(f.dir === 'next' ? f.underPage : f.movingPage);
    }
    setFlip(null);
  };

  /* ── Teclado ──────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (flipRef.current) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (canGo('next')) { beginFlip('next'); setTimeout(() => commitFlip(true), 16); }
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (canGo('prev')) { beginFlip('prev'); setTimeout(() => commitFlip(true), 16); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Touch events (passive:false en move) ─────── */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest('button,a,input,textarea,select')) return;
      const t = e.touches[0];
      touchRef.current = { x: t.clientX, y: t.clientY, locked: null };
    };

    const onMove = (e: TouchEvent) => {
      const tc = touchRef.current;
      if (!tc) return;
      const t = e.touches[0];
      const dx = t.clientX - tc.x;
      const dy = t.clientY - tc.y;

      // Determinar dirección al primer movimiento significativo
      if (tc.locked === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
        tc.locked = Math.abs(dx) > Math.abs(dy) * 0.7 ? 'h' : 'v';
        if (tc.locked === 'h') {
          const dir = dx < 0 ? 'next' : 'prev';
          beginFlip(dir);
        }
      }

      if (tc.locked === 'h') {
        e.preventDefault();
        const f = flipRef.current;
        if (f && f.phase === 'drag') {
          const w = el.clientWidth || 320;
          const raw = Math.abs(dx) / w;
          const progress = Math.max(0, Math.min(0.98, raw));
          setFlip({ ...f, progress });
        }
      }
    };

    const onEnd = (e: TouchEvent) => {
      const tc = touchRef.current;
      touchRef.current = null;
      if (!tc || tc.locked !== 'h') return;
      const t = e.changedTouches[0];
      const dx = Math.abs(t.clientX - tc.x);
      const w  = el.clientWidth || 320;
      // Umbral: 28% del ancho ó velocidad (movimiento > 55px)
      commitFlip(dx / w > 0.28 || dx > 55);
    };

    const onCancel = () => {
      touchRef.current = null;
      commitFlip(false);
    };

    el.addEventListener('touchstart',  onStart,  { passive: true  });
    el.addEventListener('touchmove',   onMove,   { passive: false });
    el.addEventListener('touchend',    onEnd,    { passive: true  });
    el.addEventListener('touchcancel', onCancel, { passive: true  });
    return () => {
      el.removeEventListener('touchstart',  onStart);
      el.removeEventListener('touchmove',   onMove);
      el.removeEventListener('touchend',    onEnd);
      el.removeEventListener('touchcancel', onCancel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Visibilidad de páginas ───────────────────── */
  const pageVisible = (i: number) => {
    if (!flip) return i === current;
    return i === flip.movingPage || i === flip.underPage;
  };
  const pageZ = (i: number) => {
    if (!flip) return i === current ? 2 : 0;
    if (i === flip.movingPage) return 8;
    if (i === flip.underPage)  return 2;
    return 0;
  };

  /* ── Render ───────────────────────────────────── */
  const renderPage = (i: number, children: React.ReactNode) => {
    const vis  = pageVisible(i);
    const isMoving = flip?.movingPage === i;
    const style: React.CSSProperties = isMoving
      ? { ...movingStyle(flip!), zIndex: 8, visibility: 'visible' }
      : { zIndex: pageZ(i), visibility: vis ? 'visible' : 'hidden' };

    return (
      <div
        key={i}
        className="notebook-page"
        style={style}
        onTransitionEnd={isMoving ? onTransitionEnd : undefined}
      >
        {children}
      </div>
    );
  };

  return (
    <div className="book-fullscreen">
      <div className="book-frame-fullscreen">
        {/* Puntos */}
        <div className="book-dots" aria-hidden="true">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`book-dot ${i === current ? 'book-dot-active' : ''}`} />
          ))}
        </div>

        <div ref={stageRef} className="notebook-stage-fullscreen">
          <div className="notebook-spine" aria-hidden="true" />
          <div className="notebook-pages">

            {/* PORTADA */}
            {renderPage(0,
              <div className={`relative flex h-full flex-col overflow-hidden text-white`} style={{ backgroundColor: t.coverBg }}>
                {catalog.coverImage && (
                  <>
                    <Image src={asset(catalog.coverImage)} alt="" fill priority className="object-cover scale-105" sizes="100vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
                  </>
                )}
                {!catalog.coverImage && (
                  <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                  </div>
                )}

                {/* Decoración: Líneas doradas sutiles */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

                <div className="book-cover-content relative z-10 flex h-full flex-col items-center justify-between p-5 pt-6 sm:p-6 sm:pt-8">
                  {/* Top: Badge premium */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-3 text-[8px] font-bold uppercase tracking-[0.4em] text-white/40">
                      <div className="h-px w-6 bg-gradient-to-r from-transparent to-white/30" />
                      <span>Estilo Único</span>
                      <div className="h-px w-6 bg-gradient-to-l from-transparent to-white/30" />
                    </div>
                  </div>

                  {/* Center: Logo + Title + Tagline */}
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 -mt-2">
                    {catalog.logoImage ? (
                      <div className="relative mb-2">
                        <div className="absolute -inset-4 rounded-full bg-white/5 blur-xl" />
                        <div className="relative h-24 w-24 drop-shadow-2xl sm:h-32 sm:w-32">
                          <Image src={asset(catalog.logoImage)} alt="Logo" fill priority className="object-contain" sizes="128px" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative mb-2">
                        <div className="absolute -inset-3 rounded-full bg-white/5 blur-lg" />
                        <div className="relative grid h-16 w-16 place-items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm sm:h-20 sm:w-20">
                          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current text-white/70 sm:h-8 sm:w-8" aria-hidden="true">
                            <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2v6.6l3-2.2 3 3 4-4L20 14V7H5Zm4.5 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                          </svg>
                        </div>
                      </div>
                    )}

                    <div className="text-center">
                      <h1 className="font-sans text-2xl font-black leading-[0.9] tracking-tight drop-shadow-2xl sm:text-3xl md:text-4xl" style={{ color: t.coverTitle }}>
                        {catalog.name}
                      </h1>
                      {catalog.tagline && (
                        <p className="mt-2 text-[10px] font-semibold tracking-[0.15em] drop-shadow-lg sm:text-xs" style={{ color: t.coverTagline }}>
                          {catalog.tagline}
                        </p>
                      )}
                    </div>

                    {/* Línea decorativa */}
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/30" />
                      <div className="h-1 w-1 rotate-45 bg-amber-400/60" />
                      <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/30" />
                    </div>
                  </div>

                  {/* Bottom: CTA elegante */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 backdrop-blur-sm">
                      <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/50">Desliza</span>
                      <svg className="h-3 w-3 text-amber-400/70 animate-bounce-x" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PÁGINA INFORMATIVA (va justo después de la portada) */}
            {hasInfo && renderPage(1,
              <div className="relative h-full w-full bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(catalog.infoImage!)} alt="" className="h-full w-full object-contain" loading="lazy" decoding="async" />
              </div>
            )}

            {/* SECCIONES */}
            {pages.map((page, si) => renderPage(si + 1 + secOffset,
              <div
                className={`notebook-menu-page relative h-full overflow-hidden p-4 pb-8 flex flex-col ${themed ? 'menu-flat' : ''}`}
                style={{ backgroundColor: t.pageBg, '--menu-page-bg': t.pageBg } as React.CSSProperties}
              >
                <div className="flex-none mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60" style={{ color: t.pageText }}>{catalog.name}</p>
                  <div className="relative mt-2 w-fit mb-2">
                    <span className="absolute -inset-x-2 -inset-y-1 -rotate-2 rounded-lg" style={{ backgroundColor: t.headingSplash }} aria-hidden="true" />
                    <h2 className="relative font-serif text-xl font-bold" style={{ color: t.heading }}>
                      {page.sectionName} {page.isContinued && <span className="text-sm font-normal opacity-50">(cont.)</span>}
                    </h2>
                  </div>
                  {page.note && (
                    <p className="mb-2 text-xs italic opacity-70" style={{ color: t.pageText }}>{page.note}</p>
                  )}
                </div>
                
                {/* Decoración: Sol en la esquina superior derecha */}
                <svg className="absolute top-2 right-2 w-16 h-16 opacity-[0.07] rotate-12" style={{ color: t.heading }} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18.75a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM6.166 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.06 1.061l1.59 1.59zM4.5 12a.75.75 0 01-.75.75H1.5a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75zM6.166 5.106a.75.75 0 00-1.06 1.06l1.59 1.591a.75.75 0 101.06-1.06l-1.59-1.591z" />
                </svg>
                {/* Decoración: Sol en la esquina inferior izquierda */}
                <svg className="absolute -bottom-4 -left-4 w-24 h-24 opacity-[0.05] -rotate-12" style={{ color: t.heading }} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18.75a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM6.166 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.06 1.061l1.59 1.59zM4.5 12a.75.75 0 01-.75.75H1.5a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75zM6.166 5.106a.75.75 0 00-1.06 1.06l1.59 1.591a.75.75 0 101.06-1.06l-1.59-1.591z" />
                </svg>
                
                <div className="flex-1 w-full overflow-hidden flex flex-col gap-1.5 pt-1 pb-1">
                  {page.products.map((p, idx) => (
                    <div key={p.id} className="w-full flex-1 min-h-0">
                      <ProductCard product={p} catalogSlug={catalog.slug} compact={true} theme={catalog.theme?.card} alternate={idx % 2 !== 0} />
                    </div>
                  ))}
                </div>
                
                <p className="mt-4 text-center text-[10px] opacity-50 flex-none" style={{ color: t.pageText }}>← desliza para ver más →</p>
              </div>
            ))}

            {/* CONTRAPORTADA */}
            {renderPage(lastPage,
              (() => {
                const back = catalog.backCover;
                return (
                  <div className={`notebook-back-page flex h-full flex-col items-center justify-center p-8 text-center text-white`} style={{ backgroundColor: t.coverBg }}>
                    {/* Decoración de fondo */}
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
                    
                    {back ? (
                      <>
                        {catalog.logoImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <div className="relative mb-4">
                            <div className="absolute -inset-3 rounded-full bg-white/5 blur-lg" />
                            <img src={asset(catalog.logoImage)} alt="" className="relative h-14 w-14 object-contain drop-shadow-xl" loading="lazy" decoding="async" />
                          </div>
                        )}
                        {back.title && (
                          <h2 className="relative font-sans text-xl font-bold tracking-tight" style={{ color: t.coverTitle }}>{back.title}</h2>
                        )}
                        {back.subtitle && (
                          <div className="relative mt-2 flex items-center gap-2">
                            <div className="h-px w-4 bg-gradient-to-r from-transparent to-white/30" />
                            <p className="text-[9px] font-medium tracking-wide" style={{ color: t.coverTagline }}>{back.subtitle}</p>
                            <div className="h-px w-4 bg-gradient-to-l from-transparent to-white/30" />
                          </div>
                        )}
                        <div className="relative mt-4 w-full max-w-xs space-y-2.5">
                          {back.rows?.map((row, i) => (
                            <div key={i}>
                              {row.label && (
                                <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/40">{row.label}</p>
                              )}
                              <p className="mt-0.5 text-xs font-semibold" style={{ color: t.coverTitle }}>{row.value}</p>
                            </div>
                          ))}
                        </div>
                        {back.footer && (
                          <p className="absolute bottom-3 left-3 right-3 text-[7px] text-white/25">{back.footer}</p>
                        )}
                      </>
                    ) : (
                      <>
                        {catalog.logoImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <div className="relative mb-4">
                            <div className="absolute -inset-3 rounded-full bg-white/5 blur-lg" />
                            <img src={asset(catalog.logoImage)} alt="" className="relative h-14 w-14 object-contain drop-shadow-xl" loading="lazy" decoding="async" />
                          </div>
                        )}
                        <h2 className="relative font-sans text-lg font-bold tracking-tight">Gracias por visitarnos</h2>
                        <div className="relative mt-2 flex items-center gap-2">
                          <div className="h-px w-4 bg-gradient-to-r from-transparent to-white/30" />
                          <p className="text-[9px] font-medium text-stone-400">Agrega tus favoritos al carrito</p>
                          <div className="h-px w-4 bg-gradient-to-l from-transparent to-white/30" />
                        </div>
                      </>
                    )}
                  </div>
                );
              })()
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
