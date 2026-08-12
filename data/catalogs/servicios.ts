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
    { name: 'Modelos de Menú', products: [
      { id: 'demo-libro', name: 'Plantilla "Libro 3D"', price: 0, description: 'Tus clientes sentirán que pasan las páginas de un libro real en su celular. Muy elegante y diferente.', image: '/img/logo.webp', badge: 'Vistosa', demoUrl: '/menu/del-sol' },
      { id: 'demo-lista', name: 'Plantilla "Lista Clásica"', price: 0, description: 'Diseño directo al grano. Perfecto si tienes muchos platos y quieres que tus clientes pidan rapidísimo.', image: '/img/chuleta.webp', badge: 'Práctica', demoUrl: '/menu/demo-lista' },
      { id: 'demo-minimal', name: 'Plantilla "Minimalista"', price: 0, description: 'Limpia, con fotos grandes y sin distracciones. Ideal para postres, cafeterías o productos gourmet.', image: '/img/seco.webp', badge: 'Elegante', demoUrl: '/menu/demo-minimal' },
    ] },
    { name: 'Sistemas de Catálogo', products: [
      { id: 'plan-basico', name: 'Catálogo Simple', price: 45, description: 'Perfecto para empezar. Un menú digital rápido donde tus clientes piden directo a tu WhatsApp. Te lo entregamos listo y nunca más pagas mensualidades.', image: '' },
      { id: 'plan-pro', name: 'Catálogo Avanzado', price: 90, description: 'Todo lo del Simple + Calculamos automáticamente el costo de envío según la distancia de tu cliente. Además, se instala como aplicación (App) en sus celulares. Pago único.', image: '', badge: 'El más vendido' },
      { id: 'plan-admin', name: 'Catálogo Administrable', price: 150, description: 'Incluye un Panel Secreto para ti. Desde tu celular podrás cambiar los precios, subir fotos o marcar platos como "Agotados" al instante. (Requiere pagar mantenimiento mensual).', image: '', demoUrl: '/admin', badge: 'Control Total' },
    ] },
    { name: 'Servicios Adicionales', products: [
      { id: 'hosting-db', name: 'Mantenimiento del Sistema', price: 15, description: 'Es como pagar la luz de tu local. Nos aseguramos de que tu Catálogo Administrable funcione sin caerse las 24 horas del día.', image: '', badge: 'Mensual' },
      { id: 'dominio-anual', name: 'Tu Propio Nombre en Internet', price: 20, description: 'En vez de un link genérico, tu menú será "www.tunegocio.com". Le da muchísimo prestigio a tu marca.', image: '' },
      { id: 'mantenimiento', name: 'Actualización de Menú', price: 10, description: '¿Tienes el Catálogo Simple o Avanzado y necesitas cambiar precios? Nos envías una foto de los cambios y lo hacemos por ti.', image: '' },
    ] }
  ],
};
