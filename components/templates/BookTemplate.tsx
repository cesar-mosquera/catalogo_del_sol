'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import type { Catalog } from '@/lib/catalog-types';
import { asset } from '@/lib/asset';
import { ProductCard } from '@/components/ProductCard';

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

  const pages    = useMemo(() => catalog.sections, [catalog.sections]);
  const lastPage = pages.length + 1;
  const total    = lastPage + 1;

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
    const angle = f.dir === 'next'
      ? -(f.progress * 180)       // 0 → -180
      : -180 + f.progress * 180;  // -180 → 0
    const origin = 'left center';
    const shadow = f.progress > 0.05 && f.progress < 0.95
      ? `${f.dir === 'next' ? '-' : ''}${Math.round(Math.sin(f.progress * Math.PI) * 18)}px 0 ${Math.round(Math.sin(f.progress * Math.PI) * 30)}px rgba(0,0,0,0.3)`
      : 'none';
    return {
      transform: `rotateY(${angle}deg)`,
      transformOrigin: origin,
      boxShadow: shadow,
      transition: f.phase !== 'drag' ? 'transform 0.35s cubic-bezier(0.25,0.8,0.35,1)' : 'none',
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
              <div className="relative flex h-full flex-col overflow-hidden bg-stone-950 text-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(catalog.coverImage)} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ opacity: 0.9 }} />
                <div className="absolute inset-x-0 bottom-0 h-3/5" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.85) 0%,transparent 100%)' }} />
                <div className="book-cover-content relative z-10 flex h-full flex-col justify-end p-6 pb-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset(catalog.logoImage)} alt="" className="mb-auto h-16 w-16 object-contain drop-shadow-lg" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-60">Menú Digital</p>
                  <h1 className="mt-1 font-serif text-3xl font-bold leading-tight drop-shadow">{catalog.name}</h1>
                  <p className="mt-1 text-sm text-orange-200 drop-shadow">{catalog.tagline}</p>
                  <div className="mt-6 flex items-center gap-1 text-xs opacity-50">
                    <span>Desliza para ver el menú</span>
                    <span className="animate-bounce-x ml-1">→</span>
                  </div>
                </div>
              </div>
            )}

            {/* SECCIONES */}
            {pages.map((section, si) => renderPage(si + 1,
              <div className="notebook-menu-page relative h-full overflow-y-auto overscroll-contain bg-orange-50 p-4 pb-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600">{catalog.name}</p>
                <h2 className="mb-3 mt-1 font-serif text-xl font-bold text-stone-900">{section.name}</h2>
                <div className="space-y-3">
                  {section.products.map(p => (
                    <ProductCard key={p.id} product={p} catalogSlug={catalog.slug} compact />
                  ))}
                </div>
                <p className="mt-4 text-center text-[10px] text-stone-400">← desliza para cambiar página →</p>
              </div>
            ))}

            {/* CONTRAPORTADA */}
            {renderPage(lastPage,
              <div className="notebook-back-page flex h-full flex-col items-center justify-center bg-stone-900 p-8 text-center text-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(catalog.logoImage)} alt="" className="h-20 w-20 object-contain" />
                <h2 className="mt-5 font-serif text-2xl">Gracias por visitarnos</h2>
                <p className="mt-3 text-sm text-stone-300">Agrega tus favoritos al carrito y confirma por WhatsApp.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
