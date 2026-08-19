import type { Catalog } from '@/lib/catalog-types';

export const servicios: Catalog = {
  slug: 'mis-servicios',
  name: 'Catálogos Digitales Pro',
  tagline: 'Desarrollo de Menús y Catálogos Digitales',
  description: 'Adquiere tu propio catálogo digital con carrito de compras, pedidos por WhatsApp y panel de administración.',
  phone: '593999999999', // Cambia este número
  address: 'Atención 100% remota',
  coverImage: '/img/cover.webp',
  logoImage: '/img/logo.webp',
  template: 'premium',
  minimumOrder: 0,
  businessHours: { timezone: 'America/Guayaquil', open: 8, close: 20, days: [0, 1, 2, 3, 4, 5, 6] },
  alwaysOpen: true,
  requiresShipping: false,
  deliveryBaseFee: 0,
  deliveryRatePerKm: 0,
  deliveryMaxKm: 0,
  checkoutNote: 'Medios de pago, tiempos de entrega y coordinación se acuerdan aquí mismo con nosotros. ¡No necesitas nada más!',

  /* ── ¿Para qué negocios sirve? ── */
  businessTypes: [
    'Restaurantes y parrillas',
    'Cafeterías y reposterías',
    'Comida rápida y pizzerías',
    'Heladerías y juguerías',
    'Ventas por catálogo (ropa, cosméticos)',
    'Servicios y talleres',
  ],

  /* ── ¿Qué necesito entregarte? ── */
  handoff: [
    { icon: '🍽', title: 'Tu menú o lista', text: 'Platos o productos con sus precios. Una captura de pantalla o una foto es suficiente.' },
    { icon: '📷', title: 'Fotos de tus productos', text: 'Las que tengas a mano. ¿No tienes? Usamos fotos de referencia o plantillas para que luzca profesional.' },
    { icon: '🎨', title: 'Logo y colores', text: 'Tu logo y los colores de tu marca para que el catálogo se sienta tuyo desde el primer vistazo.' },
    { icon: '💬', title: 'Tu WhatsApp', text: 'El número donde quieres recibir los pedidos de tus clientes. Es el corazón de tu catálogo.' },
  ],

  /* ── Proceso post-compra ── */
  process: [
    { title: 'Te contactamos', text: 'En menos de 24 horas te escribimos para confirmar tu pedido y coordinar el pago.' },
    { title: 'Envías tu material', text: 'Nos mandas menú, fotos, logo y colores. Recuerda: una foto vale por mil palabras.' },
    { title: 'Revisas tu demo', text: 'En 2 a 7 días recibes el enlace de tu catálogo para que lo pruebes con tu propio celular.' },
    { title: 'Ajustamos contigo', text: 'Hacemos los ajustes que pidas hasta que quedes contento. Tu opinión manda.' },
    { title: 'Lo compartes', text: 'Recibes el enlace y tu código QR para ponerlo en mesas, redes y marquesinas.' },
  ],

  /* ── Formas de pago ── */
  payment: [
    'Transferencia bancaria',
    'Depósito',
    'Efectivo',
    'Aceptamos un anticipo del 50% y el saldo contra entrega',
  ],

  /* ── Garantía ── */
  guarantee: 'Trabajamos contigo hasta que estés conforme. Si tu catálogo no cumple lo acordado, te devolvemos tu dinero dentro de los primeros 6 meses. Sin letra pequeña.',

  /* ── Costos recurrentes ── */
  recurringCosts: [
    'Catálogo Lista y Libro 3D: pago único, sin mensualidades ni comisiones por pedido.',
    'Catálogo Administrable: mantenimiento de $15 al mes (incluye hosting, copias de seguridad y soporte prioritario).',
    'Dominio propio: ~$20 por año (se renueva cada año, como cualquier página web).',
    'Actualización de precios por nosotros: $10 por cada cambio (solo si no tienes el panel).',
  ],

  /* ── ¿Puedo cambiar de plan después? ── */
  upgradePolicy: '¡Sí! Si empiezas con el Catálogo Lista y luego quieres el Libro 3D o el Administrable, pagas solo la diferencia entre planes y migramos tu contenido sin perder nada de lo hecho.',

  /* ── Tabla comparativa de planes ── */
  comparison: [
    { feature: 'Carrito de pedidos', includedIn: ['plan-basico', 'plan-pro', 'plan-admin'] },
    { feature: 'Pedidos directos a tu WhatsApp', includedIn: ['plan-basico', 'plan-pro', 'plan-admin'] },
    { feature: 'Diseño tipo libro con páginas 3D', includedIn: ['plan-pro', 'plan-admin'] },
    { feature: 'Mapa de envío con costo por km', includedIn: ['plan-pro', 'plan-admin'] },
    { feature: 'Se instala como App en celulares (PWA)', includedIn: ['plan-pro', 'plan-admin'] },
    { feature: 'Panel para editar precios y fotos tú mismo', includedIn: ['plan-admin'] },
    { feature: 'Mantenimiento y hosting incluidos', includedIn: ['plan-admin'], note: 'Plan Admin: $15/mes' },
    { feature: 'Dominio propio (www.tunegocio.com)', includedIn: [], note: 'Servicio extra $20/año' },
    { feature: 'Soporte técnico', includedIn: ['plan-basico', 'plan-pro', 'plan-admin'], note: 'Admin: prioritario 24/7' },
  ],

  /* ── Preguntas frecuentes (editables aquí) ── */
  faq: [
    { q: '¿Me cobran comisiones por cada pedido que me hagan?', a: '¡Para nada! A diferencia de las apps de delivery que cobran hasta el 30%, aquí los pedidos llegan directo a tu WhatsApp. Todas las ganancias son tuyas y no intervenimos en tus pagos.' },
    { q: '¿Mis clientes necesitan instalar algo o crear una cuenta?', a: 'No. Tus clientes abren el enlace o escanean el código QR con su celular y listo: ven tu menú, arman su pedido y lo envían a tu WhatsApp. Funciona en cualquier navegador, Android e iPhone, sin descargar nada.' },
    { q: 'No sé nada de computadoras, ¿cómo cambio los precios?', a: 'Tienes dos opciones: si eliges el Catálogo Administrable, te damos una pantalla en tu celular que funciona igual que publicar en Facebook (escribes el precio nuevo y guardas). O puedes contratar nuestra actualización por $10 y nosotros lo hacemos todo por ti.' },
    { q: '¿Cuánto tarda la entrega de mi catálogo?', a: 'El Catálogo Lista se entrega en 2 a 3 días, el Libro 3D en 4 a 5 días y el Administrable en 5 a 7 días. Te avisamos con el enlace de tu demo para que lo pruebes antes de publicarlo.' },
    { q: '¿Qué tengo que enviarte para empezar?', a: 'Muy poco: tu menú o lista con precios, las fotos que tengas (o nada, y usamos plantillas), tu logo y colores si los tienes, y el número de WhatsApp donde quieres recibir pedidos. Puedes mandar todo por foto.' },
    { q: '¿Cómo pago?', a: 'Aceptamos transferencia, depósito o efectivo. Puedes pagar con un anticipo del 50% y el saldo cuando tu catálogo esté listo y te haya gustado.' },
    { q: '¿Y si no me gusta o el catálogo no sale como esperaba?', a: 'Tienes garantía: trabajamos contigo hasta que estés conforme. Si tu catálogo no cumple lo acordado, te devolvemos tu dinero dentro de los primeros 6 meses.' },
    { q: '¿Tengo que pagar algo cada mes o cada año?', a: 'Solo si eliges el Catálogo Administrable (mantenimiento de $15 al mes, que incluye hosting y soporte) o un dominio propio ($20 al año). Los catálogos Lista y Libro 3D son pago único, sin mensualidades.' },
    { q: '¿Puedo cambiar de plan después de comprar?', a: 'Sí. Si empiezas con el más económico y luego quieres uno con más funciones, pagas únicamente la diferencia entre planes y migramos tu contenido sin perder nada.' },
    { q: '¿Qué es eso de que "se instala como aplicación"?', a: 'Es una función del Libro 3D y el Administrable. Cuando tus clientes abren el enlace de tu restaurante, el celular les ofrece añadirlo a su pantalla. Si aceptan, el logo de tu negocio queda instalado junto a WhatsApp o Facebook, listo para pedir con un solo toque.' },
    { q: '¿Pueden pagar mis clientes dentro del catálogo?', a: 'Por ahora el catálogo no cobra: tus clientes arman el pedido y llega a tu WhatsApp, y tú cobras como siempre (efectivo, transferencia, o como ya lo haces). Sin comisiones de por medio.' },
    { q: '¿Qué pasa después de que envío mi pedido por WhatsApp?', a: 'Recibimos tu pedido con los planes y servicios que elegiste, te escribimos en menos de 24 horas para confirmar, y seguimos el proceso de 5 pasos: contacto, tu material, tu demo, ajustes y publicación.' },
    { q: '¿Tengo muchas sucursales o varios negocios?', a: '¡Sin problema! Podemos crear varios catálogos para cada sucursal y, si lo necesitas, con el plan Administrable gestionas todo desde tu panel. Escríbenos y te armamos una propuesta a la medida.' },
  ],

  sections: [
    { name: 'Modelos de Catálogos (Elige tu favorito)', products: [
      { id: 'plan-basico', name: 'Catálogo Lista Clásica', price: 45, deliveryDays: 'Entrega en 2–3 días', description: 'Diseño práctico y directo al grano. Carrito de pedidos que llega a tu WhatsApp al instante. Pago único, sin mensualidades. Ideal para probar el mundo digital.', image: '', badge: 'Económico', demoUrl: '/menu/chifa-excelencia' },
      { id: 'plan-pro', name: 'Catálogo Libro 3D', price: 90, deliveryDays: 'Entrega en 4–5 días', description: 'Tus clientes sentirán que pasan las páginas de un menú real. Calcula costos de envío por km y se instala como App en celulares. Pago único y sin comisiones.', image: '', badge: 'El más vendido', demoUrl: '/menu/del-sol' },
      { id: 'plan-admin', name: 'Catálogo Administrable', price: 150, deliveryDays: 'Entrega en 5–7 días', description: 'El mismo catálogo premium que ves en la demo (Pinchos Del Sol), con tu logo, fotos y colores. Incluye panel en tu celular para cambiar precios o subir fotos al instante. Incluye mantenimiento de $15/mes con hosting y soporte prioritario.', image: '', badge: 'Control Total', demoUrl: '/menu/del-sol' },
    ] },
    { name: 'Servicios Adicionales', products: [
      { id: 'hosting-db', name: 'Mantenimiento del Sistema', price: 15, description: 'Obligatorio para tu Catálogo Administrable. Incluye hosting, copias de seguridad y soporte prioritario 24/7. Es como pagar la luz de tu local: se asegura de que tu catálogo funcione sin caerse.', image: '', badge: 'Mensual' },
      { id: 'dominio-anual', name: 'Tu Propio Nombre en Internet', price: 20, description: 'En vez de un link genérico, tu menú será "www.tunegocio.com". Le da muchísimo prestigio a tu marca. Se renueva una vez al año.', image: '', badge: 'Anual' },
      { id: 'mantenimiento', name: 'Actualización de Menú', price: 10, description: '¿Tienes el Catálogo Lista o Libro 3D y necesitas cambiar precios? Nos envías una foto de los cambios y lo hacemos por ti. Sin panel, sin complicaciones.', image: '', badge: 'Por cambio' },
    ] }
  ],
};
