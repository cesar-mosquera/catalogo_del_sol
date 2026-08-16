'use client';

import { useEffect, useRef, useState } from 'react';
import { haversineKm, isValidLocation, quoteForDistance, type DeliveryLocation, type DeliveryParams } from '@/lib/delivery';
import 'leaflet/dist/leaflet.css';

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

// Precarga Leaflet a nivel de módulo: el CDN de imágenes es solo para la marca; el JS ya viene del bundle.
const leafletPromise = import('leaflet');

export function LocationPicker({ restaurantLocation, deliveryParams, onSelect, onClose, deliveryRadiusKm }: LocationPickerProps) {
  const mapRef    = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<{ map: L.Map; marker: L.Marker } | null>(null);
  const leafletMod  = useRef<typeof import('leaflet') | null>(null);
  // roRef removed - ResizeObserver is managed locally in the useEffect below
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
  const [mapReady, setMapReady] = useState(false);
  const [tilesFailed, setTilesFailed] = useState(false);

  useEffect(() => { basemapRef.current = basemap; }, [basemap]);

  const TILE_URLS = {
    street: 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    satellite: 'https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  } as const;
  const SATELLITE_LABELS = 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';

  // Token para descartar respuestas fuera de orden: la ruta/dirección de un
  // clic anterior no puede pisar la ubicación elegida más reciente (evita cobros erróneos).
  const pickSeq = useRef(0);

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
    // Si algún tile no carga (red lenta / proveedor caído), avisamos y ofrecemos reintentar
    tileRef.current.on('tileerror', () => setTilesFailed(true));
    tileRef.current.on('tileload', () => setTilesFailed(false));
    // Nombres de calles y sectores sobre la imagen satelital (vista híbrida realista)
    if (isSatellite) {
      labelRef.current = L.tileLayer(SATELLITE_LABELS, {
        attribution: '© Esri',
        maxZoom: 19,
      }).addTo(map);
    }
  };

  const retryTiles = () => {
    setTilesFailed(false);
    applyBasemap();
  };

  /* ── Ruta real por calles (OSRM, sin llave) ── */
  const fetchRoute = async (loc: LatLng) => {
    const from = restaurantLocation;
    const url =
      `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${loc.lng},${loc.lat}` +
      `?overview=full&steps=false&geometries=geojson&alternatives=true`;
    const seq = pickSeq.current;
    try {
      const res = await fetch(url);
      const data = await res.json();
      // Esta respuesta ya no corresponde a la ubicación elegida → se descarta
      if (seq !== pickSeq.current) return;
      const routes = data?.routes;
      if (!Array.isArray(routes) || routes.length === 0 || !Array.isArray(routes[0].geometry?.coordinates)) throw new Error('no-route');
      // El cobro se hace por la ruta MÁS LARGA posible (no la más corta ni en línea recta)
      const route = routes.reduce((acc: { distance: number }, r: { distance: number }) =>
        (r.distance > acc.distance ? r : acc), routes[0]);
      const coords: [number, number][] = route.geometry.coordinates.map((ll: number[]) => [ll[1], ll[0]]);
      setRouteKm(Number((route.distance / 1000).toFixed(2)));
      setRouteMin(Math.max(1, Math.round(route.duration / 60)));
      setRouteState('done');
      // Leemos los refs DESPUÉS del await para usar los valores actuales
      const L = leafletMod.current;
      const map = leafletRef.current?.map;
      if (L && map) {
        if (routeRef.current) routeRef.current.remove();
        routeRef.current = L.polyline(coords, {
          color: ROUTE_COLOR, weight: 5, opacity: 0.9, lineCap: 'round',
        }).addTo(map);
      }
    } catch {
      if (seq !== pickSeq.current) return;
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
    const seq = pickSeq.current;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${loc.lat}&lon=${loc.lng}&zoom=17&addressdetails=1&accept-language=es`
      );
      const data = await res.json();
      if (seq !== pickSeq.current) return;
      setAddress(data?.display_name || null);
    } catch {
      if (seq !== pickSeq.current) return;
      setAddress(null);
    }
  };

  const setLocation = (loc: LatLng, zoom = 16) => {
    pickSeq.current += 1;
    const straightDist = haversineKm(restaurantLocation, loc);
    setPicked(loc);
    setDistKm(straightDist);
    setRouteKm(null);
    setRouteMin(null);
    setRouteState('loading');
    setAddress(null);
    setLatitude(loc.lat.toFixed(6));
    setLongitude(loc.lng.toFixed(6));
    if (leafletRef.current) {
      // Hace visible el marcador del cliente al asignar ubicación vía GPS/búsqueda/coordenadas
      leafletRef.current.marker.setOpacity(1);
      leafletRef.current.marker.setLatLng([loc.lat, loc.lng]);
      leafletRef.current.map.setView([loc.lat, loc.lng], zoom);
    }
    applyStraight(loc);
    fetchRoute(loc);
    fetchAddress(loc);
  };

  // Costo de entrega según la ruta por calles (NUNCA la línea recta ni la ruta corta)
  // Si la ruta aún no llegó o falló, no se muestra ningún costo (evita cobrar $2 a 0 km)
  const deliveryQuote = (picked && deliveryParams && routeKm !== null) ? quoteForDistance(deliveryParams, routeKm) : null;
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

  /* ── Medición del contenedor: Leaflet solo se crea cuando hay tamaño real.
     El ResizeObserver reajusta el mapa en cada cambio de layout (panel, teclado,
     orientación) sin recrearlo. ── */
  const containerBoxRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  useEffect(() => {
    if (!mapRef.current) return;
    const measure = () => {
      const rect = mapRef.current?.getBoundingClientRect();
      if (!rect) return;
      const box = { w: rect.width, h: rect.height };
      containerBoxRef.current = box;
      // Si el mapa ya existe, simplemente recalcula su tamaño (evita distorsión)
      leafletRef.current?.map?.invalidateSize(false);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(mapRef.current);
    // Re-mide cuando el documento/ventana termina de renderizar
    window.addEventListener('resize', measure);
    document.readyState !== 'complete' && window.addEventListener('load', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('load', measure);
    };
  }, []);

  /* ── Carga Leaflet dinámicamente (solo en cliente, con tamaño real) ── */
  const setupMap = () => {
    // El CSS de Leaflet se importa de forma estática en el bundle (arriba), sin latencia de CDN.
    leafletPromise.then((L) => {
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
        attributionControl: true,
        fadeAnimation: true,
        zoomAnimation: true,
      });

      // NO llamamos applyBasemap() aquí porque leafletRef.current aún no está asignado.
      // Las capas del mapa inicial se añaden directamente con las variables locales (ver abajo).

      // Control de escala (km/m)
      L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

      // Botón "mi ubicación" sobre el mapa
      const locateBtn = new L.Control({ position: 'topright' });
      locateBtn.onAdd = () => {
        const btn = L.DomUtil.create('button', 'leaflet-bar cds-locate-btn');
        btn.innerHTML =
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>';
        btn.title = 'Usar mi ubicación actual';
        btn.style.cssText = 'width:34px;height:34px;display:grid;place-items:center;cursor:pointer;border:none;background:white;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.25);color:#16a34a;';
        btn.addEventListener('click', (e) => {
          L.DomEvent.stopPropagation(e);
          locateUser();
        });
        return btn;
      };
      locateBtn.addTo(map);

      // Marcador del restaurante (no movible)
      const restaurantIcon = L.divIcon({
        html: `
          <div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center">
            <span style="position:absolute;inset:0;border-radius:50%;background:rgba(234,88,12,0.35);animation:cds-ping 1.5s ease-out infinite"></span>
            <span style="width:16px;height:16px;border-radius:50%;background:#ea580c;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.45)"></span>
          </div>`,
        className: 'cds-marker-restaurant',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker([restaurantLocation.lat, restaurantLocation.lng], { icon: restaurantIcon, zIndexOffset: 100 })
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
        html: `
          <div style="position:relative;width:30px;height:30px">
            <svg viewBox="0 0 30 30" width="30" height="30" style="filter:drop-shadow(0 3px 6px rgba(22,163,74,0.5))">
              <path d="M15 1C8.4 1 3 6.4 3 13c0 8.7 9.3 15.2 11.5 16.4a.9.9 0 0 0 1 0C17.7 28.2 27 21.7 27 13 27 6.4 21.6 1 15 1Z" fill="#16a34a" stroke="#fff" stroke-width="2.5"/>
              <circle cx="15" cy="13" r="4.5" fill="#fff"/>
            </svg>
          </div>`,
        className: 'cds-marker-client',
        iconSize: [30, 30],
        iconAnchor: [15, 29],
      });
      // El marcador del cliente empieza oculto (sin posición), se muestra al primer clic/GPS/búsqueda
      const marker = L.marker([restaurantLocation.lat, restaurantLocation.lng], {
        icon: clientIcon,
        draggable: true,
        title: 'Tu ubicación — arrastra para mover',
        opacity: 0,
      }).addTo(map);

      const updatePicked = (latlng: L.LatLng) => {
        // Hace visible el marcador al primer uso
        marker.setOpacity(1);
        // Al elegir con clic/arrastre conservamos el zoom actual del usuario (solo centra), evita el "agrandón".
        setLocation({ lat: latlng.lat, lng: latlng.lng }, map.getZoom());
      };

      marker.on('dragend', () => updatePicked(marker.getLatLng()));
      map.on('click', (e) => { marker.setLatLng(e.latlng); updatePicked(e.latlng); });

      leafletRef.current = { map, marker };

      // Ahora sí: applyBasemap() puede leer leafletRef.current y leafletMod.current correctamente.
      // Esto garantiza que el mapa nunca quede vacío al abrirse por primera vez.
      applyBasemap();

      setMapReady(true);
    });
  };

  /* ── Disparo de setupMap: espera tamaño real del contenedor (sin recrear en resize) ── */
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;
    let created = false;
    const tryInit = () => {
      if (created || leafletRef.current) return;
      const box = containerBoxRef.current;
      if (box.w < 50 || box.h < 50) return;
      created = true;
      setupMap();
    };
    tryInit();

    // Reintenta mientras el contenedor no tenga tamaño medible; sin límite duro de 2s
    const started = Date.now();
    const id = window.setInterval(() => {
      tryInit();
      if (created || Date.now() - started > 10000) window.clearInterval(id);
    }, 80);
    return () => window.clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantLocation]);

  /* ── Limpieza al desmontar ── */
  useEffect(() => {
    return () => {
      leafletRef.current?.map.remove();
      leafletRef.current = null;
    };
  }, []);

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
    // Se prefiere confirmar con la ruta por calles calculada (la más larga). Si
    // OSRM falló, se confirma con la distancia en línea recta como respaldo.
    const fallbackKm = distKm;
    if (!picked || fallbackKm === null) return;
    if (routeKm !== null || routeState === 'error') onSelect(picked, routeKm ?? fallbackKm);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-stone-900 to-stone-800 px-4 py-3 text-white shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-600/20 text-lg">📍</span>
            <div>
              <h2 className="font-bold text-base leading-tight">Ubicación de entrega</h2>
              <p className="text-[11px] text-stone-400">Busca, usa GPS o mueve el pin verde</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex overflow-hidden rounded-lg bg-stone-700/60 p-0.5">
              <button
                onClick={() => setBasemap('street')}
                className={`rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${basemap === 'street' ? 'bg-orange-600 text-white shadow' : 'text-stone-300'}`}
              >
                Calles
              </button>
              <button
                onClick={() => setBasemap('satellite')}
                className={`rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${basemap === 'satellite' ? 'bg-orange-600 text-white shadow' : 'text-stone-300'}`}
              >
                Satélite
              </button>
            </div>
            <button onClick={onClose} aria-label="Cerrar" className="ml-1 grid h-8 w-8 place-items-center rounded-full bg-stone-700/60 text-stone-200 transition-colors hover:bg-stone-600">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <form onSubmit={searchAddress} className="flex gap-2 bg-white p-3">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Dirección, barrio o referencia"
              className="w-full rounded-xl border border-stone-300 bg-stone-50 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
          <button type="submit" disabled={searching} className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-stone-800 disabled:opacity-60">
            {searching ? 'Buscando…' : 'Buscar'}
          </button>
        </form>
        {/* Sugerencias de autocompletado */}
        {suggestions.length > 0 && (
          <ul className="absolute left-3 right-3 top-[calc(100%-6px)] z-40 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl">
            {suggestions.map((s, i) => (
              <li key={`${s.lat}-${s.lng}-${i}`}>
                <button
                  onClick={() => pickSuggestion(s)}
                  className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm hover:bg-orange-50"
                  type="button"
                >
                  <span className="mt-0.5 text-stone-400">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11Z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                  </span>
                  <span className="leading-snug text-stone-700">{s.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Mapa */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div ref={mapRef} className="absolute inset-0" />
        {/* Overlay de carga mientras Leaflet y las capas se montan */}
        {!mapReady && (
          <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center bg-stone-100">
            <div className="flex flex-col items-center gap-2 text-stone-500">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-stone-300 border-t-orange-600" />
              <p className="text-xs font-semibold">Cargando mapa…</p>
            </div>
          </div>
        )}
        {/* Aviso si el proveedor de imágenes del mapa no responde */}
        {tilesFailed && (
          <div className="absolute inset-x-0 top-0 z-[400] m-3 flex items-center justify-between gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 shadow">
            <span>⚠️ No se cargaron las imágenes del mapa. Puedes usar GPS o la búsqueda igualmente.</span>
            <button
              onClick={retryTiles}
              className="shrink-0 rounded-md bg-amber-500 px-2.5 py-1 font-bold text-white hover:bg-amber-600 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>

      {/* Panel inferior */}
      <div className="flex-shrink-0 space-y-3 border-t border-stone-200 bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] max-h-[58vh] overflow-y-auto">
        {/* Botón GPS */}
        <button
          onClick={locateUser}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
          {loading ? '⏳ Obteniendo ubicación…' : 'Usar mi ubicación actual (GPS)'}
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
            {routeState === 'loading' && (
              <div className="space-y-1.5">
                <p className="text-xs text-stone-500">🚗 Calculando la ruta por calles… (unos segundos)</p>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
                  <div className="h-full w-1/3 rounded-full bg-orange-500 animate-[shimmer_1.2s_ease-in-out_infinite]" />
                </div>
              </div>
            )}
            {routeState === 'error' && !outOfRange && (
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-red-600">No se pudo calcular la ruta por calles. Reintenta o confirma con distancia estimada.</p>
                <button
                  onClick={() => { if (picked) { setRouteState('loading'); setRouteKm(null); fetchRoute(picked); } }}
                  className="shrink-0 rounded-lg bg-red-100 px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-200 transition-colors"
                >
                  🔄 Reintentar
                </button>
              </div>
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
          disabled={!picked || outOfRange || (routeKm === null && routeState !== 'error')}
          className="w-full rounded-xl bg-orange-600 py-3.5 font-bold text-white shadow-lg shadow-orange-600/25 transition-all hover:bg-orange-700 active:scale-[0.99] disabled:bg-stone-300 disabled:shadow-none disabled:cursor-not-allowed"
        >
          {outOfRange
            ? 'Fuera del radio de entrega'
            : routeKm === null
              ? (picked
                  ? (routeState === 'error'
                      ? 'Confirmar igual (distancia estimada) ✓'
                      : '⏳ Calculando ruta… espera un momento')
                  : 'Selecciona un punto en el mapa o usa GPS')
              : 'Confirmar esta ubicación ✓'}
        </button>
      </div>
    </div>
  );
}