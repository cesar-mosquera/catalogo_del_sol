import type { ReactNode } from 'react';
import { BASE_PATH } from '@/lib/base-path';
import { asset } from '@/lib/asset';

/* ════════════════════════════════════════════════════════════
   CONFIGURA TU MARCA PERSONAL AQUÍ
   ════════════════════════════════════════════════════════════ */
const AUTHOR_NAME = 'Tu Nombre';                 // Cómo te presentas
const AUTHOR_ROLE = 'Desarrollador de catálogos digitales';
const WHATSAPP    = '593999999999';              // Tu WhatsApp (con país, sin +)
const DEMO_PATH   = `${BASE_PATH}/menu/del-sol`; // Catálogo de demostración

const wa = (text: string) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

/* ─────────────────────────── FEATURES ─────────────────────── */
const features: { icon: string; title: string; text: string }[] = [
  { icon: '🛒', title: 'Carrito de pedidos', text: 'Tus clientes arman su pedido fácil desde el celular, sin instalar nada ni crear cuenta.' },
  { icon: '📲', title: 'Pedido por WhatsApp', text: 'El pedido con subtotal, envío y total llega listo y ordenado a tu WhatsApp para confirmar.' },
  { icon: '📍', title: 'Mapa de envío a domicilio', text: 'El cliente marca su ubicación en el mapa y se calcula el costo de envío según la distancia.' },
  { icon: '🧑‍💻', title: 'Panel de administración', text: 'Edita precios, nombres, secciones, fotos y datos del negocio con tu propio panel protegido por PIN.' },
  { icon: '📱', title: 'Instalable (PWA)', text: 'Tus clientes pueden añadir el menú a su pantalla de inicio como una app, con acceso sin conexión.' },
  { icon: '🎨', title: 'Plantillas a medida', text: 'Diseño tipo libro, lista limpia o minimalista: el catálogo se ve como la imagen de tu negocio.' },
];

/* ───────────────────────── PLANTILLAS ─────────────────────── */
const templates: { id: string; name: string; tag: string; desc: string; demo: string }[] = [
  { id: 'book', name: 'Libro', tag: 'El más vistoso', desc: 'Un menú con giro de páginas 3D, portada con foto y lomo de cuaderno. Ideal para parrillas y restaurantes con identidad.', demo: DEMO_PATH },
  { id: 'list', name: 'Lista', tag: 'Clásico y completo', desc: 'Secciones en cuadrícula con fotos y precios ordenados. Perfecto para menús con muchos productos.', demo: DEMO_PATH },
  { id: 'minimal', name: 'Minimal', tag: 'Elegante', desc: 'Tipografía limpia y sin distracciones, enfocada en el plato. Ideal para cafeterías y negocios gourmet.', demo: DEMO_PATH },
];

/* ─────────────────────────── PLANES ───────────────────────── */
const plans: {
  name: string; price: string; unit: string; tag: string; popular: boolean;
  items: string[]; cta: string; note: string;
}[] = [
  {
    name: 'Básico', price: '$45', unit: 'pago único',
    tag: 'Para negocios que recién empiezan', popular: false,
    items: [
      '1 catálogo digital',
      'Plantilla de tu elección',
      'Carrito + pedido por WhatsApp',
      'Panel de administración',
      'Publicación en tu dominio',
    ],
    cta: 'Quiero el Básico', note: 'Entrega en 2–3 días.',
  },
  {
    name: 'Pro', price: '$90', unit: 'pago único',
    tag: 'La opción más elegida', popular: true,
    items: [
      'Todo lo del plan Básico',
      'Mapa de envío con costo por km',
      'Logo, fotos y textos a tu gusto',
      'App instalable (PWA)',
      '30 días de soporte incluidos',
    ],
    cta: 'Quiero el Pro', note: 'Entrega en 4–5 días.',
  },
  {
    name: 'Premium', price: '$180', unit: 'pago único',
    tag: 'Catálogo completo y personalizado', popular: false,
    items: [
      'Todo lo del plan Pro',
      'Diseño 100% personalizado',
      'Varios catálogos si tienes sucursales',
      'Dominio + configuración completa',
      'Soporte por 3 meses',
    ],
    cta: 'Quiero el Premium', note: 'Agenda una llamada.',
  },
];

/* ─────────────────────────── PASOS ────────────────────────── */
const steps: { n: string; title: string; text: string }[] = [
  { n: '1', title: 'Cuéntame tu negocio', text: 'Me dices qué vendes, tus platos, precios, fotos y el estilo que quieres.' },
  { n: '2', title: 'Creo tu catálogo', text: 'Desarrollo tu menú digital con carrito, WhatsApp y panel de administración.' },
  { n: '3', title: 'Lo compartes', text: 'Recibes el enlace o código QR para ponerlo en redes, mesas y marquesinas.' },
];

