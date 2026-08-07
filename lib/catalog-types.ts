export type TemplateName = 'book' | 'list' | 'minimal';

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  badge?: string;
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
};
