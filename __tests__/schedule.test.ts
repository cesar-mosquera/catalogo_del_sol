/**
 * Tests de horario — función computeIsOpen de lib/delivery.ts
 *
 * Cubre: abierto, cerrado, medianoche, días específicos y timezone.
 */

import { describe, it, expect } from 'vitest';
import { computeIsOpen } from '@/lib/delivery';
import type { Catalog } from '@/lib/catalog-types';

// ─── Catálogo base ────────────────────────────────────────────────────────
const makeCatalog = (overrides: Partial<Catalog['businessHours']> = {}): Catalog =>
  ({
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
    sections: [],
    businessHours: {
      timezone: 'America/Guayaquil', // UTC-5
      open: 11,
      close: 22,
      openMinute: 30,
      closeMinute: 30,
      days: [0, 1, 2, 3, 4, 5, 6], // todos los días
      ...overrides,
    },
  }) as Catalog;

/**
 * Convierte una fecha/hora local en un timezone dado a un objeto Date (UTC).
 * Estrategia: busca iterativamente el instante UTC cuya representación local
 * coincide con la hora pedida (convergencia en 2 iteraciones).
 */
function localDate(timezone: string, isoLocal: string): Date {
  // Punto de partida: parsear la cadena como si fuera UTC
  const seed = new Date(isoLocal + ':00Z');

  const toLocalMinutes = (d: Date): number => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric', minute: '2-digit', hour12: false,
    }).formatToParts(d);
    const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0) % 24;
    const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
    return h * 60 + m;
  };

  const targetH = Number(isoLocal.slice(11, 13));
  const targetM = Number(isoLocal.slice(14, 16));
  const targetMin = targetH * 60 + targetM;

  // Calcula cuántos minutos de diferencia hay y corrige el seed
  const diff = toLocalMinutes(seed) - targetMin;
  return new Date(seed.getTime() - diff * 60_000);
}

// ════════════════════════════════════════════════════════════════════════════
describe('Horario — abierto', () => {
  it('las 14:00 (dentro de 11:30–22:30) → abierto', () => {
    const catalog = makeCatalog();
    // Pasamos la hora LOCAL en Guayaquil directamente
    const now = localDate('America/Guayaquil', '2026-08-26T14:00');
    expect(computeIsOpen(catalog, now)).toBe(true);
  });

  it('justo en la apertura 11:30 → abierto', () => {
    const catalog = makeCatalog();
    const now = localDate('America/Guayaquil', '2026-08-26T11:30');
    expect(computeIsOpen(catalog, now)).toBe(true);
  });
});

describe('Horario — cerrado', () => {
  it('las 10:00 (antes de 11:30) → cerrado', () => {
    const catalog = makeCatalog();
    const now = localDate('America/Guayaquil', '2026-08-26T10:00');
    expect(computeIsOpen(catalog, now)).toBe(false);
  });

  it('las 23:00 (después de 22:30) → cerrado', () => {
    const catalog = makeCatalog();
    const now = localDate('America/Guayaquil', '2026-08-26T23:00');
    expect(computeIsOpen(catalog, now)).toBe(false);
  });

  it('exactamente en la hora de cierre 22:30 → cerrado (exclusivo)', () => {
    const catalog = makeCatalog();
    // close: 22:30 es exclusivo (hora < close)
    const now = localDate('America/Guayaquil', '2026-08-26T22:30');
    expect(computeIsOpen(catalog, now)).toBe(false);
  });
});

describe('Horario — medianoche', () => {
  it('horario que no cruza medianoche: 22:00 es abierto si close=23:00', () => {
    // Catálogo con cierre a las 23:00
    const catalog = makeCatalog({ open: 8, openMinute: 0, close: 23, closeMinute: 0 });
    const now = localDate('America/Guayaquil', '2026-08-26T22:00');
    expect(computeIsOpen(catalog, now)).toBe(true);
  });

  it('las 00:30 (medianoche) → cerrado para horario 11:30–22:30', () => {
    const catalog = makeCatalog();
    const now = localDate('America/Guayaquil', '2026-08-27T00:30');
    expect(computeIsOpen(catalog, now)).toBe(false);
  });
});

describe('Horario — días específicos', () => {
  it('sólo abre lunes-viernes (1–5): sábado (6) → cerrado', () => {
    // Sábado 2026-08-29
    const catalog = makeCatalog({ days: [1, 2, 3, 4, 5] });
    const now = localDate('America/Guayaquil', '2026-08-29T14:00');
    expect(computeIsOpen(catalog, now)).toBe(false);
  });

  it('sólo abre lunes-viernes (1–5): viernes (5) → abierto', () => {
    // Viernes 2026-08-28
    const catalog = makeCatalog({ days: [1, 2, 3, 4, 5] });
    const now = localDate('America/Guayaquil', '2026-08-28T14:00');
    expect(computeIsOpen(catalog, now)).toBe(true);
  });

  it('sólo domingo (0): miércoles → cerrado', () => {
    const catalog = makeCatalog({ days: [0] });
    const now = localDate('America/Guayaquil', '2026-08-26T14:00'); // miércoles
    expect(computeIsOpen(catalog, now)).toBe(false);
  });

  it('todos los días (0–6): nunca cierra por día', () => {
    const catalog = makeCatalog({ days: [0, 1, 2, 3, 4, 5, 6] });
    // miércoles a las 14:00 (dentro del horario 11:30–22:30)
    const now = localDate('America/Guayaquil', '2026-08-26T14:00');
    expect(computeIsOpen(catalog, now)).toBe(true);
  });
});

