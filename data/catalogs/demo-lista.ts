import type { Catalog } from '@/lib/catalog-types';

export const demoLista: Catalog = {
  slug: 'demo-lista',
  name: 'Burger Station (Demo Lista)',
  tagline: 'Las mejores hamburguesas de la ciudad',
  description: 'Ejemplo de la plantilla "Lista". Ideal para menús largos, pizzerías y comida rápida.',
  phone: '593999999999',
  address: 'Demo Address',
  coverImage: '/img/cover.webp',
  logoImage: '/img/logo.webp',
  template: 'list',
  minimumOrder: 5,
  businessHours: { timezone: 'America/Guayaquil', open: 11, close: 23, days: [0, 1, 2, 3, 4, 5, 6] },
  location: { lat: -2.1710, lng: -79.9224 },
  deliveryBaseFee: 1.50,
  deliveryRatePerKm: 0.25,
  deliveryMaxKm: 10,
  sections: [
    { name: 'Hamburguesas', products: [
      { id: 'burger-classic', name: 'Classic Burger', price: 5, description: 'Carne 150g, queso cheddar, lechuga y tomate.', image: '/img/chuleta.webp' },
      { id: 'burger-bacon', name: 'Bacon Station', price: 6.5, description: 'Doble queso, tocino crujiente y salsa BBQ.', image: '/img/chuleta.webp', badge: 'Recomendada' },
      { id: 'burger-veggie', name: 'Veggie Burger', price: 5.5, description: 'Hamburguesa de lentejas con vegetales frescos.', image: '/img/chuleta.webp' },
    ] },
    { name: 'Snacks & Bebidas', products: [
      { id: 'papas-fritas', name: 'Papas Fritas', price: 2.5, description: 'Papas crujientes con salsa de ajo.', image: '/img/choclo.webp' },
      { id: 'soda', name: 'Gaseosa', price: 1.5, description: 'Bebida carbonatada 500ml.', image: '/img/choclo.webp' },
    ] }
  ],
};
