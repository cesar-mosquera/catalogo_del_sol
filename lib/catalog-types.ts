export type TemplateName = 'book' | 'list' | 'minimal' | 'premium';

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  badge?: string;
  demoUrl?: string;
  deliveryDays?: string;
  // Nota de precio visible en la tarjeta, ej: "MEDIO $5.50 | COMPLETO $6.50"
  priceNote?: string;
  packagingCount?: number; // Cuántas unidades de empaque usa este producto (para cobros automáticos)
  variants?: { id: string; name: string; price: number; packagingCount?: number }[];
  // Frecuencia de pago: 'one-time' (pago único), 'monthly' (mensual), 'yearly' (anual), 'per-service' (por cambio/servicio)
  paymentFrequency?: 'one-time' | 'monthly' | 'yearly' | 'per-service';
};

export type FaqItem = { q: string; a: string };

// Colores de una tarjeta de producto. Se pasan como clases de Tailwind.
export type CardTheme = {
  accent: string;       // botón agregar / contador (bg)
  accentHover: string;  // hover del botón
  ring: string;         // borde suave de la tarjeta
  price: string;        // color del precio
  priceBox: string;     // fondo de la caja del precio ('' = sin caja)
  badgeBg: string;
  badgeText: string;
  name: string;         // color del nombre del producto
};

// Paleta opcional de un catálogo para personalizar la plantilla.
// Los colores van como valores CSS directos (hex/rgba) y se aplican con inline style.
export type CatalogTheme = {
  coverBg: string;       // fondo portada / contraportada
  coverTitle: string;    // color del nombre en portada
  coverTagline: string;  // color de la frase en portada
  pageBg: string;        // fondo de las páginas interiores
  pageText: string;      // texto general de la página
  heading: string;       // color de títulos de sección
  headingSplash: string; // fondo decorativo detrás del título
  card: CardTheme;
};

export type BackCover = {
  title?: string;        // ej: "Vuelve Pronto"
  subtitle?: string;
  rows?: { label?: string; value: string }[];
  footer?: string;
};

export type ComparisonRow = {
  feature: string;
  includedIn: string[];
  note?: string;
};

export type HandoffItem = { icon: string; title: string; text: string };

export type Catalog = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  phone: string;
  address: string;
  coverImage: string;
  logoImage: string;
  // Imagen de página informativa que va justo después de la portada (opcional)
  infoImage?: string;
  // Ocultar texto y logo en la portada (útil si la imagen ya tiene el diseño)
  hideCoverText?: boolean;
  template: TemplateName;
  minimumOrder: number;
  businessHours: { timezone: string; open: number; close: number; days: number[]; openMinute?: number; closeMinute?: number };
  sections: { name: string; products: Product[]; note?: string; defaultPackagingCount?: number }[];
  theme?: CatalogTheme;
  backCover?: BackCover;
  // Política de envío del catálogo. Mantenerla en datos permite múltiples locales.
  location?: { lat: number; lng: number };          // coordenadas del restaurante
  deliveryRatePerKm?: number;                        // costo por km (ej: 0.50)
  deliveryIncludedKm?: number;                       // km incluidos en la tarifa base (0/ausente = se cobra desde el 1er km)
  deliveryBaseFee?: number;                          // tarifa base de envío
  deliveryMaxKm?: number;                            // radio máximo de entrega
  integerDistanceMode?: 'floor' | 'ceil' | 'round';  // cómo redondear la distancia antes de cobrar
  requiresShipping?: boolean;                        // si es falso, desactiva pedir ubicación en el carrito
  allowPickup?: boolean;                              // si es verdadero, el cliente puede elegir "retirar en el local"
  deliveryZones?: { name: string; fee: number }[];    // alternativa manual de envío por zona (sin mapa/OSRM)
  // ── Tiempos estimados (opcional) ──
  prepTimeMinutes?: number;                           // tiempo de preparación aprox (min)
  deliveryTimeMinutes?: number;                       // tiempo de entrega aprox adicional (min)
  scheduleOrders?: boolean;                           // si es verdadero, el cliente puede programar fecha/hora
  // ── Métodos de pago (opcional, ej: ['Efectivo', 'Transferencia', 'Tarjeta']) ──
  paymentMethods?: string[];
  alwaysOpen?: boolean;                              // si es verdadero, ignora el horario comercial
  // ── Costos adicionales (opcional) ──
  packaging?: { label: string; price: number };      // ej: tarrinas para llevar, cajas de regalo
  // ── Contenido orientado a resolver dudas del cliente (catálogos de servicios) ──
  faq?: FaqItem[];
  comparison?: ComparisonRow[];
  handoff?: HandoffItem[];                           // "¿Qué necesito entregarte?"
  process?: { title: string; text: string }[];       // proceso post-compra
  payment?: string[];                                // formas de pago aceptadas
  guarantee?: string;                                // garantía / reembolso
  recurringCosts?: string[];                         // costos mensuales / anuales
  upgradePolicy?: string;                            // cambiar de plan después
  businessTypes?: string[];                          // tipos de negocio a los que sirve
  checkoutNote?: string;                             // microcopy al enviar pedido por WhatsApp
  // ── SEO opcional por catálogo ──
  seo?: {
    title?: string;                                  // título personalizado para SEO (default: `${name} | Menú digital`)
    description?: string;                            // meta description personalizada
    image?: string;                                  // imagen personalizada para OG/Twitter (default: coverImage)
  };
};
