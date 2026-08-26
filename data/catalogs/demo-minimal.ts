import type { Catalog } from '@/lib/catalog-types';

export const demoMinimal: Catalog = {
  slug: 'demo-minimal',
  name: 'Café & Aroma',
  tagline: 'Panadería y cafetería de especialidad',
  description: 'Demo única de la plantilla "Minimal". Un menú elegante para cafeterías, panaderías y repostería.',
  phone: '593999999999',
  address: 'Centro Comercial, Guayaquil',
  coverImage: '/img/demo/cafe-aroma-cover.svg',
  logoImage: '/img/demo/cafe-aroma-logo.svg',
  template: 'minimal',
  minimumOrder: 3,
  businessHours: { timezone: 'America/Guayaquil', open: 7, close: 19, days: [0, 1, 2, 3, 4, 5, 6] },
  location: { lat: -2.1710, lng: -79.9224 },
  deliveryBaseFee: 1.00,
  deliveryRatePerKm: 0.50,
  deliveryMaxKm: 0, // 0 = sin límite de radio: el cliente elige dónde y siempre puede pedir
  sections: [
    { name: 'Café Caliente', products: [
      { id: 'espresso', name: 'Espresso', price: 1.5, description: 'Café negro intenso y aromático.', image: '/img/demo/espresso.svg' },
      { id: 'capuchino', name: 'Capuchino', price: 2.5, description: 'Espresso con leche espumada y canela.', image: '/img/demo/capuchino.svg', badge: 'Más pedido' },
      { id: 'latte', name: 'Latte Vainilla', price: 3, description: 'Suave, cremoso y con un toque dulce.', image: '/img/demo/latte.svg' },
    ] },
    { name: 'Postres', products: [
      { id: 'cheesecake', name: 'Cheesecake de Fresa', price: 3.5, description: 'Tarta de queso horneada con mermelada casera.', image: '/img/demo/cheesecake.svg' },
      { id: 'croissant', name: 'Croissant de Mantequilla', price: 1.5, description: 'Crujiente y recién horneado.', image: '/img/demo/croissant.svg' },
      { id: 'tiramisu', name: 'Tiramisú', price: 3, description: 'Capas de bizcocho, café y mascarpone.', image: '/img/demo/tiramisu.svg', badge: 'Chef' },
    ] }
  ],
};
