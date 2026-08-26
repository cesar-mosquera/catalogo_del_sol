'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Catalog, Product } from '@/lib/catalog-types';
import { BASE_PATH } from '@/lib/base-path';
import { asset } from '@/lib/asset';
import { useCart } from '@/store/cart';

/* ───────────────────────── HELPERS ───────────────────────── */

function goTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* Partículas "brasas" del hero (dorado + esmeralda) */
const EMBERS = Array.from({ length: 22 }).map((_, i) => ({
  left: (i * 47 + 5) % 100,
  size: 3 + (i % 3) * 1.6,
  dur: 9 + ((i * 13) % 10),
  delay: -(i * 1.7),
  color: i % 3 === 0 ? '#fcd34d' : i % 3 === 1 ? '#34d399' : '#fef3c7',
}));

function SectionHeading({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mb-8 text-center sm:mb-14">
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500 sm:text-xs sm:tracking-[0.3em]">{kicker}</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:mt-3 sm:text-3xl md:text-4xl">{title}</h2>
      {sub && <p className="mx-auto mt-3 max-w-xl text-sm font-medium text-slate-600 leading-relaxed sm:mt-4 sm:max-w-2xl sm:text-base">{sub}</p>}
      <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 sm:mt-6 sm:w-20" />
    </div>
  );
}

/* ─────────────── FILTROS POR CARACTERÍSTICA ─────────────── */

