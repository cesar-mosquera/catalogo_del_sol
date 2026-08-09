'use client';

import { useMemo } from 'react';
import type { Catalog } from './catalog-types';
import { useAdmin } from '@/store/admin-store';

/**
 * Devuelve el catálogo fusionado:
 * - Base: datos estáticos compilados en el código
 * - Override: lo que el admin guardó en localStorage
 * Las imágenes base64 del admin reemplazan las rutas estáticas.
 */
export function useMergedCatalog(base: Catalog): Catalog {
  const override = useAdmin((s) => s.overrides[base.slug]);

  return useMemo((): Catalog => {
    if (!override) return base;

    return {
      ...base,
      name:         override.name         ?? base.name,
      tagline:      override.tagline      ?? base.tagline,
      description:  override.description  ?? base.description,
      phone:        override.phone        ?? base.phone,
      address:      override.address      ?? base.address,
      minimumOrder: override.minimumOrder ?? base.minimumOrder,
      location: override.location ?? base.location,
      deliveryBaseFee: override.deliveryBaseFee ?? base.deliveryBaseFee,
      deliveryRatePerKm: override.deliveryRatePerKm ?? base.deliveryRatePerKm,
      deliveryMaxKm: override.deliveryMaxKm ?? base.deliveryMaxKm,
      businessHours: override.businessHours ?? base.businessHours,
      coverImage:   override.coverImageData ?? base.coverImage,
      logoImage:    override.logoImageData  ?? base.logoImage,
      sections:     override.sections      ?? base.sections,
    };
  }, [base, override]);
}
