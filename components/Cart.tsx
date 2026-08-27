'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { Catalog, Product } from '@/lib/catalog-types';
import { useCart, type CartItem } from '@/store/cart';
import type { LatLng } from './LocationPicker';
import { quoteForDistance, computeIsOpen, formatBusinessHours, type DeliveryParams } from '@/lib/delivery';

// Leaflet requiere el DOM → carga dinámica sin SSR
const LocationPicker = dynamic(
  () => import('./LocationPicker').then((m) => m.LocationPicker),
  { ssr: false }
);

const EMPTY_CART: CartItem[] = [];

// Formatea la frecuencia de pago a texto legible
function formatPaymentFrequency(frequency?: string): string {
  switch (frequency) {
    case 'monthly': return 'mensual';
    case 'yearly': return 'anual';
    case 'per-service': return 'por cambio';
    case 'one-time': return 'pago único';
    default: return '';
  }
}

// Formatea un datetime-local (YYYY-MM-DDTHH:mm) a texto legible en español
function formatSchedule(value: string): string {
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return new Intl.DateTimeFormat('es-EC', {
      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    }).format(d);
  } catch {
    return value;
  }
}

// Obtiene la fecha/hora local en formato para datetime-local (sin zona horaria)
function getLocalDatetimeString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Valida si una fecha/hora programada es válida según el horario del negocio
// Soporta horarios que cruzan medianoche (ej: 18:00 → 02:00)
function validateScheduleDate(
  value: string,
  businessHours: { timezone: string; open: number; close: number; days: number[]; openMinute?: number; closeMinute?: number }
): { valid: boolean; error?: string } {
  if (!value) return { valid: true };
  
  const scheduled = new Date(value);
  if (isNaN(scheduled.getTime())) return { valid: false, error: 'Fecha/hora inválida.' };
  
  const now = new Date();
  if (scheduled <= now) return { valid: false, error: 'La fecha debe ser en el futuro.' };
  
  const hour = scheduled.getHours();
  const minute = scheduled.getMinutes();
  const timeInMinutes = hour * 60 + minute;
  const openTime = businessHours.open * 60 + (businessHours.openMinute ?? 0);
  const closeTime = businessHours.close * 60 + (businessHours.closeMinute ?? 0);
  const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  
  const isCrossMidnight = openTime > closeTime; // ej: 18:00 → 02:00
  
  if (isCrossMidnight) {
    // Horario nocturno que cruza medianoche (ej: 18:00 → 02:00)
    // Si la hora es DESPUÉS de medianoche (timeInMinutes < closeTime),
    // pertenece al día ANTERIOR (ej: 01:00 del martes = horario del lunes)
    const belongsToPreviousDay = timeInMinutes < closeTime;
    
    if (belongsToPreviousDay) {
      // Validar contra el día anterior
      const previousDay = new Date(scheduled);
      previousDay.setDate(previousDay.getDate() - 1);
      const prevDayOfWeek = previousDay.getDay();
      
      if (!businessHours.days.includes(prevDayOfWeek)) {
        return { valid: false, error: `El negocio no abre los ${dayNames[prevDayOfWeek]}. El horario nocturno de ${dayNames[prevDayOfWeek]} inicia a las ${businessHours.open}:00.` };
      }
      
      // La hora es válida si está después de openTime (ej: 18:00 → 02:00, hora 01:00 es válida)
      // No necesitamos verificar más porque timeInMinutes < closeTime ya implica que es válido
      return { valid: true };
    } else {
      // Hora después de opening (ej: 20:00, 23:00)
      // Validar contra el día actual
      const dayOfWeek = scheduled.getDay();
      if (!businessHours.days.includes(dayOfWeek)) {
        return { valid: false, error: `El negocio no abre los ${dayNames[dayOfWeek]}.` };
      }
      
      // Verificar que sea >= openTime
      if (timeInMinutes < openTime) {
        return { valid: false, error: `El horario de atención inicia a las ${businessHours.open}:00.` };
      }
      
      return { valid: true };
    }
  } else {
    // Horario normal (ej: 09:00 → 18:00)
    const dayOfWeek = scheduled.getDay();
    if (!businessHours.days.includes(dayOfWeek)) {
      return { valid: false, error: `El negocio no abre los ${dayNames[dayOfWeek]}.` };
    }
    
    if (timeInMinutes < openTime || timeInMinutes >= closeTime) {
      return { valid: false, error: `El horario de atención es de ${businessHours.open}:00 a ${businessHours.close}:00.` };
    }
    
    return { valid: true };
  }
}

