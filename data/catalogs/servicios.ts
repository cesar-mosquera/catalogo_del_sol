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
  sections: [
    { name: 'Modelos de Catálogos (Elige tu favorito)', products: [
      { id: 'plan-basico', name: 'Catálogo Lista Clásica', price: 45, description: 'Diseño práctico y directo al grano. Perfecto para pedir rápido a tu WhatsApp. Pago único, sin mensualidades.', image: '', badge: 'Económico', demoUrl: '/menu/demo-lista' },
      { id: 'plan-pro', name: 'Catálogo Libro 3D', price: 90, description: 'Tus clientes sentirán que pasan las páginas de un menú real. Calcula costos de envío y se instala como App en celulares. Pago único.', image: '', badge: 'El más vendido', demoUrl: '/menu/del-sol' },
      { id: 'plan-admin', name: 'Catálogo Administrable', price: 150, description: 'Diseño súper elegante (Minimalista). Incluye un Panel en tu celular para cambiar precios o subir fotos al instante. (Requiere mantenimiento mensual).', image: '', badge: 'Control Total', demoUrl: '/menu/demo-minimal' },
    ] },
    { name: 'Servicios Adicionales', products: [
      { id: 'hosting-db', name: 'Mantenimiento del Sistema', price: 15, description: 'Es como pagar la luz de tu local. Nos aseguramos de que tu Catálogo Administrable funcione sin caerse las 24 horas del día.', image: '', badge: 'Mensual' },
      { id: 'dominio-anual', name: 'Tu Propio Nombre en Internet', price: 20, description: 'En vez de un link genérico, tu menú será "www.tunegocio.com". Le da muchísimo prestigio a tu marca.', image: '' },
      { id: 'mantenimiento', name: 'Actualización de Menú', price: 10, description: '¿Tienes el Catálogo Simple o Avanzado y necesitas cambiar precios? Nos envías una foto de los cambios y lo hacemos por ti.', image: '' },
    ] }
  ],
};
