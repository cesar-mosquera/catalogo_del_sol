/**
 * Tests de envío — funciones puras de lib/delivery.ts
 *
 * Se prueban:
 *  - quoteForDistance  (tarifa por distancia)
 *  - haversineKm       (distancia entre coordenadas)
 *  - quoteDelivery     (integración catálogo + coordenadas)
 *  - isValidLocation   (validación de coordenadas)
 */

import { describe, it, expect } from 'vitest';
import {
  quoteForDistance,
  haversineKm,
  quoteDelivery,
  isValidLocation,
  type DeliveryParams,
} from '@/lib/delivery';
import type { Catalog } from '@/lib/catalog-types';

// ─── Catálogo base (Chifa Excelencia real) ────────────────────────────────
const CHIFA_LOCATION = { lat: -0.3348695, lng: -78.550437 };

const baseCatalog: Catalog = {
  slug: 'test',
  name: 'Test',
  tagline: '',
  description: '',
  phone: '',
  address: '',
  coverImage: '',
  logoImage: '',
  template: 'list',
  minimumOrder: 0,
  businessHours: { timezone: 'UTC', open: 0, close: 24, days: [0, 1, 2, 3, 4, 5, 6] },
  sections: [],
  location: CHIFA_LOCATION,
  deliveryBaseFee: 2.0,
  deliveryIncludedKm: 2,
  deliveryRatePerKm: 0.5,
  deliveryMaxKm: 0, // sin límite
  integerDistanceMode: 'floor',
};

// ─── Params reutilizables ─────────────────────────────────────────────────
const chifaParams: DeliveryParams = {
  baseFee: 2.0,
  ratePerKm: 0.5,
  includedKm: 2,
  integerDistanceMode: 'floor',
};

// ════════════════════════════════════════════════════════════════════════════
describe('Envío — 0 km (retiro en local / misma coordenada)', () => {
  it('distancia 0 → solo tarifa base', () => {
    const q = quoteForDistance(chifaParams, 0);
    expect(q.fee).toBeCloseTo(2.0);
    expect(q.distanceKm).toBe(0);
    expect(q.isAvailable).toBe(true);
  });
});

describe('Envío — 1 km', () => {
  it('1 km dentro de los km incluidos → solo tarifa base', () => {
    const q = quoteForDistance(chifaParams, 1);
    // 1 km ≤ 2 km incluidos → fee = baseFee = 2.00
    expect(q.fee).toBeCloseTo(2.0);
    expect(q.isAvailable).toBe(true);
  });
});

describe('Envío — 2 km', () => {
  it('exactamente el límite de km incluidos → tarifa base exacta', () => {
    const q = quoteForDistance(chifaParams, 2);
    expect(q.fee).toBeCloseTo(2.0);
  });

  it('2.9 km con floor → cobra como 2 km (aún en la base)', () => {
    const q = quoteForDistance(chifaParams, 2.9);
    // floor(2.9) = 2 → excedente = 0 → fee = 2.00
    expect(q.fee).toBeCloseTo(2.0);
  });
});

describe('Envío — 5 km', () => {
  it('5 km → base + (5-2)*0.50 = 3.50', () => {
    const q = quoteForDistance(chifaParams, 5);
    expect(q.fee).toBeCloseTo(3.5);
  });

  it('5.8 km con floor → cobra 5 km → fee 3.50', () => {
    const q = quoteForDistance(chifaParams, 5.8);
    expect(q.fee).toBeCloseTo(3.5);
  });
});