export function Cart({ catalog }: { catalog: Catalog }) {
  const cartState = useCart((s) => s.carts[catalog.slug] ?? EMPTY_CART);
  const remove = useCart((s) => s.remove);
  const clear  = useCart((s) => s.clear);
  const prune  = useCart((s) => s.prune);

  // Hidratar ítems del carrito con los datos más recientes del catálogo (evita precios desactualizados)
  const items = useMemo(() => {
    const allSections = catalog.sections;
    const validIds = new Set<string>();
    const hydrated = cartState.map(cartItem => {
      let p: (Product & { packagingCount?: number }) | null = null;
      
      for (const section of allSections) {
        const prod = section.products.find(pr => pr.id === cartItem.id);
        if (prod) {
          p = { ...prod, packagingCount: prod.packagingCount ?? section.defaultPackagingCount ?? (catalog.packaging ? 1 : 0) };
          validIds.add(cartItem.id);
          break;
        }
        const prodWithVariant = section.products.find(pr => pr.variants?.some(v => v.id === cartItem.id));
        if (prodWithVariant) {
          const variant = prodWithVariant.variants!.find(v => v.id === cartItem.id)!;
          p = { 
            ...prodWithVariant, 
            id: variant.id, 
            name: `${prodWithVariant.name} (${variant.name})`, 
            price: variant.price, 
            packagingCount: variant.packagingCount ?? prodWithVariant.packagingCount ?? section.defaultPackagingCount ?? (catalog.packaging ? 1 : 0), 
            priceNote: undefined 
          };
          validIds.add(cartItem.id);
          break;
        }
      }
      if (!p) return null; // El producto fue eliminado del catálogo
      return { ...p, quantity: cartItem.quantity };
    }).filter((i): i is NonNullable<typeof i> => i !== null);

    // Limpiar productos que ya no existen del carrito persistido
    if (validIds.size < cartState.length) {
      prune(catalog.slug, validIds);
    }

    return hydrated;
  }, [cartState, catalog, prune]);

  const [open,       setOpen]       = useState(false);
  const [showMap,    setShowMap]    = useState(false);
  const [notes,      setNotes]      = useState('');
  const [clientLoc,  setClientLoc]  = useState<LatLng | null>(null);
  const [distKm,     setDistKm]     = useState<number | null>(null);
  // Modo de entrega: 'delivery' (domicilio) o 'pickup' (retiro en el local)
  const [mode, setMode] = useState<'delivery' | 'pickup'>(catalog.requiresShipping ?? true ? 'delivery' : 'pickup');
  // Método de pago y pedido programado
  const [paymentMethod, setPaymentMethod] = useState<string | null>(catalog.paymentMethods?.[0] ?? null);
  const [scheduledAt, setScheduledAt] = useState('');
  // Envío por zona manual (no depende del mapa/OSRM). null = usar mapa.
  const [zone, setZone] = useState<string | null>(null);
  const [cashChange, setCashChange] = useState('');

  const packagingQty = useMemo(() => items.reduce((sum, item) => sum + (item.packagingCount ?? 0) * item.quantity, 0), [items]);

  const requiresLocation = catalog.requiresShipping ?? true;
  const canPickup = !!catalog.allowPickup;
  const zones = catalog.deliveryZones ?? [];
  const selectedZone = zones.find((z) => z.name === zone) ?? null;
  // El toggle se ofrece solo cuando hay ambas opciones (envío configurado + retiro habilitado)
  const showModeToggle = requiresLocation && canPickup;
  const isPickup = showModeToggle ? mode === 'pickup' : !requiresLocation;
  const subtotal     = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const deliveryParams: DeliveryParams = {
    baseFee: catalog.deliveryBaseFee ?? 1,
    ratePerKm: catalog.deliveryRatePerKm ?? 0.5,
    includedKm: catalog.deliveryIncludedKm,
    maxKm: catalog.deliveryMaxKm,
    integerDistanceMode: catalog.integerDistanceMode,
  };
  // La distancia llega directo del mapa (usa la ruta real por calles si hay)
  const quote        = (!isPickup && requiresLocation && !selectedZone && distKm !== null) ? quoteForDistance(deliveryParams, distKm) : null;
  const deliveryFee  = selectedZone ? selectedZone.fee : ((!isPickup && requiresLocation) ? (quote?.fee ?? 0) : 0);
  // Distancia efectiva cobrada (con redondeo aplicado, si corresponde)
  const chargedKm    = quote?.distanceKm !== undefined ? (() => {
    const mode = deliveryParams.integerDistanceMode;
    if (mode === 'floor') return Math.floor(quote.distanceKm);
    if (mode === 'ceil')  return Math.ceil(quote.distanceKm);
    if (mode === 'round') return Math.round(quote.distanceKm);
    return quote.distanceKm;
  })() : distKm;
  const packagingFeeTotal = catalog.packaging ? packagingQty * catalog.packaging.price : 0;
  const total        = subtotal + deliveryFee + packagingFeeTotal;
  const minimumMet   = subtotal >= catalog.minimumOrder;
  const maxKm        = catalog.deliveryMaxKm || 0;
  const tooFar       = quote ? !quote.isAvailable : false;
  
  // Si el catálogo requiere envío pero olvidaron configurar las coordenadas, permitimos continuar sin mapa.
  const hasLocation  = isPickup || selectedZone ? true : (requiresLocation && catalog.location) ? clientLoc !== null : true;
  const open_        = computeIsOpen(catalog);

  // Hora aproximada en que estará listo/entregado (se actualiza tras el montaje y cada 30s)
  const prepMin = catalog.prepTimeMinutes ?? 0;
  const deliveryMin = catalog.deliveryTimeMinutes ?? 0;
  const [readyAt, setReadyAt] = useState('');
  useEffect(() => {
    const update = () => {
      if (!prepMin && !deliveryMin) { setReadyAt(''); return; }
      const totalMin = (isPickup ? prepMin : prepMin + deliveryMin);
      const t = new Date(Date.now() + totalMin * 60_000);
      const hh = t.getHours().toString().padStart(2, '0');
      const mm = t.getMinutes().toString().padStart(2, '0');
      setReadyAt(`~${hh}:${mm}`);
    };
    const first = setTimeout(update, 0);
    const id = setInterval(update, 30_000);
    return () => { clearTimeout(first); clearInterval(id); };
  }, [prepMin, deliveryMin, isPickup]);

  // Validar programación cuando cambia scheduledAt
  const scheduleErrorValue = useMemo(() => {
    if (!scheduledAt) return '';
    const result = validateScheduleDate(scheduledAt, catalog.businessHours);
    return result.valid ? '' : result.error ?? '';
  }, [scheduledAt, catalog.businessHours]);

  const onClickMode = (m: 'delivery' | 'pickup') => {
    setMode(m);
    // Al cambiar a retiro no hacen falta datos de envío
    if (m === 'pickup') { setClientLoc(null); setDistKm(null); }
  };

  const onLocationSelected = (loc: LatLng, km: number) => {
    setClientLoc(loc);
    setDistKm(km); // Se conserva para el resumen y el enlace del pedido.
    setShowMap(false);
  };

  const send = () => {
    if (!items.length || !hasLocation || (scheduledAt && scheduleErrorValue)) return;

    const isDelivery = !isPickup && requiresLocation;
    const orderId = Math.random().toString(36).substring(2, 6).toUpperCase();

    let msg = `*NUEVO PEDIDO - ${catalog.name}*\n`;
    msg += `*# PEDIDO: ${orderId}*\n\n`;
    
    // 1. Detalle de productos
    msg += `*📝 DETALLE DEL PEDIDO:*\n`;
    items.forEach((i) => {
      const frequency = i.paymentFrequency ? ` (${formatPaymentFrequency(i.paymentFrequency)})` : '';
      msg += `▪ ${i.quantity} × ${i.name}${frequency} — $${(i.quantity * i.price).toFixed(2)}\n`;
    });
    msg += `\n`;

    // 2. Resumen financiero
    msg += `*📊 RESUMEN:*\n`;
    msg += `Subtotal: $${subtotal.toFixed(2)}\n`;
    
    if (catalog.packaging && packagingQty > 0) {
      msg += `Empaque (${packagingQty}x): $${packagingFeeTotal.toFixed(2)}\n`;
    }
    
    if (isDelivery) {
      if (selectedZone) {
        msg += `Envío (${selectedZone.name}): $${deliveryFee.toFixed(2)}\n`;
      } else if (distKm !== null) {
        msg += `Envío (${distKm.toFixed(2)} km): $${deliveryFee.toFixed(2)}\n`;
      }
    }
    
    msg += `------------------------\n`;
    msg += `*TOTAL A PAGAR: $${total.toFixed(2)}*\n\n`;

    // 3. Pago y Vuelto
    if (paymentMethod) {
      msg += `*💳 MÉTODO DE PAGO:*\n${paymentMethod}\n`;
      if (paymentMethod.toLowerCase().includes('efectivo') && cashChange) {
        msg += `⚠️ _Llevar vuelto para $${Number(cashChange).toFixed(2)}_\n`;
      }
      msg += `\n`;
    }

    // 4. Notas del cliente (si afectan la preparación)
    if (notes.trim()) {
      msg += `*ℹ️ INDICACIONES DEL CLIENTE:*\n${notes.trim()}\n\n`;
    }

    if (catalog.checkoutNote) {
      msg += `_${catalog.checkoutNote}_\n\n`;
    }

    // ----------------------------------------------------
    // SEGUNDA PARTE: FICHA DE ENTREGA PARA EL REPARTIDOR
    // ----------------------------------------------------
    msg += `=======================\n`;
    msg += `*📍 FICHA DE ENTREGA (Repartidor)*\n`;
    msg += `*# PEDIDO: ${orderId}*\n\n`;

    if (isPickup && catalog.allowPickup) {
      msg += `Modo: 🏪 Retiro en local\n`;
      msg += `Dirección: ${catalog.address || catalog.name}\n`;
    } else if (isDelivery) {
      msg += `Modo: 🛵 A domicilio\n`;
    }

    if (scheduledAt) {
      msg += `Horario: 🗓️ Programado para ${formatSchedule(scheduledAt)}\n`;
    } else if (readyAt) {
      msg += `Tiempo aprox.: ⏱️ ${readyAt}\n`;
    }

    if (isDelivery && !selectedZone && clientLoc) {
      msg += `\n*Mapa GPS:*\nhttps://maps.google.com/maps?q=${clientLoc.lat},${clientLoc.lng}\n`;
    }

    // El cobro para el repartidor (repetido para claridad)
    if (isDelivery) {
      msg += `\n*💰 COBRAR AL CLIENTE: $${total.toFixed(2)}*\n`;
      if (paymentMethod?.toLowerCase().includes('efectivo') && cashChange) {
        msg += `(El cliente paga con $${Number(cashChange).toFixed(2)})\n`;
      }
    }

    const url = `https://wa.me/${catalog.phone}?text=${encodeURIComponent(msg)}`;
    const w = window.open(url, '_blank', 'noopener,noreferrer');
    
    if (w === null) {
      window.location.assign(url);
    } else {
      clear(catalog.slug);
      setOpen(false);
      setClientLoc(null);
      setDistKm(null);
      setNotes('');
      setScheduledAt('');
      setZone(null);
      setCashChange('');
    }
  };

  const count = items.reduce((n, i) => n + i.quantity, 0);

  const [isBumping, setIsBumping] = useState(false);
  const prevCount = useRef(count);
  useEffect(() => {
    if (count > prevCount.current) {
      setIsBumping(true);
      const timer = setTimeout(() => setIsBumping(false), 300);
      return () => clearTimeout(timer);
    }
    prevCount.current = count;
  }, [count]);

  return (
    <>
      {/* Botón flotante carrito */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-stone-900 dark:bg-orange-600 dark:text-stone-50 dark:shadow-orange-900/30 px-6 py-4 font-bold text-white shadow-2xl ring-4 ring-white/20 transition-all duration-300 hover:scale-110 ${isBumping ? 'scale-125' : 'scale-100'}`}
      >
        🛒 {count}
      </button>

      {/* Panel del carrito */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="ml-auto flex h-full max-w-md flex-col rounded-l-3xl bg-white p-5 shadow-2xl overflow-hidden dark:bg-stone-900 dark:text-stone-100 transition-colors"
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-bold">Tu carrito</h2>
              <button onClick={() => setOpen(false)} aria-label="Cerrar" className="text-xl opacity-60 hover:opacity-100">✕</button>
            </div>

            {/* Contenido scrolleable (ítems + opciones de envío/pago) */}
            <div className="mt-4 flex-1 overflow-auto space-y-4 pr-2 pb-2">
              {/* Lista de ítems */}
              <div className="space-y-3">
                {items.length ? items.map((item) => (
                <div key={item.id} className="flex justify-between gap-3 rounded-2xl bg-stone-50 p-4 dark:bg-stone-800/50">
                  <div className="flex-1">
                    <span className="text-sm font-medium">{item.quantity} × {item.name}</span>
                    {item.paymentFrequency && (
                      <span className="ml-2 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                        · {formatPaymentFrequency(item.paymentFrequency)}
                      </span>
                    )}
                  </div>
                  <span className="whitespace-nowrap text-sm font-bold text-orange-600">
                    ${(item.price * item.quantity).toFixed(2)}
                    <button
                      className={`ml-3 font-bold transition-colors ${item.quantity > 1 ? 'text-orange-600 hover:text-orange-700' : 'text-red-500 hover:text-red-600'}`}
                      onClick={() => remove(catalog.slug, item.id)}
                      title={item.quantity > 1 ? 'Reducir cantidad' : 'Eliminar'}
                    >
                      {item.quantity > 1 ? '−' : '🗑️'}
                    </button>
                  </span>
                </div>
              )) : (
                <p className="text-stone-400 text-sm text-center py-8">Tu carrito está vacío.</p>
              )}
              </div>

              {/* --- Opciones de envío y pago --- */}
              <div className="space-y-3 pt-4 border-t">

              {/* Selector de entrega: retiro en local o domicilio */}
              {showModeToggle && (
                <div className="grid grid-cols-2 gap-1 rounded-xl bg-stone-100 p-1 dark:bg-stone-800/60">
                  {([
                    { key: 'pickup', label: '🏪 Retiro en local' },
                    { key: 'delivery', label: '🛵 A domicilio' },
                  ] as const).map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => onClickMode(opt.key)}
                      className={`rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${
                        mode === opt.key
                          ? 'bg-white shadow text-stone-900 dark:bg-stone-900 dark:text-stone-50'
                          : 'text-stone-500 hover:text-stone-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Tiempos estimados / pedido programado */}
              {(prepMin > 0 || deliveryMin > 0 || catalog.scheduleOrders) && (
                <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3 dark:bg-stone-800/40">
                  {prepMin > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500 dark:text-stone-400">
                        ⏱️ Preparación
                      </span>
                      <span className="font-bold text-stone-700 dark:text-stone-200">~{prepMin} min</span>
                    </div>
                  )}
                  {deliveryMin > 0 && !isPickup && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500 dark:text-stone-400">🛵 Entrega (adicional)</span>
                      <span className="font-bold text-stone-700 dark:text-stone-200">~{deliveryMin} min</span>
                    </div>
                  )}
                  {!catalog.scheduleOrders && readyAt && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500 dark:text-stone-400">
                        {isPickup ? '🕐 Listo para retirar' : '🕐 Entrega estimada'}
                      </span>
                      <span className="font-bold text-orange-600 dark:text-orange-500">{readyAt}</span>
                    </div>
                  )}
                  {catalog.scheduleOrders && (
                    <div>
                      <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">
                        🗓️ ¿Prefieres programar tu pedido?
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        min={getLocalDatetimeString()}
                        className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 dark:bg-stone-900 dark:border-stone-700"
                      />
                      {scheduleErrorValue && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                          ⚠️ {scheduleErrorValue}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Selector de empaque (automático) */}
              {catalog.packaging && packagingQty > 0 && (
                <div className="flex items-center justify-between rounded-xl border border-stone-200 p-3 bg-stone-50 dark:bg-stone-800/40">
                  <div>
                    <p className="text-sm font-bold">{catalog.packaging.label}</p>
                    <p className="text-xs text-stone-500">+${catalog.packaging.price.toFixed(2)} c/u</p>
                  </div>
                  <div className="flex items-center gap-2 px-2">
                    <span className="text-stone-600 dark:text-stone-400 font-medium text-xs">Automático:</span>
                    <span className="text-sm font-bold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 px-3 py-1.5 rounded-md shadow-sm text-stone-700 dark:text-stone-200">
                      {packagingQty} envases
                    </span>
                  </div>
                </div>
              )}

              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-stone-500 dark:text-stone-400">Subtotal</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>

              {catalog.packaging && packagingQty > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500 dark:text-stone-400">Envases ({packagingQty})</span>
                  <span className="font-bold text-stone-600 dark:text-stone-300">+${packagingFeeTotal.toFixed(2)}</span>
                </div>
              )}

              {/* Mínimo */}
              {!minimumMet && items.length > 0 && (
                <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                  ⚠ Faltan ${(catalog.minimumOrder - subtotal).toFixed(2)} para el pedido mínimo de ${catalog.minimumOrder.toFixed(2)}
                </p>
              )}

              {/* Sección de ubicación (solo domicilio) */}
              {requiresLocation && !isPickup && (
                <div className="rounded-xl border border-stone-200 overflow-hidden">
                  <button
                    onClick={() => setShowMap(true)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 transition-colors"
                  >
                    <span className="text-2xl">📍</span>
                    <div className="flex-1 text-left">
                      {clientLoc ? (
                        <>
                          <p className="text-xs font-bold text-green-700">Ubicación seleccionada ✓</p>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {distKm !== null ? `${distKm.toFixed(2)} km · ` : ''}Envío: {distKm !== null ? `$${deliveryFee.toFixed(2)}` : '…'}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-bold text-stone-700">Selecciona tu ubicación</p>
                          <p className="text-xs text-stone-400">GPS o pin en el mapa</p>
                        </>
                      )}
                    </div>
                    <span className="text-stone-400 text-sm">{clientLoc ? '✏' : '→'}</span>
                  </button>

                  {tooFar && maxKm > 0 && (
                    <div className="bg-red-50 px-3 py-2 border-t border-red-100">
                      <p className="text-xs text-red-700">
                        ⚠ Fuera del radio de entrega ({maxKm} km). Tu ubicación está a {distKm!.toFixed(1)} km.
                      </p>
                    </div>
                  )}

                  {clientLoc && !tooFar && distKm !== null && (
                    <div className="bg-green-50 px-3 py-2 border-t border-green-100 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-stone-500">
                          🛵 Costo de envío
                          {chargedKm !== null && chargedKm !== distKm
                            ? ` (${chargedKm} km cobrados de ${distKm.toFixed(2)} km)` 
                            : ` (${distKm.toFixed(2)} km)`}
                        </span>
                        <span className="font-bold text-green-700">${deliveryFee.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Envío por zona (manual, sin depender del mapa) */}
              {requiresLocation && !isPickup && zones.length > 0 && (
                <div className="rounded-xl border border-stone-200 p-3 dark:border-stone-700">
                  <p className="text-xs font-bold text-stone-600 dark:text-stone-300 mb-2">🗺️ ¿Dónde entregamos?</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => { setZone(null); setClientLoc(null); setDistKm(null); }}
                      className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                        !selectedZone
                          ? 'bg-orange-600 text-white shadow'
                          : 'bg-white text-stone-600 ring-1 ring-stone-300 hover:bg-orange-50 dark:bg-stone-900 dark:text-stone-300 dark:ring-stone-600'
                      }`}
                    >
                      📍 Con mapa
                    </button>
                    {zones.map((z) => (
                      <button
                        key={z.name}
                        onClick={() => { setZone(z.name); setClientLoc(null); setDistKm(null); setShowMap(false); }}
                        className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                          selectedZone?.name === z.name
                            ? 'bg-orange-600 text-white shadow'
                            : 'bg-white text-stone-600 ring-1 ring-stone-300 hover:bg-orange-50 dark:bg-stone-900 dark:text-stone-300 dark:ring-stone-600'
                        }`}
                      >
                        {z.name} · ${z.fee.toFixed(2)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas adicionales */}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isPickup ? "Notas adicionales (p.ej. apellido para retirar)..." : "Indicaciones (timbre, piso, etc.)"}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none dark:bg-stone-800 dark:border-stone-700 dark:focus:border-orange-500"
                rows={2}
              />

              {/* Método de pago */}
              {catalog.paymentMethods && catalog.paymentMethods.length > 0 && (
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 dark:bg-stone-800/40">
                  <p className="text-xs font-bold text-stone-600 dark:text-stone-300 mb-2">💳 Método de pago</p>
                  <div className="flex flex-wrap gap-1.5">
                    {catalog.paymentMethods.map((m) => (
                      <button
                        key={m}
                        onClick={() => setPaymentMethod(m)}
                        className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                          paymentMethod === m
                            ? 'bg-orange-600 text-white shadow'
                            : 'bg-white text-stone-600 ring-1 ring-stone-300 hover:bg-orange-50 dark:bg-stone-900 dark:text-stone-300 dark:ring-stone-600'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  {paymentMethod?.toLowerCase().includes('efectivo') && (
                    <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700">
                      <p className="text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1.5">¿Con cuánto vas a pagar? (Para llevarte vuelto)</p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder={(Math.ceil(total / 5) * 5).toFixed(2)}
                          value={cashChange}
                          onChange={(e) => setCashChange(e.target.value)}
                          className="w-full rounded-lg border border-stone-300 pl-7 pr-3 py-2 text-sm outline-none focus:border-orange-500 bg-white dark:bg-stone-900 dark:border-stone-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              </div>
            </div>

            {/* Footer Fijo (Total y Botón) */}
            <div className="flex-shrink-0 border-t pt-4 space-y-3 mt-2 bg-white dark:bg-stone-900">

              {/* Total */}
              {(!requiresLocation || isPickup || clientLoc || selectedZone) && !tooFar && (
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>{isPickup && catalog.allowPickup ? 'Total (retiro)' : requiresLocation ? 'Total con envío' : 'Total'}</span>
                  <span className="text-orange-600">${total.toFixed(2)}</span>
                </div>
              )}

              {/* Estado del negocio */}
              {!open_ && (
                <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 text-center">
                  🔴 El negocio está cerrado. Horario: {formatBusinessHours(catalog)}. Aún puedes enviar tu pedido; lo confirmaremos al abrir.
                </p>
              )}

              {/* Aviso contextual cuando falta ubicación — el cuello de botella más crítico (solo domicilio) */}
              {requiresLocation && !isPickup && !selectedZone && !clientLoc && items.length > 0 && (
                <button
                  onClick={() => setShowMap(true)}
                  className="w-full flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-300 px-4 py-3 text-sm font-bold text-amber-800 hover:bg-amber-100 transition-colors text-left"
                >
                  <span className="text-lg">👆</span>
                  <span>Selecciona tu dirección de entrega para continuar</span>
                  <span className="ml-auto text-amber-500">→</span>
                </button>
              )}

              {/* Botón enviar */}
              <button
                disabled={!items.length || !hasLocation || tooFar || !minimumMet || !!(scheduledAt && scheduleErrorValue)}
                onClick={send}
                className="w-full rounded-2xl bg-green-600 px-5 py-4 text-base font-bold text-white shadow-xl shadow-green-900/20 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none hover:bg-green-700 transition-all active:scale-95 dark:disabled:bg-stone-800 dark:disabled:text-stone-500"
              >
                {tooFar ? '⚠️ Fuera del radio de entrega' : !minimumMet ? `⚠️ Mínimo $${catalog.minimumOrder.toFixed(2)}` : scheduledAt && scheduleErrorValue ? '⚠️ Horario no válido' : '📲 Enviar pedido por WhatsApp'}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Mapa de selección de ubicación */}
      {showMap && catalog.location && (
        <LocationPicker
          restaurantLocation={catalog.location}
          deliveryParams={deliveryParams}
          deliveryRadiusKm={catalog.deliveryIncludedKm}
          onSelect={onLocationSelected}
          onClose={() => setShowMap(false)}
        />
      )}

      {/* Aviso si el catálogo no tiene coordenadas configuradas */}
      {showMap && !catalog.location && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="rounded-2xl bg-white p-6 text-center max-w-sm">
            <p className="text-4xl mb-3">⚙️</p>
            <p className="font-bold">Coordenadas no configuradas</p>
            <p className="text-sm text-stone-500 mt-2">El administrador debe configurar la ubicación del restaurante en el código.</p>
            <button onClick={() => setShowMap(false)} className="mt-4 w-full rounded-xl bg-stone-900 py-2 text-white font-bold">Cerrar</button>
          </div>
        </div>
      )}
    </>
  );
}