/* ─────────────────────────── UI ───────────────────────────── */
function Section({ id, className = '', children }: { id?: string; className?: string; children: ReactNode }) {
  return <section id={id} className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</section>;
}

function Kicker({ children }: { children: ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-600">{children}</p>;
}

function WhatsAppButton({ label, className = '' }: { label: string; className?: string }) {
  return (
    <a
      href={wa('Hola, quiero un catálogo digital para mi negocio.')}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-green-900/20 transition-colors hover:bg-green-700 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.5 14.2c-.3.8-1.5 1.5-2.1 1.6-.6.1-1.2.2-3.9-.8-3.3-1.3-5.4-4.5-5.6-4.7-.2-.2-1.3-1.8-1.3-3.4 0-1.6.9-2.4 1.2-2.7.3-.3.7-.4.9-.4h.6c.2 0 .5-.1.7.6l.9 2.1c.1.2.1.5 0 .7l-.4.6c-.2.2-.4.5-.2.8.2.4.9 1.5 1.9 2.4 1.3 1.2 2.4 1.6 2.8 1.8.3.2.6.1.7-.1l.8-.9c.2-.3.5-.2.8-.1l2 .9c.3.2.5.3.6.4 0 .2 0 .7-.3 1.3Z" />
      </svg>
      {label}
    </a>
  );
}

/* ═══════════════════════════════ PÁGINA ═══════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fdf8f0] text-stone-800">
      {/* ─────── HEADER ─────── */}
      <header className="sticky top-0 z-40 border-b border-orange-900/10 bg-[#fdf8f0]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
          <a href="#" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 font-serif text-lg font-bold text-white shadow">CD</span>
            <span className="font-bold text-stone-900">
              Catálogos<span className="text-orange-600">&nbsp;Digitales</span>
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-stone-600 md:flex">
            <a href="#caracteristicas" className="hover:text-orange-600">Características</a>
            <a href="#plantillas" className="hover:text-orange-600">Plantillas</a>
            <a href="#precios" className="hover:text-orange-600">Precios</a>
            <a href="#como-funciona" className="hover:text-orange-600">Cómo funciona</a>
          </nav>
          <WhatsAppButton label="Contratar" className="px-4 py-2 text-sm" />
        </div>
      </header>

      {/* ─────── HERO ─────── */}
      <Section className="grid items-center gap-10 pb-16 pt-14 lg:grid-cols-2 lg:pt-20">
        <div>
          <Kicker>Menú digital con panel de administración</Kicker>
          <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-stone-950 sm:text-5xl">
            Tu restaurante,
            <br />
            <span className="text-orange-600">un catálogo digital</span> que vende solo.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-stone-600">
            Entrego tu menú digital listo en 3 días: carrito de pedidos, confirmación por WhatsApp,
            mapa de envío a domicilio y un panel para que edites todo tú mismo. Sin instalar nada.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={`${BASE_PATH}/menu/mis-servicios`}
              className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-orange-900/20 transition-colors hover:bg-orange-700"
            >
              Ver mis servicios y planes
            </a>
            <a
              href={`${BASE_PATH}/admin`}
              className="inline-flex items-center gap-2 rounded-full border-2 border-stone-900/10 px-6 py-3.5 font-bold text-stone-800 transition-colors hover:border-orange-400 hover:text-orange-600"
            >
              Ver panel de administración
            </a>
          </div>
          <p className="mt-5 text-sm text-stone-500">
            ✦ Hecho a medida por <span className="font-semibold text-stone-700">{AUTHOR_NAME}</span> ·{' '}
            <span className="italic">{AUTHOR_ROLE}</span>
          </p>
        </div>

        {/* Mockup de teléfono */}
        <a href={DEMO_PATH} className="group mx-auto block max-w-[300px] sm:max-w-[320px]" title="Ver el catálogo de demostración">
          <div className="rounded-[2.4rem] border-[10px] border-stone-900 bg-stone-900 shadow-2xl shadow-orange-900/20 transition-transform duration-300 group-hover:-translate-y-1.5">
            <div className="relative aspect-[9/16] overflow-hidden rounded-[1.9rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset('/img/cover.webp')} alt="Demostración del catálogo" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-5 pt-16 text-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset('/img/logo.webp')} alt="" className="h-10 w-10 object-contain" />
                <p className="mt-2 font-serif text-lg font-bold leading-tight">Pinchos y Chuletas Del Sol</p>
                <p className="text-xs text-orange-200">Toca para ver el demo →</p>
              </div>
              <div className="absolute left-1/2 top-2 h-5 w-28 -translate-x-1/2 rounded-full bg-black/80" />
            </div>
          </div>
        </a>
      </Section>

      {/* ─────── FEATURES ─────── */}
      <Section id="caracteristicas" className="pb-20 pt-8">
        <div className="max-w-2xl">
          <Kicker>Todo lo que necesita tu negocio</Kicker>
          <h2 className="mt-3 font-serif text-3xl font-bold text-stone-950">
            Herramientas de pedidos a un clic de tus clientes
          </h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-stone-900/5 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-orange-100 text-2xl">{f.icon}</span>
              <h3 className="mt-4 font-bold text-stone-900">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{f.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ─────── PLANTILLAS / PORTFOLIO ─────── */}
      <div className="bg-stone-950 py-20 text-white">
        <Section id="plantillas">
          <div className="max-w-2xl">
            <Kicker>Galería de plantillas</Kicker>
            <h2 className="mt-3 font-serif text-3xl font-bold">
              Un diseño para cada tipo de negocio
            </h2>
            <p className="mt-3 text-stone-400">
              Elige la base y la ajusto a colores, fotos y textos de tu negocio. Aquí ves la
              muestra con un catálogo real funcionando.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {templates.map((t) => (
              <a
                key={t.id}
                href={t.demo}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-colors hover:border-orange-500/60"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset('/img/cover.webp')}
                    alt={`Plantilla ${t.name}`}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-orange-300">
                    {t.tag}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-serif text-xl font-bold">{t.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-300">{t.desc}</p>
                  <span className="mt-4 text-sm font-bold text-orange-400 group-hover:underline">
                    Ver plantilla en vivo →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </Section>
      </div>

      {/* ─────── CÓMO FUNCIONA ─────── */}
      <Section id="como-funciona" className="py-20">
        <div className="max-w-2xl">
          <Kicker>Proceso simple</Kicker>
          <h2 className="mt-3 font-serif text-3xl font-bold text-stone-950">De tu idea a tu menú online en 3 días</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.n} className="relative rounded-2xl border border-stone-900/5 bg-white p-6 shadow-sm">
              <span className="absolute -top-4 left-6 grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-orange-700 font-serif text-base font-bold text-white shadow">
                {s.n}
              </span>
              <h3 className="mt-2 font-bold text-stone-900">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{s.text}</p>
              {i < steps.length - 1 && (
                <span className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-2xl text-orange-400 md:block">→</span>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ─────── PRECIOS ─────── */}
      <Section id="precios" className="pb-20">
        <div className="mx-auto max-w-2xl text-center">
          <Kicker>Planes simples, sin letra pequeña</Kicker>
          <h2 className="mt-3 font-serif text-3xl font-bold text-stone-950">Precios de referencia</h2>
          <p className="mt-3 text-stone-600">
            Pago único por el desarrollo. Los precios se ajustan a las necesidades de tu negocio:
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-3xl p-7 shadow-sm ${
                p.popular
                  ? 'border-2 border-orange-500 bg-white shadow-xl shadow-orange-900/10'
                  : 'border border-stone-900/10 bg-white'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-orange-600 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow">
                  Más solicitado
                </span>
              )}
              <p className="text-sm font-bold uppercase tracking-wide text-orange-600">{p.name}</p>
              <p className="text-xs text-stone-500">{p.tag}</p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-serif text-4xl font-bold text-stone-950">{p.price}</span>
                <span className="text-sm text-stone-500">{p.unit}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-2.5">
                {p.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-stone-700">
                    <span className="mt-0.5 text-orange-600">✓</span>{item}
                  </li>
                ))}
              </ul>
              <WhatsAppButton
                label={p.cta}
                className={`mt-7 w-full ${p.popular ? '' : '!bg-stone-900 hover:!bg-stone-800'}`}
              />
              <p className="mt-3 text-center text-xs text-stone-400">{p.note}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ─────── CTA FINAL ─────── */}
      <div className="bg-stone-950 py-20 text-white">
        <Section className="flex flex-col items-center text-center">
          <div className="max-w-2xl">
            <Kicker>Empecemos</Kicker>
            <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
              ¿Listo para tener tu propio menú digital?
            </h2>
            <p className="mt-4 text-stone-400">
              Escríbeme por WhatsApp y te cuento cómo sería el catálogo de tu negocio, con una
              cotización sin compromiso.
            </p>
            <WhatsAppButton label={`Hablemos por WhatsApp (${AUTHOR_NAME})`} className="mt-8 px-8 py-4 text-base" />
          </div>
        </Section>
      </div>

      {/* ─────── FOOTER ─────── */}
      <footer className="border-t border-stone-900/10 bg-[#fdf8f0] py-8">
        <Section className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-stone-500">
            © {new Date().getFullYear()} {AUTHOR_NAME} · {AUTHOR_ROLE}
          </p>
          <div className="flex items-center gap-5 text-sm font-semibold text-stone-600">
            <a href={DEMO_PATH} className="hover:text-orange-600">Catálogo de demostración</a>
            <a href={wa('Hola, quiero contratar un catálogo digital.')} className="hover:text-orange-600">Contacto</a>
          </div>
        </Section>
      </footer>
    </div>
  );
}