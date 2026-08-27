import type { Catalog } from '@/lib/catalog-types';

export const nuevoNegocio: Catalog = {
  slug: 'nuevo-negocio',
  name: 'Mi Nuevo Negocio',
  tagline: 'Lo mejor en productos y servicios',
  description: 'Catálogo digital de prueba creado para demostración.',
  phone: '593969581620',
  address: 'Av. Principal y Secundaria',
  coverImage: '/img/demo/nuevo-negocio-cover.svg',
  logoImage: '/img/demo/nuevo-negocio-logo.svg',
  template: 'list',
  minimumOrder: 10,
  businessHours: { timezone: 'America/Guayaquil', open: 9, close: 18, days: [1, 2, 3, 4, 5] },
  location: { lat: -2.1894, lng: -79.8891 }, // Guayaquil central
  deliveryBaseFee: 2.00,
  deliveryRatePerKm: 0.50,
  deliveryMaxKm: 0,
  requiresShipping: true,
  sections: [
    { name: 'Populares', products: [
      { id: 'prod-1', name: 'Producto 1', price: 15, description: 'Descripción detallada del primer producto.', image: '/img/demo/producto-1.svg' },
      { id: 'prod-2', name: 'Producto 2', price: 25, description: 'Descripción detallada del segundo producto.', image: '/img/demo/producto-2.svg' },
    ] },
    { name: 'Novedades', products: [
      { id: 'prod-3', name: 'Producto 3', price: 30, description: 'Un producto muy especial y novedoso.', image: '/img/demo/producto-3.svg' },
    ] }
  ],
};