function FilterGroup({
  title, options, selected, onToggle, onClear, resultCount,
  singularNoun = 'plan', pluralNoun = 'planes',
}: {
  title: string;
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
  resultCount?: number;
  singularNoun?: string;
  pluralNoun?: string;
}) {
  if (options.length === 0) return null;

  return (
    <div className="mx-auto mb-10 max-w-4xl">
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-3xl border border-white bg-white/40 p-4 shadow-sm backdrop-blur-md">
        <span className="text-xs font-black uppercase tracking-widest text-slate-500">{title}:</span>
        {selected.length > 0 && (
          <button
            onClick={onClear}
            className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 transition-colors hover:bg-red-100"
          >
            ✕ Limpiar
          </button>
        )}
        {options.map((opt) => {
          const active = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => onToggle(opt.id)}
              aria-pressed={active}
              aria-label={`Filtrar por: ${opt.label}`}
              className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${
                active
                  ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'border-white bg-white/80 text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {resultCount !== undefined && selected.length > 0 && (
        <p className="mt-3 text-center text-xs font-medium text-slate-400">
          Mostrando {resultCount} {resultCount === 1 ? singularNoun : pluralNoun}.
        </p>
      )}
    </div>
  );
}

/* ─────────────── REVELAR AL HACER SCROLL ─────────────── */

function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(
    // Muestra inmediatamente si el navegador no soporta IntersectionObserver
    () => typeof IntersectionObserver === 'undefined'
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
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
  const COLORS = ['#10b981', '#f59e0b', '#14b8a6', '#fbbf24', '#84cc16'];
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[2.5rem]">
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const dist = 46 + ((i * 37) % 64);
        return (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 h-2.5 w-2.5 animate-confetti rounded-[2px]"
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
    <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[380px] lg:max-w-[400px] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="absolute inset-0 scale-90 rounded-full bg-gradient-to-tr from-emerald-500/40 to-amber-500/40 blur-[90px] animate-blob" />

      {/* Aviso "tócalo" */}
      <div className="absolute -top-10 left-1/2 z-20 -translate-x-1/2 animate-wiggle">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/40 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-amber-200 shadow-xl backdrop-blur-md">
          👆 Toca el celular <span className="animate-bounce-x">→</span>
        </span>
      </div>

      <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onClick={next}>
        <TiltCard className="relative cursor-pointer" max={9}>
          <div className="relative animate-float-slow rounded-[2.7rem] border border-white/25 bg-white/10 p-3 shadow-[0_50px_100px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            <div className="relative overflow-hidden rounded-[2.2rem] bg-stone-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={d.img}
                src={asset(d.img)}
                alt={`Vista previa de ${d.name}`}
                className="h-auto w-full animate-phone-in"
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
              idx === i ? 'w-7 bg-gradient-to-r from-amber-300 to-emerald-300' : 'w-2.5 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Tarjeta flotante del demo actual */}
      <div className="absolute -right-3 top-1/3 z-20 animate-float rounded-2xl border border-white/30 bg-white/15 px-4 py-3 shadow-2xl backdrop-blur-md" style={{ animationDelay: '1.8s' }}>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-200">{d.tag || 'Demo en vivo'}</p>
        <p className="text-sm font-black text-white">{d.name}</p>
        {d.demoUrl ? (
          <a
            href={`${BASE_PATH}${d.demoUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-[11px] font-black text-emerald-300 hover:text-amber-200"
            onClick={(e) => e.stopPropagation()}
          >
            Probar en vivo →
          </a>
        ) : (
          <p className="mt-1 text-[11px] font-bold text-white/60">Ver características abajo ↓</p>
        )}
      </div>

      <div className="absolute -left-4 top-10 z-20 animate-float rounded-2xl border border-white/30 bg-white/15 px-4 py-3 shadow-2xl backdrop-blur-md" style={{ animationDelay: '0.9s' }}>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-200">Pedido recibido</p>
        <p className="text-sm font-black text-white">✅ Directo a tu WhatsApp</p>
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

  const handleAdd = () => {
    add(catalogSlug, product);
    setAdded(true);
    setBursting(true);
    setTimeout(() => setAdded(false), 1400);
    setTimeout(() => setBursting(false), 1000);
  };

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setSpot({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

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
          ? 'bg-white/80 backdrop-blur-3xl border-2 border-emerald-200 shadow-[0_20px_40px_-10px_rgba(4,120,87,0.25)] sm:border-white sm:shadow-[0_30px_60px_-15px_rgba(4,120,87,0.35)] sm:scale-[1.02] sm:z-10'
          : 'bg-white/50 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:bg-white/80 hover:shadow-[0_12px_30px_rgb(0,0,0,0.08)] sm:shadow-[0_8px_30px_rgb(0,0,0,0.06)]'
      }`}>

      {spot && (
        <div
          className="pointer-events-none absolute inset-0 z-[5] transition-opacity duration-300 rounded-2xl sm:rounded-[2.5rem]"
          style={{
            background: `radial-gradient(400px circle at ${spot.x}px ${spot.y}px, rgba(255,255,255,0.5), transparent 40%)`,
          }}
        />
      )}

      {bursting && <ConfettiBurst />}

      {isPopular && (
        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/20 blur-3xl sm:h-64 sm:w-64" />
      )}

      {/* Header de la tarjeta - compacto en mobile */}
      <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-teal-50 via-amber-50 to-teal-50 p-3 flex items-end justify-center border-b border-white/50 sm:h-48 sm:p-4">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.5),rgba(255,255,255,0))] transition-opacity duration-500 group-hover:opacity-60" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mockupImageSrc}
          alt={`Demo ${product.name}`}
          className="relative z-10 w-auto h-[120%] object-contain drop-shadow-xl transition-all duration-500 transform translate-y-6 group-hover:translate-y-2 group-hover:scale-110 sm:h-[140%] sm:drop-shadow-2xl sm:group-hover:scale-[1.12]"
        />
      </div>

      <div className="flex flex-col flex-1 p-4 sm:p-6 relative z-10">
        <div className="flex justify-between items-start gap-2 sm:gap-4">
          <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight sm:text-2xl">{product.name}</h3>
          {product.badge && (
            <span className="flex-shrink-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] text-white shadow-md sm:px-3 sm:py-1 sm:text-[10px] sm:tracking-[0.2em]">
              {product.badge}
            </span>
          )}
        </div>

        {/* Precio - más prominente */}
        <div className="mt-3 flex items-baseline gap-1.5 sm:mt-2 sm:gap-2">
          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 sm:text-4xl">
            ${product.price.toFixed(0)}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:text-xs">USD · Pago Único</span>
        </div>

        {product.deliveryDays && (
          <p className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700 sm:mt-2 sm:gap-1.5 sm:px-3 sm:py-1 sm:text-xs">
            ⏱ {product.deliveryDays}
          </p>
        )}

        {/* Features - compactas en mobile */}
        <ul className="mt-3 mb-4 flex flex-1 flex-col gap-2 sm:mt-5 sm:mb-8 sm:gap-3">
          {product.description.split(/\.\s+/).filter(Boolean).slice(0, 4).map((line, i) => (
            <li key={i} className="flex items-start gap-2 text-xs font-medium leading-relaxed text-slate-700 sm:gap-3 sm:text-sm">
              <div className="mt-0.5 flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-[8px] font-bold text-white shadow-sm sm:h-4 sm:w-4 sm:text-[9px]">
                ✓
              </div>
              <span>{line.replace(/\.$/, '')}</span>
            </li>
          ))}
        </ul>

        {/* CTAs - más grandes para touch */}
        <div className="mt-auto flex flex-col gap-2 relative z-10">
          {product.demoUrl && (
            <a
              href={`${BASE_PATH}${product.demoUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-teal-100 bg-teal-50/50 px-4 py-3 text-xs font-black uppercase tracking-widest text-teal-700 transition-colors hover:bg-teal-100 hover:border-teal-200 sm:px-5"
            >
              <span>👀</span> Probar Demostración
            </a>
          )}
          {product.id === 'plan-admin' && (
            <a
              href={`${BASE_PATH}/admin`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-stone-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-stone-700 transition-colors hover:bg-stone-100 hover:border-stone-300 sm:px-5"
            >
              <span>⚙️</span> Probar Panel Admin
            </a>
          )}
          <button
            onClick={handleAdd}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] sm:py-4 sm:text-sm ${
              added
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                : isPopular
                  ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
            }`}
          >
            {added ? '✅ ¡Añadido!' : '🛒 Comprar Ahora'}
          </button>
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
    <div className="group relative flex flex-col rounded-2xl bg-white/50 backdrop-blur-md p-4 shadow-sm border border-white transition-all duration-400 hover:bg-white hover:border-emerald-200 hover:shadow-lg hover:-translate-y-1 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:rounded-[2rem] sm:p-6">
      {bursting && <ConfettiBurst />}
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h4 className="text-base font-black text-slate-900 sm:text-lg">{product.name}</h4>
          {product.badge && (
            <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-teal-700 sm:px-3 sm:py-1 sm:text-[10px]">
              {product.badge}
            </span>
          )}
        </div>
        <p className="mt-2 text-xs font-medium text-slate-600 leading-relaxed sm:text-sm">{product.description}</p>
      </div>
      <div className="text-left flex items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-200 sm:text-right sm:flex-col sm:items-end sm:gap-3 sm:border-l sm:border-slate-200 sm:pl-6 sm:pt-0 sm:mt-0 sm:border-t-0">
        <div className="text-xl font-black text-slate-900 sm:text-2xl">${product.price.toFixed(0)}</div>
        <button
          onClick={handleAdd}
          className={`rounded-lg px-4 py-2 text-xs font-black uppercase tracking-widest transition-all active:scale-95 sm:rounded-xl sm:px-5 sm:py-2.5 ${
            added ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white'
          }`}
        >
          {added ? '✓ Añadido' : '+ Agregar'}
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
      <div className="mx-auto max-w-2xl rounded-[2.5rem] border border-white bg-white/70 p-8 text-center shadow-[0_20px_50px_rgb(0,0,0,0.08)] backdrop-blur-md animate-fade-in-up">
        <div className="text-5xl">🎉</div>
        <p className="mt-3 text-xs font-black uppercase tracking-[0.3em] text-emerald-500">Nuestra recomendación</p>
        <h3 className="mt-2 text-3xl font-black text-slate-900">{recommended.name}</h3>
        <p className="mt-3 font-medium leading-relaxed text-slate-600">{why[recommended.id]}</p>
        <div className="mt-5 flex items-baseline justify-center gap-2">
          <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-teal-500">${recommended.price.toFixed(0)}</span>
          <span className="text-sm font-bold uppercase tracking-widest text-slate-400">pago único</span>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => { add(catalogSlug, recommended); setAdded(true); setTimeout(() => setAdded(false), 1400); }}
            className={`rounded-2xl px-6 py-3.5 text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
              added ? 'bg-green-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/20'
            }`}
          >
            {added ? '✅ ¡Añadido al carrito!' : '🛒 Añadir este plan'}
          </button>
          <button onClick={() => goTo('planes')} className="rounded-2xl border-2 border-slate-200 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-slate-700 transition-colors hover:border-emerald-300 hover:text-emerald-600">
            Ver todos los planes
          </button>
          <button onClick={restart} className="rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-400 transition-colors hover:text-slate-600">
            ↺ Repetir
          </button>
        </div>
      </div>
    );
  }

  const current = QUIZ[step];

  return (
    <div className="mx-auto max-w-2xl rounded-[2.5rem] border border-white bg-white/70 p-8 shadow-[0_20px_50px_rgb(0,0,0,0.08)] backdrop-blur-md">
      {/* Progreso */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200/70">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500" style={{ width: `${((step + 1) / total) * 100}%` }} />
        </div>
        <span className="text-xs font-black text-slate-500">{step + 1}/{total}</span>
      </div>

      <p className="text-center text-xs font-black uppercase tracking-[0.3em] text-emerald-500">¿No sabes cuál elegir?</p>
      <h3 className="mt-2 text-center text-2xl font-black text-slate-900">{current.question}</h3>

      <div className="mt-6 flex flex-col gap-3">
        {current.options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => pick(opt)}
            className="group flex items-center justify-between rounded-2xl border-2 border-slate-100 bg-white px-5 py-4 text-left font-bold text-slate-700 transition-all duration-300 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-lg active:scale-[0.98]"
          >
            <span>{opt.label}</span>
            <span className="text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-emerald-500">→</span>
          </button>
        ))}
      </div>

      <button onClick={restart} className="mt-5 w-full text-center text-xs font-bold text-slate-400 transition-colors hover:text-slate-600">
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
      <div className="min-w-[580px] rounded-2xl border border-white bg-white/60 p-3 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-[2rem] sm:p-5 sm:shadow-[0_20px_50px_rgb(0,0,0,0.06)]">
        {/* Cabecera con los planes */}
        <div className="grid grid-cols-[1.1fr_repeat(3,1fr)] gap-2">
          <div className="flex items-center px-3 text-xs font-black uppercase tracking-widest text-slate-500">Qué incluye</div>
          {plans.map((plan) => {
            const active = selectedId === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedId(active ? null : plan.id)}
                className={`flex flex-col items-center gap-1 rounded-2xl border-2 px-3 py-4 text-center transition-all duration-300 active:scale-95 ${
                  active
                    ? 'border-emerald-400 bg-gradient-to-b from-emerald-50 to-teal-50 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                    : 'border-white bg-white hover:border-emerald-200 hover:shadow-md'
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">{plan.name}</span>
                {plan.badge && (
                  <span className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white">
                    {plan.badge}
                  </span>
                )}
                <span className="text-lg font-black text-emerald-600">${plan.price.toFixed(0)}</span>
              </button>
            );
          })}
        </div>

        {/* Filas de características */}
        <div className="mt-3 flex flex-col gap-2">
          {rows.map((row, i) => (
            <div key={i}>
              <div className={`grid grid-cols-[1.1fr_repeat(3,1fr)] items-center gap-2 rounded-2xl px-3 py-2.5 transition-colors ${i % 2 === 0 ? 'bg-slate-50/60' : 'bg-white/60'}`}>
                <span className="px-1 text-sm font-semibold text-slate-700">{row.feature}</span>
                {plans.map((plan) => (
                  <span key={plan.id} className={`text-center ${isIncluded(row, plan.id) ? 'text-emerald-500' : 'text-slate-300'}`}>
                    {isIncluded(row, plan.id) ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-black">✓</span>
                    ) : (
                      <span className="text-sm font-bold">—</span>
                    )}
                  </span>
                ))}
              </div>
              {row.note && (
                <p className="px-4 py-1.5 text-xs font-medium italic text-slate-400">💡 {row.note}</p>
              )}
            </div>
          ))}
        </div>

        {/* Barra de resumen al seleccionar un plan */}
        <div className="mt-4 flex min-h-[4.5rem] items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-3 transition-all">
          {selected ? (
            <>
              <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-widest text-emerald-600">✓ Has elegido</p>
                <p className="font-black text-slate-900">{selected.name} · ${selected.price.toFixed(0)} {selected.deliveryDays && `· ${selected.deliveryDays}`}</p>
              </div>
              <button
                onClick={() => handleAdd(selected)}
                className={`flex-shrink-0 rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
                  added ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                }`}
              >
                {added ? '✅ Añadido' : '🛒 Añadir'}
              </button>
            </>
          ) : (
            <p className="w-full text-center text-sm font-semibold text-slate-500">
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
    <section id="faq" className="relative z-10 mx-auto max-w-4xl animate-fade-in-up scroll-mt-24 sm:scroll-mt-28" style={{ animationDelay: '0.8s' }}>
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
          className="w-full rounded-xl border border-white bg-white/70 px-9 py-3 text-sm font-medium text-slate-700 shadow-sm outline-none backdrop-blur-md transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 sm:rounded-2xl sm:px-11 sm:py-3.5"
        />
      </div>

      {faq.length === 0 ? (
        <p className="text-center font-semibold text-slate-500">No encontramos esa pregunta. ¡Escríbenos por WhatsApp!</p>
      ) : (
        <div className="flex flex-col gap-2 sm:gap-3">
          {faq.map((f) => (
            <details key={f.q} name="faq" className="group rounded-xl border border-white bg-white/60 p-4 shadow-sm backdrop-blur-md transition-all hover:shadow-md sm:rounded-[2rem] sm:p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-bold text-slate-900 outline-none sm:gap-4 sm:text-lg">
                <span>{f.q}</span>
                <span className="flex-shrink-0 text-xl font-light text-emerald-500 transition-transform duration-300 group-open:rotate-180 sm:text-2xl">↓</span>
              </summary>
              <p className="faq-answer mt-3 text-sm font-medium leading-relaxed text-slate-600 sm:mt-4">{f.a}</p>
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
    const onScroll = () => {
      setVisible(window.scrollY > 560);
      const probe = window.innerHeight * 0.32;
      let current: string | undefined;
      for (const l of NAV_LINKS) {
        const el = document.getElementById(l.id);
        if (el && el.getBoundingClientRect().top <= probe) current = l.id;
      }
      setActive(current ?? NAV_LINKS[0].id);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed left-1/2 top-4 z-50 -translate-x-1/2 transition-all duration-500 ${visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-6 opacity-0'}`}>
      <div className="flex max-w-[95vw] items-center gap-1 overflow-x-auto rounded-full border border-white/60 bg-white/80 px-2 py-1.5 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
        {NAV_LINKS.map((l) => (
          <button
            key={l.id}
            onClick={() => goTo(l.id)}
            className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-black transition-colors ${
              active === l.id
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30'
                : 'text-slate-600 hover:bg-emerald-100 hover:text-emerald-700'
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-amber-500 to-teal-500 p-6 text-center text-white shadow-xl shadow-emerald-500/20 sm:rounded-[3rem] sm:p-10 md:p-14 sm:shadow-2xl sm:shadow-emerald-500/30">
        <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl sm:-left-16 sm:-top-16 sm:h-56 sm:w-56" />
        <div className="absolute -bottom-16 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl sm:-bottom-20 sm:-right-16 sm:h-64 sm:w-64" />
        <p className="relative text-[10px] font-black uppercase tracking-[0.25em] text-emerald-100 sm:text-xs sm:tracking-[0.3em]">Empecemos hoy</p>
        <h2 className="relative mt-2 text-xl font-black tracking-tight sm:mt-3 sm:text-3xl md:text-4xl">¿Listo para tener tu catálogo digital?</h2>
        <p className="relative mx-auto mt-3 max-w-lg text-sm font-medium leading-relaxed text-emerald-50 sm:mt-4 sm:max-w-xl sm:text-base">
          Si ya lo tienes claro, añade tu plan al carrito. Y si te queda una duda, escríbenos.
        </p>
        <div className="relative mt-5 flex flex-col items-center justify-center gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-xs font-black uppercase tracking-widest text-emerald-600 shadow-lg transition-all hover:scale-[1.02] active:scale-95 sm:w-auto sm:rounded-2xl sm:px-8 sm:py-4 sm:text-sm sm:shadow-xl"
          >
            💬 Aún tengo una duda
          </a>
          <button
            onClick={() => goTo('planes')}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-white/40 px-5 py-3.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 hover:scale-[1.02] active:scale-95 sm:w-auto sm:rounded-2xl sm:px-8 sm:py-4 sm:text-sm"
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
  const addonBadges = [...new Set(
    addonSections.flatMap((s) => s.products.map((p) => p.badge ?? '').filter(Boolean))
  )];

  const visibleAddonSections = activeAddonBadges.length === 0
    ? addonSections
    : addonSections.map((s) => ({
        ...s,
        products: s.products.filter((p) => p.badge && activeAddonBadges.includes(p.badge)),
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50 to-teal-50 animate-mesh text-slate-900 selection:bg-emerald-500/30 font-sans overflow-hidden">
      <StickyNav />

      {/* Orbes decorativos */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-amber-300/50 rounded-full filter blur-3xl opacity-60 animate-blob" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-300/50 rounded-full filter blur-3xl opacity-60 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-32 left-20 w-[500px] h-[500px] bg-teal-300/40 rounded-full filter blur-3xl opacity-70 animate-blob animation-delay-4000" />

      {/* ═══════════ HEADER ═══════════ */}
      <header className="relative z-10 overflow-hidden bg-[#041b14] text-white">
        {/* Fondo: auroras + rejilla + grano */}
        <div className="absolute inset-0">
          <div className="absolute -left-[12%] -top-[25%] h-[620px] w-[620px] rounded-full bg-emerald-400/65 blur-[110px] animate-blob" />
          <div className="absolute right-[-10%] top-[5%] h-[540px] w-[540px] rounded-full bg-amber-400/60 blur-[110px] animate-blob animation-delay-2000" />
          <div className="absolute bottom-[-20%] left-[35%] h-[520px] w-[520px] rounded-full bg-teal-400/55 blur-[120px] animate-blob animation-delay-4000" />
          <div className="absolute left-[30%] top-[30%] h-[400px] w-[400px] rounded-full bg-emerald-300/30 blur-[90px] animate-blob animation-delay-2000" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
              backgroundSize: '76px 76px',
              maskImage: 'radial-gradient(ellipse 95% 85% at 50% 0%, #000 30%, transparent 78%)',
              WebkitMaskImage: 'radial-gradient(ellipse 95% 85% at 50% 0%, #000 30%, transparent 78%)',
            }}
          />
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

        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-6 pb-6 sm:px-6 lg:pt-20 lg:pb-12">
          <div className="flex flex-col-reverse items-center gap-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
            {/* ── Columna texto ── */}
            <div className="w-full text-center lg:text-left animate-fade-in-up">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 shadow-lg backdrop-blur-md sm:mb-7 sm:gap-2.5 sm:px-4 sm:py-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-80" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200 sm:text-[11px] sm:tracking-[0.25em]">{catalog.tagline}</span>
              </div>

              <h1 className="text-[2rem] font-black leading-[1.08] tracking-tighter sm:text-5xl lg:text-[4rem]">
                Tu negocio convertido en un{' '}
                <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-emerald-300 bg-clip-text text-transparent">
                  catálogo que enamora
                </span>
              </h1>

              <p className="mx-auto mt-4 max-w-lg text-sm font-medium leading-relaxed text-white/70 sm:mt-6 sm:max-w-xl sm:text-base lg:mx-0 lg:text-lg">
                {catalog.description} Con carrito de pedidos, envío por WhatsApp y panel para editar todo tú mismo. Listo en días, sin comisiones.
              </p>

              {/* CTAs */}
              <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                <button
                  onClick={() => goTo('planes')}
                  className="shine group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 px-5 py-3.5 text-xs font-black uppercase tracking-widest text-emerald-950 shadow-xl shadow-amber-500/30 ring-1 ring-white/30 transition-all hover:scale-[1.03] hover:shadow-amber-500/50 active:scale-95 sm:rounded-2xl sm:px-7 sm:py-4 sm:text-sm"
                >
                  🛒 Ver planes y precios
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
                {demoPath && (
                  <a
                    href={`${BASE_PATH}${demoPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3.5 text-xs font-black uppercase tracking-widest text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-[1.02] active:scale-95 sm:rounded-2xl sm:px-6 sm:py-4 sm:text-sm"
                  >
                    👀 Probar una demo
                  </a>
                )}
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-white/60 transition-colors hover:text-emerald-300 sm:py-4 sm:text-sm"
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
                ].map((s) => (
                  <div
                    key={s.small}
                    className={`relative rounded-xl px-2 py-3 text-center backdrop-blur-md transition-all sm:rounded-2xl sm:px-3 sm:py-4 ${
                      s.small === 'garantía'
                        ? 'border border-amber-400/70 bg-gradient-to-b from-amber-400/20 to-emerald-500/10'
                        : 'border border-white/15 bg-white/5'
                    }`}
                  >
                    <div className="text-lg sm:text-xl">{s.icon}</div>
                    <div className="mt-0.5 bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-lg font-black text-transparent sm:text-2xl">{s.big}</div>
                    <div className="text-[8px] font-bold uppercase tracking-widest text-white/50 sm:text-[10px]">{s.small}</div>
                  </div>
                ))}
              </div>
              <div className="mt-8 hidden lg:grid max-w-xl grid-cols-3 gap-3">
                {[
                  { icon: '🚫', big: '0%', small: 'comisiones' },
                  { icon: '⏱', big: '2–7', small: 'días de entrega' },
                  { icon: '🛡', big: '6 meses', small: 'de garantía' },
                ].map((s) => (
                  <div
                    key={s.small}
                    className={`relative rounded-2xl px-3 py-4 text-center backdrop-blur-md transition-all ${
                      s.small === 'de garantía'
                        ? 'border border-amber-400/70 bg-gradient-to-b from-amber-400/20 to-emerald-500/10 shadow-[0_0_30px_rgba(251,191,36,0.25)] hover:shadow-[0_0_40px_rgba(251,191,36,0.4)]'
                        : 'border border-white/15 bg-white/5 hover:border-emerald-400/50 hover:bg-white/10'
                    }`}
                  >
                    {s.small === 'de garantía' && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 px-3 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-950 shadow-lg">
                        Reembolso garantizado
                      </span>
                    )}
                    {s.small === 'de garantía' && (
                      <span className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                        <span className="absolute inline-flex h-3 w-3 -right-1 -top-1 animate-ping rounded-full bg-amber-300/80" />
                      </span>
                    )}
                    <div className="text-xl">{s.icon}</div>
                    <div className={`mt-1 bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-2xl font-black text-transparent ${s.small === 'de garantía' ? 'scale-110' : ''}`}>{s.big}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">{s.small}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Columna mockup (teléfono interactivo) ── */}
            <PhoneDemo demos={heroDemos} catalogSlug={catalog.slug} />
          </div>
        </div>

        {/* Marquee de negocios */}
        {(catalog.businessTypes?.length ?? 0) > 0 && (
          <div className="relative z-10 border-t border-white/10 bg-black/30 backdrop-blur-sm">
            <div className="marquee-mask overflow-hidden py-5">
              <div className="animate-marquee flex w-max items-center gap-8 px-4">
                {[...(catalog.businessTypes ?? []), ...(catalog.businessTypes ?? [])].map((b, i) => (
                  <span key={i} className="flex items-center gap-2.5 whitespace-nowrap text-sm font-black uppercase tracking-[0.2em] text-white/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-amber-400" />
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ═══════════ PLANES ═══════════ */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-5 sm:py-12">
        <div className="space-y-16 sm:space-y-28">
          <section id="planes" className="scroll-mt-28">
            <SectionHeading
              kicker="Tres modelos, un objetivo"
              title="Elige el catálogo perfecto para tu negocio"
              sub="Toca “Probar Demostración” en cualquier plan para verlo funcionando con productos reales."
            />

            <FilterGroup
              title="Filtrar por qué incluye"
              options={planFeatures.map((row) => ({ id: row.feature, label: row.feature }))}
              selected={activeFeatures}
              onToggle={toggleFeature}
              onClear={() => setActiveFeatures([])}
              resultCount={visiblePlans.length}
            />

            {visiblePlans.length > 0 ? (
              <Reveal>
                <div className="grid justify-center gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {visiblePlans.map((product) => (
                    <PremiumServiceCard key={product.id} product={product} catalogSlug={catalog.slug} />
                  ))}
                </div>
              </Reveal>
            ) : (
              <div className="mx-auto max-w-md rounded-[2.5rem] border border-white bg-white/60 p-8 text-center shadow-sm backdrop-blur-md">
                <p className="text-4xl">🔍</p>
                <p className="mt-3 font-black text-slate-900">Ningún plan incluye todo lo que marcaste</p>
                <p className="mt-2 text-sm font-medium text-slate-600">Prueba quitar un filtro o compara los planes para ver qué incluye cada uno.</p>
                <button
                  onClick={() => setActiveFeatures([])}
                  className="mt-5 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-95"
                >
                  ✕ Limpiar filtros
                </button>
              </div>
            )}

            {/* Servicios adicionales */}
            {addonSections.length > 0 && (
              <div className="mt-24">
                <SectionHeading
                  kicker="Complementa tu plan"
                  title="Servicios adicionales"
                  sub="Filtra por tipo de pago: mensual, anual o por cambio."
                />
                <FilterGroup
                  title="Filtrar por tipo de pago"
                  options={addonBadges.map((b) => ({ id: b, label: b }))}
                  selected={activeAddonBadges}
                  onToggle={toggleAddonBadge}
                  onClear={() => setActiveAddonBadges([])}
                  resultCount={visibleAddonSections.reduce((acc, s) => acc + s.products.length, 0)}
                  singularNoun="servicio"
                  pluralNoun="servicios"
                />
                {visibleAddonSections.map((section) => (
                  <div key={section.name} className={addonSections.length > 1 ? "mt-14" : ""}>
                    {addonSections.length > 1 && (
                      <h3 className="mb-5 text-center font-black text-slate-800">{section.name}</h3>
                    )}
                    <Reveal>
                      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
                        {section.products.map((product) => (
                          <AddonServiceCard key={product.id} product={product} catalogSlug={catalog.slug} />
                        ))}
                      </div>
                    </Reveal>
                  </div>
                ))}
                {visibleAddonSections.length === 0 && (
                  <div className="mx-auto max-w-md rounded-[2.5rem] border border-white bg-white/60 p-8 text-center shadow-sm backdrop-blur-md">
                    <p className="text-4xl">🔍</p>
                    <p className="mt-3 font-black text-slate-900">No hay servicios con ese tipo de pago</p>
                    <button
                      onClick={() => setActiveAddonBadges([])}
                      className="mt-5 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-95"
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
            <section id="recomendador" className="scroll-mt-28">
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
            <section id="comparar" className="scroll-mt-28">
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

          {/* ═══════════ PARA QUÉ NEGOCIOS ═══════════ */}
          {(catalog.businessTypes?.length ?? 0) > 0 && (
            <section id="negocios" className="scroll-mt-28">
              <SectionHeading
                kicker="¿Es para mi negocio?"
                title="Hecho para negocios como el tuyo"
                sub="Si tu negocio vende por lista, menú o catálogo, esto es para ti."
              />
              <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-3">
                {catalog.businessTypes!.map((b) => (
                  <span key={b} className="rounded-full border border-white bg-white/60 px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:border-emerald-200">
                    {b}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* ═══════════ QUÉ NECESITAS ENTREGARME ═══════════ */}
          {(catalog.handoff?.length ?? 0) > 0 && (
            <section id="entregar" className="scroll-mt-28">
              <SectionHeading
                kicker="Nada complicado"
                title="¿Qué necesitas entregarme para empezar?"
                sub="Menos de lo que crees. Todo se puede enviar por WhatsApp o foto."
              />
              <Reveal>
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                {catalog.handoff!.map((h, i) => (
                  <div key={h.title} className="group rounded-xl border border-white bg-white/60 p-4 text-center shadow-sm backdrop-blur-md transition-all duration-400 hover:-translate-y-1 hover:shadow-md animate-fade-in-up sm:rounded-[2rem] sm:p-6 sm:hover:-translate-y-2 sm:hover:shadow-xl" style={{ animationDelay: `${i * 0.1}s` }}>
                    <span className="inline-grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-2xl shadow-inner transition-transform duration-400 group-hover:scale-110 sm:h-16 sm:w-16 sm:rounded-2xl sm:text-3xl">
                      {h.icon}
                    </span>
                    <h3 className="mt-3 text-sm font-black text-slate-900 sm:mt-4 sm:text-base">{h.title}</h3>
                    <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-600 sm:mt-2 sm:text-sm">{h.text}</p>
                  </div>
                ))}
              </div>
            </Reveal>
            </section>
          )}

          {/* ═══════════ PROCESO ═══════════ */}
          {(catalog.process?.length ?? 0) > 0 && (
            <section id="proceso" className="scroll-mt-28">
              <SectionHeading
                kicker="Simple y sin sorpresas"
                title="¿Qué pasa después de tu compra?"
                sub="Un proceso de 5 pasos y tú siempre al tanto. Nada de letra pequeña."
              />
              <Reveal>
              <div className="relative mx-auto grid max-w-5xl gap-4 sm:gap-6 md:grid-cols-3">
                <div className="absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent md:block sm:top-10" />
                {catalog.process!.map((p, i) => (
                  <div key={p.title} className="relative rounded-xl border border-white bg-white/60 p-4 shadow-sm backdrop-blur-md transition-all duration-400 hover:-translate-y-1 hover:shadow-md animate-fade-in-up sm:rounded-[2rem] sm:p-6 sm:hover:-translate-y-1.5 sm:hover:shadow-xl" style={{ animationDelay: `${i * 0.1}s` }}>
                    <span className="absolute -top-3 left-4 grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-xs font-black text-white shadow-lg sm:-top-4 sm:left-6 sm:h-10 sm:w-10 sm:text-sm">
                      {i + 1}
                    </span>
                    <h3 className="mt-2 text-sm font-black text-slate-900 sm:mt-3 sm:text-base">{p.title}</h3>
                    <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-600 sm:mt-2 sm:text-sm">{p.text}</p>
                  </div>
                ))}
              </div>
            </Reveal>
            </section>
          )}

          {/* ═══════════ PAGO, GARANTÍA Y COSTOS ═══════════ */}
          {(catalog.payment?.length || catalog.guarantee || catalog.recurringCosts?.length || catalog.upgradePolicy) ? (
            <section id="pagos" className="scroll-mt-28">
              <SectionHeading
                kicker="Transparencia total"
                title="Pago, garantía y costos que debes conocer"
                sub="Todo lo que quieres saber antes de dar el sí, respondido aquí."
              />
              <Reveal>
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-5">
                  {catalog.payment && (
                    <div className="rounded-xl border border-white bg-white/60 p-4 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md sm:rounded-[2rem] sm:p-7 sm:hover:shadow-xl">
                      <h3 className="flex items-center gap-2 text-base font-black text-slate-900 sm:gap-3 sm:text-lg">💳 Formas de pago</h3>
                      <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
                        {catalog.payment.map((p) => (
                          <li key={p} className="flex items-start gap-2 text-xs font-medium text-slate-700 sm:gap-3 sm:text-sm">
                            <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-bold text-emerald-600 sm:h-5 sm:w-5 sm:text-[10px]">✓</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {catalog.guarantee && (
                    <div className="rounded-xl border border-white bg-gradient-to-br from-emerald-50 to-teal-50 p-4 shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-md sm:rounded-[2rem] sm:p-7 sm:hover:-translate-y-1 sm:hover:shadow-xl">
                      <h3 className="flex items-center gap-2 text-base font-black text-slate-900 sm:gap-3 sm:text-lg">🛡 Garantía</h3>
                      <p className="mt-3 text-xs font-medium leading-relaxed text-slate-700 sm:mt-4 sm:text-sm">{catalog.guarantee}</p>
                    </div>
                  )}

                  {catalog.recurringCosts && (
                    <div className="rounded-xl border border-white bg-white/60 p-4 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md sm:rounded-[2rem] sm:p-7 sm:hover:shadow-xl">
                      <h3 className="flex items-center gap-2 text-base font-black text-slate-900 sm:gap-3 sm:text-lg">💡 Costos que debes conocer</h3>
                      <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
                        {catalog.recurringCosts.map((c) => (
                          <li key={c} className="flex items-start gap-2 text-xs font-medium text-slate-700 sm:gap-3 sm:text-sm">
                            <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-[9px] font-bold text-teal-600 sm:h-5 sm:w-5 sm:text-[10px]">→</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {catalog.upgradePolicy && (
                    <div className="rounded-xl border border-white bg-white/60 p-4 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md sm:rounded-[2rem] sm:p-7 sm:hover:shadow-xl">
                      <h3 className="flex items-center gap-2 text-base font-black text-slate-900 sm:gap-3 sm:text-lg">🔄 ¿Puedo cambiar de plan?</h3>
                      <p className="mt-3 text-xs font-medium leading-relaxed text-slate-700 sm:mt-4 sm:text-sm">{catalog.upgradePolicy}</p>
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

          {/* ═══════════ CTA FINAL ═══════════ */}
          <Reveal><FinalCta catalog={catalog} /></Reveal>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/30 bg-white/20 py-12 text-center backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Powered by Catálogos Digitales</p>
      </footer>
    </div>
  );
}
