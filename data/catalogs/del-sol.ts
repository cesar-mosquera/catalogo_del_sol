import type { Catalog } from '@/lib/catalog-types';

export const delSol: Catalog = {
  slug: 'del-sol',
  name: 'Pinchos y Chuletas Del Sol',
  tagline: '',
  description: 'Menú digital de Pinchos y Chuletas Del Sol.',
  phone: '593969581620',
  address: 'Consulta la dirección al confirmar tu pedido.',
  coverImage: '/img/cover_new.png',
  logoImage: '/img/logo.webp',
  template: 'book',
  minimumOrder: 0,
  theme: {
    book: {
      pageBg: '#fef9c3', // yellow-100 (sol claro)
      pageText: '#713f12', // yellow-900
      heading: '#d97706', // amber-600
      headingSplash: 'rgba(253, 230, 138, 0.9)', // amber-200
    },
    card: {
      name: 'text-amber-900',
      price: 'text-orange-700',
      priceBox: 'bg-orange-50 ring-1 ring-orange-200',
      accent: 'bg-orange-500',
      accentHover: 'hover:bg-orange-600',
      badgeBg: 'bg-yellow-400',
      badgeText: 'text-yellow-950',
      ring: 'ring-orange-200',
    }
  },
  businessHours: { timezone: 'America/Guayaquil', open: 11, close: 22, openMinute: 30, closeMinute: 30, days: [0, 1, 2, 3, 4, 5, 6] },
  // Coordenadas del restaurante (Guayaquil, Ecuador) — ajusta según tu ubicación real
  location: { lat: -2.1710, lng: -79.9224 },
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
