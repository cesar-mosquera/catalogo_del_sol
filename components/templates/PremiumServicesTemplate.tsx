'use client';

import { useEffect, useState } from 'react';
import type { Catalog, Product } from '@/lib/catalog-types';
import { BASE_PATH } from '@/lib/base-path';
import { useCart } from '@/store/cart';

/* ───────────────────────── HELPERS ───────────────────────── */

function goTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function SectionHeading({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mb-14 text-center">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-500">{kicker}</p>
      <h2 className="mt-3 text-3xl md:text-4xl font-black tracking-tight text-slate-900">{title}</h2>
      {sub && <p className="mx-auto mt-4 max-w-2xl font-medium text-slate-600 leading-relaxed">{sub}</p>}
      <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-orange-400 to-pink-500" />
    </div>
  );
}

/* ─────────────────── TARJETA DE PLAN (PRINCIPAL) ─────────────────── */

function PremiumServiceCard({ product, catalogSlug }: { product: Product; catalogSlug: string }) {
  const add = useCart((state) => state.add);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    add(catalogSlug, product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const isPopular = !!product.badge && product.badge.toLowerCase().includes('vendido');
  const mockupType = product.id.includes('basico') ? 'lista' : product.id.includes('pro') ? 'libro' : 'admin';
  const mockupImageSrc = `/img/mockup-${mockupType}.webp`;

  return (
    <div id={`plan-${product.id}`} className={`group relative flex flex-col overflow-hidden rounded-[2.5rem] transition-all duration-700 hover:-translate-y-4 ${
      isPopular
        ? 'bg-white/80 backdrop-blur-3xl border border-white shadow-[0_30px_60px_-15px_rgba(249,115,22,0.3)] scale-[1.03] z-10'
        : 'bg-white/50 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:bg-white/80 hover:shadow-[0_20px_40px_rgb(0,0,0,0.1)]'
    }`}>

      {isPopular && (
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-orange-400/20 to-pink-400/20 blur-3xl transition-transform duration-700 hover:scale-150" />
      )}

      <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 flex items-end justify-center border-b border-white/50">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_0%,rgba(120,119,198,0.5),rgba(255,255,255,0))] transition-opacity duration-700 group-hover:opacity-80" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mockupImageSrc}
          alt={`Demo ${product.name}`}
          className="relative z-10 w-auto h-[140%] object-contain drop-shadow-2xl transition-all duration-700 transform translate-y-8 group-hover:translate-y-2 group-hover:scale-[1.15] group-hover:rotate-2"
        />
      </div>

      <div className="flex flex-col flex-1 p-6 relative z-10">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{product.name}</h3>
          {product.badge && (
            <span className="flex-shrink-0 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-md">
              {product.badge}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600">
            ${product.price.toFixed(0)}
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">USD (Pago Único)</span>
        </div>

        {product.deliveryDays && (
          <p className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-bold text-emerald-700">
            ⏱ {product.deliveryDays}
          </p>
        )}

        <ul className="mt-5 mb-8 flex flex-1 flex-col gap-3">
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
              href={`${BASE_PATH}${product.demoUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-indigo-100 bg-indigo-50/50 px-5 py-3 text-xs font-black uppercase tracking-widest text-indigo-700 transition-colors hover:bg-indigo-100 hover:border-indigo-200"
            >
              <span>👀</span> Probar Demostración
            </a>
          )}
          {product.id === 'plan-admin' && (
            <a
              href={`${BASE_PATH}/admin`}
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

/* ─────────────── TARJETA DE SERVICIO ADICIONAL ─────────────── */

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
        <p className="mt-3 text-xs font-black uppercase tracking-[0.3em] text-orange-500">Nuestra recomendación</p>
        <h3 className="mt-2 text-3xl font-black text-slate-900">{recommended.name}</h3>
        <p className="mt-3 font-medium leading-relaxed text-slate-600">{why[recommended.id]}</p>
        <div className="mt-5 flex items-baseline justify-center gap-2">
          <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-pink-500">${recommended.price.toFixed(0)}</span>
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
          <button onClick={() => goTo('planes')} className="rounded-2xl border-2 border-slate-200 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-slate-700 transition-colors hover:border-orange-300 hover:text-orange-600">
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
          <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-pink-500 transition-all duration-500" style={{ width: `${((step) / total) * 100}%` }} />
        </div>
        <span className="text-xs font-black text-slate-500">{step + 1}/{total}</span>
      </div>

      <p className="text-center text-xs font-black uppercase tracking-[0.3em] text-orange-500">¿No sabes cuál elegir?</p>
      <h3 className="mt-2 text-center text-2xl font-black text-slate-900">{current.question}</h3>

      <div className="mt-6 flex flex-col gap-3">
        {current.options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => pick(opt)}
            className="group flex items-center justify-between rounded-2xl border-2 border-slate-100 bg-white px-5 py-4 text-left font-bold text-slate-700 transition-all duration-300 hover:border-orange-300 hover:bg-orange-50 hover:shadow-lg active:scale-[0.98]"
          >
            <span>{opt.label}</span>
            <span className="text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-orange-500">→</span>
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
    <div className="overflow-x-auto">
      <div className="min-w-[640px] rounded-[2rem] border border-white bg-white/60 p-5 backdrop-blur-md shadow-[0_20px_50px_rgb(0,0,0,0.06)]">
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
                    ? 'border-orange-400 bg-gradient-to-b from-orange-50 to-pink-50 shadow-lg shadow-orange-500/20 scale-[1.02]'
                    : 'border-white bg-white hover:border-orange-200 hover:shadow-md'
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">{plan.name}</span>
                {plan.badge && (
                  <span className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white">
                    {plan.badge}
                  </span>
                )}
                <span className="text-lg font-black text-orange-600">${plan.price.toFixed(0)}</span>
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
        <div className="mt-4 flex min-h-[4.5rem] items-center justify-between gap-3 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-pink-50 px-5 py-3 transition-all">
          {selected ? (
            <>
              <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-widest text-orange-600">✓ Has elegido</p>
                <p className="font-black text-slate-900">{selected.name} · ${selected.price.toFixed(0)} {selected.deliveryDays && `· ${selected.deliveryDays}`}</p>
              </div>
              <button
                onClick={() => handleAdd(selected)}
                className={`flex-shrink-0 rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
                  added ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20'
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
    <section id="faq" className="relative z-10 mx-auto max-w-4xl animate-fade-in-up scroll-mt-28" style={{ animationDelay: '0.8s' }}>
      <SectionHeading
        kicker="Sin letra pequeña"
        title="Preguntas Frecuentes"
        sub="Resolvemos tus dudas en lenguaje claro, sin términos informáticos."
      />

      <div className="relative mx-auto mb-6 max-w-xl">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Busca tu duda (ej: dominio, pago, app…)"
          className="w-full rounded-2xl border border-white bg-white/70 px-11 py-3.5 text-sm font-medium text-slate-700 shadow-sm outline-none backdrop-blur-md transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20"
        />
      </div>

      {faq.length === 0 ? (
        <p className="text-center font-semibold text-slate-500">No encontramos esa pregunta. ¡Escríbenos por WhatsApp y la respondemos al instante! 💬</p>
      ) : (
        <div className="flex flex-col gap-3">
          {faq.map((f, i) => (
            <details key={i} name="faq" className="group rounded-[2rem] border border-white bg-white/60 p-6 shadow-sm backdrop-blur-md transition-all hover:shadow-lg hover:-translate-y-0.5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold text-slate-900 outline-none">
                <span>{f.q}</span>
                <span className="flex-shrink-0 text-2xl font-light text-orange-500 transition-transform duration-300 group-open:rotate-180">↓</span>
              </summary>
              <p className="faq-answer mt-4 font-medium leading-relaxed text-slate-600">{f.a}</p>
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
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 560);
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
            className="flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-black text-slate-600 transition-colors hover:bg-orange-100 hover:text-orange-700"
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
    <section id="contacto" className="relative z-10 mx-auto max-w-4xl animate-fade-in-up scroll-mt-28" style={{ animationDelay: '0.9s' }}>
      <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-orange-500 via-rose-500 to-pink-500 p-10 text-center text-white shadow-2xl shadow-orange-500/30 md:p-14">
        <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <p className="relative text-xs font-black uppercase tracking-[0.3em] text-orange-100">Empecemos hoy</p>
        <h2 className="relative mt-3 text-3xl font-black tracking-tight md:text-4xl">¿Listo para tener tu catálogo digital?</h2>
        <p className="relative mx-auto mt-4 max-w-xl font-medium leading-relaxed text-orange-50">
          Si ya lo tienes claro, añade tu plan al carrito. Y si te queda una duda, escríbenos: te respondemos en menos de 24 horas.
        </p>
        <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-orange-600 shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            💬 Aún tengo una duda
          </a>
          <button
            onClick={() => goTo('planes')}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/40 px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-indigo-50 animate-mesh text-slate-900 selection:bg-orange-500/30 font-sans overflow-hidden">
      <StickyNav />

      {/* Orbes decorativos */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-32 left-20 w-[500px] h-[500px] bg-pink-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000" />

      {/* ═══════════ HEADER ═══════════ */}
      <header className="relative z-10">
        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
          <div className="mb-16 flex flex-col items-center justify-between gap-12 text-center lg:flex-row lg:text-left">
            <div className="flex-1 max-w-2xl">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/40 px-5 py-2 shadow-sm backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-slate-800">{catalog.tagline}</span>
              </div>
              <h1 className="text-5xl font-black leading-[1.1] tracking-tighter text-slate-900 md:text-7xl">
                {catalog.name}
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-slate-600 md:text-xl lg:mx-0">
                {catalog.description}
              </p>

              {/* Barra de confianza */}
              <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                {[
                  { icon: '💵', text: 'Pago único' },
                  { icon: '🚫', text: 'Sin comisiones' },
                  { icon: '⏱', text: 'Entrega 2–7 días' },
                  { icon: '🛡', text: 'Garantía 7 días' },
                ].map((t) => (
                  <span key={t.text} className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/50 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-700 shadow-sm backdrop-blur-md transition-transform hover:scale-105">
                    {t.icon} {t.text}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative w-full max-w-lg flex-1 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 scale-75 rounded-full bg-gradient-to-tr from-orange-400/30 to-pink-500/30 blur-[80px]" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/hero-mockup.webp"
                alt="Catálogo Digital Interactivo"
                className="relative z-10 h-auto w-full drop-shadow-2xl transition-transform duration-700 hover:rotate-1 hover:scale-[1.03]"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════ PLANES ═══════════ */}
      <main className="relative z-10 mx-auto max-w-7xl px-5 py-12">
        <div className="space-y-28">
          <section id="planes" className="scroll-mt-28">
            <SectionHeading
              kicker="Tres modelos, un objetivo"
              title="Elige el catálogo perfecto para tu negocio"
              sub="Toca “Probar Demostración” en cualquier plan para verlo funcionando con productos reales."
            />
            <div className="grid justify-center gap-8 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((product) => (
                <PremiumServiceCard key={product.id} product={product} catalogSlug={catalog.slug} />
              ))}
            </div>

            {/* Servicios adicionales */}
            {catalog.sections.filter((s) => /servicio|suscripcion/i.test(s.name)).map((section) => (
              <div key={section.name} className="mt-24">
                <SectionHeading kicker="Complementa tu plan" title={section.name} />
                <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
                  {section.products.map((product) => (
                    <AddonServiceCard key={product.id} product={product} catalogSlug={catalog.slug} />
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* ═══════════ RECOMENDADOR ═══════════ */}
          {plans.length > 0 && (
            <section id="recomendador" className="scroll-mt-28">
              <SectionHeading
                kicker="30 segundos"
                title="¿No sabes cuál elegir? Te ayudamos"
                sub="Responde 4 preguntas y te recomendamos el plan ideal para tu negocio."
              />
              <PlanRecommender plans={plans} catalogSlug={catalog.slug} />
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
              <ComparisonTable catalog={catalog} />
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
                  <span key={b} className="rounded-full border border-white bg-white/60 px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:border-orange-200">
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
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {catalog.handoff!.map((h, i) => (
                  <div key={h.title} className="group rounded-[2rem] border border-white bg-white/60 p-6 text-center shadow-sm backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:shadow-xl animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                    <span className="inline-grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-orange-100 to-pink-100 text-3xl shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                      {h.icon}
                    </span>
                    <h3 className="mt-4 font-black text-slate-900">{h.title}</h3>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{h.text}</p>
                  </div>
                ))}
              </div>
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
              <div className="relative mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
                <div className="absolute left-0 right-0 top-10 hidden h-0.5 bg-gradient-to-r from-transparent via-orange-300 to-transparent md:block" />
                {catalog.process!.map((p, i) => (
                  <div key={p.title} className="relative rounded-[2rem] border border-white bg-white/60 p-6 shadow-sm backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                    <span className="absolute -top-4 left-6 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500 text-sm font-black text-white shadow-lg">
                      {i + 1}
                    </span>
                    <h3 className="mt-3 font-black text-slate-900">{p.title}</h3>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{p.text}</p>
                  </div>
                ))}
              </div>
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
              <div className="grid gap-5 md:grid-cols-2">
                {catalog.payment && (
                  <div className="rounded-[2rem] border border-white bg-white/60 p-7 shadow-sm backdrop-blur-md transition-shadow hover:shadow-xl">
                    <h3 className="flex items-center gap-3 text-lg font-black text-slate-900">💳 Formas de pago</h3>
                    <ul className="mt-4 space-y-2.5">
                      {catalog.payment.map((p) => (
                        <li key={p} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                          <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-600">✓</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {catalog.guarantee && (
                  <div className="rounded-[2rem] border border-white bg-gradient-to-br from-emerald-50 to-teal-50 p-7 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-xl">
                    <h3 className="flex items-center gap-3 text-lg font-black text-slate-900">🛡 Garantía</h3>
                    <p className="mt-4 text-sm font-medium leading-relaxed text-slate-700">{catalog.guarantee}</p>
                  </div>
                )}

                {catalog.recurringCosts && (
                  <div className="rounded-[2rem] border border-white bg-white/60 p-7 shadow-sm backdrop-blur-md transition-shadow hover:shadow-xl">
                    <h3 className="flex items-center gap-3 text-lg font-black text-slate-900">💡 Costos que debes conocer</h3>
                    <ul className="mt-4 space-y-2.5">
                      {catalog.recurringCosts.map((c) => (
                        <li key={c} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                          <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600">→</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {catalog.upgradePolicy && (
                  <div className="rounded-[2rem] border border-white bg-white/60 p-7 shadow-sm backdrop-blur-md transition-shadow hover:shadow-xl">
                    <h3 className="flex items-center gap-3 text-lg font-black text-slate-900">🔄 ¿Puedo cambiar de plan después?</h3>
                    <p className="mt-4 text-sm font-medium leading-relaxed text-slate-700">{catalog.upgradePolicy}</p>
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {/* ═══════════ FAQ ═══════════ */}
          {(catalog.faq?.length ?? 0) > 0 && <FaqSection catalog={catalog} />}

          {/* ═══════════ CTA FINAL ═══════════ */}
          <FinalCta catalog={catalog} />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/30 bg-white/20 py-12 text-center backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Powered by Catálogos Digitales</p>
      </footer>
    </div>
  );
}
