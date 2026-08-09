'use client';

import { useEffect, useRef, useState } from 'react';
import { haversineKm, isValidLocation, type DeliveryLocation } from '@/lib/delivery';

export type LatLng = DeliveryLocation;

interface LocationPickerProps {
  restaurantLocation: LatLng;
  onSelect: (loc: LatLng, distKm: number) => void;
  onClose: () => void;
}

export function LocationPicker({ restaurantLocation, onSelect, onClose }: LocationPickerProps) {
  const mapRef    = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<{ map: L.Map; marker: L.Marker } | null>(null);
  const [picked, setPicked]   = useState<LatLng | null>(null);
  const [distKm, setDistKm]   = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const setLocation = (loc: LatLng, zoom = 16) => {
    const dist = haversineKm(restaurantLocation, loc);
    setPicked(loc);
    setDistKm(dist);
    setLatitude(loc.lat.toFixed(6));
    setLongitude(loc.lng.toFixed(6));
    if (leafletRef.current) {
      leafletRef.current.marker.setLatLng([loc.lat, loc.lng]);
      leafletRef.current.map.setView([loc.lat, loc.lng], zoom);
    }
  };

  /* ── Carga Leaflet dinámicamente (solo en cliente) ── */
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    // Carga CSS de Leaflet
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id  = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    import('leaflet').then((L) => {
      if (!mapRef.current || leafletRef.current) return;

      // Icono por defecto de Leaflet
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [restaurantLocation.lat, restaurantLocation.lng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Marcador del restaurante (no movible)
      const restaurantIcon = L.divIcon({
        html: '<div style="background:#ea580c;border:3px solid white;border-radius:50%;width:20px;height:20px;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>',
        className: '',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker([restaurantLocation.lat, restaurantLocation.lng], { icon: restaurantIcon })
        .addTo(map)
        .bindPopup('📍 Restaurante')
        .openPopup();

      // Marcador del cliente (movible)
      const clientIcon = L.divIcon({
        html: '<div style="background:#16a34a;border:3px solid white;border-radius:50% 50% 50% 0;width:24px;height:24px;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>',
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      });
      const marker = L.marker([restaurantLocation.lat, restaurantLocation.lng], {
        icon: clientIcon,
        draggable: true,
        title: 'Tu ubicación — arrastra para mover',
      }).addTo(map);

      const updatePicked = (latlng: L.LatLng) => setLocation({ lat: latlng.lat, lng: latlng.lng });

      marker.on('dragend', () => updatePicked(marker.getLatLng()));
      map.on('click', (e) => { marker.setLatLng(e.latlng); updatePicked(e.latlng); });

      leafletRef.current = { map, marker };
    });

    return () => {
      leafletRef.current?.map.remove();
      leafletRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantLocation]);

  /* ── GPS automático ── */
  const useGPS = () => {
    setGpsError('');
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc, 16);
      },
      (err) => {
        setLoading(false);
        setGpsError(err.code === 1 ? 'Permiso denegado. Mueve el pin manualmente.' : 'No se pudo obtener ubicación.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const searchAddress = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!search.trim()) return;

    setSearching(true);
    setSearchError('');
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(search)}`);
      const results: Array<{ lat: string; lon: string }> = await response.json();
      const result = results[0];
      const loc = result ? { lat: Number(result.lat), lng: Number(result.lon) } : null;
      if (!loc || !isValidLocation(loc)) {
        setSearchError('No encontramos esa ubicación. Prueba con una dirección más completa.');
        return;
      }
      setLocation(loc, 16);
    } catch {
      setSearchError('No fue posible buscar la ubicación. Puedes mover el pin o ingresar coordenadas.');
    } finally {
      setSearching(false);
    }
  };

  const applyCoordinates = () => {
    const loc = { lat: Number(latitude), lng: Number(longitude) };
    if (!isValidLocation(loc)) {
      setSearchError('Ingresa coordenadas válidas: latitud entre -90 y 90, longitud entre -180 y 180.');
      return;
    }
    setSearchError('');
    setLocation(loc, 16);
  };

  const confirm = () => {
    if (picked && distKm !== null) onSelect(picked, distKm);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between bg-stone-900 px-4 py-3 text-white flex-shrink-0">
        <div>
          <h2 className="font-bold text-base">Ubicación de entrega</h2>
          <p className="text-xs text-stone-400">Busca, usa GPS o mueve el pin verde</p>
        </div>
        <button onClick={onClose} className="text-2xl leading-none">✕</button>
      </div>

      <form onSubmit={searchAddress} className="flex gap-2 border-b border-stone-200 bg-white p-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Dirección, barrio o referencia"
          className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
        />
        <button type="submit" disabled={searching} className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-bold text-white disabled:opacity-60">
          {searching ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {/* Mapa */}
      <div ref={mapRef} className="flex-1" style={{ minHeight: 0 }} />

      {/* Panel inferior */}
      <div className="flex-shrink-0 bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] space-y-3">
        {/* Botón GPS */}
        <button
          onClick={useGPS}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? '⏳ Obteniendo ubicación…' : '🎯 Usar mi ubicación actual (GPS)'}
        </button>

        {gpsError && <p className="text-sm text-red-600 text-center">{gpsError}</p>}
        {searchError && <p className="text-sm text-red-600 text-center">{searchError}</p>}

        <div className="grid grid-cols-2 gap-2">
          <input value={latitude} onChange={(event) => setLatitude(event.target.value)} inputMode="decimal" placeholder="Latitud" className="min-w-0 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-500" />
          <input value={longitude} onChange={(event) => setLongitude(event.target.value)} inputMode="decimal" placeholder="Longitud" className="min-w-0 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-500" />
        </div>
        <button onClick={applyCoordinates} className="w-full text-sm font-semibold text-stone-700 underline underline-offset-2">Usar estas coordenadas</button>

        {/* Distancia y costo */}
        {picked && distKm !== null && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-600">📏 Distancia al local</span>
              <span className="font-bold text-stone-900">{distKm.toFixed(2)} km</span>
            </div>
            <p className="mt-1 text-xs text-stone-500">
              Lat. {picked.lat.toFixed(5)} · Lng. {picked.lng.toFixed(5)}
            </p>
          </div>
        )}

        <button
          onClick={confirm}
          disabled={!picked}
          className="w-full rounded-xl bg-orange-600 py-3 font-bold text-white hover:bg-orange-700 disabled:bg-stone-300 disabled:cursor-not-allowed"
        >
          {picked ? 'Confirmar esta ubicación ✓' : 'Selecciona un punto en el mapa'}
        </button>
      </div>
    </div>
  );
}
