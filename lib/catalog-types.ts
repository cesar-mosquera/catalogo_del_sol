export type TemplateName = 'book' | 'list' | 'minimal' | 'premium';

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  badge?: string;
  demoUrl?: string;
};

export type Catalog = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  phone: string;
  address: string;
  coverImage: string;
  logoImage: string;
  template: TemplateName;
  minimumOrder: number;
  businessHours: { timezone: string; open: number; close: number; days: number[] };
  sections: { name: string; products: Product[] }[];
  // Política de envío del catálogo. Mantenerla en datos permite múltiples locales.
  location?: { lat: number; lng: number };          // coordenadas del restaurante
  deliveryRatePerKm?: number;                        // costo por km (ej: 0.50)
  deliveryBaseFee?: number;                          // tarifa base de envío
  deliveryMaxKm?: number;                            // radio máximo de entrega
  requiresShipping?: boolean;                        // si es falso, desactiva pedir ubicación en el carrito
};
