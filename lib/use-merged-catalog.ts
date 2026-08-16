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
      requiresShipping: override.requiresShipping ?? base.requiresShipping,
      allowPickup: override.allowPickup ?? base.allowPickup,
      // Política de envío definida en el código del catálogo: si la base NO define
      // zonas manuales, un override antiguo guardado en localStorage no puede
      // reintroducirlas (evita mezclar mapa y zonas en un mismo catálogo).
      deliveryZones: base.deliveryZones ? (override.deliveryZones ?? base.deliveryZones) : undefined,
      prepTimeMinutes: override.prepTimeMinutes ?? base.prepTimeMinutes,
      deliveryTimeMinutes: override.deliveryTimeMinutes ?? base.deliveryTimeMinutes,
      scheduleOrders: override.scheduleOrders ?? base.scheduleOrders,
      paymentMethods: override.paymentMethods ?? base.paymentMethods,
      deliveryBaseFee: override.deliveryBaseFee ?? base.deliveryBaseFee,
      deliveryRatePerKm: override.deliveryRatePerKm ?? base.deliveryRatePerKm,
      deliveryMaxKm: override.deliveryMaxKm ?? base.deliveryMaxKm,
      businessHours: override.businessHours ?? base.businessHours,
      coverImage:   override.coverImageData ?? base.coverImage,
      logoImage:    override.logoImageData  ?? base.logoImage,
      sections:     override.sections ? override.sections.map(oSec => {
        const bSec = base.sections.find(s => s.name === oSec.name);
        return {
          ...oSec,
          products: oSec.products.map(oProd => {
            const bProd = bSec?.products.find(p => p.id === oProd.id);
            return {
              ...oProd,
              demoUrl: bProd?.demoUrl ?? oProd.demoUrl,
              badge: bProd?.badge ?? oProd.badge,
            };
          })
        };
      }) : base.sections,
    };
  }, [base, override]);
}
