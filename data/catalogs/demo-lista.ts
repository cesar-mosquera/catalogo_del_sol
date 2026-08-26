import type { Catalog } from '@/lib/catalog-types';

export const demoLista: Catalog = {
  slug: 'demo-lista',
  name: 'Burger Station',
  tagline: 'Las mejores hamburguesas de la ciudad',
  description: 'Demo única de la plantilla "Lista". Un menú completo para hamburgueserías, pizzerías y comida rápida.',
  phone: '593999999999',
  address: 'Av. Principal 123, Guayaquil',
  coverImage: '/img/demo/burger-station-cover.svg',
  logoImage: '/img/demo/burger-station-logo.svg',
  template: 'list',
  minimumOrder: 5,
  businessHours: { timezone: 'America/Guayaquil', open: 11, close: 23, days: [0, 1, 2, 3, 4, 5, 6] },
  location: { lat: -2.1710, lng: -79.9224 },
  deliveryBaseFee: 1.50,
  deliveryRatePerKm: 0.25,
  deliveryMaxKm: 0, // 0 = sin límite de radio: el cliente elige dónde y siempre puede pedir
  sections: [
    { name: 'Hamburguesas', products: [
      { id: 'burger-classic', name: 'Classic Burger', price: 5, description: 'Carne 150g, queso cheddar, lechuga y tomate.', image: '/img/demo/burger-classic.svg', badge: 'Clásica' },
      { id: 'burger-bacon', name: 'Bacon Station', price: 6.5, description: 'Doble queso, tocino crujiente y salsa BBQ.', image: '/img/demo/burger-bacon.svg', badge: 'Recomendada' },
      { id: 'burger-veggie', name: 'Veggie Burger', price: 5.5, description: 'Hamburguesa de lentejas con vegetales frescos.', image: '/img/demo/burger-veggie.svg' },
    ] },
    { name: 'Snacks & Bebidas', products: [
      { id: 'papas-fritas', name: 'Papas Fritas', price: 2.5, description: 'Papas crujientes con salsa de ajo.', image: '/img/demo/papas-fritas.svg' },
      { id: 'aros-cebolla', name: 'Aros de Cebolla', price: 3, description: 'Anillos dorados con mayonesa de la casa.', image: '/img/demo/aros-cebolla.svg' },
      { id: 'gaseosa', name: 'Gaseosa 500ml', price: 1.5, description: 'Bebida bien fría de tu sabor favorito.', image: '/img/demo/gaseosa.svg' },
      { id: 'malteada', name: 'Malteada de Vainilla', price: 3.5, description: 'Espesa y cremosa, con toque de canela.', image: '/img/demo/malteada.svg', badge: 'Nueva' },
    ] }
  ],
};
