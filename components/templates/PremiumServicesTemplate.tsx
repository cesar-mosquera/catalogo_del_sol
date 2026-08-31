'use client';

import { useEffect, useRef, useState, useCallback, Children } from 'react';
import type { ReactNode } from 'react';
import type { Catalog, Product } from '@/lib/catalog-types';
import { BASE_PATH } from '@/lib/base-path';
import { asset } from '@/lib/asset';
import { useCart } from '@/store/cart';

/* ───────────────────────── HELPERS ───────────────────────── */

function goTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* Partículas "brasas" del hero (blancas) */
const EMBERS = Array.from({ length: 14 }).map((_, i) => ({
  left: (i * 47 + 5) % 100,
  size: 3 + (i % 3) * 1.6,
  dur: 9 + ((i * 13) % 10),
  delay: -(i * 1.7),
  color: i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)',
}));

/* ─────────────── ESTRELLITAS DECORATIVAS ─────────────── */

/* Estrella "destello" de 4 puntas dibujada con SVG */
function Star({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className={className} style={style}>
      <path d="M12 0c.6 7.2 4.8 11.4 12 12-7.2.6-11.4 4.8-12 12-.6-7.2-4.8-11.4-12-12 7.2-.6 11.4-4.8 12-12z" />
    </svg>
  );
}

const STAR_COLORS = ['text-sky-300', 'text-sky-200', 'text-white', 'text-sky-200', 'text-cyan-200'];

/* Posiciones del campo de estrellas */
const STARS = Array.from({ length: 38 }).map((_, i) => ({
  left: (i * 137 + 29) % 100,
  top: (i * 89 + 53) % 100,
  size: 6 + ((i * 31) % 6) * 2.5,
  dur: 3 + ((i * 7) % 6) * 0.9,
  delay: -(i * 0.55),
  color: STAR_COLORS[i % STAR_COLORS.length],
}));

function StarField({ count = STARS.length, className = '', density = 1, colors = STAR_COLORS }: { count?: number; className?: string; density?: number; colors?: string[] }) {
  const stars = count >= STARS.length ? STARS : STARS.slice(0, count);
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {stars.map((s, i) => (
        <Star
          key={i}
          className={`animate-twinkle absolute ${colors[i % colors.length]}`}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size * density}px`,
            height: `${s.size * density}px`,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Estrellas fugaces que cruzan el cielo ── */
const SHOOTING_STARS = Array.from({ length: 3 }).map((_, i) => ({
  top: 10 + ((i * 23) % 45),
  left: 10 + ((i * 37) % 55),
  x: 280 + (i % 2) * 160,
  y: -(150 + (i % 3) * 70),
  dur: 6.5 + i * 1.8,
  delay: -((i % 3) * 4.5),
}));

function ShootingStars() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
      {SHOOTING_STARS.map((s, i) => (
        <span
          key={i}
          className="animate-shoot absolute h-px w-24 rounded-full bg-gradient-to-r from-transparent via-sky-200 to-white sm:w-28"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            ['--shoot-x' as string]: `${s.x}px`,
            ['--shoot-y' as string]: `${s.y}px`,
            ['--shoot-dur' as string]: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
            boxShadow: '0 0 10px rgba(136,192,255,0.9), 0 0 3px rgba(255,255,255,0.9)',
          }}
        />
      ))}
    </div>
  );
}

function SectionHeading({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mb-5 text-center sm:mb-8">
      <p className="animate-gradient-x inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 via-indigo-600 to-cyan-500 bg-clip-text text-[10px] font-semibold uppercase tracking-[0.3em] text-transparent sm:text-xs sm:tracking-[0.35em]">
        <span className="hidden h-2.5 w-2.5 sm:block">
          <Star className="h-full w-full animate-twinkle text-sky-500" style={{ animationDuration: '3.4s', filter: 'drop-shadow(0 0 4px currentColor)' }} />
        </span>
        {kicker}
        <span className="hidden h-2.5 w-2.5 sm:block">
          <Star className="h-full w-full animate-twinkle text-sky-500" style={{ animationDuration: '2.7s', filter: 'drop-shadow(0 0 4px currentColor)' }} />
        </span>
      </p>
      <h2 className="mt-1 text-xl font-light tracking-wide font-display sm:mt-2 sm:text-2xl md:text-3xl text-slate-800">{title}</h2>
      {sub && <p className="mx-auto mt-2 max-w-xl text-xs font-normal text-slate-500 leading-relaxed sm:mt-3 sm:max-w-2xl sm:text-sm">{sub}</p>}
      <div className="relative mx-auto mt-3 h-px w-12 bg-gradient-to-r from-transparent via-sky-500/60 to-transparent sm:mt-4 sm:w-20">
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Star className="h-2.5 w-2.5 animate-twinkle text-sky-500" style={{ animationDuration: '3s' }} />
        </span>
      </div>
    </div>
  );
}

/* ─────────────── FILTROS POR CARACTERÍSTICA ─────────────── */

function FilterGroup({
  title, options, selected, onToggle, onClear, resultCount,
  singularNoun = 'plan', pluralNoun = 'planes',
  sticky = false,
  orientation = 'horizontal',
}: {
  title: string;
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
  resultCount?: number;
  singularNoun?: string;
  pluralNoun?: string;
  sticky?: boolean;
  orientation?: 'horizontal' | 'sidebar';
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    el.addEventListener('scroll', checkScroll, { passive: true });
    return () => { ro.disconnect(); el.removeEventListener('scroll', checkScroll); };
  }, [checkScroll, options.length]);

  if (options.length === 0) return null;

  return (
    <div className={`${sticky && orientation !== 'sidebar' ? 'sticky top-4 z-40' : ''} mb-6 ${orientation === 'sidebar' ? 'lg:mb-0' : 'sm:mb-10'}`}>
      <div className={`${sticky && orientation !== 'sidebar' ? 'rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-md shadow-lg shadow-slate-900/5' : 'rounded-2xl bg-white p-1.5 shadow-md shadow-slate-900/5 border border-slate-200/80'}`}>
        <div className={`mx-auto max-w-5xl ${orientation === 'sidebar' ? 'lg:px-0 lg:py-0' : ''} px-3 py-3 sm:px-5`}>
          {/* Fila: título + badge contador + limpiar */}
          <div className="flex items-center justify-between gap-3 mb-3 pl-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-800 truncate">{title}</span>
              {resultCount !== undefined && selected.length > 0 && (
                <span className="flex-shrink-0 inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-1.5 text-[10px] font-bold text-white tabular-nums shadow-sm">
                  {resultCount}
                </span>
              )}
            </div>
            {selected.length > 0 && (
              <button
                onClick={onClear}
                className="flex-shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Chips horizontales con scroll */}
          <div className="relative">
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none rounded-l-xl" />
            )}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none rounded-r-xl" />
            )}

            <div
              ref={scrollRef}
              className={`no-scrollbar flex gap-2 ${orientation === 'sidebar' ? 'lg:flex-col lg:gap-2' : ''} overflow-x-auto scroll-smooth pb-1 pt-1 px-1`}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {options.map((opt) => {
                const active = selected.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => onToggle(opt.id)}
                    aria-pressed={active}
                    className="flex-shrink-0 group"
                  >
                    <span className={`flex items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wide transition-all duration-300 select-none ${orientation === 'sidebar' ? 'lg:w-full lg:px-4 lg:py-3 lg:text-sm' : 'whitespace-nowrap'} ${
                      active
                        ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md shadow-sky-500/30 scale-[1.02] lg:scale-100'
                        : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200/80 hover:bg-white hover:text-sky-700 hover:ring-sky-300 hover:shadow-sm'
                    }`}>
                      {opt.label}
                      {active && (
                        <svg className="h-3.5 w-3.5 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── REVELAR AL HACER SCROLL ─────────────── */

function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;

    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setShown(true); io.disconnect(); }
      },
      { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return (
    <div
      ref={ref}
      className={className}
      suppressHydrationWarning
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(28px)',
        transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────── GRUPOS ESCALONADOS AL HACER SCROLL ─────────────── */

function StaggerGroup({ children, delay = 70, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setShown(true); io.disconnect(); }
      },
      { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return (
    <div ref={ref} className={className} suppressHydrationWarning>
      {Children.map(children, (child, i) => (
        <div
          key={i}
          style={{
            opacity: shown ? 1 : 0,
            transform: shown ? 'none' : 'translateY(30px) scale(0.97)',
            transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            transitionDelay: shown ? `${i * delay}ms` : '0ms',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

/* ─────────────── PALABRA ROTATIVA DEL H1 ─────────────── */

const HERO_WORDS = ['catálogo que enamora', 'menú digital con carrito', 'carta QR que vende solo'];

function RotatingText({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % words.length), 3600);
    return () => clearInterval(t);
  }, [words.length]);
  return (
    <span className="relative inline-block min-h-[1.25em] align-baseline">
      <span
        key={i}
        className="animate-gradient-x animate-word-in inline-block bg-gradient-to-r from-sky-300 via-sky-200 to-cyan-200 bg-clip-text font-bold text-transparent"
      >
        {words[i]}
      </span>
    </span>
  );
}

/* ─────────────── BARRA DE PROGRESO DEL SCROLL ─────────────── */

function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    let h = document.documentElement.scrollHeight - window.innerHeight;
    
    const onResize = () => {
      h = document.documentElement.scrollHeight - window.innerHeight;
    };
    
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        if (ref.current) {
          const p = h > 0 ? Math.min(1, window.scrollY / h) : 0;
          ref.current.style.transform = `scaleX(${p})`;
        }
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed left-0 top-0 z-[80] h-[3px] w-full">
      <div
        ref={ref}
        className="h-full origin-left bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.8)] transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(0)` }}
      />
    </div>
  );
}

