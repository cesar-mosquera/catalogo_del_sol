'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Catalog } from '@/lib/catalog-types';
import { useCart, type CartItem } from '@/store/cart';
import type { LatLng } from './LocationPicker';
import { quoteDelivery } from '@/lib/delivery';

// Leaflet requiere el DOM → carga dinámica sin SSR
const LocationPicker = dynamic(
  () => import('./LocationPicker').then((m) => m.LocationPicker),
  { ssr: false }
);

const EMPTY_CART: CartItem[] = [];

function isOpen(catalog: Catalog) {
  const now   = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: catalog.businessHours.timezone,
    weekday: 'short', hour: 'numeric', hour12: false,
  }).formatToParts(now);
  const weekday = parts.find((p) => p.type === 'weekday')?.value;
  const hour    = Number(parts.find((p) => p.type === 'hour')?.value ?? 0) % 24;
  const index   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(weekday ?? '');
  return catalog.businessHours.days.includes(index)
    && hour >= catalog.businessHours.open
    && hour <  catalog.businessHours.close;
}

export function Cart({ catalog }: { catalog: Catalog }) {
  const items  = useCart((s) => s.carts[catalog.slug] ?? EMPTY_CART);
  const remove = useCart((s) => s.remove);
  const clear  = useCart((s) => s.clear);

  const [open,       setOpen]       = useState(false);
  const [showMap,    setShowMap]    = useState(false);
  const [notes,      setNotes]      = useState('');
  const [clientLoc,  setClientLoc]  = useState<LatLng | null>(null);
  const [distKm,     setDistKm]     = useState<number | null>(null);

  const subtotal     = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const quote        = clientLoc ? quoteDelivery(catalog, clientLoc) : null;
  const deliveryFee  = quote?.fee ?? null;
  const total        = subtotal + (deliveryFee ?? 0);
  const minimumMet   = subtotal >= catalog.minimumOrder;
  const maxKm        = catalog.deliveryMaxKm ?? 10;
  const tooFar       = quote ? !quote.isAvailable : false;
  const hasLocation  = clientLoc !== null;
  const open_        = isOpen(catalog);

  const onLocationSelected = (loc: LatLng, km: number) => {
    setClientLoc(loc);
    setDistKm(km); // Se conserva para el resumen y el enlace del pedido.
    setShowMap(false);
  };

  const send = () => {
    if (!items.length || !minimumMet || !hasLocation || tooFar || !open_) return;

    const detail = items
      .map((i) => `• ${i.quantity} × ${i.name} — $${(i.quantity * i.price).toFixed(2)}`)
      .join('\n');

    const locLine = `📍 https://maps.google.com/?q=${clientLoc!.lat},${clientLoc!.lng}`;
    const distLine = `📏 Distancia: ${distKm!.toFixed(2)} km · Envío: $${deliveryFee!.toFixed(2)}`;
    const notesLine = notes.trim() ? `\n📝 Indicaciones: ${notes.trim()}` : '';

    const message =
      `Hola, quiero hacer un pedido en *${catalog.name}*:\n\n` +
      `${detail}\n\n` +
      `*Subtotal: $${subtotal.toFixed(2)}*\n` +
      `*${distLine}*\n` +
      `*Total con envío: $${total.toFixed(2)}*\n\n` +
      `${locLine}${notesLine}`;

    window.open(`https://wa.me/${catalog.phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    clear(catalog.slug);
    setOpen(false);
    setClientLoc(null);
    setDistKm(null);
    setNotes('');
  };

  const count = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <>
      {/* Botón flotante carrito */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-stone-900 px-5 py-3 font-bold text-white shadow-xl"
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
            className="ml-auto flex h-full max-w-md flex-col rounded-3xl bg-white p-5 shadow-2xl overflow-hidden"
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-bold">Tu pedido</h2>
              <button onClick={() => setOpen(false)} aria-label="Cerrar" className="text-xl">✕</button>
            </div>

            {/* Lista de ítems */}
            <div className="mt-4 flex-1 overflow-auto space-y-3">
              {items.length ? items.map((item) => (
                <div key={item.id} className="flex justify-between gap-3 rounded-xl bg-stone-50 p-3">
                  <span className="text-sm">{item.quantity} × {item.name}</span>
                  <span className="whitespace-nowrap text-sm font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                    <button
                      className="ml-2 text-orange-600 font-bold"
                      onClick={() => remove(catalog.slug, item.id)}
                    >−</button>
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
                <span className="text-stone-500">Subtotal</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>

              {/* Mínimo */}
              {!minimumMet && items.length > 0 && (
                <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                  ⚠ Faltan ${(catalog.minimumOrder - subtotal).toFixed(2)} para el pedido mínimo de ${catalog.minimumOrder.toFixed(2)}
                </p>
              )}

              {/* Sección de ubicación */}
              <div className="rounded-xl border border-stone-200 overflow-hidden">
                <button
                  onClick={() => setShowMap(true)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 transition-colors"
                >
                  <span className="text-2xl">📍</span>
                  <div className="flex-1 text-left">
                    {hasLocation ? (
                      <>
                        <p className="text-xs font-bold text-green-700">Ubicación seleccionada ✓</p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {distKm!.toFixed(2)} km del local · Envío: ${deliveryFee!.toFixed(2)}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-stone-700">Selecciona tu ubicación</p>
                        <p className="text-xs text-stone-400">GPS o pin en el mapa</p>
                      </>
                    )}
                  </div>
                  <span className="text-stone-400 text-sm">{hasLocation ? '✏' : '→'}</span>
                </button>

                {tooFar && (
                  <div className="bg-red-50 px-3 py-2 border-t border-red-100">
                    <p className="text-xs text-red-700">
                      ⚠ Fuera del radio de entrega ({maxKm} km). Tu ubicación está a {distKm!.toFixed(1)} km.
                    </p>
                  </div>
                )}

                {hasLocation && !tooFar && (
                  <div className="bg-green-50 px-3 py-2 border-t border-green-100 flex justify-between text-xs">
                    <span className="text-stone-500">Costo de envío</span>
                    <span className="font-bold text-green-700">${deliveryFee!.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Notas adicionales */}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Indicaciones adicionales (timbre, piso, etc.)"
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none"
                rows={2}
              />

              {/* Total */}
              {hasLocation && !tooFar && (
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total con envío</span>
                  <span className="text-orange-600">${total.toFixed(2)}</span>
                </div>
              )}

              {/* Estado del negocio */}
              {!open_ && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 text-center">
                  🔴 El negocio está cerrado. Horario: {catalog.businessHours.open}:00 – {catalog.businessHours.close}:00
                </p>
              )}

              {/* Botón enviar */}
              <button
                disabled={!items.length || !minimumMet || !hasLocation || tooFar || !open_}
                onClick={send}
                className="w-full rounded-xl bg-green-600 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-stone-300 hover:bg-green-700 transition-colors"
              >
                📲 Enviar pedido por WhatsApp
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Mapa de selección de ubicación */}
      {showMap && catalog.location && (
        <LocationPicker
          restaurantLocation={catalog.location}
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
