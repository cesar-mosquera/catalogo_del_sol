'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import type { Catalog, Product } from '@/lib/catalog-types';
import { asset } from '@/lib/asset';
import { ProductCard } from '@/components/ProductCard';

/* Colores por defecto (look clásico naranja/piedra) si el catálogo no trae `theme` */
const T = {
  coverBg: '#0c0a09',       // stone-950
  coverTitle: '#ffffff',
  coverTagline: '#fed7aa',  // orange-200
  pageBg: '#fff7ed',        // orange-50
  pageText: '#1c1917',      // stone-900
  heading: '#1c1917',
  headingSplash: 'rgba(254,215,170,0.6)', // orange-200/60
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
      const chunkSize = 2; // Máximo 2 productos por página para evitar scroll vertical
      for (let i = 0; i < sec.products.length; i += chunkSize) {
        pgs.push({
          sectionName: sec.name,
          products: sec.products.slice(i, i + chunkSize),
          isContinued: i > 0,
          note: i === 0 ? sec.note : undefined,
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset(catalog.coverImage)} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ opacity: 0.9 }} />
                    <div className="absolute inset-x-0 bottom-0 h-3/5" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.85) 0%,transparent 100%)' }} />
                  </>
                )}
                {!catalog.coverImage && (
                  <div className="absolute left-1/2 top-8 z-[5] grid h-36 w-36 -translate-x-1/2 place-items-center rounded-full border-2 border-dashed border-white/40 bg-white/10">
                    <div className="flex flex-col items-center gap-1 text-white/50">
                      <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current" aria-hidden="true">
                        <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2v6.6l3-2.2 3 3 4-4L20 14V7H5Zm4.5 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                      </svg>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em]">Foto</p>
                    </div>
                  </div>
                )}
                <div className="book-cover-content relative z-10 flex h-full flex-col justify-end p-6 pb-8">
                  {catalog.logoImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={asset(catalog.logoImage)} alt="" className="mb-auto h-16 w-16 object-contain drop-shadow-lg" />
                  ) : (
                    <div className="mb-auto grid h-16 w-16 place-items-center rounded-full border-2 border-dashed border-white/40 bg-white/10">
                      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current text-white/50" aria-hidden="true">
                        <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2v6.6l3-2.2 3 3 4-4L20 14V7H5Zm4.5 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                      </svg>
                    </div>
                  )}
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-60">Menú Digital</p>
                  <h1 className="mt-1 font-serif text-3xl font-bold leading-tight drop-shadow" style={{ color: t.coverTitle }}>{catalog.name}</h1>
                  <p className="mt-1 text-sm drop-shadow" style={{ color: t.coverTagline }}>{catalog.tagline}</p>
                  <div className="mt-6 flex items-center gap-1 text-xs opacity-50">
                    <span>Desliza para ver el menú</span>
                    <span className="animate-bounce-x ml-1">→</span>
                  </div>
                </div>
              </div>
            )}

            {/* PÁGINA INFORMATIVA (va justo después de la portada) */}
            {hasInfo && renderPage(1,
              <div className="relative h-full w-full bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(catalog.infoImage!)} alt="" className="h-full w-full object-contain" />
              </div>
            )}

            {/* SECCIONES */}
            {pages.map((page, si) => renderPage(si + 1 + secOffset,
              <div
                className={`notebook-menu-page relative h-full overflow-hidden p-4 pb-10 flex flex-col ${themed ? 'menu-flat' : ''}`}
                style={{ backgroundColor: t.pageBg, '--menu-page-bg': t.pageBg } as React.CSSProperties}
              >
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
                <div className="space-y-3 flex-1">
                  {page.products.map(p => (
                    <ProductCard key={p.id} product={p} catalogSlug={catalog.slug} compact theme={catalog.theme?.card} />
                  ))}
                </div>
                <p className="mt-4 text-center text-[10px] opacity-50" style={{ color: t.pageText }}>← desliza para ver más →</p>
              </div>
            ))}

            {/* CONTRAPORTADA */}
            {renderPage(lastPage,
              (() => {
                const back = catalog.backCover;
                return (
                  <div className={`notebook-back-page flex h-full flex-col items-center justify-center p-8 text-center text-white`} style={{ backgroundColor: t.coverBg }}>
                    {back ? (
                      <>
                        {catalog.logoImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={asset(catalog.logoImage)} alt="" className="h-20 w-20 object-contain" />
                        )}
                        {back.title && (
                          <h2 className="mt-5 font-serif text-3xl font-bold" style={{ color: t.coverTitle }}>{back.title}</h2>
                        )}
                        {back.subtitle && <p className="mt-2 text-sm" style={{ color: t.coverTagline }}>{back.subtitle}</p>}
                        <div className="mt-6 w-full max-w-xs space-y-4">
                          {back.rows?.map((row, i) => (
                            <div key={i}>
                              {row.label && (
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">{row.label}</p>
                              )}
                              <p className="mt-0.5 text-lg font-bold" style={{ color: t.coverTitle }}>{row.value}</p>
                            </div>
                          ))}
                        </div>
                        {back.footer && (
                          <p className="absolute bottom-4 left-4 right-4 text-[9px] text-white/40">{back.footer}</p>
                        )}
                      </>
                    ) : (
                      <>
                        {catalog.logoImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={asset(catalog.logoImage)} alt="" className="h-20 w-20 object-contain" />
                        )}
                        <h2 className="mt-5 font-serif text-2xl">Gracias por visitarnos</h2>
                        <p className="mt-3 text-sm text-stone-300">Agrega tus favoritos al carrito y confirma por WhatsApp.</p>
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
