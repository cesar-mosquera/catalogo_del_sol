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
  // Limpia items que ya no existen en el catálogo (producto eliminado)
  prune: (catalogSlug: string, validIds: Set<string>) => void;
};

// Helper para ejecutar set con manejo de errores de quota
function safeSet(set: (fn: (s: CartState) => Partial<CartState>) => void, updater: (state: CartState) => Partial<CartState>) {
  try {
    set(updater);
  } catch (err) {
    if (err instanceof Error && err.name === 'QuotaExceededError') {
      console.error('LocalStorage lleno en carrito:', err);
      if (typeof window !== 'undefined') {
        alert('El almacenamiento del navegador está lleno. Algunos datos del carrito pueden no guardarse.');
      }
    } else {
      throw err;
    }
  }
}

export const useCart = create<CartState>()(persist((set) => ({
  carts: {},
  add: (catalogSlug, product) => safeSet(set, (state) => {
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
  remove: (catalogSlug, id) => safeSet(set, (state) => {
    const current = state.carts[catalogSlug] ?? [];
    return {
      carts: {
        ...state.carts,
        [catalogSlug]: current.flatMap((item) => item.id !== id ? [item] : item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : []),
      },
    };
  }),
  clear: (catalogSlug) => safeSet(set, (state) => ({
    carts: { ...state.carts, [catalogSlug]: [] },
  })),
  prune: (catalogSlug, validIds) => safeSet(set, (state) => {
    const current = state.carts[catalogSlug] ?? [];
    const pruned = current.filter((item) => validIds.has(item.id));
    return {
      carts: {
        ...state.carts,
        [catalogSlug]: pruned,
      },
    };
  }),
}), { name: 'catalog-cart' }));