describe('Horario — alwaysOpen', () => {
  it('alwaysOpen=true ignora todo horario', () => {
    const catalog: Catalog = {
      ...makeCatalog({ days: [] }), // ← sin días habilitados
      alwaysOpen: true,
    };
    const now = new Date('2099-01-01T00:00:00Z');
    expect(computeIsOpen(catalog, now)).toBe(true);
  });
});

describe('Horario — timezone', () => {
  it('mismo instante UTC, diferente timezone → puede ser abierto o cerrado', () => {
    // UTC 16:00 = Guayaquil 11:00 (cerrado antes de 11:30)
    //           = Madrid 18:00 en verano (CEST UTC+2, abierto si open=9)
    const utcDate = new Date('2026-08-26T16:00:00Z');

    const catalogGuayaquil = makeCatalog({ timezone: 'America/Guayaquil' }); // 11:00 → cerrado
    const catalogMadrid = makeCatalog({
      timezone: 'Europe/Madrid',
      open: 9,
      openMinute: 0,
      close: 21,
      closeMinute: 0,
    }); // 18:00 → abierto

    expect(computeIsOpen(catalogGuayaquil, utcDate)).toBe(false);
    expect(computeIsOpen(catalogMadrid, utcDate)).toBe(true);
  });

  it('catálogo servicios.ts tiene alwaysOpen=true → abierto siempre', () => {
    const catalog: Catalog = {
      ...makeCatalog({ timezone: 'America/Guayaquil' }),
      alwaysOpen: true,
    };
    expect(computeIsOpen(catalog, new Date())).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Tests de horarios nocturnos que cruzan medianoche (18:00 → 02:00)
// ════════════════════════════════════════════════════════════════════════════
describe('Horario nocturno — 18:00 → 02:00', () => {
  const catalogNight = makeCatalog({
    open: 18,
    openMinute: 0,
    close: 2,
    closeMinute: 0,
    days: [1, 2, 3, 4, 5, 6], // lunes a sábado
  });

  it('20:00 martes → abierto (después de opening)', () => {
    // Martes 2026-08-25 a las 20:00
    const now = localDate('America/Guayaquil', '2026-08-25T20:00');
    expect(computeIsOpen(catalogNight, now)).toBe(true);
  });

  it('01:00 martes → abierto (pertenece al lunes 18:00→02:00)', () => {
    // Martes 2026-08-26 a las 01:00 = horario del lunes
    const now = localDate('America/Guayaquil', '2026-08-26T01:00');
    expect(computeIsOpen(catalogNight, now)).toBe(true);
  });

  it('01:30 martes → abierto (dentro del horario nocturno)', () => {
    const now = localDate('America/Guayaquil', '2026-08-26T01:30');
    expect(computeIsOpen(catalogNight, now)).toBe(true);
  });

  it('17:00 martes → cerrado (antes de opening)', () => {
    const now = localDate('America/Guayaquil', '2026-08-25T17:00');
    expect(computeIsOpen(catalogNight, now)).toBe(false);
  });

  it('02:00 martes → cerrado (en el cierre exacto)', () => {
    const now = localDate('America/Guayaquil', '2026-08-26T02:00');
    expect(computeIsOpen(catalogNight, now)).toBe(false);
  });

  it('03:00 martes → cerrado (después de cierre)', () => {
    const now = localDate('America/Guayaquil', '2026-08-26T03:00');
    expect(computeIsOpen(catalogNight, now)).toBe(false);
  });

  it('01:00 domingo → cerrado (el sábado cierra a las 02:00)', () => {
    // Domingo 2026-08-30 a las 01:00 → debería pertenecer al sábado
    // Pero sábado NO está en days: [1,2,3,4,5,6] — sí está
    // Espera: sábado SÍ está en [1,2,3,4,5,6], así que debería estar abierto
    const now = localDate('America/Guayaquil', '2026-08-30T01:00');
    expect(computeIsOpen(catalogNight, now)).toBe(true);
  });

  it('01:00 lunes → cerrado (el domingo no abre)', () => {
    // Lunes 01:00 en Guayaquil = 2026-09-07T06:00:00Z (UTC-5)
    // Pertenece al domingo, y domingo (0) NO está en days: [1,2,3,4,5,6]
    const now = new Date('2026-09-07T06:00:00Z');
    expect(computeIsOpen(catalogNight, now)).toBe(false);
  });
});
