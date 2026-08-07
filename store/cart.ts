'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/lib/catalog-types';

export type CartItem = Product & { quantity: number };
type CartState = {
  items: CartItem[];
  add: (product: Product) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(persist((set) => ({
  items: [],
  add: (product) => set((state) => {
    const existing = state.items.find((item) => item.id === product.id);
    return {
      items: existing
        ? state.items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...state.items, { ...product, quantity: 1 }],
    };
  }),
  remove: (id) => set((state) => ({
    items: state.items.flatMap((item) => item.id !== id ? [item] : item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : []),
  })),
  clear: () => set({ items: [] }),
}), { name: 'catalog-cart' }));
