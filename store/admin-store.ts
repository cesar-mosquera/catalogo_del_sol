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
          const sections = (override.sections ?? []).map((sec) => {
            if (sec.name !== sectionName) return sec;
            const exists = sec.products.find((p) => p.id === product.id);
            return {
              ...sec,
              products: exists
                ? sec.products.map((p) => p.id === product.id ? product : p)
                : [...sec.products, product],
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
