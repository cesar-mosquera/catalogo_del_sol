'use client';

import { useMemo, useState } from 'react';
import type { Catalog } from '@/lib/catalog-types';
import { useCart } from '@/store/cart';

function isOpen(catalog: Catalog) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: catalog.businessHours.timezone, weekday: 'short', hour: 'numeric', hour12: false }).formatToParts(now);
  const weekday = parts.find((part) => part.type === 'weekday')?.value;
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0) % 24;
  const index = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday ?? '');
  return catalog.businessHours.days.includes(index) && hour >= catalog.businessHours.open && hour < catalog.businessHours.close;
}

export function Cart({ catalog }: { catalog: Catalog }) {
  const { items, remove, clear } = useCart();
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState('');
  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const minimumMet = total >= catalog.minimumOrder;
  const send = () => {
    if (!items.length || !minimumMet || !address.trim() || !isOpen(catalog)) return;
    const detail = items.map((item) => `• ${item.quantity} × ${item.name} — $${(item.quantity * item.price).toFixed(2)}`).join('\n');
    const message = `Hola, quiero hacer un pedido en *${catalog.name}*:\n\n${detail}\n\n*Total: $${total.toFixed(2)}*\n*Dirección / indicaciones:* ${address.trim()}`;
    window.open(`https://wa.me/${catalog.phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    clear(); setOpen(false);
  };
  return <>
    <button onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-30 rounded-full bg-stone-900 px-5 py-3 font-bold text-white shadow-xl">🛒 {items.reduce((n, item) => n + item.quantity, 0)}</button>
    {open && <div className="fixed inset-0 z-40 bg-black/40 p-4" onClick={() => setOpen(false)}><aside onClick={(event) => event.stopPropagation()} className="ml-auto flex h-full max-w-md flex-col rounded-3xl bg-white p-5 shadow-2xl">
      <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Tu pedido</h2><button onClick={() => setOpen(false)} aria-label="Cerrar">✕</button></div>
      <div className="mt-5 flex-1 overflow-auto space-y-3">{items.length ? items.map((item) => <div className="flex justify-between gap-3 rounded-xl bg-stone-50 p-3" key={item.id}><span>{item.quantity} × {item.name}</span><span className="whitespace-nowrap">${(item.price * item.quantity).toFixed(2)} <button className="ml-2 text-orange-700" onClick={() => remove(item.id)}>−</button></span></div>) : <p className="text-stone-500">Tu carrito está vacío.</p>}</div>
      <div className="border-t pt-4"><p className="text-lg font-bold">Total: ${total.toFixed(2)}</p><p className="mt-1 text-xs text-stone-600">Pedido mínimo: ${catalog.minimumOrder.toFixed(2)} · Horario: {catalog.businessHours.open}:00–{catalog.businessHours.close}:00</p>
        <textarea value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Dirección e indicaciones de entrega" className="mt-3 w-full rounded-xl border p-3" rows={3} />
        {!minimumMet && items.length > 0 && <p className="mt-2 text-sm text-red-700">Faltan ${(catalog.minimumOrder - total).toFixed(2)} para el pedido mínimo.</p>}
        {!isOpen(catalog) && <p className="mt-2 text-sm text-red-700">El negocio está cerrado en este momento.</p>}
        <button disabled={!items.length || !minimumMet || !address.trim() || !isOpen(catalog)} onClick={send} className="mt-3 w-full rounded-xl bg-green-600 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-stone-300">Enviar por WhatsApp</button>
      </div>
    </aside></div>}
  </>;
}
