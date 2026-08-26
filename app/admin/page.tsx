'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useAdmin } from '@/store/admin-store';
import { BASE_PATH } from '@/lib/base-path';
import { getCatalogs } from '@/lib/getCatalog';
import { compressImage, localStorageUsageKB } from '@/lib/compress-image';
import type { Catalog, Product } from '@/lib/catalog-types';
import { asset } from '@/lib/asset';

/* ───────────────────────── PIN DE ACCESO ──────────────────── */
const ADMIN_PIN = '1234'; // Cambia este PIN en el código

function PinGate({ onOk }: { onOk: () => void }) {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(false);
  const submit = () => {
    if (pin === ADMIN_PIN) { onOk(); }
    else { setErr(true); setPin(''); }
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-stone-950">
      <div className="w-80 rounded-3xl bg-stone-900 p-8 text-center text-white shadow-2xl">
        <div className="text-4xl mb-2">🔒</div>
        <h1 className="text-xl font-bold mb-1">Panel de administración</h1>
        <p className="text-sm text-stone-400 mb-6">Ingresa el PIN de acceso</p>
        <input
          type="password"
          inputMode="numeric"
          maxLength={8}
          value={pin}
          onChange={(e) => { setPin(e.target.value); setErr(false); }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="● ● ● ●"
          className="w-full rounded-xl bg-stone-800 px-4 py-3 text-center text-2xl tracking-widest outline-none focus:ring-2 focus:ring-orange-500"
          autoFocus
        />
        {err && <p className="mt-2 text-sm text-red-400">PIN incorrecto</p>}
        <button onClick={submit} className="mt-4 w-full rounded-xl bg-orange-600 py-3 font-bold hover:bg-orange-700">
          Entrar
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── COMPONENTE IMAGEN ──────────────── */
function ImageUpload({
  label, current, onUpload, maxPx = 900, aspectRatio
}: {
  label: string;
  current?: string;
  onUpload: (base64: string) => void;
  maxPx?: number;
  aspectRatio?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const data = await compressImage(file, maxPx, 0.78, aspectRatio);
      onUpload(data);
    } catch (err) {
      console.error('Error procesando imagen:', err);
      setError('No pudimos procesar esta imagen. Intenta con otra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-stone-700">{label}</label>
      <div
        className="relative flex h-36 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 hover:border-orange-400 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-stone-400 text-sm">Toca para subir foto</span>
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-white text-sm">Comprimiendo…</span>
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
          ⚠️ {error}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}

/* ───────────────────────── EDITOR DE PRODUCTO ─────────────── */
function ProductEditor({
  product,
  catalogSlug,
  sectionName: initialSectionName,
  sections,
  onClose,
}: {
  product?: Product;
  catalogSlug: string;
  sectionName: string;
  sections: string[];
  onClose: () => void;
}) {
  const upsert = useAdmin((s) => s.upsertProduct);
  const remove = useAdmin((s) => s.deleteProduct);
  const [selectedSection, setSelectedSection] = useState(initialSectionName);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [form, setForm] = useState<Product>({
    id: product?.id ?? '',
    name: product?.name ?? '',
    price: product?.price ?? 0,
    description: product?.description ?? '',
    image: product?.image ?? '',
    badge: product?.badge ?? '',
    demoUrl: product?.demoUrl ?? '',
    deliveryDays: product?.deliveryDays ?? '',
    priceNote: product?.priceNote ?? '',
    packagingCount: product?.packagingCount ?? undefined,
    paymentFrequency: product?.paymentFrequency ?? undefined,
  });

  const set = (k: keyof Product, v: string | number | undefined) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.name.trim()) return;
    const prod: Product = {
      ...form,
      id: form.id || `prod-${Date.now()}`,
      badge: form.badge || undefined,
      demoUrl: form.demoUrl || undefined,
      deliveryDays: form.deliveryDays || undefined,
      priceNote: form.priceNote || undefined,
      packagingCount: form.packagingCount || undefined,
      paymentFrequency: form.paymentFrequency || undefined,
    };
    upsert(catalogSlug, selectedSection, prod);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 sm:items-center sm:justify-center" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-4">{product ? 'Editar producto' : 'Nuevo producto'}</h3>

        <ImageUpload
          label="Foto del producto"
          current={form.image ? asset(form.image) : undefined}
          onUpload={(d) => set('image', d)}
          maxPx={800}
          aspectRatio={1}
        />

        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1">Sección</label>
            <select
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              {sections.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <Field label="Nombre *" value={form.name} onChange={(v) => set('name', v)} />
          <Field label="Precio *" type="number" step="0.01" value={String(form.price)} onChange={(v) => set('price', parseFloat(v) || 0)} />
          <Field label="Descripción" value={form.description} onChange={(v) => set('description', v)} textarea />
          <Field label="Etiqueta (ej: Favorita)" value={form.badge ?? ''} onChange={(v) => set('badge', v)} />
          <Field label="Días de entrega (ej: 2–3 días)" value={form.deliveryDays ?? ''} onChange={(v) => set('deliveryDays', v)} />
          <Field label="Nota de precio (ej: MEDIO $5.50 | COMPLETO $6.50)" value={form.priceNote ?? ''} onChange={(v) => set('priceNote', v)} />
          <Field label="URL de demo" value={form.demoUrl ?? ''} onChange={(v) => set('demoUrl', v)} />
        </div>

        {/* Sección de campos avanzados (colapsable) */}
        <div className="mt-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-stone-700"
          >
            <span>{showAdvanced ? '▼' : '▶'}</span>
            <span>Campos avanzados</span>
          </button>
          
          {showAdvanced && (
            <div className="mt-3 space-y-3 rounded-xl border border-stone-200 p-3 bg-stone-50">
              <Field 
                label="Unidades de empaque (para cobros automáticos)" 
                type="number" 
                step="1"
                value={String(form.packagingCount ?? '')} 
                onChange={(v) => set('packagingCount', v ? parseInt(v) : undefined)} 
              />
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Frecuencia de pago</label>
                <select
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white"
                  value={form.paymentFrequency ?? ''}
                  onChange={(e) => set('paymentFrequency', e.target.value as Product['paymentFrequency'] || undefined)}
                >
                  <option value="">No especificado</option>
                  <option value="one-time">Pago único</option>
                  <option value="monthly">Mensual</option>
                  <option value="yearly">Anual</option>
                  <option value="per-service">Por cambio/servicio</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          {product && (
            <button
              onClick={() => { remove(catalogSlug, initialSectionName, product.id); onClose(); }}
              className="flex-1 rounded-xl border-2 border-red-200 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
            >
              🗑 Eliminar
            </button>
          )}
          <button onClick={onClose} className="flex-1 rounded-xl border-2 border-stone-200 py-2 text-sm font-bold text-stone-600">
            Cancelar
          </button>
          <button onClick={save} className="flex-1 rounded-xl bg-orange-600 py-2 text-sm font-bold text-white hover:bg-orange-700">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── CAMPO REUTILIZABLE ─────────────── */
function Field({
  label, value, onChange, type = 'text', textarea = false, step,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
  step?: string;
}) {
  const [local, setLocal] = useState(value);

  // Sync prop -> local if it changes from outside
  useEffect(() => {
    if (type !== 'number' || parseFloat(value) === parseFloat(local) || (value === '' && local === '')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (value !== local) setLocal(value);
    }
  }, [value, type, local]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLocal(e.target.value);
    onChange(e.target.value);
  };

  const cls = 'w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100';
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-500 mb-1">{label}</label>
      {textarea
        ? <textarea rows={3} className={cls} value={local} onChange={handleChange} />
        : <input type={type} step={step} className={cls} value={local} onChange={handleChange} />
      }
    </div>
  );
}

/* ───────────────────────── PÁGINA PRINCIPAL ───────────────── */
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<'info' | 'menu' | 'images'>('info');
  const [storageKB, setStorageKB] = useState(0);
  const [editingProduct, setEditingProduct] = useState<{ product?: Product; section: string } | null>(null);
  const [newSectionName, setNewSectionName] = useState('');

  // Datos estáticos base
  const baseCatalog = getCatalogs()[0];
  const slug = baseCatalog.slug;

  const overrides    = useAdmin((s) => s.overrides[slug]);
  const setField     = useAdmin((s) => s.setField);
  const setCover     = useAdmin((s) => s.setCoverImage);
  const setLogo      = useAdmin((s) => s.setLogoImage);
  const setSections  = useAdmin((s) => s.setSections);
  const addSection   = useAdmin((s) => s.addSection);
  const renameSection= useAdmin((s) => s.renameSection);
  const deleteSection = useAdmin((s) => s.deleteSection);
  const moveSection  = useAdmin((s) => s.moveSection);
  const moveProduct  = useAdmin((s) => s.moveProduct);
  const resetCatalog = useAdmin((s) => s.resetCatalog);

  // Secciones actuales (overrides o base)
  const sections = overrides?.sections ?? baseCatalog.sections;

  // Inicializar secciones en override si no existen aún
  useEffect(() => {
    if (!overrides?.sections) {
      setSections(slug, baseCatalog.sections.map((s) => ({ name: s.name, products: [...s.products] })));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualizar medidor de almacenamiento
  useEffect(() => {
    const update = () => setStorageKB(localStorageUsageKB());
    update();
    const id = setInterval(update, 3000);
    return () => clearInterval(id);
  }, []);

  // Texto helper de campo
  const val = (key: keyof typeof overrides, fallback: string | number) =>
    (overrides?.[key as keyof typeof overrides] as string | number | undefined) ?? fallback;

  // Zonas de envío (override o base)
  const zones = overrides?.deliveryZones ?? baseCatalog.deliveryZones ?? [];
  const saveZones = (next: NonNullable<Catalog['deliveryZones']>) => setField(slug, 'deliveryZones', next);
  const updateZone = (i: number, patch_: Partial<NonNullable<Catalog['deliveryZones']>[number]>) =>
    saveZones(zones.map((z, idx) => (idx === i ? { ...z, ...patch_ } : z)));
  const removeZone = (i: number) => saveZones(zones.filter((_, idx) => idx !== i));
  const addZone = () => saveZones([...zones, { name: '', fee: 0 }]);

  if (!authed) return <PinGate onOk={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-stone-100 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-stone-900 px-4 py-3 flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-white font-bold text-lg leading-none">⚙ Admin</h1>
          <p className="text-stone-400 text-xs mt-0.5">{baseCatalog.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-stone-400">Memoria usada</p>
            <p className="text-sm font-bold text-orange-400">{storageKB} KB</p>
          </div>
          <a href={`${BASE_PATH}/menu/del-sol`} target="_blank"
            className="rounded-xl bg-orange-600 px-3 py-2 text-xs font-bold text-white hover:bg-orange-700">
            Ver catálogo →
          </a>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 bg-white sticky top-[56px] z-20 shadow-sm">
        {(['info', 'menu', 'images'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${tab === t ? 'border-b-2 border-orange-600 text-orange-600' : 'text-stone-500 hover:text-stone-800'}`}
          >
            {t === 'info' ? '📋 Info' : t === 'menu' ? '🍽 Menú' : '🖼 Imágenes'}
          </button>
        ))}
      </div>

      <div className="max-w-xl mx-auto px-4 pt-5">

        {/* ────── TAB: INFO ────── */}
        {tab === 'info' && (
          <div className="space-y-4">
            <Card title="Información del negocio">
              <Field label="Nombre del negocio" value={val('name', baseCatalog.name) as string} onChange={(v) => setField(slug, 'name', v)} />
              <Field label="Slogan / tagline" value={val('tagline', baseCatalog.tagline) as string} onChange={(v) => setField(slug, 'tagline', v)} />
              <Field label="Descripción" value={val('description', baseCatalog.description) as string} onChange={(v) => setField(slug, 'description', v)} textarea />
              <Field label="Teléfono WhatsApp (con código de país, sin +)" value={val('phone', baseCatalog.phone) as string} onChange={(v) => setField(slug, 'phone', v)} />
              <Field label="Dirección" value={val('address', baseCatalog.address) as string} onChange={(v) => setField(slug, 'address', v)} />
              <Field label="Pedido mínimo ($)" type="number" value={String(val('minimumOrder', baseCatalog.minimumOrder))} onChange={(v) => setField(slug, 'minimumOrder', parseFloat(v) || 0)} />
            </Card>

            <Card title="Tiempos y pagos">
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Preparación aprox (min)"
                  type="number"
                  value={String(val('prepTimeMinutes', baseCatalog.prepTimeMinutes ?? 0))}
                  onChange={(v) => setField(slug, 'prepTimeMinutes', parseInt(v) || 0)}
                />
                <Field
                  label="Entrega aprox adicional (min)"
                  type="number"
                  value={String(val('deliveryTimeMinutes', baseCatalog.deliveryTimeMinutes ?? 0))}
                  onChange={(v) => setField(slug, 'deliveryTimeMinutes', parseInt(v) || 0)}
                />
              </div>
              <label className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-stone-200 px-4 py-3 cursor-pointer">
                <span className="text-sm font-semibold text-stone-700">🗓️ Permitir programar fecha/hora</span>
                <input
                  type="checkbox"
                  checked={Boolean(overrides?.scheduleOrders ?? baseCatalog.scheduleOrders)}
                  onChange={(e) => setField(slug, 'scheduleOrders', e.target.checked)}
                  className="h-5 w-5 accent-orange-600"
                />
              </label>
              <div className="mt-3">
                <Field
                  label="Métodos de pago (separados por coma, ej: Efectivo, Transferencia, Tarjeta)"
                  value={(overrides?.paymentMethods ?? baseCatalog.paymentMethods)?.join(', ') ?? ''}
                  onChange={(v) => setField(slug, 'paymentMethods', v.split(',').map((s) => s.trim()).filter(Boolean))}
                />
              </div>
            </Card>

            <Card title="Horario de atención">
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Abre (hora, 0-23)"
                  type="number"
                  value={String((overrides?.businessHours ?? baseCatalog.businessHours).open)}
                  onChange={(v) => setField(slug, 'businessHours', {
                    ...(overrides?.businessHours ?? baseCatalog.businessHours),
                    open: parseInt(v) || 0,
                  })}
                />
                <Field
                  label="Cierra (hora, 0-23)"
                  type="number"
                  value={String((overrides?.businessHours ?? baseCatalog.businessHours).close)}
                  onChange={(v) => setField(slug, 'businessHours', {
                    ...(overrides?.businessHours ?? baseCatalog.businessHours),
                    close: parseInt(v) || 0,
                  })}
                />
              </div>
              <p className="text-xs text-stone-400 mt-1">Días: todos los días por defecto. Personalizar días requiere editar el código.</p>
            </Card>

            <Card title="Envío a domicilio">
              <label className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 px-4 py-3 cursor-pointer">
                <span className="text-sm font-semibold text-stone-700">🏪 Permitir retiro en el local</span>
                <input
                  type="checkbox"
                  checked={Boolean(overrides?.allowPickup ?? baseCatalog.allowPickup)}
                  onChange={(e) => setField(slug, 'allowPickup', e.target.checked)}
                  className="h-5 w-5 accent-orange-600"
                />
              </label>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Field label="Latitud del local" type="number" value={String((overrides?.location ?? baseCatalog.location)?.lat ?? '')} onChange={(v) => setField(slug, 'location', { lat: parseFloat(v) || 0, lng: (overrides?.location ?? baseCatalog.location)?.lng ?? 0 })} />
                <Field label="Longitud del local" type="number" value={String((overrides?.location ?? baseCatalog.location)?.lng ?? '')} onChange={(v) => setField(slug, 'location', { lat: (overrides?.location ?? baseCatalog.location)?.lat ?? 0, lng: parseFloat(v) || 0 })} />
                <Field label="Precio de envío inicial ($)" type="number" step="0.01" value={String(val('deliveryBaseFee', baseCatalog.deliveryBaseFee ?? 0))} onChange={(v) => setField(slug, 'deliveryBaseFee', parseFloat(v) || 0)} />
                <Field label="Precio adicional por km ($)" type="number" step="0.01" value={String(val('deliveryRatePerKm', baseCatalog.deliveryRatePerKm ?? 0))} onChange={(v) => setField(slug, 'deliveryRatePerKm', parseFloat(v) || 0)} />
              </div>
              <div className="mt-3">
                <Field label="Radio máximo de entrega (km)" type="number" value={String(val('deliveryMaxKm', baseCatalog.deliveryMaxKm ?? 0))} onChange={(v) => setField(slug, 'deliveryMaxKm', parseFloat(v) || 0)} />
              </div>
              <p className="mt-2 text-xs text-stone-400">El total se calcula con tarifa base + distancia en línea recta por costo por km. El cliente puede buscar, mover el pin o ingresar coordenadas.</p>

              <div className="mt-4 border-t border-stone-100 pt-3">
                <p className="text-sm font-semibold text-stone-700 mb-2">🗺️ Envío por zona (opcional, sin mapa)</p>
                <p className="text-xs text-stone-400 mb-3">Alternativa manual: el cliente elige una zona y paga su tarifa fija, sin depender del mapa ni de Internet.</p>
                {zones.length === 0 && (
                  <p className="text-xs text-stone-500 mb-2">Sin zonas configuradas. Agrega una para ofrecer esta opción.</p>
                )}
                <div className="space-y-2">
                  {zones.map((z, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        value={z.name}
                        onChange={(e) => updateZone(i, { name: e.target.value })}
                        placeholder="Nombre de la zona"
                        className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
                      />
                      <input
                        type="number"
                        step="0.10"
                        value={String(z.fee)}
                        onChange={(e) => updateZone(i, { fee: parseFloat(e.target.value) || 0 })}
                        placeholder="Tarifa $"
                        className="w-24 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
                      />
                      <button
                        onClick={() => removeZone(i)}
                        className="shrink-0 rounded-lg border border-red-200 px-2 py-1.5 text-sm text-red-600 hover:bg-red-50"
                        aria-label="Eliminar zona"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addZone}
                  className="mt-2 rounded-lg border border-orange-300 px-3 py-1.5 text-sm font-semibold text-orange-600 hover:bg-orange-50"
                >
                  + Agregar zona
                </button>
              </div>
            </Card>

            <Card title="Zona de peligro">
              <button
                onClick={() => { if (confirm('¿Resetear todos los cambios al estado original?')) resetCatalog(slug); }}
                className="w-full rounded-xl border-2 border-red-200 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
              >
                🔄 Restaurar datos originales
              </button>
              <p className="text-xs text-stone-400 mt-1 text-center">Esto borra todos los cambios y fotos guardadas.</p>
            </Card>
          </div>
        )}

        {/* ────── TAB: MENÚ ────── */}
        {tab === 'menu' && (
          <div className="space-y-4">
            {sections.map((section) => (
              <Card
                key={section.name}
                title={section.name}
                action={
                  <div className="flex items-center gap-2">
                    <button onClick={() => moveSection(slug, section.name, 'up')} className="text-stone-400 hover:text-orange-500 font-bold px-1" title="Subir sección">↑</button>
                    <button onClick={() => moveSection(slug, section.name, 'down')} className="text-stone-400 hover:text-orange-500 font-bold px-1" title="Bajar sección">↓</button>
                    <div className="w-px h-4 bg-stone-200 mx-1"></div>
                    <button
                      onClick={() => { const nn = prompt('Nuevo nombre:', section.name); if (nn && nn.trim() && nn !== section.name) renameSection(slug, section.name, nn.trim()); }}
                      className="text-xs font-semibold text-blue-500 hover:text-blue-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => { if (confirm(`¿Eliminar sección "${section.name}"?`)) deleteSection(slug, section.name); }}
                      className="text-xs font-semibold text-red-500 hover:text-red-600"
                    >
                      Borrar
                    </button>
                  </div>
                }
              >
                <div className="space-y-2">
                  {section.products.map((product) => (
                    <div key={product.id} className="flex items-center gap-2">
                      <div className="flex flex-col gap-1">
                        <button onClick={() => moveProduct(slug, section.name, product.id, 'up')} className="text-stone-300 hover:text-orange-500 text-[10px] leading-none px-1">▲</button>
                        <button onClick={() => moveProduct(slug, section.name, product.id, 'down')} className="text-stone-300 hover:text-orange-500 text-[10px] leading-none px-1">▼</button>
                      </div>
                      <button
                        onClick={() => setEditingProduct({ product, section: section.name })}
                        className="flex-1 flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50 p-3 text-left hover:border-orange-200 transition-colors min-w-0"
                      >
                        {product.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={asset(product.image)} alt="" className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center text-xl flex-shrink-0">🍽</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-stone-900 truncate">{product.name}</p>
                          <p className="text-sm text-orange-600">${product.price.toFixed(2)}</p>
                        </div>
                        <span className="text-stone-400 text-xs">✏</span>
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setEditingProduct({ section: section.name })}
                  className="mt-3 w-full rounded-xl border-2 border-dashed border-orange-200 py-2 text-sm font-semibold text-orange-600 hover:border-orange-400 hover:bg-orange-50 transition-colors"
                >
                  + Agregar producto
                </button>
              </Card>
            ))}

            {/* Nueva sección */}
            <Card title="Agregar sección">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nombre de la sección"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && newSectionName.trim()) { addSection(slug, newSectionName.trim()); setNewSectionName(''); } }}
                  className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
                />
                <button
                  onClick={() => { if (newSectionName.trim()) { addSection(slug, newSectionName.trim()); setNewSectionName(''); } }}
                  className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700"
                >
                  Crear
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* ────── TAB: IMÁGENES ────── */}
        {tab === 'images' && (
          <div className="space-y-4">
            <Card title="Imagen de portada">
              <ImageUpload
                label="Foto principal del catálogo"
                current={asset(overrides?.coverImageData || baseCatalog.coverImage)}
                onUpload={(d) => setCover(slug, d)}
                maxPx={1200}
                aspectRatio={0.68}
              />
              <p className="text-xs text-stone-400 mt-2">Se verá como fondo en la primera página del catálogo. Usa una foto horizontal de alta calidad.</p>
            </Card>

            <Card title="Logo del negocio">
              <ImageUpload
                label="Logo (cuadrado, fondo transparente ideal)"
                current={asset(overrides?.logoImageData || baseCatalog.logoImage)}
                onUpload={(d) => setLogo(slug, d)}
                maxPx={400}
                aspectRatio={1}
              />
            </Card>

            <Card title="Uso de memoria del dispositivo">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-600">Usado en este dispositivo</span>
                  <span className="font-bold text-orange-600">{storageKB} KB</span>
                </div>
                <div className="h-3 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-orange-500 transition-all"
                    style={{ width: `${Math.min((storageKB / 5120) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-stone-400">
                  <span>0 KB</span>
                  <span>Límite aprox. 5 120 KB</span>
                </div>
                <p className="text-xs text-stone-400 bg-stone-50 rounded-xl p-3">
                  💡 Los datos se guardan en <strong>este dispositivo</strong>. Si abres el catálogo en otro celular, verá las fotos originales hasta que también subas las fotos desde ese dispositivo. Para compartir cambios a todos los dispositivos necesitarías un servidor.
                </p>
              </div>
            </Card>
          </div>
        )}

      </div>

      {/* Modal editor de producto */}
      {editingProduct && (
        <ProductEditor
          product={editingProduct.product}
          catalogSlug={slug}
          sectionName={editingProduct.section}
          sections={sections.map(s => s.name)}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}

/* ───────────────────────── CARD HELPER ────────────────────── */
function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-stone-800">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}
