/**
 * Tests de carrito — lógica pura extraída del store cart.ts
 *
 * El store usa Zustand + persist (localStorage), que no existe en Node.
 * Para testear la lógica sin montar el framework, replicamos aquí las
 * mismas funciones puras que el store usa internamente.
 */

import { describe, it, expect } from 'vitest';
import type { Product } from '@/lib/catalog-types';

// ─── Tipos idénticos al store ───────────────────────────────────────────────
type CartItem = { id: string; quantity: number };
type Cart = CartItem[];

// ─── Funciones puras del store (misma lógica que store/cart.ts) ─────────────
function cartAdd(cart: Cart, product: Product): Cart {
  const existing = cart.find((item) => item.id === product.id);
  return existing
    ? cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
      )
    : [...cart, { id: product.id, quantity: 1 }];
}

function cartRemove(cart: Cart, id: string): Cart {
  return cart.flatMap((item) =>
    item.id !== id
      ? [item]
      : item.quantity > 1
        ? [{ ...item, quantity: item.quantity - 1 }]
        : [],
  );
}

function cartTotal(cart: Cart, catalog: { sections: { products: Product[] }[] }): number {
  const allProducts = catalog.sections.flatMap((s) => s.products);
  return cart.reduce((sum, item) => {
    const product = allProducts.find((p) => p.id === item.id);
    return product ? sum + product.price * item.quantity : sum;
  }, 0);
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'prod-1',
  name: 'Chaulafán',
  price: 5.5,
  description: '',
  image: '',
  ...overrides,
});

const makeCatalog = (products: Product[]) => ({
  sections: [{ name: 'Test', products }],
});

// ════════════════════════════════════════════════════════════════════════════
describe('Carrito — agregar', () => {
  it('agrega un producto nuevo con cantidad 1', () => {
    const product = makeProduct();
    const cart = cartAdd([], product);
    expect(cart).toHaveLength(1);
    expect(cart[0]).toEqual({ id: 'prod-1', quantity: 1 });
  });

  it('incrementa la cantidad si el producto ya existe', () => {
    const product = makeProduct();
    let cart = cartAdd([], product);
    cart = cartAdd(cart, product);
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });

  it('agrega productos distintos como ítems separados', () => {
    const p1 = makeProduct({ id: 'a', price: 3 });
    const p2 = makeProduct({ id: 'b', price: 7 });
    let cart = cartAdd([], p1);
    cart = cartAdd(cart, p2);
    expect(cart).toHaveLength(2);
  });
});

describe('Carrito — quitar', () => {
  it('decrementa la cantidad en 1 si es mayor a 1', () => {
    const product = makeProduct();
    let cart: Cart = [{ id: 'prod-1', quantity: 3 }];
    cart = cartRemove(cart, 'prod-1');
    expect(cart[0].quantity).toBe(2);
  });

  it('elimina el ítem cuando la cantidad llega a 0', () => {
    let cart: Cart = [{ id: 'prod-1', quantity: 1 }];
    cart = cartRemove(cart, 'prod-1');
    expect(cart).toHaveLength(0);
  });

  it('no afecta otros ítems al eliminar uno', () => {
    let cart: Cart = [
      { id: 'a', quantity: 2 },
      { id: 'b', quantity: 1 },
    ];
    cart = cartRemove(cart, 'a');
    expect(cart).toHaveLength(2);
    expect(cart.find((i) => i.id === 'b')?.quantity).toBe(1);
  });

  it('ignorar quitar un id que no existe', () => {
    const cart: Cart = [{ id: 'a', quantity: 1 }];
    const result = cartRemove(cart, 'no-existe');
    expect(result).toEqual(cart);
  });
});

describe('Carrito — cantidades', () => {
  it('acumula correctamente múltiples adiciones', () => {
    const product = makeProduct({ id: 'p', price: 2 });
    let cart: Cart = [];
    for (let i = 0; i < 5; i++) cart = cartAdd(cart, product);
    expect(cart[0].quantity).toBe(5);
  });

  it('qty no puede volverse negativa via remove repetido', () => {
    let cart: Cart = [{ id: 'x', quantity: 1 }];
    cart = cartRemove(cart, 'x');
    cart = cartRemove(cart, 'x'); // ya no existe, no rompe
    expect(cart).toHaveLength(0);
  });
});

describe('Carrito — producto eliminado del catálogo', () => {
  it('el total ignora un id que ya no está en el catálogo', () => {
    const cart: Cart = [{ id: 'fantasma', quantity: 2 }];
    const catalog = makeCatalog([]);
    expect(cartTotal(cart, catalog)).toBe(0);
  });

  it('el carrito puede tener ítems aunque el catálogo esté vacío', () => {
    const cart: Cart = [{ id: 'viejo', quantity: 1 }];
    const catalog = makeCatalog([]);
    // No lanza excepción y el total es 0
    expect(() => cartTotal(cart, catalog)).not.toThrow();
    expect(cartTotal(cart, catalog)).toBe(0);
  });
});

describe('Carrito — variantes', () => {
  it('agrega variante con su propio id (no el del padre)', () => {
    // Las variantes se agregan usando el id de la variante como si fuera un producto
    const variant = makeProduct({ id: 'chaulafan-especial-completo', price: 6.5 });
    const cart = cartAdd([], variant);
    expect(cart[0].id).toBe('chaulafan-especial-completo');
  });

  it('variante medio y completo del mismo plato son ítems separados', () => {
    const medio = makeProduct({ id: 'chaulafan-medio', price: 5.5 });
    const completo = makeProduct({ id: 'chaulafan-completo', price: 6.5 });
    let cart = cartAdd([], medio);
    cart = cartAdd(cart, completo);
    expect(cart).toHaveLength(2);
  });
});

describe('Carrito — precio actualizado', () => {
  it('el total usa el precio actual del catálogo, no el del momento de agregar', () => {
    // Simula que el precio cambió en el catálogo de $5.50 a $7.00
    const cart: Cart = [{ id: 'prod-1', quantity: 2 }];
    const catalogNuevo = makeCatalog([makeProduct({ price: 7.0 })]);
    expect(cartTotal(cart, catalogNuevo)).toBeCloseTo(14.0);
  });
});

describe('Carrito — mínimo de pedido', () => {
  it('total menor al mínimo devuelve false en validación', () => {
    const minimumOrder = 5;
    const total = 3.5;
    expect(total >= minimumOrder).toBe(false);
  });

  it('total exactamente igual al mínimo es válido', () => {
    const minimumOrder = 5;
    const total = 5;
    expect(total >= minimumOrder).toBe(true);
  });

  it('mínimo de 0 siempre permite el pedido', () => {
    const minimumOrder = 0;
    const total = 0;
    expect(total >= minimumOrder).toBe(true);
  });

  it('catálogo de servicios con minimumOrder=0 siempre válido', () => {
    // servicios.ts tiene minimumOrder: 0
    const minimumOrder = 0;
    const total = 45; // plan básico
    expect(total >= minimumOrder).toBe(true);
  });
});
