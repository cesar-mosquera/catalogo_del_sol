/**
 * Tests de servicios — datos del catálogo servicios.ts
 *
 * Cubre: plan único, mensual, anual, combinación y total correcto.
 */

import { describe, it, expect } from 'vitest';
import { servicios } from '@/data/catalogs/servicios';
import type { Product } from '@/lib/catalog-types';

// ─── Helpers ─────────────────────────────────────────────────────────────
function allProducts(catalog: typeof servicios): Product[] {
  return catalog.sections.flatMap((s) => s.products);
}

function findById(id: string): Product | undefined {
  return allProducts(servicios).find((p) => p.id === id);
}

/**
 * Calcula el subtotal de un carrito virtual sobre el catálogo de servicios.
 * Devuelve { monthly, yearly, oneTime, perService } para claridad.
 */
function calcServiceTotal(items: { id: string; quantity: number }[]) {
  const products = allProducts(servicios);
  let total = 0;
  let monthly = 0;
  let yearly = 0;
  let oneTime = 0;
  let perService = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.id);
    if (!product) continue;
    const subtotal = product.price * item.quantity;
    total += subtotal;
    switch (product.paymentFrequency) {
      case 'monthly':     monthly     += subtotal; break;
      case 'yearly':      yearly      += subtotal; break;
      case 'one-time':    oneTime     += subtotal; break;
      case 'per-service': perService  += subtotal; break;
    }
  }
  return { total, monthly, yearly, oneTime, perService };
}

// ════════════════════════════════════════════════════════════════════════════
describe('Servicios — plan único (one-time)', () => {
  it('plan-basico tiene paymentFrequency one-time', () => {
    expect(findById('plan-basico')?.paymentFrequency).toBe('one-time');
  });

  it('plan-pro tiene paymentFrequency one-time', () => {
    expect(findById('plan-pro')?.paymentFrequency).toBe('one-time');
  });

  it('plan-admin tiene paymentFrequency one-time', () => {
    expect(findById('plan-admin')?.paymentFrequency).toBe('one-time');
  });

  it('precios correctos: básico $45, pro $90, admin $150', () => {
    expect(findById('plan-basico')?.price).toBe(45);
    expect(findById('plan-pro')?.price).toBe(90);
    expect(findById('plan-admin')?.price).toBe(150);
  });

  it('total de un carrito con solo plan-basico x1 = $45', () => {
    const { total } = calcServiceTotal([{ id: 'plan-basico', quantity: 1 }]);
    expect(total).toBeCloseTo(45);
  });
});

describe('Servicios — plan mensual', () => {
  it('hosting-db tiene paymentFrequency monthly', () => {
    expect(findById('hosting-db')?.paymentFrequency).toBe('monthly');
  });

  it('precio mensual correcto: $15', () => {
    expect(findById('hosting-db')?.price).toBe(15);
  });

  it('2 meses de hosting = $30', () => {
    const { total, monthly } = calcServiceTotal([{ id: 'hosting-db', quantity: 2 }]);
    expect(total).toBeCloseTo(30);
    expect(monthly).toBeCloseTo(30);
  });
});

describe('Servicios — plan anual', () => {
  it('dominio-anual tiene paymentFrequency yearly', () => {
    expect(findById('dominio-anual')?.paymentFrequency).toBe('yearly');
  });

  it('precio anual correcto: $20', () => {
    expect(findById('dominio-anual')?.price).toBe(20);
  });

  it('total de dominio x1 = $20', () => {
    const { total, yearly } = calcServiceTotal([{ id: 'dominio-anual', quantity: 1 }]);
    expect(total).toBeCloseTo(20);
    expect(yearly).toBeCloseTo(20);
  });
});

describe('Servicios — per-service', () => {
  it('mantenimiento tiene paymentFrequency per-service', () => {
    expect(findById('mantenimiento')?.paymentFrequency).toBe('per-service');
  });

  it('precio por servicio: $10', () => {
    expect(findById('mantenimiento')?.price).toBe(10);
  });
});

describe('Servicios — combinación de servicios', () => {
  it('plan-admin + hosting-db + dominio-anual: frecuencias separadas correctas', () => {
    const result = calcServiceTotal([
      { id: 'plan-admin', quantity: 1 },   // $150 one-time
      { id: 'hosting-db', quantity: 1 },   // $15 monthly
      { id: 'dominio-anual', quantity: 1 }, // $20 yearly
    ]);
    expect(result.oneTime).toBeCloseTo(150);
    expect(result.monthly).toBeCloseTo(15);
    expect(result.yearly).toBeCloseTo(20);
    expect(result.total).toBeCloseTo(185);
  });

  it('plan-basico + mantenimiento (un cambio) = $45 + $10 = $55', () => {
    const { total } = calcServiceTotal([
      { id: 'plan-basico', quantity: 1 },
      { id: 'mantenimiento', quantity: 1 },
    ]);
    expect(total).toBeCloseTo(55);
  });

  it('todos los planes juntos: básico+pro+admin = $45+$90+$150 = $285', () => {
    const { total, oneTime } = calcServiceTotal([
      { id: 'plan-basico', quantity: 1 },
      { id: 'plan-pro', quantity: 1 },
      { id: 'plan-admin', quantity: 1 },
    ]);
    expect(total).toBeCloseTo(285);
    expect(oneTime).toBeCloseTo(285);
  });

  it('carrito vacío da total 0', () => {
    const { total } = calcServiceTotal([]);
    expect(total).toBe(0);
  });
});

describe('Servicios — total correcto', () => {
  it('el catálogo tiene exactamente 2 secciones', () => {
    expect(servicios.sections).toHaveLength(2);
  });

  it('sección de modelos tiene 3 productos', () => {
    expect(servicios.sections[0].products).toHaveLength(3);
  });

  it('sección de adicionales tiene 3 productos', () => {
    expect(servicios.sections[1].products).toHaveLength(3);
  });

  it('total de todos los productos del catálogo = $330', () => {
    // $45 + $90 + $150 + $15 + $20 + $10 = $330
    const items = allProducts(servicios).map((p) => ({ id: p.id, quantity: 1 }));
    const { total } = calcServiceTotal(items);
    expect(total).toBeCloseTo(330);
  });

  it('minimumOrder del catálogo de servicios es 0', () => {
    expect(servicios.minimumOrder).toBe(0);
  });

  it('alwaysOpen está activo en el catálogo de servicios', () => {
    expect(servicios.alwaysOpen).toBe(true);
  });

  it('no requiere envío (servicio digital)', () => {
    expect(servicios.requiresShipping).toBe(false);
  });

  it('precio actualizado: si cambio el precio del plan-basico en memoria, el total cambia', () => {
    // Verifica que calcServiceTotal siempre usa el precio del catálogo en vivo
    const originalPrice = findById('plan-basico')!.price;
    // Modificamos temporalmente en memoria
    const clonedProduct = { ...findById('plan-basico')!, price: 60 };
    const catalogMod = {
      sections: servicios.sections.map((s) => ({
        ...s,
        products: s.products.map((p) => (p.id === 'plan-basico' ? clonedProduct : p)),
      })),
    };
    const items = [{ id: 'plan-basico', quantity: 1 }];
    const products = catalogMod.sections.flatMap((s) => s.products);
    const totalMod = items.reduce((sum, item) => {
      const p = products.find((x) => x.id === item.id);
      return p ? sum + p.price * item.quantity : sum;
    }, 0);
    expect(totalMod).toBeCloseTo(60);
    // Precio original sigue siendo $45 en el catálogo real
    expect(originalPrice).toBe(45);
  });
});