/* ─────────────── BOTÓN FLOTANTE DE WHATSAPP ─────────────── */

function WhatsAppFloat({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-5 left-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-500 text-2xl shadow-lg shadow-black/40 transition-transform hover:scale-110 active:scale-95 animate-fade-in-up"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/40" />
      <span className="relative">💬</span>
    </a>
  );
}

/* ─────────────── DECORACIÓN FLOTANTE DE CONTENIDO ─────────────── */

const FLOATERS = [
  { e: '🍽️', l: '3%', t: '6%', s: '1.7rem', dur: 9, d: '0s' },
  { e: '🛵', l: '93%', t: '14%', s: '2.1rem', dur: 11, d: '-2s' },
  { e: '📦', l: '2%', t: '58%', s: '1.9rem', dur: 10, d: '-4s' },
  { e: '🧾', l: '95%', t: '70%', s: '1.6rem', dur: 12, d: '-1s' },
  { e: '🛍️', l: '46%', t: '86%', s: '1.8rem', dur: 9.5, d: '-5s' },
];

/* ─────────────── INCLINACIÓN 3D AL MOUSE ─────────────── */

function TiltCard({ children, className = '', max = 10 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1100px) rotateY(${(x * max).toFixed(2)}deg) rotateX(${(-y * max).toFixed(2)}deg) scale(1.02)`;
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = '';
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1) , box-shadow 0.28s ease', willChange: 'transform', transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}

/* ─────────────── CONFETI (jugable) ─────────────── */

function ConfettiBurst() {
  const COLORS = ['#f59e0b', '#d4a574', '#fbbf24', '#e8d5b7', '#c9a96e'];
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[2.5rem]">
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const dist = 46 + ((i * 37) % 64);
        return (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 h-2.5 w-2.5 animate-confetti rounded-full"
            style={{
              backgroundColor: COLORS[i % COLORS.length],
              ['--dx' as string]: `${(Math.cos(angle) * dist).toFixed(0)}px`,
              ['--dy' as string]: `${(Math.sin(angle) * dist - 26).toFixed(0)}px`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ─────────────── COLLAPSIBLE INFO ─────────────── */

function CollapsibleInfo({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  
  if (!open) {
    return (
      <div className="mt-4 flex flex-col items-center pb-10">
        <button 
          onClick={() => setOpen(true)} 
          className="group flex flex-col items-center gap-2 rounded-2xl bg-white px-8 py-5 text-sm font-bold uppercase tracking-[0.15em] text-slate-700 shadow-md shadow-slate-900/5 ring-1 ring-slate-200 transition-all hover:bg-sky-50 hover:text-sky-700 hover:ring-sky-300 hover:shadow-lg sm:px-12 sm:text-base"
        >
          <span>Conoce el proceso y detalles</span>
          <svg className="h-5 w-5 animate-bounce text-sky-400 group-hover:text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-12 sm:space-y-16 animate-fade-in-up">
      {children}
      <div className="flex justify-center pb-12 pt-4">
        <button 
          onClick={() => { setOpen(false); document.getElementById('info-extra')?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }} 
          className="flex items-center gap-2 rounded-full bg-slate-100 px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
          Ocultar detalles
        </button>
      </div>
    </div>
  );
}

/* ─────────────── TELÉFONO DEMO INTERACTIVO ─────────────── */

type HeroDemo = { id: string; name: string; tag: string; img: string; demoUrl: string | null };

function PhoneDemo({ demos, catalogSlug }: { demos: HeroDemo[]; catalogSlug: string }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || demos.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % demos.length), 3800);
    return () => clearInterval(t);
  }, [paused, demos.length]);

  const d = demos[i % demos.length];
  if (!d) return null;

  const next = () => setI((p) => (p + 1) % demos.length);

  return (
    <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[380px] lg:max-w-[400px] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="absolute inset-0 animate-glow-pulse scale-90 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.15)_0%,transparent_70%)] will-change-transform" />
      <div className="absolute inset-0 scale-90 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.15)_0%,transparent_70%)] animate-blob will-change-transform" />

      {/* Aviso "tócalo" — arriba en desktop, abajo en mobile para no cortar */}
      <div className="hidden sm:block absolute -top-10 left-1/2 z-20 -translate-x-1/2 animate-wiggle">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/40 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-sky-200 shadow-xl backdrop-blur-md">
          👆 Toca el celular <span className="animate-bounce-x">→</span>
        </span>
      </div>

      <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onClick={next}>
        <TiltCard className="relative cursor-pointer" max={9}>
          <div className="relative animate-float-slow rounded-[2.7rem] border border-white/25 bg-slate-900/45 p-3 shadow-[0_50px_100px_-24px_rgba(0,0,0,0.8)]">
            <div className="relative overflow-hidden rounded-[2.2rem] bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset(d.img)}
                alt={`Vista previa de ${d.name}`}
                className="h-auto w-full transition-opacity duration-500 ease-in-out"
              />
              <div className="absolute left-1/2 top-2 h-5 w-28 -translate-x-1/2 rounded-full bg-black/90" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-14">
                <p className="text-sm font-black text-white">{d.name}</p>
                <p className="text-xs font-medium text-white/70">Toca para ver el siguiente →</p>
              </div>
            </div>
          </div>
        </TiltCard>
      </div>

      {/* Puntos de navegación */}
      <div className="absolute -bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {demos.map((dm, idx) => (
          <button
            key={dm.id}
            onClick={(e) => { e.stopPropagation(); setI(idx); }}
            aria-label={`Ver ${dm.name}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              idx === i ? 'w-7 bg-gradient-to-r from-sky-300 to-cyan-400' : 'w-2.5 bg-slate-300/40 hover:bg-slate-300/70'
            }`}
          />
        ))}
      </div>

      {/* Tarjeta flotante derecha — solo desktop */}
      <div className="hidden sm:block absolute -right-3 top-1/3 z-20 animate-float rounded-2xl border border-white/30 bg-slate-900/60 px-4 py-3 shadow-2xl" style={{ animationDelay: '1.8s' }}>
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-sky-500">{d.tag || 'Demo en vivo'}</p>
        <p className="text-sm font-black text-white">{d.name}</p>
        {d.demoUrl ? (
          <a
            href={`${BASE_PATH}${d.demoUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-[11px] font-black text-sky-300 hover:text-sky-200"
            onClick={(e) => e.stopPropagation()}
          >
            Probar en vivo →
          </a>
        ) : (
          <p className="mt-1 text-[11px] font-bold text-white/60">Ver características abajo ↓</p>
        )}
      </div>

      {/* Tarjeta flotante izquierda — solo desktop */}
      <div className="hidden sm:block absolute -left-4 top-10 z-20 animate-float rounded-2xl border border-white/30 bg-slate-900/60 px-4 py-3 shadow-2xl" style={{ animationDelay: '0.9s' }}>
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-sky-500">Pedido recibido</p>
        <p className="text-sm font-black text-white">✅ Directo a tu WhatsApp</p>
      </div>

      {/* Badge "tócalo" en mobile — debajo del teléfono */}
      <div className="mt-8 flex justify-center sm:hidden">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/55 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-sky-200 shadow-xl">
          👆 Toca para ver el siguiente
        </span>
      </div>
    </div>
  );
}

