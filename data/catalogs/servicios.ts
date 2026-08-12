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
      { id: 'plan-basico', name: 'Plan Básico (Estático)', price: 45, description: 'Catálogo estático ultra-rápido con carrito a WhatsApp. Alojamiento gratuito de por vida, ¡sin mensualidades!', image: '/img/cover.webp' },
      { id: 'plan-pro', name: 'Plan Pro (Estático)', price: 90, description: 'Básico + Cálculo de envíos en mapa, App instalable (PWA) y personalización profunda. Sin pagos mensuales.', image: '/img/cover.webp', badge: 'Popular' },
      { id: 'plan-admin', name: 'Plan Administrable (Con Panel)', price: 150, description: 'Catálogo dinámico con panel de administración para que cambies precios e imágenes tú mismo. (Requiere plan de Hosting mensual).', image: '/img/cover.webp' },
    ] },
    { name: 'Plantillas de Diseño', products: [
      { id: 'demo-libro', name: 'Plantilla "Libro 3D"', price: 0, description: 'Nuestra plantilla más vistosa. Ideal para restaurantes y negocios con fuerte identidad visual. (Incluida en todos los planes)', image: '/img/cover.webp', badge: 'Vistosa', demoUrl: '/menu/del-sol' },
      { id: 'demo-lista', name: 'Plantilla "Lista Clásica"', price: 0, description: 'Diseño limpio y ordenado en formato grilla. Excelente para pizzerías, fast-food o menús con muchos ítems. (Incluida en todos los planes)', image: '/img/cover.webp', badge: 'Completa', demoUrl: '/menu/demo-lista' },
      { id: 'demo-minimal', name: 'Plantilla "Minimalista"', price: 0, description: 'Estética limpia y elegante. Altamente recomendada para cafeterías, repostería o negocios gourmet. (Incluida en todos los planes)', image: '/img/cover.webp', badge: 'Elegante', demoUrl: '/menu/demo-minimal' },
    ] },
    { name: 'Suscripciones y Servicios', products: [
      { id: 'hosting-db', name: 'Suscripción de Hosting y BD', price: 15, description: 'Mensualidad para mantener online el Plan Administrable. Incluye base de datos, servidores rápidos y backups de seguridad.', image: '', badge: 'Mensual' },
      { id: 'dominio-anual', name: 'Dominio Propio Anual', price: 20, description: 'Registro de dominio web (.com o .net) por un año completo (ej. tunegocio.com).', image: '' },
      { id: 'mantenimiento', name: 'Modificación de Menú', price: 10, description: '¿Tienes un plan estático? Nosotros nos encargamos de actualizar tus precios o agregar nuevos platos. (Pago por evento)', image: '' },
    ] }
  ],
};