describe('Envío — fuera de radio', () => {
  it('maxKm definido: distancia mayor lo marca no disponible', () => {
    const params: DeliveryParams = { ...chifaParams, maxKm: 8 };
    const q = quoteForDistance(params, 10);
    expect(q.isAvailable).toBe(false);
  });

  it('maxKm=0 significa sin límite → siempre disponible', () => {
    const params: DeliveryParams = { ...chifaParams, maxKm: 0 };
    const q = quoteForDistance(params, 100);
    expect(q.isAvailable).toBe(true);
  });

  it('maxKm undefined → sin límite → siempre disponible', () => {
    const params: DeliveryParams = { baseFee: 2, ratePerKm: 0.5 };
    const q = quoteForDistance(params, 50);
    expect(q.isAvailable).toBe(true);
  });

  it('exactamente en el límite → disponible', () => {
    const params: DeliveryParams = { ...chifaParams, maxKm: 5 };
    const q = quoteForDistance(params, 5);
    expect(q.isAvailable).toBe(true);
  });

  it('un metro más allá del límite → no disponible', () => {
    const params: DeliveryParams = { ...chifaParams, maxKm: 5 };
    const q = quoteForDistance(params, 5.001);
    expect(q.isAvailable).toBe(false);
  });
});

describe('Envío — ruta fallida (catálogo sin location)', () => {
  it('quoteDelivery retorna null si el catálogo no tiene location', () => {
    const catalogSinLocation: Catalog = { ...baseCatalog, location: undefined };
    const result = quoteDelivery(catalogSinLocation, { lat: -0.2, lng: -78.5 });
    expect(result).toBeNull();
  });
});

describe('Envío — zona manual (deliveryZones)', () => {
  it('la estructura de zonas manuales es válida en el catálogo', () => {
    const zones = [
      { name: 'Centro', fee: 2.0 },
      { name: 'Norte', fee: 3.0 },
      { name: 'Sur', fee: 4.0 },
    ];
    const catalogConZonas: Catalog = { ...baseCatalog, deliveryZones: zones };
    expect(catalogConZonas.deliveryZones).toHaveLength(3);
    expect(catalogConZonas.deliveryZones![0].fee).toBe(2.0);
  });

  it('zona con tarifa $0 es válida (retiro gratis)', () => {
    const zones = [{ name: 'Local', fee: 0 }];
    const cat: Catalog = { ...baseCatalog, deliveryZones: zones };
    expect(cat.deliveryZones![0].fee).toBe(0);
  });
});

describe('Envío — haversineKm (distancia real)', () => {
  it('misma coordenada → 0 km', () => {
    const d = haversineKm(CHIFA_LOCATION, CHIFA_LOCATION);
    expect(d).toBeCloseTo(0, 4);
  });

  it('coordenadas conocidas: Quito centro ~10 km del chifa', () => {
    const quitoCentro = { lat: -0.2295, lng: -78.5243 };
    const d = haversineKm(CHIFA_LOCATION, quitoCentro);
    // Distancia aproximada: debe estar entre 8 y 14 km
    expect(d).toBeGreaterThan(8);
    expect(d).toBeLessThan(14);
  });

  it('coordenadas inversas producen la misma distancia (simetría)', () => {
    const a = { lat: -0.3, lng: -78.5 };
    const b = { lat: -0.4, lng: -78.6 };
    expect(haversineKm(a, b)).toBeCloseTo(haversineKm(b, a), 8);
  });
});

describe('Envío — isValidLocation', () => {
  it('coordenadas válidas del chifa', () => {
    expect(isValidLocation(CHIFA_LOCATION)).toBe(true);
  });

  it('lat fuera de rango (-91) → inválido', () => {
    expect(isValidLocation({ lat: -91, lng: 0 })).toBe(false);
  });

  it('lng fuera de rango (181) → inválido', () => {
    expect(isValidLocation({ lat: 0, lng: 181 })).toBe(false);
  });

  it('NaN → inválido', () => {
    expect(isValidLocation({ lat: NaN, lng: -78 })).toBe(false);
  });

  it('Infinity → inválido', () => {
    expect(isValidLocation({ lat: Infinity, lng: 0 })).toBe(false);
  });

  it('lat=90, lng=180 → límites válidos', () => {
    expect(isValidLocation({ lat: 90, lng: 180 })).toBe(true);
  });

  it('lat=-90, lng=-180 → límites válidos', () => {
    expect(isValidLocation({ lat: -90, lng: -180 })).toBe(true);
  });
});
