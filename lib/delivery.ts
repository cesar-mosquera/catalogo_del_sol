import type { Catalog } from './catalog-types';

export type DeliveryLocation = { lat: number; lng: number };

export type DeliveryQuote = {
  distanceKm: number;
  fee: number;
  isAvailable: boolean;
};

/* ───────────────────────────────────────────
   Horario: soporta horas con minutos
   (open: 11, openMinute: 30 → 11:30)
─────────────────────────────────────────── */
export function businessMinutes(catalog: Catalog): { open: number; close: number } {
  const { open, close, openMinute = 0, closeMinute = 0 } = catalog.businessHours;
  return { open: open * 60 + openMinute, close: close * 60 + closeMinute };
}

export function computeIsOpen(catalog: Catalog, now: Date = new Date()): boolean {
  if (catalog.alwaysOpen) return true;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: catalog.businessHours.timezone,
    weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false,
  }).formatToParts(now);
  const weekday = parts.find((p) => p.type === 'weekday')?.value;
  const hour    = Number(parts.find((p) => p.type === 'hour')?.value ?? 0) % 24;
  const minute  = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  const { open, close } = businessMinutes(catalog);
  const index = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday ?? '');
  return catalog.businessHours.days.includes(index)
    && hour * 60 + minute >= open
    && hour * 60 + minute < close;
}

export function formatBusinessHours(catalog: Catalog): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const { open, close } = businessMinutes(catalog);
  return `${pad(Math.floor(open / 60))}:${pad(open % 60)} – ${pad(Math.floor(close / 60))}:${pad(close % 60)}`;
}

export type DeliveryParams = {
  baseFee: number;
  ratePerKm: number;
  includedKm?: number;
  maxKm?: number;
  integerDistanceMode?: 'floor' | 'ceil' | 'round';
};

export function quoteForDistance(params: DeliveryParams, distanceKm: number): DeliveryQuote {
  const baseFee = Number((params.baseFee ?? 1).toFixed(2));
  const ratePerKm = params.ratePerKm ?? 0.5;
  const includedKm = params.includedKm;

  let distToCharge = distanceKm;
  if (params.integerDistanceMode === 'floor') distToCharge = Math.floor(distanceKm);
  else if (params.integerDistanceMode === 'ceil') distToCharge = Math.ceil(distanceKm);
  else if (params.integerDistanceMode === 'round') distToCharge = Math.round(distanceKm);

  // Si includedKm está definido: la tarifa base cubre esos km y
  // luego se cobra ratePerKm solo por el excedente.
  const fee = includedKm && includedKm > 0
    ? Number((baseFee + Math.max(0, distToCharge - includedKm) * ratePerKm).toFixed(2))
    : Number((baseFee + distToCharge * ratePerKm).toFixed(2));

  const maxDistanceKm = params.maxKm;

  // Si es 0 o no está definido, consideramos que no hay límite (ilimitado)
  const isAvailable = !maxDistanceKm ? true : distanceKm <= maxDistanceKm;

  return { distanceKm, fee, isAvailable };
}

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
  const params: DeliveryParams = {
    baseFee: catalog.deliveryBaseFee ?? 1,
    ratePerKm: catalog.deliveryRatePerKm ?? 0.5,
    includedKm: catalog.deliveryIncludedKm,
    maxKm: catalog.deliveryMaxKm,
    integerDistanceMode: catalog.integerDistanceMode,
  };
  return quoteForDistance(params, haversineKm(catalog.location, destination));
}

export function isValidLocation(location: DeliveryLocation): boolean {
  return Number.isFinite(location.lat) && Number.isFinite(location.lng)
    && location.lat >= -90 && location.lat <= 90
    && location.lng >= -180 && location.lng <= 180;
}
