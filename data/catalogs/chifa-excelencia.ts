import type { Catalog } from '@/lib/catalog-types';

export const chifaExcelencia: Catalog = {
  slug: 'chifa-excelencia',
  name: 'CHIFA EXCELENCIA',
  tagline: 'Bienvenidos',
  description: 'Menú digital de CHIFA EXCELENCIA: combos, sopas, chaulafán, platos orientales y bebidas.',
  phone: '593977364021',
  address: 'Av. Maldonado y IS57 (Sector Guamani)',
  coverImage: '/img/portada.webp',
  infoImage: '/img/subportada.webp',
  logoImage: '',  // pendiente: logo extraído del PDF
  template: 'book',
  minimumOrder: 0,
  businessHours: { timezone: 'America/Guayaquil', open: 11, close: 23, days: [0, 1, 2, 3, 4, 5, 6] },
  location: { lat: -2.2137, lng: -79.8942 },
  requiresShipping: false,
  checkoutNote: 'Los pedidos se confirman por WhatsApp. Para llevar tiene un costo de 0,30 ctv. por cada tarrina.',

  /* ── Paleta extraída del PDF ── */
  theme: {
    coverBg: '#682a20',            // granate chino: portada y contraportada
    coverTitle: '#eab33a',         // dorado: "CHIFA EXCELENCIA"
    coverTagline: '#f4d68c',       // dorado claro: "Bienvenidos"
    pageBg: '#fbd581',             // crema: fondo de páginas interiores
    pageText: '#2c6934',           // verde bosque: nombres de productos
    heading: '#a6281e',            // rojo carmesí: títulos de sección
    headingSplash: '#e98825',      // naranja: pincelada detrás de títulos
    card: {
      accent: 'bg-[#e98825]',
      accentHover: 'hover:bg-[#d97b1b]',
      ring: 'ring-[#e9b873]',
      price: 'text-[#191919]',
      priceBox: 'bg-white px-2 py-0.5 rounded-[6px]',
      badgeBg: 'bg-[#e98825]',
      badgeText: 'text-white',
      name: 'text-[#2c6934]',
    },
  },

  /* ── Contraportada del PDF: página 15 ── */
  backCover: {
    title: 'Vuelve Pronto',
    subtitle: '⛩️',
    rows: [
      { label: 'Horario de atención', value: '11:30 am hasta 10:30 pm' },
      { label: 'Servicio a domicilio', value: '097 736 4021' },
      { label: 'Ubicación', value: 'Av. Maldonado y IS57 (Sector Guamani)' },
    ],
    footer: 'DISEÑO & IMPRESIÓN SERVIGRAF EDITORES 321 6666 / 0999 646 748',
  },

  sections: [
    /* ════════ LOS COMBOS (págs. 3–6 del PDF) ════════ */
    { name: 'Los Combos', note: 'Todos los combos incluyen wantán frito y limonada (o cola)', products: [
      { id: 'combo-1', name: 'COMBO #1', price: 6.80, description: '½ Chaulafán especial, Tortilla de huevo (o huevo frito), Wantán frito, Limonada (o cola).', image: '' },
      { id: 'combo-2', name: 'COMBO #2', price: 6.80, description: '½ Chaulafán especial, Papas fritas, Wantán frito, Limonada (o cola).', image: '' },
      { id: 'combo-3', name: 'COMBO #3', price: 7.50, description: 'Consomé de pollo (o sopa wantán), ½ Chaulafán especial, Wantán frito, Limonada (o cola).', image: '' },
      { id: 'combo-4', name: 'COMBO #4', price: 7.50, description: 'Consomé de pollo (o sopa wantán), ½ Tallarín especial, Wantán frito, Limonada (o cola).', image: '' },
      { id: 'combo-5', name: 'COMBO #5', price: 8.20, description: 'Consomé de pollo (o sopa wantán), Lomo salteado con papas (o lomo con verduras), Wantán frito, Limonada (o cola).', image: '' },
      { id: 'combo-6', name: 'COMBO #6', price: 8.20, description: 'Consomé de pollo (o sopa wantán), Pollo salteado con papas (o pollo con verduras), Wantán frito, Limonada (o cola).', image: '' },
      { id: 'combo-7', name: 'COMBO #7', price: 12.80, description: 'Consomé de pollo (o sopa wantán), Camarón salteado con papas (o camarón con verduras), Wantán frito, Limonada (o cola).', image: '', badge: 'Mariscos' },
      { id: 'combo-8', name: 'COMBO #8', price: 8.90, description: 'Consomé de pollo (o sopa wantán), Chancho agridulce, ½ Chaulafán especial, Wantán frito, Limonada (o cola).', image: '' },
      { id: 'combo-9', name: 'COMBO #9', price: 8.90, description: 'Consomé de pollo (o sopa wantán), Pollo agridulce, ½ Chaulafán especial, Wantán frito, Limonada (o cola).', image: '' },
      { id: 'combo-10', name: 'COMBO #10', price: 9.50, description: 'Consomé de pollo (o sopa wantán), Chancho en salsa de naranja, ½ Chaulafán especial, Wantán frito, Limonada (o cola).', image: '' },
      { id: 'combo-11', name: 'COMBO #11', price: 9.50, description: 'Consomé de pollo (o sopa wantán), Pollo en salsa de naranja, ½ Chaulafán especial, Wantán frito, Limonada (o cola).', image: '' },
      { id: 'combo-12', name: 'COMBO #12', price: 9.80, description: 'Consomé de pollo (o sopa wantán), ½ Mixto especial, Wantán frito, Limonada (o cola).', image: '' },
      { id: 'combo-13', name: 'COMBO #13', price: 13.80, description: 'Consomé de pollo (o sopa wantán), Mixto de mariscos, Wantán frito, Limonada (o cola).', image: '', badge: 'Mariscos' },
      { id: 'combo-14', name: 'COMBO #14', price: 11.80, description: 'Consomé de pollo (o sopa wantán), Churrasco de lomo (o churrasco de pollo), Wantán frito, Limonada (o cola).', image: '' },
      { id: 'combo-15', name: 'COMBO #15', price: 10.50, description: 'Consomé de pollo (o sopa wantán), Pollo frito 1/8, ½ Chaulafán especial, Wantán frito, Limonada (o cola).', image: '' },
      { id: 'combo-16', name: 'COMBO #16', price: 10.50, description: 'Consomé de pollo (o sopa wantán), Alitas BBQ (o alitas en salsa agridulce), ½ Chaulafán especial, Wantán frito, Limonada (o cola).', image: '' },
      { id: 'combo-17', name: 'COMBO #17', price: 12.50, description: 'Consomé de pollo (o sopa wantán), Pollo apanado, ½ Chaulafán especial, Wantán frito, Limonada (o cola).', image: '' },
      { id: 'combo-18', name: 'COMBO #18', price: 12.50, description: 'Consomé de pollo (o sopa wantán), Lomo apanado, ½ Chaulafán especial, Wantán frito, Limonada (o cola).', image: '' },
      { id: 'combo-19', name: 'COMBO #19', price: 13.80, description: 'Consomé de pollo (o sopa wantán), Camarón apanado, ½ Chaulafán especial, Wantán frito, Limonada (o cola).', image: '', badge: 'Mariscos' },
      { id: 'combo-20', name: 'COMBO #20', price: 13.80, description: 'Consomé de pollo (o sopa wantán), Corvina apanada, ½ Chaulafán especial, Wantán frito, Limonada (o cola).', image: '', badge: 'Pescado' },
    ] },

    /* ════════ ENTRADAS ════════ */
    { name: 'Entradas', note: '', products: [
      { id: 'wantun-clasico', name: 'Wantán frito clásico (10 unidades)', price: 4.80, description: '', image: '' },
      { id: 'wantun-camaron-queso', name: 'Wantán relleno camarón y queso (10 unidades)', price: 6.50, description: '', image: '' },
      { id: 'wantun-cangrejo-queso', name: 'Wantán relleno cangrejo y queso (10 unidades)', price: 6.50, description: '', image: '' },
      { id: 'rollos-primavera', name: 'Rollos primavera (8 unidades)', price: 6.50, description: '', image: '' },
      { id: 'wantun-mosaico', name: 'Wantán mosaico (12 unidades)', price: 8.50, description: '', image: '' },
      { id: 'con-lu-wantun', name: 'Con Lu Wantán (wantán frito con salsa agridulce)', price: 8.50, description: '', image: '' },
      { id: 'alitas-bbq', name: 'Alitas BBQ (con papas fritas y ensalada)', price: 8.50, description: '', image: '' },
      { id: 'papas-fritas', name: 'Porción de papas fritas', price: 3.50, description: '', image: '' },
      { id: 'porcion-arroz', name: 'Porción de arroz', price: 2.00, description: '', image: '' },
    ] },

    /* ════════ SOPAS ════════ */
    { name: 'Sopas', note: '', products: [
      { id: 'sopa-consome-pollo', name: 'Consomé de pollo', price: 3.20, description: '', image: '' },
      { id: 'sopa-consome-reina', name: 'Consomé a la reina', price: 4.50, description: '', image: '' },
      { id: 'sopa-menudencia', name: 'Sopa de menudencia', price: 4.50, description: '', image: '' },
      { id: 'sopa-tallarin', name: 'Sopa tallarín', price: 6.80, description: '', image: '' },
      { id: 'sopa-wantan-tallarin', name: 'Sopa wantán con tallarín', price: 6.80, description: '', image: '', badge: 'Popular' },
      { id: 'sopa-pollo-jengibre', name: 'Sopa de pollo con jengibre', price: 6.50, description: '', image: '' },
      { id: 'sopa-camaron-jengibre', name: 'Sopa de camarón con jengibre', price: 8.50, description: '', image: '', badge: 'Mariscos' },
      { id: 'sopa-mariscos', name: 'Sopa de mariscos', price: 8.50, description: '', image: '', badge: 'Mariscos' },
      { id: 'sopa-chopsuey', name: 'Sopa chopsuey', price: 6.80, description: '', image: '' },
      { id: 'crema-cangrejo-choclo', name: 'Crema de cangrejo con choclo', price: 4.80, description: '', image: '' },
      { id: 'crema-champinones-pollo', name: 'Crema de champiñones con pollo', price: 4.80, description: '', image: '' },
      { id: 'crema-mariscos', name: 'Crema de mariscos', price: 8.50, description: '', image: '', badge: 'Mariscos' },
      { id: 'crema-pac-pow', name: 'Crema pac pow', price: 4.80, description: '', image: '' },
    ] },

    /* ════════ CHAULAFÁN ════════ */
    { name: 'Chaulafán', note: 'MEDIO / COMPLETO', products: [
      { id: 'chaulafan-especial', name: 'Chaulafán especial', price: 5.50, description: '', priceNote: 'MEDIO $5.50 · COMPLETO $6.50', image: '', badge: 'Popular' },
      { id: 'chaulafan-pollo', name: 'Chaulafán de pollo', price: 5.80, description: '', priceNote: 'MEDIO $5.80 · COMPLETO $6.80', image: '' },
      { id: 'chaulafan-lomo', name: 'Chaulafán de lomo', price: 5.80, description: '', priceNote: 'MEDIO $5.80 · COMPLETO $6.80', image: '' },
      { id: 'chaulafan-camaron', name: 'Chaulafán de camarón', price: 9.80, description: '', priceNote: 'MEDIO $9.80 · COMPLETO $10.80', image: '', badge: 'Mariscos' },
      { id: 'chaulafan-camaron-grande', name: 'Chaulafán de camarón grande', price: 11.80, description: '', priceNote: 'MEDIO $11.80 · COMPLETO $12.80', image: '', badge: 'Mariscos' },
      { id: 'chaulafan-chancho', name: 'Chaulafán de chancho', price: 6.80, description: '', priceNote: 'MEDIO $6.80 · COMPLETO $7.80', image: '' },
      { id: 'chaulafan-concha', name: 'Chaulafán de concha', price: 6.80, description: '', priceNote: 'MEDIO $6.80 · COMPLETO $7.80', image: '' },
      { id: 'chaulafan-mariscos', name: 'Chaulafán de mariscos', price: 11.80, description: '', priceNote: 'MEDIO $11.80 · COMPLETO $12.80', image: '', badge: 'Mariscos' },
      { id: 'chaulafan-cantones', name: 'Chaulafán cantones', price: 11.80, description: '', priceNote: 'MEDIO $11.80 · COMPLETO $12.80', image: '' },
      { id: 'chaulafan-vegetariano', name: 'Chaulafán vegetariano', price: 5.50, description: '', priceNote: 'MEDIO $5.50 · COMPLETO $6.50', image: '', badge: 'Vegetariano' },
    ] },

    /* ════════ ARROZ ════════ */
    { name: 'Arroz', note: 'MEDIO / COMPLETO', products: [
      { id: 'arroz-pollo', name: 'Arroz con pollo', price: 5.80, description: '', priceNote: 'MEDIO $5.80 · COMPLETO $6.80', image: '' },
      { id: 'arroz-lomo', name: 'Arroz con lomo', price: 5.80, description: '', priceNote: 'MEDIO $5.80 · COMPLETO $6.80', image: '' },
      { id: 'arroz-camaron', name: 'Arroz con camarón', price: 9.80, description: '', priceNote: 'MEDIO $9.80 · COMPLETO $10.80', image: '', badge: 'Mariscos' },
      { id: 'arroz-camaron-grande', name: 'Arroz con camarón grande', price: 11.80, description: '', priceNote: 'MEDIO $11.80 · COMPLETO $12.80', image: '', badge: 'Mariscos' },
      { id: 'arroz-chancho', name: 'Arroz con chancho', price: 6.80, description: '', priceNote: 'MEDIO $6.80 · COMPLETO $7.80', image: '' },
      { id: 'arroz-concha', name: 'Arroz con concha', price: 6.80, description: '', priceNote: 'MEDIO $6.80 · COMPLETO $7.80', image: '' },
      { id: 'arroz-mariscos', name: 'Arroz con mariscos', price: 11.80, description: '', priceNote: 'MEDIO $11.80 · COMPLETO $12.80', image: '', badge: 'Mariscos' },
      { id: 'arroz-cantones', name: 'Arroz cantones', price: 11.80, description: '', priceNote: 'MEDIO $11.80 · COMPLETO $12.80', image: '' },
      { id: 'arroz-vegetariano', name: 'Arroz vegetariano', price: 5.50, description: '', priceNote: 'MEDIO $5.50 · COMPLETO $6.50', image: '', badge: 'Vegetariano' },
    ] },

    /* ════════ TALLARÍN ════════ */
    { name: 'Tallarín', note: 'MEDIO / COMPLETO', products: [
      { id: 'tallarin-especial-verduras', name: 'Tallarín especial con verduras', price: 6.50, description: '', priceNote: 'MEDIO $6.50 · COMPLETO $7.50', image: '', badge: 'Popular' },
      { id: 'tallarin-pollo', name: 'Tallarín salteado con pollo', price: 6.80, description: '', priceNote: 'MEDIO $6.80 · COMPLETO $7.80', image: '' },
      { id: 'tallarin-lomo', name: 'Tallarín salteado con lomo', price: 6.80, description: '', priceNote: 'MEDIO $6.80 · COMPLETO $7.80', image: '' },
      { id: 'tallarin-camaron', name: 'Tallarín salteado con camarón', price: 8.80, description: '', priceNote: 'MEDIO $8.80 · COMPLETO $9.80', image: '', badge: 'Mariscos' },
      { id: 'tallarin-chancho', name: 'Tallarín salteado con chancho', price: 7.80, description: '', priceNote: 'MEDIO $7.80 · COMPLETO $8.80', image: '' },
      { id: 'tallarin-mariscos', name: 'Tallarín salteado con mariscos', price: 11.80, description: '', priceNote: 'MEDIO $11.80 · COMPLETO $12.80', image: '', badge: 'Mariscos' },
      { id: 'tallarin-frito', name: 'Tallarín frito', price: 7.20, description: '', priceNote: 'MEDIO $7.20 · COMPLETO $8.20', image: '' },
      { id: 'tallarin-cantones', name: 'Tallarín cantones', price: 10.80, description: '', priceNote: 'MEDIO $10.80 · COMPLETO $11.80', image: '' },
      { id: 'tallarin-agridulce', name: 'Tallarín agridulce', price: 10.80, description: '', priceNote: 'MEDIO $10.80 · COMPLETO $11.80', image: '' },
    ] },

    /* ════════ TALLARÍN CON CHAMPIÑONES ════════ */
    { name: 'Tallarín con champiñones', note: 'MEDIO / COMPLETO', products: [
      { id: 'tallarin-champinon-especial', name: 'Tallarín especial con champiñones', price: 7.50, description: '', priceNote: 'MEDIO $7.50 · COMPLETO $8.50', image: '' },
      { id: 'tallarin-champinon-pollo', name: 'Tallarín de pollo con champiñones', price: 7.80, description: '', priceNote: 'MEDIO $7.80 · COMPLETO $8.80', image: '' },
      { id: 'tallarin-champinon-lomo', name: 'Tallarín de lomo con champiñones', price: 7.80, description: '', priceNote: 'MEDIO $7.80 · COMPLETO $8.80', image: '' },
      { id: 'tallarin-champinon-camaron', name: 'Tallarín de camarón con champiñones', price: 12.80, description: '', priceNote: 'MEDIO $12.80 · COMPLETO $13.80', image: '', badge: 'Mariscos' },
      { id: 'tallarin-champinon-chancho', name: 'Tallarín de chancho con champiñones', price: 7.80, description: '', priceNote: 'MEDIO $7.80 · COMPLETO $8.80', image: '' },
      { id: 'tallarin-champinon-mariscos', name: 'Tallarín de mariscos con champiñones', price: 12.80, description: '', priceNote: 'MEDIO $12.80 · COMPLETO $13.80', image: '', badge: 'Mariscos' },
    ] },

    /* ════════ MIXTOS ════════ */
    { name: 'Mixtos', note: 'MEDIO / COMPLETO', products: [
      { id: 'mixto-especial', name: 'Mixto especial', price: 7.20, description: '', priceNote: 'MEDIO $7.20 · COMPLETO $8.20', image: '', badge: 'Popular' },
      { id: 'mixto-pollo', name: 'Mixto de pollo', price: 7.80, description: '', priceNote: 'MEDIO $7.80 · COMPLETO $8.80', image: '' },
      { id: 'mixto-lomo', name: 'Mixto de lomo', price: 7.80, description: '', priceNote: 'MEDIO $7.80 · COMPLETO $8.80', image: '' },
      { id: 'mixto-chancho', name: 'Mixto de chancho', price: 8.80, description: '', priceNote: 'MEDIO $8.80 · COMPLETO $9.80', image: '' },
      { id: 'mixto-camaron', name: 'Mixto de camarón', price: 12.80, description: '', priceNote: 'MEDIO $12.80 · COMPLETO $13.80', image: '', badge: 'Mariscos' },
      { id: 'mixto-mariscos', name: 'Mixto de mariscos', price: 12.80, description: '', priceNote: 'MEDIO $12.80 · COMPLETO $13.80', image: '', badge: 'Mariscos' },
      { id: 'mixto-chancho-tamarindo', name: 'Mixto de chancho tamarindo', price: 8.80, description: '', priceNote: 'MEDIO $8.80 · COMPLETO $9.80', image: '' },
    ] },

    /* ════════ SALTEADOS CON CHAMPIÑONES ════════ */
    { name: 'Salteados con champiñones', note: 'Todos con papas o arroz · MEDIO / COMPLETO', products: [
      { id: 'salteado-pollo-champinones', name: 'Pollo salteado con champiñones y verduras', price: 8.20, description: '', priceNote: 'MEDIO $8.20 · COMPLETO $9.20', image: '' },
      { id: 'salteado-lomo-champinones', name: 'Lomo salteado con champiñones y verduras', price: 8.20, description: '', priceNote: 'MEDIO $8.20 · COMPLETO $9.20', image: '' },
      { id: 'salteado-mariscos-champinones', name: 'Mariscos salteados con champiñones y verduras', price: 12.80, description: '', priceNote: 'MEDIO $12.80 · COMPLETO $13.80', image: '', badge: 'Mariscos' },
      { id: 'salteado-chancho-champinones', name: 'Chancho salteado con champiñones y verduras', price: 8.80, description: '', priceNote: 'MEDIO $8.80 · COMPLETO $9.80', image: '' },
      { id: 'salteado-chopsuey-champinones', name: 'Chopsuey salteado con champiñones y verduras', price: 8.80, description: '', priceNote: 'MEDIO $8.80 · COMPLETO $9.80', image: '' },
      { id: 'salteado-camaron-champinones', name: 'Camarón salteado con champiñones y verduras', price: 12.80, description: '', priceNote: 'MEDIO $12.80 · COMPLETO $13.80', image: '', badge: 'Mariscos' },
      { id: 'salteado-calamar-champinones', name: 'Calamar salteado con champiñones y verduras', price: 12.80, description: '', priceNote: 'MEDIO $12.80 · COMPLETO $13.80', image: '', badge: 'Mariscos' },
      { id: 'salteado-corvina-champinones', name: 'Corvina salteada con champiñones y verduras', price: 12.80, description: '', priceNote: 'MEDIO $12.80 · COMPLETO $13.80', image: '', badge: 'Pescado' },
      { id: 'salteado-conchas-champinones', name: 'Conchas salteadas con champiñones y verduras', price: 12.80, description: '', priceNote: 'MEDIO $12.80 · COMPLETO $13.80', image: '', badge: 'Mariscos' },
    ] },

    /* ════════ AGRIDULCE ════════ */
    { name: 'Agridulce', note: '', products: [
      { id: 'agridulce-pollo-tamarindo', name: 'Pollo en salsa de tamarindo', price: 9.50, description: '', image: '', badge: 'Popular' },
      { id: 'agridulce-lomo-tamarindo', name: 'Lomo en salsa de tamarindo', price: 9.50, description: '', image: '' },
      { id: 'agridulce-camaron-tamarindo', name: 'Camarón en salsa de tamarindo', price: 13.80, description: '', image: '', badge: 'Mariscos' },
      { id: 'agridulce-corvina-tamarindo', name: 'Corvina en salsa de tamarindo', price: 13.80, description: '', image: '', badge: 'Pescado' },
      { id: 'agridulce-chancho-tamarindo', name: 'Chancho en salsa de tamarindo', price: 9.80, description: '', image: '' },
      { id: 'agridulce-chopsuey-tamarindo', name: 'Chopsuey en salsa de tamarindo', price: 10.80, description: '', image: '' },
      { id: 'agridulce-pollo-naranja', name: 'Pollo en salsa de naranja', price: 10.80, description: '', image: '' },
      { id: 'agridulce-chancho-naranja', name: 'Chancho en salsa de naranja', price: 10.80, description: '', image: '' },
    ] },

    /* ════════ PICANTE ════════ */
    { name: 'Picante', note: 'Todos con papas o arroz', products: [
      { id: 'picante-lomo', name: 'Lomo picante ají y tausí', price: 9.50, description: '', image: '' },
      { id: 'picante-pollo', name: 'Pollo picante ají y tausí', price: 9.50, description: '', image: '' },
      { id: 'picante-camaron', name: 'Camarón picante ají y tausí', price: 13.80, description: '', image: '', badge: 'Mariscos' },
      { id: 'picante-calamar', name: 'Calamar picante ají y tausí', price: 13.80, description: '', image: '', badge: 'Mariscos' },
      { id: 'picante-chancho', name: 'Chancho picante ají y tausí', price: 10.80, description: '', image: '' },
      { id: 'picante-chopsuey', name: 'Chopsuey picante ají y tausí', price: 10.80, description: '', image: '' },
    ] },

    /* ════════ PLANCHAS ════════ */
    { name: 'Planchas', note: 'Salsas: ostión / cantonesa / curry / ají tausí / jengibre', products: [
      { id: 'plancha-pollo', name: 'Pollo a la plancha', price: 9.80, description: '', image: '' },
      { id: 'plancha-lomo', name: 'Lomo a la plancha', price: 9.80, description: '', image: '' },
      { id: 'plancha-camaron', name: 'Camarón a la plancha', price: 12.80, description: '', image: '', badge: 'Mariscos' },
      { id: 'plancha-calamar', name: 'Calamar a la plancha', price: 12.80, description: '', image: '', badge: 'Mariscos' },
      { id: 'plancha-costilla', name: 'Costilla a la plancha', price: 12.80, description: '', image: '' },
      { id: 'plancha-conchas', name: 'Conchas a la plancha', price: 12.80, description: '', image: '', badge: 'Mariscos' },
      { id: 'plancha-chopsuey', name: 'Chopsuey a la plancha', price: 10.20, description: '', image: '' },
      { id: 'plancha-mariscos', name: 'Mariscos a la plancha', price: 12.80, description: '', image: '', badge: 'Mariscos' },
    ] },

    /* ════════ APANADOS ════════ */
    { name: 'Apanados', note: 'Todos con papas fritas, chaulafán y ensalada', products: [
      { id: 'apanado-pollo', name: 'Pollo apanado', price: 9.80, description: '', image: '' },
      { id: 'apanado-lomo', name: 'Lomo apanado', price: 9.80, description: '', image: '' },
      { id: 'apanado-camaron', name: 'Camarón apanado', price: 12.80, description: '', image: '', badge: 'Mariscos' },
      { id: 'apanado-corvina', name: 'Corvina apanada', price: 12.80, description: '', image: '', badge: 'Pescado' },
      { id: 'apanado-mixto', name: 'Apanado mixto', price: 13.80, description: '', image: '' },
      { id: 'apanado-camaron-crocante', name: 'Camarón crocante', price: 12.80, description: '', image: '', badge: 'Mariscos' },
    ] },

    /* ════════ LOMO DE RES ════════ */
    { name: 'Lomo de Res', note: '', products: [
      { id: 'lomo-curry-papas', name: 'Lomo salteado con curry y papas (con arroz)', price: 9.50, description: '', image: '' },
      { id: 'lomo-brocoli-tausi', name: 'Lomo salteado con brócoli y tausí (con papas o arroz)', price: 9.50, description: '', image: '' },
      { id: 'lomo-tomate', name: 'Lomo salteado con tomate (con papas o arroz)', price: 9.50, description: '', image: '' },
      { id: 'bistek-lomo', name: 'Bistek de lomo', price: 9.80, description: '', image: '' },
      { id: 'churrasco-lomo', name: 'Churrasco de lomo', price: 10.20, description: '', image: '', badge: 'Popular' },
    ] },

    /* ════════ POLLO ════════ */
    { name: 'Pollo', note: 'Todos con papas o arroz', products: [
      { id: 'pollo-sesamo', name: 'Pollo sésamo (con papas o arroz)', price: 9.50, description: '', image: '' },
      { id: 'pollo-nuez', name: 'Pollo a la nuez (con papas o arroz)', price: 9.80, description: '', image: '' },
      { id: 'pollo-durazno', name: 'Pollo con durazno (con papas o arroz)', price: 9.80, description: '', image: '' },
      { id: 'pollo-teriyaki', name: 'Pollo en salsa teriyaki', price: 9.50, description: '', image: '' },
      { id: 'pollo-frito-cuarto', name: 'Pollo frito ¼', price: 9.80, description: '', image: '' },
      { id: 'pollo-frito-jugo', name: 'Pollo frito con jugo', price: 9.80, description: '', image: '' },
      { id: 'bistek-pollo', name: 'Bistek de pollo', price: 9.20, description: '', image: '' },
      { id: 'churrasco-pollo', name: 'Churrasco de pollo', price: 10.20, description: '', image: '' },
    ] },

    /* ════════ CAMARÓN ════════ */
    { name: 'Camarón', note: 'Todos con papas o arroz', products: [
      { id: 'camaron-tomate', name: 'Camarón salteado con tomate', price: 10.20, description: '', image: '', badge: 'Mariscos' },
      { id: 'camaron-curry', name: 'Camarón salteado con curry y papas', price: 10.20, description: '', image: '', badge: 'Mariscos' },
      { id: 'camaron-salsa-cangrejo', name: 'Camarón frito con salsa de cangrejo', price: 13.80, description: '', image: '', badge: 'Mariscos' },
      { id: 'camaron-salsa-champinon', name: 'Camarón frito con salsa de champiñón', price: 13.80, description: '', image: '', badge: 'Mariscos' },
      { id: 'camaron-salsa-teriyaki', name: 'Camarón frito con salsa teriyaki', price: 13.80, description: '', image: '', badge: 'Mariscos' },
      { id: 'camaron-salsa-ostras', name: 'Camarón frito con salsa de ostras', price: 13.80, description: '', image: '', badge: 'Mariscos' },
    ] },

    /* ════════ CORVINA ════════ */
    { name: 'Corvina', note: 'Todos con papas o arroz', products: [
      { id: 'corvina-brocoli-tausi', name: 'Corvina salteada con brócoli y tausí', price: 12.20, description: '', image: '', badge: 'Pescado' },
      { id: 'corvina-frita', name: 'Corvina frita', price: 12.20, description: '', image: '', badge: 'Pescado' },
      { id: 'corvina-salsa-cangrejo', name: 'Corvina frita con salsa de cangrejo', price: 12.80, description: '', image: '', badge: 'Pescado' },
      { id: 'corvina-salsa-champinones', name: 'Corvina frita con salsa de champiñones', price: 12.80, description: '', image: '', badge: 'Pescado' },
      { id: 'corvina-salsa-ostras', name: 'Corvina frita con salsa de ostras', price: 12.80, description: '', image: '', badge: 'Pescado' },
    ] },

    /* ════════ BEBIDAS ════════ */
    { name: 'Bebidas', note: '', products: [
      { id: 'cola-mediana', name: 'Cola mediana', price: 0.90, description: '', image: '' },
      { id: 'cola-1lt', name: 'Cola de 1 litro', price: 2.80, description: '', image: '' },
      { id: 'cola-3lt', name: 'Cola de 3 litros', price: 4.00, description: '', image: '' },
      { id: 'vaso-naranja', name: 'Vaso de naranja', price: 2.80, description: '', image: '' },
      { id: 'vaso-limonada', name: 'Vaso de limonada', price: 2.20, description: '', image: '' },
      { id: 'vaso-jugo', name: 'Vaso de jugo', price: 2.80, description: '', image: '' },
      { id: 'jarra-naranja', name: 'Jarra de naranja', price: 5.20, description: '', image: '' },
      { id: 'jarra-limonada', name: 'Jarra de limonada', price: 4.50, description: '', image: '' },
      { id: 'jarra-jugo', name: 'Jarra de jugo', price: 5.20, description: '', image: '' },
      { id: 'agua-sin-gas', name: 'Agua sin gas', price: 0.80, description: '', image: '' },
      { id: 'nestea', name: 'Nestea', price: 1.20, description: '', image: '' },
      { id: 'nestea-1lt', name: 'Nestea 1 litro', price: 2.50, description: '', image: '' },
    ] },
  ],
};