'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/lib/catalog-types';

export type CartItem = { id: string; quantity: number };
type CartState = {
  carts: Record<string, CartItem[]>;
  add: (catalogSlug: string, product: Product) => void;
  remove: (catalogSlug: string, id: string) => void;
  clear: (catalogSlug: string) => void;
};

export const useCart = create<CartState>()(persist((set) => ({
  carts: {},
  add: (catalogSlug, product) => set((state) => {
    const current = state.carts[catalogSlug] ?? [];
    const existing = current.find((item) => item.id === product.id);
    return {
      carts: {
        ...state.carts,
        [catalogSlug]: existing
          ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
          : [...current, { id: product.id, quantity: 1 }],
      },
    };
  }),
  remove: (catalogSlug, id) => set((state) => {
    const current = state.carts[catalogSlug] ?? [];
    return {
      carts: {
        ...state.carts,
        [catalogSlug]: current.flatMap((item) => item.id !== id ? [item] : item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : []),
      },
    };
  }),
  clear: (catalogSlug) => set((state) => ({
    carts: { ...state.carts, [catalogSlug]: [] },
  })),
}), { name: 'catalog-cart' }));
