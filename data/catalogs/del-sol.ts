import type { Catalog } from '@/lib/catalog-types';

export const delSol: Catalog = {
  slug: 'del-sol',
  name: 'Pinchos y Chuletas Del Sol',
  tagline: '',
  description: 'Menú digital de Pinchos y Chuletas Del Sol.',
  phone: '593969581620',
  address: 'Consulta la dirección al confirmar tu pedido.',
  coverImage: '/img/cover.webp',
  logoImage: '',
  hideCoverText: true,
  template: 'book',
  minimumOrder: 0,
  backCover: {
    title: 'Gracias por visitarnos',
    subtitle: 'La mejor experiencia en carnes al carbón',
    rows: [
      { label: 'Dirección', value: 'Calles Principales y Av. del Parque' },
      { label: 'Horarios', value: 'Lunes a Domingo: 11:30 am - 10:30 pm' },
      { label: 'WhatsApp', value: '0969581620' }
    ],
    footer: 'Pinchos del Sol • Hecho con pasión'
  },
  theme: {
    coverBg: '#f5f0e8',         // color exacto del fondo de la imagen para fusión perfecta
    coverTitle: '#000000',
    coverTagline: '#fed7aa',
    pageBg: '#fdf0d5',          // crema-dorado cálido (pergamino)
    pageText: '#7c2d12',        // rojo-tierra oscuro (mejor contraste)
    heading: '#c2410c',         // naranja fuego intenso
    headingSplash: '#fbbf24',   // ámbar sólido y vibrante
    card: {
      name: 'text-orange-950',
      price: 'text-orange-700',
      priceBox: 'bg-amber-50 ring-1 ring-amber-300',
      accent: 'bg-orange-600',
      accentHover: 'hover:bg-orange-700',
      badgeBg: 'bg-amber-400',
      badgeText: 'text-amber-950',
      ring: 'ring-amber-300',
    }
  },
  businessHours: { timezone: 'America/Guayaquil', open: 11, close: 22, openMinute: 30, closeMinute: 30, days: [0, 1, 2, 3, 4, 5, 6] },
  // Coordenadas del restaurante (Quito, Ecuador)
  location: { lat: -0.323043, lng: -78.556539 },
  requiresShipping: true,
  allowPickup: true,
  prepTimeMinutes: 25,
  deliveryTimeMinutes: 15,
  scheduleOrders: true,
  paymentMethods: ['Efectivo', 'Transferencia', 'Tarjeta', 'Pago al recibir'],
  deliveryBaseFee: 2.00,
  deliveryIncludedKm: 2,
  deliveryRatePerKm: 0.50,
  deliveryMaxKm: 0,
  integerDistanceMode: 'floor',
  packaging: { label: 'Empaque (Para llevar)', price: 0.30 },
  checkoutNote: 'Los pedidos se confirman por WhatsApp.',
  sections: [
    { name: 'Parrilla al carbón', products: [
      { id: 'pincho-pollo', name: 'Pincho de Pollo', price: 3.5, description: 'Pollo marinado en ají y especias criollas, asado al carbón.', image: '/img/pincho_pollo.webp' },
      { id: 'pincho-mixto', name: 'Pincho Mixto', price: 4, description: 'Pollo y res con especias secretas y salsa de maní.', image: '/img/pincho_carne.webp' },
      { id: 'chuleta-plancha', name: 'Chuleta a la Plancha', price: 7, description: 'Chuleta de cerdo con arroz, menestra y patacones.', image: '/img/chuleta.webp', badge: 'Favorita' },
    ] },
    { name: 'Especialidades', products: [
      { id: 'chuleta-ahumada', name: 'Chuleta Ahumada', price: 8, description: 'Cocción lenta y sabor ahumado de nogal.', image: '/img/chuleta.webp', badge: 'Chef' },
      { id: 'guatita', name: 'Guatita', price: 5.5, description: 'Mondongo tierno en salsa cremosa de maní tostado.', image: '/img/guatita.webp' },
      { id: 'seco-carne', name: 'Seco de Carne', price: 6, description: 'Estofado lento con cerveza y cilantro fresco.', image: '/img/seco.webp' },
    ] },
    { name: 'Acompañantes', products: [
      { id: 'seco-pollo', name: 'Seco de Pollo', price: 5, description: 'Pollo estofado en salsa de naranjilla.', image: '/img/seco.webp' },
      { id: 'choclo-queso', name: 'Choclo con Queso', price: 2.5, description: 'Mazorca andina con queso artesanal.', image: '/img/choclo.webp' },
      { id: 'maduros', name: 'Maduros Fritos', price: 1.5, description: 'Tajadas caramelizadas, suaves y doradas.', image: '/img/choclo.webp' },
    ] },
  ],
};
