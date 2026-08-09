import type { Catalog } from './catalog-types';

export type DeliveryLocation = { lat: number; lng: number };

export type DeliveryQuote = {
  distanceKm: number;
  fee: number;
  isAvailable: boolean;
};

export function haversineKm(from: DeliveryLocation, to: DeliveryLocation): number {
  const earthRadiusKm = 6371;
  const latitudeDelta = ((to.lat - from.lat) * Math.PI) / 180;
  const longitudeDelta = ((to.lng - from.lng) * Math.PI) / 180;
  const area =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.asin(Math.sqrt(area));
}

export function quoteDelivery(catalog: Catalog, destination: DeliveryLocation): DeliveryQuote | null {
  if (!catalog.location) return null;

  const distanceKm = haversineKm(catalog.location, destination);
  const fee = Number(((catalog.deliveryBaseFee ?? 1) + distanceKm * (catalog.deliveryRatePerKm ?? 0.5)).toFixed(2));
  const maxDistanceKm = catalog.deliveryMaxKm;
  
  // Si es 0 o no está definido, consideramos que no hay límite (ilimitado)
  const isAvailable = !maxDistanceKm ? true : distanceKm <= maxDistanceKm;

  return { distanceKm, fee, isAvailable };
}

export function isValidLocation(location: DeliveryLocation): boolean {
  return Number.isFinite(location.lat) && Number.isFinite(location.lng)
    && location.lat >= -90 && location.lat <= 90
    && location.lng >= -180 && location.lng <= 180;
}
