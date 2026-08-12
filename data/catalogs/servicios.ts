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
    { name: 'Planes de Catálogos', products: [
      { id: 'plan-basico', name: 'Plan Básico', price: 45, description: '1 catálogo con plantilla, carrito, WhatsApp, panel admin y publicación en tu dominio. Entrega en 2-3 días.', image: '/img/cover.webp' },
      { id: 'plan-pro', name: 'Plan Pro', price: 90, description: 'Básico + Mapa de envío por km, App instalable (PWA), personalización y 30 días de soporte. Entrega en 4-5 días.', image: '/img/cover.webp', badge: 'Popular' },
      { id: 'plan-premium', name: 'Plan Premium', price: 180, description: 'Pro + Diseño 100% personalizado, múltiples sucursales, dominio propio y 3 meses de soporte.', image: '/img/cover.webp' },
    ] },
    { name: 'Plantillas de Diseño', products: [
      { id: 'demo-libro', name: 'Plantilla "Libro 3D"', price: 0, description: 'Nuestra plantilla más vistosa. Ideal para restaurantes y negocios con fuerte identidad visual. (Incluida en todos los planes)', image: '/img/cover.webp', badge: 'Vistosa', demoUrl: '/menu/del-sol' },
      { id: 'demo-lista', name: 'Plantilla "Lista Clásica"', price: 0, description: 'Diseño limpio y ordenado en formato grilla. Excelente para pizzerías, fast-food o menús con muchos ítems. (Incluida en todos los planes)', image: '/img/cover.webp', badge: 'Completa', demoUrl: '/menu/demo-lista' },
      { id: 'demo-minimal', name: 'Plantilla "Minimalista"', price: 0, description: 'Estética limpia y elegante. Altamente recomendada para cafeterías, repostería o negocios gourmet. (Incluida en todos los planes)', image: '/img/cover.webp', badge: 'Elegante', demoUrl: '/menu/demo-minimal' },
    ] },
    { name: 'Servicios Adicionales', products: [
      { id: 'dominio-anual', name: 'Dominio Anual', price: 20, description: 'Registro de dominio .com o .net por un año (ej. tunegocio.com).', image: '' },
      { id: 'mantenimiento', name: 'Soporte y Mantenimiento Mensual', price: 15, description: 'Soporte técnico, cambios en el menú y actualizaciones durante 1 mes.', image: '' },
    ] }
  ],
};