/* ─────────────────── TARJETA DE PLAN (PRINCIPAL) ─────────────────── */

function PremiumServiceCard({ product, catalogSlug }: { product: Product; catalogSlug: string }) {
  const add = useCart((state) => state.add);
  const [added, setAdded] = useState(false);
  const [spot, setSpot] = useState<{ x: number; y: number } | null>(null);
  const [bursting, setBursting] = useState(false);
  const rafRef = useRef<number | null>(null);

  const handleAdd = () => {
    add(catalogSlug, product);
    setAdded(true);
    setBursting(true);
    setTimeout(() => setAdded(false), 1400);
    setTimeout(() => setBursting(false), 1000);
  };

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const next = { x: e.clientX - r.left, y: e.clientY - r.top };
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      setSpot(next);
      rafRef.current = null;
    });
  };

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const isPopular = !!product.badge && product.badge.toLowerCase().includes('vendido');
  const mockupType = product.id.includes('basico') ? 'lista' : product.id.includes('pro') ? 'libro' : 'admin';
  const mockupImageSrc = `/img/mockup-${mockupType}.webp`;

  return (
    <div
      id={`plan-${product.id}`}
      onMouseMove={onMove}
      onMouseLeave={() => setSpot(null)}
      className={`group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-2 sm:rounded-[2.5rem] lg:rounded-[2.5rem] ${
        isPopular
          ? 'bg-white border-2 border-sky-300 shadow-[0_20px_40px_-12px_rgba(56,189,248,0.3)] sm:border-sky-300 sm:shadow-[0_30px_60px_-15px_rgba(56,189,248,0.35)] sm:scale-[1.02] sm:z-10'
          : 'bg-white border border-slate-200/80 shadow-[0_8px_30px_-10px_rgb(2,6,23,0.18)] hover:shadow-[0_20px_50px_-15px_rgb(2,6,23,0.3)]'
      }`}>

      {spot && (
        <div
          className="pointer-events-none absolute inset-0 z-[5] transition-opacity duration-300 rounded-2xl sm:rounded-[2.5rem]"
          style={{
            background: `radial-gradient(400px circle at ${spot.x}px ${spot.y}px, rgba(56,189,248,0.08), transparent 40%)`,
          }}
        />
      )}

      {!isPopular && (
        <div className="shine pointer-events-none absolute inset-0 z-[2] overflow-hidden rounded-2xl sm:rounded-[2.5rem]" />
      )}

      {bursting && <ConfettiBurst />}

      {isPopular && (
        <>
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(186,230,253,0.4)_0%,transparent_70%)] animate-glow-pulse sm:h-64 sm:w-64" />
          <div className="shine-sky-top pointer-events-none absolute inset-0 z-[2] overflow-hidden rounded-2xl sm:rounded-[2.5rem]" />
        </>
      )}

      {/* Header de la tarjeta */}
      <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-sky-500 via-sky-400 to-cyan-400 flex items-center justify-center border-b border-sky-200/60 sm:h-52">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.45),rgba(255,255,255,0))] transition-opacity duration-500 group-hover:opacity-50" />
        <span className="absolute left-3 top-3 sm:left-4 sm:top-4">
          <Star className="h-2.5 w-2.5 animate-twinkle text-sky-200" style={{ animationDuration: '3.6s' }} />
        </span>
        <span className="absolute right-3 top-3 sm:right-4 sm:top-4">
          <Star className="h-3 w-3 animate-twinkle text-white" style={{ animationDuration: '2.7s' }} />
        </span>
        <Star
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-white/40"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mockupImageSrc}
          alt={`Demo ${product.name}`}
          className="relative z-10 h-[82%] w-auto object-contain drop-shadow-lg transition-all duration-500 group-hover:scale-105 sm:h-[95%] sm:drop-shadow-2xl sm:group-hover:scale-[1.08]"
        />
      </div>

      <div className="flex flex-col flex-1 p-3 sm:p-5 relative z-10">
        <div className="flex justify-between items-start gap-2 sm:gap-4">
          <h3 className="text-lg font-light tracking-wide font-display leading-tight text-slate-800 sm:text-2xl">{product.name}</h3>
          {product.badge && (
            <span className="flex-shrink-0 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white shadow-lg shadow-sky-500/25 sm:px-3 sm:py-1 sm:text-[10px] sm:tracking-[0.2em]">
              {product.badge}
            </span>
          )}
        </div>

        {/* Precio - más prominente */}
        <div className="mt-3 flex items-baseline gap-1.5 sm:mt-2 sm:gap-2">
          <span className="text-3xl font-light tracking-tight text-slate-800 sm:text-4xl font-display">
            ${product.price.toFixed(0)}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 sm:text-xs">USD · Pago Único</span>
        </div>

        {product.deliveryDays && (
          <p className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-sky-50 border border-sky-200 px-2 py-0.5 text-[10px] font-semibold text-sky-600 sm:mt-2 sm:gap-1.5 sm:px-3 sm:py-1 sm:text-xs">
            ⏱ {product.deliveryDays}
          </p>
        )}

        {/* Features - compactas en mobile */}
        <ul className="mt-2 mb-3 flex flex-1 flex-col gap-1.5 sm:mt-4 sm:mb-5 sm:gap-2">
          {product.description.split(/\.\s+/).filter(Boolean).slice(0, 4).map((line, i) => (
            <li key={i} className="flex items-start gap-2 text-xs font-normal leading-relaxed text-slate-600 sm:gap-3 sm:text-sm">
              <div className="mt-0.5 flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full bg-sky-50 border border-sky-200 text-[8px] font-bold text-sky-600 sm:h-4 sm:w-4 sm:text-[9px]">
                ✓
              </div>
              <span>{line.replace(/\.$/, '')}</span>
            </li>
          ))}
        </ul>

        {/* CTAs - más grandes para touch */}
        <div className="mt-auto flex flex-col gap-2 relative z-10 pt-2">
          {/* Acción Principal */}
          <button
            onClick={handleAdd}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-xs font-bold uppercase tracking-widest transition-all active:scale-[0.98] sm:py-4 sm:text-sm ${
              added
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                : isPopular
                  ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.02]'
                  : 'bg-slate-800 text-white hover:bg-slate-700 shadow-md shadow-slate-800/15'
            }`}
          >
            {added ? '✅ ¡Añadido!' : '🛒 Comprar Ahora'}
          </button>
          
          {/* Acciones Secundarias */}
          {product.demoUrl && (
            <a
              href={`${BASE_PATH}${product.demoUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-100 bg-sky-50/50 px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-sky-700 transition-colors hover:bg-sky-100 hover:border-sky-200 sm:text-xs"
            >
              <span>👀</span> Probar Demostración
            </a>
          )}
          {product.id === 'plan-admin' && (
            <a
              href={`${BASE_PATH}/admin`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-50 sm:text-xs"
            >
              <span>⚙️</span> Probar Panel Admin
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── TARJETA DE SERVICIO ADICIONAL ─────────────── */

function AddonServiceCard({ product, catalogSlug }: { product: Product; catalogSlug: string }) {
  const add = useCart((state) => state.add);
  const [added, setAdded] = useState(false);
  const [bursting, setBursting] = useState(false);

  const handleAdd = () => {
    add(catalogSlug, product);
    setAdded(true);
    setBursting(true);
    setTimeout(() => setAdded(false), 1200);
    setTimeout(() => setBursting(false), 1000);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white p-5 shadow-sm shadow-slate-900/5 border border-slate-200/80 transition-all duration-500 hover:border-sky-400 hover:shadow-xl hover:shadow-sky-900/10 hover:-translate-y-1 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
      {bursting && <ConfettiBurst />}
      <div className="flex-1 relative z-10">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-300 text-white shadow-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          </div>
          <h4 className="text-base font-bold text-slate-800 sm:text-lg">{product.name}</h4>
          {product.badge && (
            <span className="rounded-full bg-gradient-to-r from-slate-800 to-slate-700 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-sky-200 shadow-sm sm:text-[10px]">
              {product.badge}
            </span>
          )}
        </div>
        <p className="mt-3 text-xs font-medium text-slate-500 leading-relaxed sm:text-sm pl-11">{product.description}</p>
      </div>
      <div className="relative z-10 text-left flex items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100 sm:text-right sm:flex-col sm:items-end sm:gap-3 sm:border-l sm:border-slate-100 sm:pl-6 sm:pt-0 sm:mt-0 sm:border-t-0">
        <div className="flex flex-col items-start sm:items-end">
          <span className="text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">${product.price.toFixed(0)}</span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">USD</span>
        </div>
        <button
          onClick={handleAdd}
          className={`rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-md ${
            added ? 'bg-teal-500 text-white shadow-teal-500/30' : 'bg-sky-500 text-white hover:bg-sky-400 hover:shadow-sky-500/30 hover:-translate-y-0.5'
          }`}
        >
          {added ? '✓ Añadido' : 'Agregar'}
        </button>
      </div>
    </div>
  );
}

/* ─────────────── RECOMENDADOR INTERACTIVO ─────────────── */

type QuizOption = { label: string; scores: Record<string, number> };

const QUIZ: { question: string; options: QuizOption[] }[] = [
  {
    question: '¿Qué tan seguido cambiarás precios o tu menú?',
    options: [
      { label: 'Casi nunca', scores: {} },
      { label: 'De vez en cuando', scores: { 'plan-pro': 1 } },
      { label: 'Seguido, cada semana', scores: { 'plan-admin': 2 } },
    ],
  },
  {
    question: '¿Entregas a domicilio y quieres calcular el costo del envío?',
    options: [
      { label: 'Sí, quiero el mapa de envío', scores: { 'plan-pro': 1 } },
      { label: 'No, solo para pedir', scores: {} },
    ],
  },
  {
    question: '¿Quieres que tus clientes lo tengan como App en su celular?',
    options: [
      { label: '¡Sí, me encanta!', scores: { 'plan-pro': 1 } },
      { label: 'No es necesario', scores: {} },
    ],
  },
  {
    question: '¿Qué prefieres para empezar?',
    options: [
      { label: 'Lo más económico posible', scores: { 'plan-basico': 1 } },
      { label: 'La mejor experiencia, sin pensarlo', scores: { 'plan-admin': 1 } },
    ],
  },
];

const RECO_PRIORITY = ['plan-admin', 'plan-pro', 'plan-basico'];

function PlanRecommender({ plans, catalogSlug }: { plans: Product[]; catalogSlug: string }) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [recommendedId, setRecommendedId] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const add = useCart((state) => state.add);

  const total = QUIZ.length;
  const isDone = recommendedId !== null;

  const pick = (option: QuizOption) => {
    const merged = { ...scores };
    for (const [id, pts] of Object.entries(option.scores)) merged[id] = (merged[id] ?? 0) + pts;
    if (step + 1 < total) {
      setScores(merged);
      setStep(step + 1);
    } else {
      const winner = RECO_PRIORITY.slice().sort((a, b) => (merged[b] ?? 0) - (merged[a] ?? 0))[0];
      setScores(merged);
      setRecommendedId(winner);
    }
  };

  const restart = () => { setStep(0); setScores({}); setRecommendedId(null); setAdded(false); };

  const recommended = isDone ? plans.find((p) => p.id === recommendedId) : null;
  const why: Record<string, string> = {
    'plan-basico': 'Perfecto para empezar sin gastar de más: carrito, WhatsApp y pago único.',
    'plan-pro': 'El equilibrio ideal: páginas 3D, mapa de envío y App instalable. Es el más elegido.',
    'plan-admin': 'Para quien quiere control total: editas precios y fotos tú mismo desde tu celular.',
  };

  if (isDone && recommended) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl shadow-slate-900/10 animate-fade-in-up">
        <div className="text-4xl">🎉</div>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">Nuestra recomendación</p>
        <h3 className="mt-2 text-2xl font-light tracking-wide font-display text-slate-800">{recommended.name}</h3>
        <p className="mt-2 font-normal leading-relaxed text-slate-600">{why[recommended.id]}</p>
        <div className="mt-4 flex items-baseline justify-center gap-2">
          <span className="text-3xl font-light tracking-tight text-sky-600 font-display">${recommended.price.toFixed(0)}</span>
          <span className="text-sm font-semibold uppercase tracking-widest text-slate-500">pago único</span>
        </div>
        <div className="mt-5 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => { add(catalogSlug, recommended); setAdded(true); setTimeout(() => setAdded(false), 1400); }}
            className={`rounded-2xl px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-all active:scale-95 ${
              added ? 'bg-sky-500 text-white' : 'bg-gradient-to-r from-sky-400 to-cyan-300 text-slate-950 hover:from-sky-300 hover:to-cyan-200 shadow-xl shadow-sky-500/20'
            }`}
          >
            {added ? '✅ ¡Añadido al carrito!' : '🛒 Añadir este plan'}
          </button>
          <button onClick={() => goTo('planes')} className="rounded-2xl border border-slate-200 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-slate-600 transition-colors hover:border-sky-300 hover:text-sky-600">
            Ver todos los planes
          </button>
          <button onClick={restart} className="rounded-2xl px-4 py-3 text-xs font-normal text-slate-500 transition-colors hover:text-slate-700">
            ↺ Repetir
          </button>
        </div>
      </div>
    );
  }

  const current = QUIZ[step];

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/10">
      {/* Progreso */}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-500 transition-all duration-500" style={{ width: `${((step + 1) / total) * 100}%` }} />
        </div>
        <span className="text-xs font-semibold text-slate-500">{step + 1}/{total}</span>
      </div>

      <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">¿No sabes cuál elegir?</p>
      <h3 className="mt-2 text-center text-xl font-light tracking-wide font-display text-slate-800">{current.question}</h3>

      <div className="mt-5 flex flex-col gap-2">
        {current.options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => pick(opt)}
            className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left font-normal text-slate-700 transition-all duration-300 hover:border-sky-300 hover:bg-sky-50 hover:shadow-md active:scale-[0.98]"
          >
            <span>{opt.label}</span>
            <span className="text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-sky-500">→</span>
          </button>
        ))}
      </div>

      <button onClick={restart} className="mt-5 w-full text-center text-xs font-normal text-slate-500 transition-colors hover:text-slate-700">
        ↺ Empezar de nuevo
      </button>
    </div>
  );
}

