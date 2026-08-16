'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Catalog, Product } from '@/lib/catalog-types';

/* ────────────────────────────────────────────────────────────
   Tipos
──────────────────────────────────────────────────────────── */
export type AdminSection = { name: string; products: Product[] };

export type CatalogOverride = {
  name?: string;
  tagline?: string;
  description?: string;
  phone?: string;
  address?: string;
  minimumOrder?: number;
  requiresShipping?: boolean;
  allowPickup?: boolean;
  deliveryZones?: Catalog['deliveryZones'];
  prepTimeMinutes?: number;
  deliveryTimeMinutes?: number;
  scheduleOrders?: boolean;
  paymentMethods?: string[];
  location?: Catalog['location'];
  deliveryBaseFee?: number;
  deliveryRatePerKm?: number;
  deliveryMaxKm?: number;
  businessHours?: Catalog['businessHours'];
  sections?: AdminSection[];
  coverImageData?: string;  // base64
  logoImageData?: string;   // base64
};

type AdminState = {
  overrides: Record<string, CatalogOverride>;  // keyed by catalog slug
  // Actualizar campos de texto/número
  setField: <K extends keyof CatalogOverride>(
    slug: string, key: K, value: CatalogOverride[K]
  ) => void;
  // Imágenes
  setCoverImage: (slug: string, data: string) => void;
  setLogoImage:  (slug: string, data: string) => void;
  setProductImage: (slug: string, productId: string, data: string) => void;
  // Secciones y productos
  setSections: (slug: string, sections: AdminSection[]) => void;
  upsertProduct: (slug: string, sectionName: string, product: Product) => void;
  deleteProduct: (slug: string, sectionName: string, productId: string) => void;
  addSection: (slug: string, sectionName: string) => void;
  renameSection: (slug: string, oldName: string, newName: string) => void;
  deleteSection: (slug: string, sectionName: string) => void;
  moveSection: (slug: string, sectionName: string, dir: 'up' | 'down') => void;
  moveProduct: (slug: string, sectionName: string, productId: string, dir: 'up' | 'down') => void;
  // Reset
  resetCatalog: (slug: string) => void;
};

/* ────────────────────────────────────────────────────────────
   Helpers internos
──────────────────────────────────────────────────────────── */
function getOrInit(state: AdminState, slug: string): CatalogOverride {
  return state.overrides[slug] ?? {};
}

function patch(set: (fn: (s: AdminState) => Partial<AdminState>) => void, slug: string, update: Partial<CatalogOverride>) {
  set((state) => ({
    overrides: {
      ...state.overrides,
      [slug]: { ...getOrInit(state, slug), ...update },
    },
  }));
}

/* ────────────────────────────────────────────────────────────
   Store — se persiste automáticamente en localStorage
──────────────────────────────────────────────────────────── */
export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      overrides: {},

      setField: (slug, key, value) => patch(set, slug, { [key]: value }),

      setCoverImage: (slug, data) => patch(set, slug, { coverImageData: data }),
      setLogoImage:  (slug, data) => patch(set, slug, { logoImageData:  data }),

      setProductImage: (slug, productId, data) =>
        set((state) => {
          const override = getOrInit(state, slug);
          const sections = (override.sections ?? []).map((sec) => ({
            ...sec,
            products: sec.products.map((p) =>
              p.id === productId ? { ...p, image: data } : p
            ),
          }));
          return { overrides: { ...state.overrides, [slug]: { ...override, sections } } };
        }),

      setSections: (slug, sections) => patch(set, slug, { sections }),

      upsertProduct: (slug, sectionName, product) =>
        set((state) => {
          const override = getOrInit(state, slug);
          // Eliminar el producto de todas las secciones primero (por si cambió de sección)
          let sections = (override.sections ?? []).map((sec) => ({
            ...sec,
            products: sec.products.filter((p) => p.id !== product.id),
          }));
          // Luego agregarlo a la sección de destino
          sections = sections.map((sec) => {
            if (sec.name !== sectionName) return sec;
            return {
              ...sec,
              products: [...sec.products, product],
            };
          });
          return { overrides: { ...state.overrides, [slug]: { ...override, sections } } };
        }),

      deleteProduct: (slug, sectionName, productId) =>
        set((state) => {
          const override = getOrInit(state, slug);
          const sections = (override.sections ?? []).map((sec) =>
            sec.name !== sectionName ? sec : { ...sec, products: sec.products.filter((p) => p.id !== productId) }
          );
          return { overrides: { ...state.overrides, [slug]: { ...override, sections } } };
        }),

      addSection: (slug, sectionName) =>
        set((state) => {
          const override = getOrInit(state, slug);
          const sections = [...(override.sections ?? []), { name: sectionName, products: [] }];
          return { overrides: { ...state.overrides, [slug]: { ...override, sections } } };
        }),

      renameSection: (slug, oldName, newName) =>
        set((state) => {
          const override = getOrInit(state, slug);
          const sections = (override.sections ?? []).map((sec) =>
            sec.name === oldName ? { ...sec, name: newName } : sec
          );
          return { overrides: { ...state.overrides, [slug]: { ...override, sections } } };
        }),

      deleteSection: (slug, sectionName) =>
        set((state) => {
          const override = getOrInit(state, slug);
          const sections = (override.sections ?? []).filter((sec) => sec.name !== sectionName);
          return { overrides: { ...state.overrides, [slug]: { ...override, sections } } };
        }),

      moveSection: (slug, sectionName, dir) =>
        set((state) => {
          const override = getOrInit(state, slug);
          if (!override.sections) return state;
          const idx = override.sections.findIndex((s) => s.name === sectionName);
          if (idx < 0) return state;
          const newIdx = dir === 'up' ? idx - 1 : idx + 1;
          if (newIdx < 0 || newIdx >= override.sections.length) return state;
          
          const newSections = [...override.sections];
          const temp = newSections[idx];
          newSections[idx] = newSections[newIdx];
          newSections[newIdx] = temp;
          
          return { overrides: { ...state.overrides, [slug]: { ...override, sections: newSections } } };
        }),

      moveProduct: (slug, sectionName, productId, dir) =>
        set((state) => {
          const override = getOrInit(state, slug);
          if (!override.sections) return state;
          const sections = override.sections.map((sec) => {
            if (sec.name !== sectionName) return sec;
            const idx = sec.products.findIndex((p) => p.id === productId);
            if (idx < 0) return sec;
            const newIdx = dir === 'up' ? idx - 1 : idx + 1;
            if (newIdx < 0 || newIdx >= sec.products.length) return sec;
            
            const newProducts = [...sec.products];
            const temp = newProducts[idx];
            newProducts[idx] = newProducts[newIdx];
            newProducts[newIdx] = temp;
            
            return { ...sec, products: newProducts };
          });
          return { overrides: { ...state.overrides, [slug]: { ...override, sections } } };
        }),

      resetCatalog: (slug) =>
        set((state) => {
          const { [slug]: _, ...rest } = state.overrides;
          return { overrides: rest };
        }),
    }),
    {
      name: 'catalog-admin',
      // Partición: guardamos todo en localStorage
      // Las imágenes base64 pueden ocupar varios MB — es normal
    }
  )
);
