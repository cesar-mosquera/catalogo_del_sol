'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { Catalog } from '@/lib/catalog-types';
import { useCart, type CartItem } from '@/store/cart';
import type { LatLng } from './LocationPicker';
import { quoteForDistance, computeIsOpen, formatBusinessHours, type DeliveryParams } from '@/lib/delivery';

// Leaflet requiere el DOM → carga dinámica sin SSR
const LocationPicker = dynamic(
  () => import('./LocationPicker').then((m) => m.LocationPicker),
  { ssr: false }
);

const EMPTY_CART: CartItem[] = [];

export function Cart({ catalog }: { catalog: Catalog }) {
  const cartState = useCart((s) => s.carts[catalog.slug] ?? EMPTY_CART);
  const remove = useCart((s) => s.remove);
  const clear  = useCart((s) => s.clear);

  // Hidratar ítems del carrito con los datos más recientes del catálogo (evita precios desactualizados)
  const items = useMemo(() => {
    const allProducts = catalog.sections.flatMap(s => s.products);
    return cartState.map(cartItem => {
      let p = allProducts.find(p => p.id === cartItem.id);
      if (!p) {
        for (const prod of allProducts) {
          const variant = prod.variants?.find(v => v.id === cartItem.id);
          if (variant) {
            p = { ...prod, id: variant.id, name: `${prod.name} (${variant.name})`, price: variant.price, priceNote: undefined };
            break;
          }
        }
      }
      if (!p) return null; // El producto fue eliminado del catálogo
      return { ...p, quantity: cartItem.quantity };
    }).filter((i): i is NonNullable<typeof i> => i !== null);
  }, [cartState, catalog]);

  const [open,       setOpen]       = useState(false);
  const [showMap,    setShowMap]    = useState(false);
  const [notes,      setNotes]      = useState('');
  const [clientLoc,  setClientLoc]  = useState<LatLng | null>(null);
  const [distKm,     setDistKm]     = useState<number | null>(null);

  const requiresLocation = catalog.requiresShipping ?? true;
  const subtotal     = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const deliveryParams: DeliveryParams = {
    baseFee: catalog.deliveryBaseFee ?? 1,
    ratePerKm: catalog.deliveryRatePerKm ?? 0.5,
    includedKm: catalog.deliveryIncludedKm,
    maxKm: catalog.deliveryMaxKm,
  };
  // La distancia llega directo del mapa (usa la ruta real por calles si hay)
  const quote        = (requiresLocation && distKm !== null) ? quoteForDistance(deliveryParams, distKm) : null;
  const deliveryFee  = requiresLocation ? (quote?.fee ?? 0) : 0;
  const total        = subtotal + deliveryFee;
  const minimumMet   = subtotal >= catalog.minimumOrder;
  const maxKm        = catalog.deliveryMaxKm || 0;
  const tooFar       = quote ? !quote.isAvailable : false;
  
  // Si el catálogo requiere envío pero olvidaron configurar las coordenadas, permitimos continuar sin mapa.
  const hasLocation  = (requiresLocation && catalog.location) ? clientLoc !== null : true;
  const open_        = computeIsOpen(catalog);

  const onLocationSelected = (loc: LatLng, km: number) => {
    setClientLoc(loc);
    setDistKm(km); // Se conserva para el resumen y el enlace del pedido.
    setShowMap(false);
  };

  const send = () => {
    if (!items.length || !hasLocation) return;

    const detail = items
      .map((i) => `• ${i.quantity} × ${i.name} — $${(i.quantity * i.price).toFixed(2)}`)
      .join('\n');

    const locLine = (requiresLocation && clientLoc) ? `📍 https://maps.google.com/?q=${clientLoc.lat},${clientLoc.lng}\n` : '';
    const distLine = (requiresLocation && distKm !== null) ? `*🛵 Envío (ruta por calles ${distKm.toFixed(2)} km): $${deliveryFee.toFixed(2)}*\n` : '';
    const notesLine = notes.trim() ? `📝 Indicaciones: ${notes.trim()}` : '';
    const checkoutLine = catalog.checkoutNote ? `\n*ℹ️ ${catalog.checkoutNote}*\n` : '';

    const message =
      `Hola, quiero hacer un pedido en *${catalog.name}*:\n\n` +
      `${detail}\n\n` +
      `*Subtotal: $${subtotal.toFixed(2)}*\n` +
      distLine +
      `*Total${requiresLocation ? ' con envío' : ''}: $${total.toFixed(2)}*\n` +
      checkoutLine +
      locLine + notesLine;

    window.open(`https://wa.me/${catalog.phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    clear(catalog.slug);
    setOpen(false);
    setClientLoc(null);
    setDistKm(null);
    setNotes('');
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

            {/* Lista de ítems */}
            <div className="mt-4 flex-1 overflow-auto space-y-3 pr-2">
              {items.length ? items.map((item) => (
                <div key={item.id} className="flex justify-between gap-3 rounded-2xl bg-stone-50 p-4 dark:bg-stone-800/50">
                  <span className="text-sm font-medium">{item.quantity} × {item.name}</span>
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

            {/* Footer con resumen y ubicación */}
            <div className="flex-shrink-0 border-t pt-4 space-y-3 mt-2">

              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-stone-500 dark:text-stone-400">Subtotal</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>

              {/* Mínimo */}
              {!minimumMet && items.length > 0 && (
                <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                  ⚠ Faltan ${(catalog.minimumOrder - subtotal).toFixed(2)} para el pedido mínimo de ${catalog.minimumOrder.toFixed(2)}
                </p>
              )}

              {/* Sección de ubicación */}
              {requiresLocation && (
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
                    <div className="bg-green-50 px-3 py-2 border-t border-green-100 flex justify-between text-xs">
                      <span className="text-stone-500">🛵 Costo de envío ({distKm.toFixed(2)} km)</span>
                      <span className="font-bold text-green-700">${deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Notas adicionales */}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={requiresLocation ? "Indicaciones (timbre, piso, etc.)" : "Notas, requerimientos o mensaje adicional..."}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none dark:bg-stone-800 dark:border-stone-700 dark:focus:border-orange-500"
                rows={2}
              />

              {/* Total */}
              {(!requiresLocation || clientLoc) && !tooFar && (
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>{requiresLocation ? 'Total con envío' : 'Total'}</span>
                  <span className="text-orange-600">${total.toFixed(2)}</span>
                </div>
              )}

              {/* Estado del negocio */}
              {!open_ && (
                <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 text-center">
                  🔴 El negocio está cerrado. Horario: {formatBusinessHours(catalog)}. Aún puedes enviar tu pedido; lo confirmaremos al abrir.
                </p>
              )}

              {/* Botón enviar */}
              <button
                disabled={!items.length || !hasLocation || tooFar}
                onClick={send}
                className="w-full rounded-2xl bg-green-600 px-5 py-4 text-base font-bold text-white shadow-xl shadow-green-900/20 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none hover:bg-green-700 transition-all active:scale-95 dark:disabled:bg-stone-800 dark:disabled:text-stone-500"
              >
                {tooFar ? '⚠️ Fuera del radio de entrega' : '📲 Enviar pedido por WhatsApp'}
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