/* ─────────────── TABLA COMPARATIVA INTERACTIVA ─────────────── */

function ComparisonTable({ catalog }: { catalog: Catalog }) {
  const plans = catalog.sections.find((s) => /modelo|plan/i.test(s.name))?.products ?? catalog.sections[0]?.products ?? [];
  const rows = catalog.comparison ?? [];
  const add = useCart((state) => state.add);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const selected = plans.find((p) => p.id === selectedId) ?? null;
  const isIncluded = (row: { includedIn: string[] }, planId: string) => row.includedIn.includes(planId);

  const handleAdd = (plan: Product) => {
    add(catalog.slug, plan);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="min-w-[580px] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 sm:rounded-2xl sm:p-4">
        {/* Cabecera con los planes */}
        <div className="grid grid-cols-[1.1fr_repeat(3,1fr)] gap-2">
          <div className="flex items-center px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Qué incluye</div>
          {plans.map((plan) => {
            const active = selectedId === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedId(active ? null : plan.id)}
                className={`flex flex-col items-center gap-1 rounded-2xl border px-3 py-4 text-center transition-all duration-300 active:scale-95 ${
                  active
                    ? 'border-sky-400/70 bg-gradient-to-b from-sky-50 to-cyan-50 shadow-md shadow-sky-500/10 scale-[1.02]'
                    : 'border-slate-200 bg-slate-50 hover:border-sky-300 hover:shadow-md'
                }`}
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">{plan.name}</span>
                {plan.badge && (
                  <span className="rounded-full bg-gradient-to-r from-sky-400 to-cyan-400 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-950">
                    {plan.badge}
                  </span>
                )}
                <span className="text-lg font-light text-sky-600 font-display">${plan.price.toFixed(0)}</span>
              </button>
            );
          })}
        </div>

        {/* Filas de características */}
        <div className="mt-3 flex flex-col gap-2">
          {rows.map((row, i) => (
            <div key={i}>
              <div className={`grid grid-cols-[1.1fr_repeat(3,1fr)] items-center gap-2 rounded-2xl px-3 py-2.5 transition-colors ${i % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'}`}>
                <span className="px-1 text-sm font-normal text-slate-700">{row.feature}</span>
                {plans.map((plan) => (
                  <span key={plan.id} className={`text-center ${isIncluded(row, plan.id) ? 'text-sky-600' : 'text-slate-300'}`}>
                    {isIncluded(row, plan.id) ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-50 border border-sky-200 text-xs font-semibold text-sky-600">✓</span>
                    ) : (
                      <span className="text-sm font-normal">—</span>
                    )}
                  </span>
                ))}
              </div>
              {row.note && (
                <p className="px-4 py-1.5 text-xs font-normal italic text-slate-400">💡 {row.note}</p>
              )}
            </div>
          ))}
        </div>

        {/* Barra de resumen al seleccionar un plan */}
        <div className="mt-4 flex min-h-[4.5rem] items-center justify-between gap-3 rounded-2xl border border-sky-300 bg-gradient-to-r from-sky-100 to-cyan-100 px-5 py-3 transition-all">
          {selected ? (
            <>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">✓ Has elegido</p>
                <p className="font-semibold text-slate-800">{selected.name} · ${selected.price.toFixed(0)} {selected.deliveryDays && `· ${selected.deliveryDays}`}</p>
              </div>
              <button
                onClick={() => handleAdd(selected)}
                className={`flex-shrink-0 rounded-xl px-5 py-2.5 text-xs font-semibold uppercase tracking-widest transition-all active:scale-95 ${
                  added ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'bg-gradient-to-r from-sky-400 to-cyan-300 text-slate-950 hover:from-sky-300 hover:to-cyan-200 shadow-lg shadow-sky-500/20'
                }`}
              >
                {added ? '✅ Añadido' : '🛒 Añadir'}
              </button>
            </>
          ) : (
            <p className="w-full text-center text-sm font-normal text-slate-500">
              👆 Toca una columna para ver qué incluye y añadirlo al carrito
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── FAQ (desde datos) ─────────────── */

function FaqSection({ catalog }: { catalog: Catalog }) {
  const [filter, setFilter] = useState('');
  const faq = (catalog.faq ?? []).filter((f) =>
    `${f.q} ${f.a}`.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <section id="faq" className="relative z-10 mx-auto max-w-4xl animate-fade-in-up scroll-mt-20 sm:scroll-mt-24" style={{ animationDelay: '0.8s' }}>
      <SectionHeading
        kicker="Sin letra pequeña"
        title="Preguntas Frecuentes"
        sub="Resolvemos tus dudas en lenguaje claro, sin términos informáticos."
      />

      <div className="relative mx-auto mb-4 max-w-xl sm:mb-6">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base sm:left-4 sm:text-lg">🔍</span>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Busca tu duda (ej: dominio, pago…)"
          className="w-full rounded-xl border border-slate-200 bg-white px-9 py-3 text-sm font-normal text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 sm:rounded-2xl sm:px-11 sm:py-3.5"
        />
      </div>

      {faq.length === 0 ? (
        <p className="text-center font-normal text-slate-500">No encontramos esa pregunta. ¡Escríbenos por WhatsApp!</p>
      ) : (
        <div className="flex flex-col gap-2 sm:gap-3">
          {faq.map((f) => (
            <details key={f.q} name="faq" className="group rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:shadow-md hover:border-sky-200 sm:rounded-2xl sm:p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-normal text-slate-800 outline-none sm:gap-4 sm:text-lg">
                <span>{f.q}</span>
                <span className="flex-shrink-0 text-xl font-light text-sky-500 transition-transform duration-300 group-open:rotate-180 sm:text-2xl">↓</span>
              </summary>
              <p className="faq-answer mt-3 text-sm font-normal leading-relaxed text-slate-600 sm:mt-4">{f.a}</p>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}

/* ─────────────── NAV STICKY ─────────────── */

const NAV_LINKS = [
  { id: 'planes', label: 'Planes' },
  { id: 'recomendador', label: '¿Cuál me conviene?' },
  { id: 'comparar', label: 'Comparar' },
  { id: 'entregar', label: 'Qué necesitas' },
  { id: 'proceso', label: 'Proceso' },
  { id: 'pagos', label: 'Pagos y garantía' },
  { id: 'faq', label: 'FAQ' },
];

function StickyNav() {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState<string | undefined>('planes');

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setVisible(window.scrollY > 560);
      const probe = window.innerHeight * 0.32;
      let current: string | undefined;
      for (const l of NAV_LINKS) {
        const el = document.getElementById(l.id);
        if (el && el.getBoundingClientRect().top <= probe) current = l.id;
      }
      setActive(current ?? NAV_LINKS[0].id);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <nav className={`fixed left-1/2 top-4 z-40 -translate-x-1/2 transition-all duration-500 ${visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-6 opacity-0'}`}>
      <div className="flex max-w-[95vw] items-center gap-1 overflow-x-auto rounded-full border border-slate-700/50 bg-slate-900/95 px-2 py-1.5 shadow-xl shadow-black/30">
        {NAV_LINKS.map((l) => (
          <button
            key={l.id}
            onClick={() => goTo(l.id)}
            className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              active === l.id
                ? 'bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

/* ─────────────── CTA FINAL ─────────────── */

function FinalCta({ catalog }: { catalog: Catalog }) {
  const wa = `https://wa.me/${catalog.phone}?text=${encodeURIComponent('Hola, tengo una duda sobre los catálogos digitales.')}`;
  return (
    <section id="contacto" className="relative z-10 mx-auto max-w-4xl animate-fade-in-up scroll-mt-24 sm:scroll-mt-28" style={{ animationDelay: '0.9s' }}>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 via-blue-950 to-indigo-950 p-5 text-center shadow-2xl shadow-black/40 sm:rounded-3xl sm:p-8 md:p-10 border border-white/10">
        <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.15)_0%,transparent_70%)] sm:-left-16 sm:-top-16 sm:h-56 sm:w-56" />
        <div className="absolute -bottom-16 -right-12 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.12)_0%,transparent_70%)] sm:-bottom-20 sm:-right-16 sm:h-64 sm:w-64" />
        <p className="relative text-[10px] font-bold uppercase tracking-[0.25em] text-sky-300 sm:text-xs sm:tracking-[0.3em]">Empecemos hoy</p>
        <h2 className="relative mt-2 text-xl font-light tracking-wide sm:mt-3 sm:text-3xl md:text-4xl text-white" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>¿Listo para tener tu catálogo digital?</h2>
        <p className="relative mx-auto mt-3 max-w-lg text-sm font-medium leading-relaxed text-slate-300 sm:mt-4 sm:max-w-xl sm:text-base">
          Si ya lo tienes claro, añade tu plan al carrito. Y si te queda una duda, escríbenos.
        </p>
        <div className="relative mt-5 flex flex-col items-center justify-center gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-slate-950 shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02] active:scale-95 sm:w-auto sm:rounded-2xl sm:px-8 sm:py-4 sm:text-sm sm:shadow-xl"
          >
            💬 Aún tengo una duda
          </a>
          <button
            onClick={() => goTo('planes')}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-white/80 transition-all hover:bg-white/10 hover:scale-[1.02] active:scale-95 sm:w-auto sm:rounded-2xl sm:px-8 sm:py-4 sm:text-sm"
          >
            🛒 Ir a los planes
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── PLANTILLA PRINCIPAL ─────────────── */

export function PremiumServicesTemplate({ catalog }: { catalog: Catalog }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const plans = catalog.sections.find((s) => /modelo|plan/i.test(s.name))?.products ?? catalog.sections[0]?.products ?? [];

  // ── Filtros por característica (desde la tabla comparativa) ──
  const [activeFeatures, setActiveFeatures] = useState<string[]>([]);
  const [activeAddonBadges, setActiveAddonBadges] = useState<string[]>([]);

  // Sólo mostramos en el filtro las features que diferencian planes.
  // Features que están en TODOS los planes se excluyen: marcarlas no cambiaría nada.
  const planFeatures = (catalog.comparison ?? []).filter((row) => {
    const isInSomePlan = row.includedIn.some((id) => plans.some((p) => p.id === id));
    const isInAllPlans = plans.length > 0 && plans.every((p) => row.includedIn.includes(p.id));
    return isInSomePlan && !isInAllPlans;
  });

  const visiblePlans = activeFeatures.length === 0
    ? plans
    : plans.filter((p) => activeFeatures.every((f) => {
        const row = planFeatures.find((r) => r.feature === f);
        return row ? row.includedIn.includes(p.id) : false;
      }));

  const addonSections = catalog.sections.filter((s) => /servicio|suscripcion/i.test(s.name));

  const FREQ_LABELS: Record<string, string> = {
    'monthly': 'Mensual',
    'yearly': 'Anual',
    'per-service': 'Por cambio',
    'one-time': 'Pago único',
  };

  const addonFrequencies = [...new Set(
    addonSections.flatMap((s) => s.products.map((p) => p.paymentFrequency).filter(Boolean) as string[])
  )];

  const visibleAddonSections = activeAddonBadges.length === 0
    ? addonSections
    : addonSections.map((s) => ({
        ...s,
        products: s.products.filter((p) => p.paymentFrequency && activeAddonBadges.includes(p.paymentFrequency)),
      })).filter((s) => s.products.length > 0);

  const toggleFeature = (f: string) =>
    setActiveFeatures((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  const toggleAddonBadge = (b: string) =>
    setActiveAddonBadges((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));

  const demoPath = plans[0]?.demoUrl ?? null;
  const waHref = `https://wa.me/${catalog.phone}?text=${encodeURIComponent('Hola, quiero un catálogo digital para mi negocio. 💛')}`;

  const heroDemos = plans.map((p) => ({
    id: p.id,
    name: p.name,
    tag: p.badge ?? 'Demo interactiva',
    img: `/img/mockup-${p.id.includes('basico') ? 'lista' : p.id.includes('pro') ? 'libro' : 'admin'}.webp`,
    demoUrl: p.demoUrl ?? null,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-white to-sky-50 text-slate-800 selection:bg-sky-500/20 font-sans overflow-hidden">
      <ScrollProgress />
      <StickyNav />

      {/* Orbes decorativos */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(186,230,253,0.15)_0%,transparent_70%)] rounded-full animate-blob will-change-transform" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(207,250,254,0.15)_0%,transparent_70%)] rounded-full animate-blob animation-delay-2000 will-change-transform" />
      <div className="absolute -bottom-32 left-20 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(199,210,254,0.15)_0%,transparent_70%)] rounded-full animate-blob animation-delay-4000 will-change-transform" />

      {/* ═══════════ HEADER ═══════════ */}
      <header className="relative z-10 overflow-hidden bg-gradient-to-b from-blue-900 via-blue-950 to-blue-950 text-white">
        {/* Fondo: auroras + rejilla + grano */}
        <div className="absolute inset-0">
          <div className="absolute -left-[12%] -top-[25%] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(2,132,199,0.15)_0%,transparent_70%)] animate-blob will-change-transform" />
          <div className="absolute right-[-10%] top-[5%] h-[540px] w-[540px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.12)_0%,transparent_70%)] animate-blob animation-delay-2000 will-change-transform" />
          <div className="absolute bottom-[-20%] left-[35%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.15)_0%,transparent_70%)] animate-blob animation-delay-4000 will-change-transform" />
          <div className="absolute left-[30%] top-[30%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.12)_0%,transparent_70%)] animate-blob animation-delay-2000 will-change-transform" />
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '76px 76px',
              maskImage: 'radial-gradient(ellipse 95% 85% at 50% 0%, #000 30%, transparent 78%)',
              WebkitMaskImage: 'radial-gradient(ellipse 95% 85% at 50% 0%, #000 30%, transparent 78%)',
            }}
          />
          {/* Estrellitas del cielo nocturno con deriva lenta */}
          <div className="absolute inset-0 z-[1] animate-star-drift">
            <StarField className="opacity-80" density={1.2} />
          </div>
          {/* Estrellas fugaces */}
          <ShootingStars />
          {/* Brasas ascendentes */}
          <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
            {EMBERS.map((e, i) => (
              <span
                key={i}
                className="absolute bottom-0 animate-ember rounded-full opacity-0"
                style={{
                  left: `${e.left}%`,
                  width: `${e.size}px`,
                  height: `${e.size}px`,
                  background: e.color,
                  boxShadow: `0 0 8px 2px ${e.color}55`,
                  animationDuration: `${e.dur}s`,
                  animationDelay: `${e.delay}s`,
                  opacity: 0,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-4 pb-4 sm:px-6 lg:pt-12 lg:pb-8">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-2 lg:gap-12">
            {/* ── Título (arriba en móvil, col 1 en desktop) ── */}
            <div className="w-full text-center lg:text-left animate-fade-in-up lg:col-start-1 lg:row-start-1 lg:self-end">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 shadow-sm sm:mb-7 sm:gap-2.5 sm:px-4 sm:py-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-80" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-300" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300 sm:text-[11px] sm:tracking-[0.25em]">{catalog.tagline}</span>
              </div>

              <h1 className="text-[2rem] font-light leading-[1.1] tracking-wide sm:text-5xl lg:text-[4rem] font-display text-white">
                Tu negocio convertido en un{' '}
                <RotatingText words={HERO_WORDS} />
              </h1>
            </div>

            {/* ── Columna mockup (teléfono interactivo en medio) ── */}
            <div className="w-full flex justify-center lg:col-start-2 lg:row-start-1 lg:row-span-2">
              <PhoneDemo demos={heroDemos} catalogSlug={catalog.slug} />
            </div>

            {/* ── Descripción y botones (abajo en móvil, col 1 en desktop) ── */}
            <div className="w-full text-center lg:text-left animate-fade-in-up lg:col-start-1 lg:row-start-2 lg:self-start">

              <p className="mx-auto mt-4 max-w-lg text-sm font-medium leading-relaxed text-slate-300 sm:mt-6 sm:max-w-xl sm:text-base lg:mx-0 lg:text-lg">
                {catalog.description} Con carrito de pedidos, envío por WhatsApp y panel para editar todo tú mismo. Listo en días, sin comisiones.
              </p>

              {/* CTAs */}
              <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                <button
                  onClick={() => goTo('planes')}
                  className="shine group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-slate-950 shadow-[0_20px_50px_-12px_rgba(56,189,248,0.5)] transition-all hover:scale-[1.03] active:scale-95 sm:rounded-2xl sm:px-7 sm:py-4 sm:text-sm"
                >
                  🛒 Ver planes y precios
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
                {demoPath && (
                  <a
                    href={`${BASE_PATH}${demoPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-sky-200 shadow-sm transition-all hover:bg-white/20 hover:scale-[1.02] active:scale-95 sm:rounded-2xl sm:px-6 sm:py-4 sm:text-sm"
                  >
                    👀 Probar una demo
                  </a>
                )}
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-sky-300 sm:py-4 sm:text-sm"
                >
                  💬 WhatsApp
                </a>
              </div>

              {/* Stats */}
              <div className="mt-6 grid max-w-lg grid-cols-3 gap-2 sm:mt-8 sm:max-w-xl sm:gap-3 lg:hidden">
                {[
                  { icon: '🚫', big: '0%', small: 'comisiones' },
                  { icon: '⏱', big: '2–7', small: 'días' },
                  { icon: '🛡', big: '6 meses', small: 'garantía' },
                ].map((s, i) => (
                  <div
                    key={s.small}
                    className={`animate-fade-in-up relative rounded-xl px-2 py-3 text-center transition-all sm:rounded-2xl sm:px-3 sm:py-4 ${
                      s.small === 'garantía'
                        ? 'border border-sky-400/25 bg-sky-400/10'
                        : 'border border-white/10 bg-white/5'
                    }`}
                    style={{ animationDelay: `${i * 0.12}s` }}
                  >
                    <div className="text-lg sm:text-xl">{s.icon}</div>
                    <div className={`mt-0.5 text-lg font-bold font-display sm:text-2xl ${s.small === 'garantía' ? 'text-sky-300' : 'text-sky-300'}`}>{s.big}</div>
                    <div className="text-[8px] font-bold uppercase tracking-widest text-slate-400 sm:text-[10px]">{s.small}</div>
                  </div>
                ))}
              </div>
              <div className="mt-8 hidden lg:grid max-w-xl grid-cols-3 gap-3">
                {[
                  { icon: '🚫', big: '0%', small: 'comisiones' },
                  { icon: '⏱', big: '2–7', small: 'días de entrega' },
                  { icon: '🛡', big: '6 meses', small: 'de garantía' },
                ].map((s, i) => (
                  <div
                    key={s.small}
                    className={`animate-fade-in-up relative rounded-2xl px-3 py-4 text-center transition-all ${
                      s.small === 'de garantía'
                        ? 'border border-sky-400/25 bg-sky-400/10 shadow-md'
                        : 'border border-white/10 bg-white/5 hover:border-sky-400/30 hover:shadow-md'
                    }`}
                    style={{ animationDelay: `${i * 0.12}s` }}
                  >
                    {s.small === 'de garantía' && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-sky-400 to-cyan-400 px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-950 shadow-lg">
                        Reembolso garantizado
                      </span>
                    )}
                    {s.small === 'de garantía' && (
                      <span className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                        <span className="absolute inline-flex h-3 w-3 -right-1 -top-1 animate-ping rounded-full bg-sky-400" />
                      </span>
                    )}
                    <div className="text-xl">{s.icon}</div>
                    <div className={`mt-1 text-2xl font-bold font-display ${s.small === 'de garantía' ? 'scale-110 text-sky-300' : 'text-sky-300'}`}>{s.big}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.small}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Aviso de scroll */}
        <div className="relative z-10 flex justify-center pb-3 sm:pb-5">
          <span className="flex flex-col items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
            Conoce los planes
            <span className="animate-bounce text-base text-sky-300">↓</span>
          </span>
        </div>

        {/* Marquee de negocios */}
        {(catalog.businessTypes?.length ?? 0) > 0 && (
          <div className="relative z-10 border-y border-teal-200/50 bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400 shadow-[0_0_30px_rgba(45,212,191,0.4)]">
            <div className="marquee-mask overflow-hidden py-4 sm:py-5">
              <div className="animate-marquee flex w-max items-center gap-8 px-4 hover:[animation-play-state:paused]">
                {[...(catalog.businessTypes ?? []), ...(catalog.businessTypes ?? [])].map((b, i) => (
                  <span key={i} className="flex items-center gap-2.5 whitespace-nowrap text-sm font-black uppercase tracking-[0.2em] text-slate-900 drop-shadow-sm">
                    <Star
                      className={`h-3 w-3 animate-twinkle text-white`}
                      style={{ animationDuration: `${2.4 + (i % 3) * 1.1}s`, animationDelay: `${(i % 5) * 0.4}s`, filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.9))' }}
                    />
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ═══════════ PLANES ═══════════ */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-5 sm:py-8">
        <StarField className="opacity-100" colors={['text-sky-500', 'text-sky-400', 'text-indigo-400', 'text-sky-400', 'text-cyan-500']} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 select-none">
          {FLOATERS.map((f, i) => (
            <span
              key={i}
              className="animate-float absolute opacity-[0.12]"
              style={{ left: f.l, top: f.t, fontSize: f.s, animationDuration: `${f.dur}s`, animationDelay: f.d }}
            >
              {f.e}
            </span>
          ))}
        </div>
        <div className="relative z-10 space-y-10 sm:space-y-14">
          <section id="planes" className="scroll-mt-20">
            <SectionHeading
              kicker="Tres modelos, un objetivo"
              title="Elige el catálogo perfecto para tu negocio"
              sub="Toca “Probar Demostración” en cualquier plan para verlo funcionando con productos reales."
            />

            <div className="flex flex-col">
              {/* Filtros Horizontales */}
              <div className="w-full">
                <FilterGroup
                  title="¿Qué funciones necesitas?"
                  options={planFeatures.map((row) => ({ id: row.feature, label: row.feature }))}
                  selected={activeFeatures}
                  onToggle={toggleFeature}
                  onClear={() => setActiveFeatures([])}
                  resultCount={visiblePlans.length}
                  orientation="horizontal"
                />
              </div>

              {/* Grid de Planes */}
              <div className="flex-1">
                {visiblePlans.length > 0 ? (
                  <StaggerGroup className="grid justify-center gap-4 transition-all duration-500 sm:gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3" delay={90}>
                    {visiblePlans.map((product) => (
                      <PremiumServiceCard key={product.id} product={product} catalogSlug={catalog.slug} />
                    ))}
                  </StaggerGroup>
                ) : (
                  <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/10">
                    <p className="text-4xl">🔍</p>
                    <p className="mt-3 font-semibold text-slate-800">Ningún plan incluye todo lo que marcaste</p>
                    <p className="mt-2 text-sm font-normal text-slate-500">Prueba quitar un filtro o compara los planes para ver qué incluye cada uno.</p>
                    <button
                      onClick={() => setActiveFeatures([])}
                      className="mt-5 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-slate-950 shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      ✕ Limpiar filtros
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Servicios adicionales */}
            {addonSections.length > 0 && (
              <div className="mt-14">
                <SectionHeading
                  kicker="Complementa tu plan"
                  title="Servicios adicionales"
                  sub="Filtra por tipo de pago: mensual, anual o por cambio."
                />
                <FilterGroup
                  title="Tipo de cobro"
                  options={addonFrequencies.map((f) => ({ id: f, label: FREQ_LABELS[f] ?? f }))}
                  selected={activeAddonBadges}
                  onToggle={toggleAddonBadge}
                  onClear={() => setActiveAddonBadges([])}
                  resultCount={visibleAddonSections.reduce((acc, s) => acc + s.products.length, 0)}
                  singularNoun="servicio"
                  pluralNoun="servicios"
                  sticky
                />
                {visibleAddonSections.map((section) => (
                  <div key={section.name} className={addonSections.length > 1 ? "mt-14" : ""}>
                    {addonSections.length > 1 && (
                      <h3 className="mb-5 text-center font-semibold text-slate-700">{section.name}</h3>
                    )}
                    <Reveal>
                      <StaggerGroup className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2" delay={90}>
                        {section.products.map((product) => (
                          <AddonServiceCard key={product.id} product={product} catalogSlug={catalog.slug} />
                        ))}
                      </StaggerGroup>
                    </Reveal>
                  </div>
                ))}
                {visibleAddonSections.length === 0 && (
                  <div className="mx-auto max-w-md rounded-[2.5rem] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/10">
                    <p className="text-4xl">🔍</p>
                    <p className="mt-3 font-semibold text-slate-800">No hay servicios con ese tipo de pago</p>
                    <button
                      onClick={() => setActiveAddonBadges([])}
                      className="mt-5 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-slate-950 shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      ✕ Limpiar filtros
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ═══════════ RECOMENDADOR ═══════════ */}
          {plans.length > 0 && (
            <section id="recomendador" className="scroll-mt-20">
              <SectionHeading
                kicker="30 segundos"
                title="¿No sabes cuál elegir? Te ayudamos"
                sub="Responde 4 preguntas y te recomendamos el plan ideal para tu negocio."
              />
              <Reveal>
                <PlanRecommender plans={plans} catalogSlug={catalog.slug} />
              </Reveal>
            </section>
          )}

          {/* ═══════════ COMPARACIÓN ═══════════ */}
          {(catalog.comparison?.length ?? 0) > 0 && (
            <section id="comparar" className="scroll-mt-20">
              <SectionHeading
                kicker="Todo claro"
                title="Compara los planes de un vistazo"
                sub="Puedes seleccionar el plan que más te llame la atención tocando su columna."
              />
              <Reveal>
                <ComparisonTable catalog={catalog} />
              </Reveal>
            </section>
          )}

          {/* ═══════════ DETALLES EXTRAS (Ocultos por defecto) ═══════════ */}
          <div id="info-extra" className="scroll-mt-20">
            <CollapsibleInfo>
              {/* ═══════════ PARA QUÉ NEGOCIOS ═══════════ */}
          {(catalog.businessTypes?.length ?? 0) > 0 && (
            <section id="negocios" className="scroll-mt-20">
              <SectionHeading
                kicker="¿Es para mi negocio?"
                title="Hecho para negocios como el tuyo"
                sub="Si tu negocio vende por lista, menú o catálogo, esto es para ti."
              />
              <Reveal>
              <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-3">
                {catalog.businessTypes!.map((b) => (
                  <span key={b} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-normal text-slate-600 shadow-sm transition-all hover:-translate-y-1 hover:bg-sky-50 hover:shadow-md hover:border-sky-300 hover:text-sky-700">
                    {b}
                  </span>
                ))}
              </div>
            </Reveal>
            </section>
          )}

          {/* ═══════════ QUÉ NECESITAS ENTREGARME ═══════════ */}
          {(catalog.handoff?.length ?? 0) > 0 && (
            <section id="entregar" className="scroll-mt-20">
              <SectionHeading
                kicker="Nada complicado"
                title="¿Qué necesitas entregarme para empezar?"
                sub="Menos de lo que crees. Todo se puede enviar por WhatsApp o foto."
              />
              <Reveal>
              <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
                {catalog.handoff!.map((h, i) => (
                  <div key={h.title} className="group rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm transition-all duration-400 hover:-translate-y-1 hover:bg-sky-50/50 hover:shadow-md animate-fade-in-up sm:rounded-2xl sm:p-4 sm:hover:-translate-y-2" style={{ animationDelay: `${i * 0.1}s` }}>
                    <span className="inline-grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-100 to-cyan-50 text-xl transition-transform duration-400 group-hover:scale-110 sm:h-12 sm:w-12 sm:rounded-2xl sm:text-2xl">
                      {h.icon}
                    </span>
                    <h3 className="mt-2 text-xs font-semibold text-slate-800 sm:mt-3 sm:text-sm">{h.title}</h3>
                    <p className="mt-1 text-[10px] font-normal leading-relaxed text-slate-500 sm:mt-1.5 sm:text-xs">{h.text}</p>
                  </div>
                ))}
              </div>
            </Reveal>
            </section>
          )}

          {/* ═══════════ PROCESO ═══════════ */}
          {(catalog.process?.length ?? 0) > 0 && (
            <section id="proceso" className="scroll-mt-20">
              <SectionHeading
                kicker="Simple y sin sorpresas"
                title="¿Qué pasa después de tu compra?"
                sub="Un proceso de 5 pasos y tú siempre al tanto. Nada de letra pequeña."
              />
              <Reveal>
              <div className="relative mx-auto grid max-w-5xl gap-3 sm:gap-4 md:grid-cols-3">
                <div className="absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-transparent via-sky-500/30 to-transparent md:block sm:top-10" />
                {catalog.process!.map((p, i) => (
                  <div key={p.title} className="relative rounded-xl border border-slate-200 bg-white px-3 pb-3 pt-6 shadow-sm transition-all duration-400 hover:-translate-y-1 hover:bg-sky-50/50 hover:shadow-md animate-fade-in-up sm:rounded-2xl sm:px-5 sm:pb-5 sm:pt-8 sm:hover:-translate-y-1.5" style={{ animationDelay: `${i * 0.1}s` }}>
                    <span className="absolute -top-3 left-4 sm:-top-4 sm:left-6">
                      <span
                        className="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-sky-400/25 sm:h-10 sm:w-10"
                        style={{ animationDelay: `${i * 0.3}s` }}
                      />
                      <span className="relative grid h-8 w-8 place-items-center rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 text-xs font-semibold text-slate-950 shadow-lg shadow-sky-500/20 sm:h-10 sm:w-10 sm:text-sm">
                        {i + 1}
                      </span>
                    </span>
                    <h3 className="text-sm font-semibold text-slate-800 sm:text-base">{p.title}</h3>
                    <p className="mt-1.5 text-xs font-normal leading-relaxed text-slate-500 sm:mt-2 sm:text-sm">{p.text}</p>
                  </div>
                ))}
              </div>
            </Reveal>
            </section>
          )}

          {/* ═══════════ PAGO, GARANTÍA Y COSTOS ═══════════ */}
          {(catalog.payment?.length || catalog.guarantee || catalog.recurringCosts?.length || catalog.upgradePolicy) ? (
            <section id="pagos" className="scroll-mt-20">
              <SectionHeading
                kicker="Transparencia total"
                title="Pago, garantía y costos que debes conocer"
                sub="Todo lo que quieres saber antes de dar el sí, respondido aquí."
              />
              <Reveal>
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  {catalog.payment && (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:rounded-2xl sm:p-5">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 sm:gap-3 sm:text-base">💳 Formas de pago</h3>
                      <ul className="mt-2 space-y-1.5 sm:mt-3 sm:space-y-2">
                        {catalog.payment.map((p) => (
                          <li key={p} className="flex items-start gap-2 text-xs font-normal text-slate-600 sm:gap-3 sm:text-sm">
                            <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-sky-50 border border-sky-200 text-[9px] font-semibold text-sky-600 sm:h-5 sm:w-5 sm:text-[10px]">✓</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {catalog.guarantee && (
                    <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:rounded-2xl sm:p-5 sm:hover:-translate-y-1">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 sm:gap-3 sm:text-base">🛡 Garantía</h3>
                      <p className="mt-2 text-xs font-normal leading-relaxed text-slate-600 sm:mt-3 sm:text-sm">{catalog.guarantee}</p>
                    </div>
                  )}

                  {catalog.recurringCosts && (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:rounded-2xl sm:p-5">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 sm:gap-3 sm:text-base">💡 Costos que debes conocer</h3>
                      <ul className="mt-2 space-y-1.5 sm:mt-3 sm:space-y-2">
                        {catalog.recurringCosts.map((c) => (
                          <li key={c} className="flex items-start gap-2 text-xs font-normal text-slate-600 sm:gap-3 sm:text-sm">
                            <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-sky-50 border border-sky-200 text-[9px] font-semibold text-sky-600 sm:h-5 sm:w-5 sm:text-[10px]">→</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {catalog.upgradePolicy && (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:rounded-2xl sm:p-5">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 sm:gap-3 sm:text-base">🔄 ¿Puedo cambiar de plan?</h3>
                      <p className="mt-2 text-xs font-normal leading-relaxed text-slate-600 sm:mt-3 sm:text-sm">{catalog.upgradePolicy}</p>
                    </div>
                  )}
                </div>
              </Reveal>
            </section>
          ) : null}

          {/* ═══════════ FAQ ═══════════ */}
          {(catalog.faq?.length ?? 0) > 0 && (
            <Reveal><FaqSection catalog={catalog} /></Reveal>
          )}
            </CollapsibleInfo>
          </div>

      {/* ═══════════ CTA FINAL ═══════════ */}
          <Reveal><FinalCta catalog={catalog} /></Reveal>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/60 bg-white py-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Powered by Catálogos Digitales</p>
      </footer>

      <WhatsAppFloat href={waHref} />
    </div>
  );
}
