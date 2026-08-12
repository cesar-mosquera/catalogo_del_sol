import type { Catalog } from '@/lib/catalog-types';

export const demoMinimal: Catalog = {
  slug: 'demo-minimal',
  name: 'Café & Aroma (Demo Minimal)',
  tagline: 'Panadería y cafetería de especialidad',
  description: 'Ejemplo de la plantilla "Minimal". Ideal para negocios elegantes, cafeterías y repostería.',
  phone: '593999999999',
  address: 'Demo Address',
  coverImage: '/img/cover.webp',
  logoImage: '/img/logo.webp',
  template: 'minimal',
  minimumOrder: 3,
  businessHours: { timezone: 'America/Guayaquil', open: 7, close: 19, days: [0, 1, 2, 3, 4, 5, 6] },
  location: { lat: -2.1710, lng: -79.9224 },
  deliveryBaseFee: 1.00,
  deliveryRatePerKm: 0.50,
  deliveryMaxKm: 5,
  sections: [
    { name: 'Café Caliente', products: [
      { id: 'espresso', name: 'Espresso', price: 1.5, description: 'Café negro intenso y aromático.', image: '/img/seco.webp' },
      { id: 'capuchino', name: 'Capuchino', price: 2.5, description: 'Café espresso con leche espumada y canela.', image: '/img/seco.webp', badge: 'Más pedido' },
    ] },
    { name: 'Postres', products: [
      { id: 'cheesecake', name: 'Cheesecake de Fresa', price: 3.5, description: 'Tarta de queso horneada con mermelada casera.', image: '/img/choclo.webp' },
      { id: 'croissant', name: 'Croissant de Mantequilla', price: 1.5, description: 'Crujiente y recién horneado.', image: '/img/choclo.webp' },
    ] }
  ],
};
