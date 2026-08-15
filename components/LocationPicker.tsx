'use client';

import { useEffect, useRef, useState } from 'react';
import { haversineKm, isValidLocation, quoteForDistance, type DeliveryLocation, type DeliveryParams } from '@/lib/delivery';

export type LatLng = DeliveryLocation;

interface LocationPickerProps {
  restaurantLocation: LatLng;
  // Parámetros de cobro del catálogo (para mostrar el costo de envío en vivo)
  deliveryParams?: DeliveryParams;
  onSelect: (loc: LatLng, distKm: number) => void;
  onClose: () => void;
  // Radio de la zona de entrega incluida en la tarifa base (en km). Dibuja el círculo en el mapa.
  deliveryRadiusKm?: number;
}

type Suggestion = { label: string; lat: number; lng: number };

const STRAIGHT_COLOR = '#f59e0b';
const ROUTE_COLOR = '#ea580c';

export function LocationPicker({ restaurantLocation, deliveryParams, onSelect, onClose, deliveryRadiusKm }: LocationPickerProps) {
  const mapRef    = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<{ map: L.Map; marker: L.Marker } | null>(null);
  const leafletMod  = useRef<typeof import('leaflet') | null>(null);
  const routeRef   = useRef<L.Polyline | null>(null);
  const straightRef = useRef<L.Polyline | null>(null);
  const circleRef  = useRef<L.Circle | null>(null);
  const tileRef    = useRef<L.TileLayer | null>(null);
  const labelRef   = useRef<L.TileLayer | null>(null);
  const [basemap, setBasemap] = useState<'street' | 'satellite'>('street');
  const basemapRef = useRef(basemap);
  const [picked, setPicked]   = useState<LatLng | null>(null);
  const [distKm, setDistKm]   = useState<number | null>(null);
  const [routeKm, setRouteKm] = useState<number | null>(null);
  const [routeMin, setRouteMin] = useState<number | null>(null);
  const [routeState, setRouteState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [address, setAddress]  = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [manualMode, setManualMode] = useState(false);

  useEffect(() => { basemapRef.current = basemap; }, [basemap]);

  const TILE_URLS = {
    street: 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    satellite: 'https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  } as const;
  const SATELLITE_LABELS = 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';

  const applyBasemap = () => {
    const L = leafletMod.current;
    const map = leafletRef.current?.map;
    if (!L || !map) return;
    if (tileRef.current) tileRef.current.remove();
    if (labelRef.current) labelRef.current.remove();
    const isSatellite = basemapRef.current === 'satellite';
    tileRef.current = L.tileLayer(isSatellite ? TILE_URLS.satellite : TILE_URLS.street, {
      attribution: isSatellite ? '© Esri, Maxar, Earthstar Geographics' : '© OpenStreetMap contributors © CARTO',
      maxZoom: 19,
    }).addTo(map);
    // Nombres de calles y sectores sobre la imagen satelital (vista híbrida realista)
    if (isSatellite) {
      labelRef.current = L.tileLayer(SATELLITE_LABELS, {
        attribution: '© Esri',
        maxZoom: 19,
      }).addTo(map);
    }
  };

  /* ── Ruta real por calles (OSRM, sin llave) ── */
  const fetchRoute = async (loc: LatLng) => {
    const from = restaurantLocation;
    const url =
      `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${loc.lng},${loc.lat}` +
      `?overview=full&steps=false&geometries=geojson&alternatives=true`;
    const L = leafletMod.current;
    const map = leafletRef.current?.map;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const routes = data?.routes;
      if (!Array.isArray(routes) || routes.length === 0 || !Array.isArray(routes[0].geometry?.coordinates)) throw new Error('no-route');
      // El cobro se hace por la ruta MÁS LARGA posible (no la más corta ni en línea recta)
      const route = routes.reduce((acc: { distance: number }, r: { distance: number }) =>
        (r.distance > acc.distance ? r : acc), routes[0]);
      const coords: [number, number][] = route.geometry.coordinates.map((ll: number[]) => [ll[1], ll[0]]);
      setRouteKm(Number((route.distance / 1000).toFixed(2)));
      setRouteMin(Math.max(1, Math.round(route.duration / 60)));
      setRouteState('done');
      if (L && map) {
        if (routeRef.current) routeRef.current.remove();
        routeRef.current = L.polyline(coords, {
          color: ROUTE_COLOR, weight: 5, opacity: 0.9, lineCap: 'round',
        }).addTo(map);
      }
    } catch {
      setRouteState('error');
      setRouteKm(null);
    }
  };

  // Línea recta de referencia (si la ruta real aún no carga o falla)
  const applyStraight = (loc: LatLng) => {
    const L = leafletMod.current;
    const map = leafletRef.current?.map;
    if (!L || !map) return;
    if (straightRef.current) straightRef.current.remove();
    straightRef.current = L.polyline([restaurantLocation, loc], {
      color: STRAIGHT_COLOR, weight: 2.5, dashArray: '6 6', opacity: 0.7,
    }).addTo(map);
  };

  /* ── Geolocalización inversa (dirección del punto) ── */
  const fetchAddress = async (loc: LatLng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${loc.lat}&lon=${loc.lng}&zoom=17&addressdetails=1&accept-language=es`
      );
      const data = await res.json();
      setAddress(data?.display_name || null);
    } catch {
      setAddress(null);
    }
  };

  const setLocation = (loc: LatLng, zoom = 16) => {
    const straightDist = haversineKm(restaurantLocation, loc);
    setPicked(loc);
    setDistKm(straightDist);
    setRouteKm(null);
    setRouteMin(null);
    setRouteState('idle');
    setAddress(null);
    setLatitude(loc.lat.toFixed(6));
    setLongitude(loc.lng.toFixed(6));
    if (leafletRef.current) {
      leafletRef.current.marker.setLatLng([loc.lat, loc.lng]);
      leafletRef.current.map.setView([loc.lat, loc.lng], zoom);
    }
    applyStraight(loc);
    fetchRoute(loc);
    fetchAddress(loc);
  };

  // Costo de entrega según la ruta por calles (NUNCA la línea recta ni la ruta corta)
  const bestKm = routeKm ?? 0;
  const deliveryQuote = (picked && deliveryParams && routeKm !== null) ? quoteForDistance(deliveryParams, bestKm) : null;
  const deliveryFee = deliveryQuote?.fee ?? null;
  const outOfRange = (deliveryQuote?.isAvailable ?? true) ? false : true;

  /* ── GPS automático ── */
  const locateUser = () => {
    if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost') {
      setGpsError('⚠️ El GPS del navegador requiere HTTPS. Para pruebas en red local, usa la barra de búsqueda arriba.');
      return;
    }
    setGpsError('');
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc, 17);
      },
      (err) => {
        setLoading(false);
        setGpsError(err.code === 1 ? 'Permiso denegado. Mueve el pin o usa el buscador.' : 'Señal débil. Usa el buscador arriba o mueve el pin.');
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
    );
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
      leafletMod.current = L;

      // Icono por defecto de Leaflet
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [restaurantLocation.lat, restaurantLocation.lng],
        zoom: 15,
        zoomControl: true,
      });

      applyBasemap();

      // Control de escala (km/m)
      L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

      // Botón "mi ubicación" sobre el mapa
      const locateBtn = new L.Control({ position: 'topright' });
      locateBtn.onAdd = () => {
        const btn = L.DomUtil.create('button', 'leaflet-bar');
        btn.innerHTML = '🎯';
        btn.title = 'Usar mi ubicación actual';
        btn.style.cssText = 'width:30px;height:30px;line-height:30px;font-size:15px;cursor:pointer;border:2px solid rgba(0,0,0,0.2);background:white;border-radius:4px;';
        btn.addEventListener('click', (e) => {
          L.DomEvent.stopPropagation(e);
          locateUser();
        });
        return btn;
      };
      locateBtn.addTo(map);

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

      // Zona gráfica de entrega (radio incluido en la tarifa base)
      if (deliveryRadiusKm && deliveryRadiusKm > 0) {
        circleRef.current = L.circle([restaurantLocation.lat, restaurantLocation.lng], {
          radius: deliveryRadiusKm * 1000,
          color: '#ea580c',
          weight: 1.5,
          dashArray: '6 6',
          fillColor: '#f97316',
          fillOpacity: 0.12,
          className: 'delivery-zone-circle',
        }).addTo(map);
      }

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

  /* ── Cambio de capa del mapa (Calles / Satélite) ── */
  useEffect(() => {
    applyBasemap();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basemap]);

  /* ── Autocompletado al escribir ── */
  useEffect(() => {
    const handler = setTimeout(() => {
      const q = search.trim();
      if (!q) { setSuggestions([]); return; }
      fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&accept-language=es&q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((results: Array<{ display_name: string; lat: string; lon: string }>) => {
          setSuggestions(
            results
              .filter((r) => r.display_name)
              .map((r) => ({ label: r.display_name, lat: Number(r.lat), lng: Number(r.lon) }))
          );
        })
        .catch(() => setSuggestions([]));
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

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
        setSuggestions([]);
        return;
      }
      setLocation(loc, 16);
      setSuggestions([]);
      setSearch('');
    } catch {
      setSearchError('No fue posible buscar la ubicación. Puedes mover el pin o ingresar coordenadas.');
    } finally {
      setSearching(false);
    }
  };

  const pickSuggestion = (s: Suggestion) => {
    setLocation({ lat: s.lat, lng: s.lng }, 16);
    setSearch(s.label);
    setSuggestions([]);
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
    // Solo se confirma con la ruta por calles calculada (la más larga), nunca en línea recta
    if (picked && routeKm !== null) onSelect(picked, routeKm);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between bg-stone-900 px-4 py-3 text-white flex-shrink-0">
        <div>
          <h2 className="font-bold text-base">Ubicación de entrega</h2>
          <p className="text-xs text-stone-400">Busca, usa GPS o mueve el pin verde</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setBasemap('street')}
            className={`rounded-lg px-2 py-1 text-xs font-bold ${basemap === 'street' ? 'bg-orange-600 text-white' : 'bg-stone-700 text-stone-300'}`}
          >
            Calles
          </button>
          <button
            onClick={() => setBasemap('satellite')}
            className={`rounded-lg px-2 py-1 text-xs font-bold ${basemap === 'satellite' ? 'bg-orange-600 text-white' : 'bg-stone-700 text-stone-300'}`}
          >
            Satélite
          </button>
          <button onClick={onClose} className="text-2xl leading-none ml-1">✕</button>
        </div>
      </div>

      <div className="relative">
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
        {/* Sugerencias de autocompletado */}
        {suggestions.length > 0 && (
          <ul className="absolute left-3 right-14 top-[calc(100%-2px)] z-40 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-xl">
            {suggestions.map((s, i) => (
              <li key={`${s.lat}-${s.lng}-${i}`}>
                <button
                  onClick={() => pickSuggestion(s)}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-orange-50"
                  type="button"
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Mapa */}
      <div ref={mapRef} className="flex-1" style={{ minHeight: 0 }} />

      {/* Panel inferior */}
      <div className="flex-shrink-0 bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] space-y-3 max-h-[58vh] overflow-y-auto">
        {/* Botón GPS */}
        <button
          onClick={locateUser}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? '⏳ Obteniendo ubicación…' : '🎯 Usar mi ubicación actual (GPS)'}
        </button>

        {gpsError && <p className="text-sm text-red-600 text-center">{gpsError}</p>}
        {searchError && <p className="text-sm text-red-600 text-center">{searchError}</p>}

        {/* Resumen en vivo del punto elegido */}
        {picked && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm space-y-2">
            {address && (
              <div className="flex items-start gap-2">
                <span>🏠</span>
                <span className="text-stone-600 leading-snug">{address}</span>
              </div>
            )}
            {routeState === 'loading' && <p className="text-xs text-stone-400">🚗 Calculando ruta por calles…</p>}
            {routeState === 'error' && !outOfRange && (
              <p className="text-xs text-red-600">No se pudo calcular la ruta por calles. Mueve el pin y reintenta.</p>
            )}
            {routeKm !== null && (
              <div className="flex justify-between">
                <span className="text-stone-600">🚗 Ruta por calles (para el cobro)</span>
                <span className="font-bold text-stone-900">{routeKm.toFixed(2)} km · ~{routeMin} min</span>
              </div>
            )}
            <div className="flex justify-between text-[11px] opacity-70">
              <span className="text-stone-500">📏 Línea recta (referencia)</span>
              <span className="text-stone-500">{distKm!.toFixed(2)} km</span>
            </div>

            {deliveryFee !== null && (
              <div className="flex justify-between border-t border-green-200 pt-2">
                <span className="text-stone-600">🛵 Costo de envío</span>
                <span className="font-bold text-green-700">${deliveryFee.toFixed(2)}</span>
              </div>
            )}
            {outOfRange && (
              <p className="text-xs font-semibold text-red-700">
                ⚠ Estás fuera del radio de entrega ({deliveryParams?.maxKm} km).
              </p>
            )}
            <p className="text-[11px] text-stone-400">
              Lat. {picked.lat.toFixed(5)} · Lng. {picked.lng.toFixed(5)}
            </p>
          </div>
        )}

        {deliveryRadiusKm && deliveryRadiusKm > 0 && !picked && !manualMode && (
          <p className="text-xs text-stone-500 text-center">
            El círculo naranja es la zona con tarifa base de entrega ({deliveryRadiusKm} km).
          </p>
        )}

        {/* Entrada manual de coordenadas (colapsable) */}
        <button
          onClick={() => setManualMode((v) => !v)}
          className="w-full text-sm font-semibold text-stone-700 underline underline-offset-2 text-center"
        >
          {manualMode ? 'Ocultar coordenadas manuales' : 'Ingresar coordenadas manualmente'}
        </button>
        {manualMode && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input value={latitude} onChange={(event) => setLatitude(event.target.value)} inputMode="decimal" placeholder="Latitud" className="min-w-0 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-500" />
              <input value={longitude} onChange={(event) => setLongitude(event.target.value)} inputMode="decimal" placeholder="Longitud" className="min-w-0 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-500" />
            </div>
            <button onClick={applyCoordinates} className="w-full text-sm font-semibold text-orange-600 underline underline-offset-2 text-center">Usar estas coordenadas</button>
          </div>
        )}

        <button
          onClick={confirm}
          disabled={!picked || outOfRange || routeKm === null}
          className="w-full rounded-xl bg-orange-600 py-3 font-bold text-white hover:bg-orange-700 disabled:bg-stone-300 disabled:cursor-not-allowed"
        >
          {outOfRange
            ? 'Fuera del radio de entrega'
            : routeKm === null
              ? (picked ? 'Calculando ruta por calles…' : 'Selecciona un punto en el mapa')
              : 'Confirmar esta ubicación ✓'}
        </button>
      </div>
    </div>
  );
}