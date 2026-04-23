'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Map, {
  Marker,
  Popup,
  Source,
  Layer,
  NavigationControl,
  MapRef,
} from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import {
  RefreshCw,
  PanelLeftOpen,
  PanelLeftClose,
  ExternalLink,
  MapPin,
  Truck,
  Phone,
  Clock,
  Navigation,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TransportRequest {
  id: string;
  status: string;
  transportTypes?: string[];
  pickupAddress: string;
  pickupLat: number | null;
  pickupLng: number | null;
  deliveryAddress: string;
  deliveryLat: number | null;
  deliveryLng: number | null;
  distance: number;
  totalPrice: number;
  scheduledDate: string;
  createdAt: string;
  driverId: string | null;
  paymentMethod?: string;
  client: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  driver?: {
    id: string;
    vehicleType: string;
    vehiclePlate: string;
    user: {
      firstName: string;
      lastName: string;
      phone: string;
    };
  };
}

interface TrackingInfo {
  status: string;
  driverLat: number | null;
  driverLng: number | null;
  driverName?: string;
  driverPhone?: string;
  lastUpdate: string | null;
  estimatedArrival: string | null;
}

interface SelectedMarker {
  request: TransportRequest;
  lng: number;
  lat: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; hex: string; bg: string; text: string; icon: string }> = {
  pending:              { label: 'En attente',       hex: '#EAB308', bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' },
  accepted:             { label: 'Accepté',           hex: '#3B82F6', bg: 'bg-blue-100',   text: 'text-blue-800',   icon: '✅' },
  heading_to_pickup:    { label: 'En route retrait',  hex: '#6366F1', bg: 'bg-indigo-100', text: 'text-indigo-800', icon: '🚚' },
  arrived_at_pickup:    { label: 'Arrivé retrait',    hex: '#8B5CF6', bg: 'bg-purple-100', text: 'text-purple-800', icon: '📍' },
  loading:              { label: 'Chargement',        hex: '#F97316', bg: 'bg-orange-100', text: 'text-orange-800', icon: '📦' },
  in_transit:           { label: 'En transit',        hex: '#06B6D4', bg: 'bg-cyan-100',   text: 'text-cyan-800',   icon: '🚛' },
  arrived_at_delivery:  { label: 'Arrivé livraison',  hex: '#7C3AED', bg: 'bg-violet-100', text: 'text-violet-800', icon: '🏠' },
  unloading:            { label: 'Déchargement',      hex: '#EC4899', bg: 'bg-pink-100',   text: 'text-pink-800',   icon: '📤' },
};

const ACTIVE_STATUSES = Object.keys(STATUS_CONFIG);
const TRACKING_STATUSES = ['heading_to_pickup', 'arrived_at_pickup', 'loading', 'in_transit', 'arrived_at_delivery', 'unloading'];

const INITIAL_VIEW_STATE = { longitude: 31.235, latitude: 30.045, zoom: 10 };

const VEHICLE_LABELS: Record<string, string> = {
  van: 'Fourgon',
  small_truck: 'Petit camion',
  large_truck: 'Grand camion',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const truncate = (str: string, max: number) =>
  str && str.length > max ? str.substring(0, max) + '…' : str;

const buildRouteGeoJson = (requests: TransportRequest[]) => ({
  type: 'FeatureCollection' as const,
  features: requests
    .filter(r => r.pickupLat && r.pickupLng && r.deliveryLat && r.deliveryLng)
    .map(r => ({
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          [r.pickupLng!, r.pickupLat!],
          [r.deliveryLng!, r.deliveryLat!],
        ],
      },
      properties: { id: r.id },
    })),
});

const buildDriverLineGeoJson = (
  requests: TransportRequest[],
  tracking: Record<string, TrackingInfo>,
) => ({
  type: 'FeatureCollection' as const,
  features: requests
    .filter(
      r =>
        r.driverId &&
        tracking[r.id]?.driverLat &&
        tracking[r.id]?.driverLng &&
        r.pickupLat &&
        r.deliveryLat,
    )
    .map(r => {
      const track = tracking[r.id];
      const toPickup = ['heading_to_pickup', 'arrived_at_pickup', 'loading'].includes(r.status);
      const destLng = toPickup ? r.pickupLng! : r.deliveryLng!;
      const destLat = toPickup ? r.pickupLat! : r.deliveryLat!;
      return {
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: [
            [track.driverLng!, track.driverLat!],
            [destLng, destLat],
          ],
        },
        properties: { hex: STATUS_CONFIG[r.status]?.hex ?? '#888888' },
      };
    }),
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function LiveMapClient() {
  const mapRef = useRef<MapRef>(null);

  const [requests, setRequests]       = useState<TransportRequest[]>([]);
  const [tracking, setTracking]       = useState<Record<string, TrackingInfo>>({});
  const [selected, setSelected]       = useState<SelectedMarker | null>(null);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [lastUpdate, setLastUpdate]   = useState<Date | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(ACTIVE_STATUSES));

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const all = await apiClient.get<TransportRequest[]>('/admin/transport-requests');
      const active = all.filter(r => ACTIVE_STATUSES.includes(r.status));
      setRequests(active);

      // Fetch live GPS only for requests with drivers in motion
      const needTracking = active.filter(r => r.driverId && TRACKING_STATUSES.includes(r.status));
      const results = await Promise.allSettled(
        needTracking.map(r =>
          apiClient.get<TrackingInfo>(`/transport/${r.id}/tracking`).then(t => ({ id: r.id, t })),
        ),
      );
      const trackMap: Record<string, TrackingInfo> = {};
      for (const result of results) {
        if (result.status === 'fulfilled') {
          trackMap[result.value.id] = result.value.t;
        }
      }
      setTracking(trackMap);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('LiveMap fetchData error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(false);
    const interval = setInterval(() => fetchData(true), 10_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── Map helpers ────────────────────────────────────────────────────────────

  const flyToRequest = (r: TransportRequest) => {
    const track = tracking[r.id];
    const lng = track?.driverLng ?? r.pickupLng;
    const lat = track?.driverLat ?? r.pickupLat;
    if (lng && lat && mapRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: 14, duration: 800 });
    }
  };

  const fitAllMarkers = () => {
    const coords = requests
      .filter(r => r.pickupLat && r.pickupLng)
      .flatMap(r => {
        const pts: [number, number][] = [[r.pickupLng!, r.pickupLat!], [r.deliveryLng!, r.deliveryLat!]];
        const t = tracking[r.id];
        if (t?.driverLng && t?.driverLat) pts.push([t.driverLng, t.driverLat]);
        return pts;
      });
    if (coords.length === 0 || !mapRef.current) return;
    const lngs = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);
    mapRef.current.fitBounds(
      [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
      { padding: 80, duration: 800 },
    );
  };

  const toggleFilter = (status: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  // ── Derived data ───────────────────────────────────────────────────────────

  const filtered = requests.filter(r => activeFilters.has(r.status));
  const inTransitCount = requests.filter(r => r.status === 'in_transit').length;
  const routeGeoJson = buildRouteGeoJson(filtered);
  const driverLineGeoJson = buildDriverLineGeoJson(filtered, tracking);

  // ─── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left Panel ──────────────────────────────────────────────────────── */}
      <div
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden flex-shrink-0 z-10`}
      >
        {/* Panel Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-900 text-white flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-lg">Suivi en temps réel</h2>
            <span className="text-xs bg-teal-500 text-white px-2 py-0.5 rounded-full font-semibold">
              {requests.length} actives
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {inTransitCount} en transit · Actualisation 10s
          </p>
        </div>

        {/* Status Filters */}
        <div className="p-3 border-b border-gray-100 flex-shrink-0">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Filtres statut</p>
          <div className="flex flex-wrap gap-1.5">
            {ACTIVE_STATUSES.map(s => {
              const cfg = STATUS_CONFIG[s];
              const on = activeFilters.has(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleFilter(s)}
                  className={`text-xs px-2 py-1 rounded-full border transition-all ${
                    on
                      ? `${cfg.bg} ${cfg.text} border-transparent font-semibold`
                      : 'bg-white text-gray-400 border-gray-200'
                  }`}
                >
                  {cfg.icon} {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Request List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
              <Truck className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm text-center">Aucune livraison active avec ces filtres</p>
            </div>
          ) : (
            filtered.map(r => {
              const cfg = STATUS_CONFIG[r.status];
              const track = tracking[r.id];
              const hasGps = !!(track?.driverLat && track?.driverLng);
              return (
                <div
                  key={r.id}
                  className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    flyToRequest(r);
                    setSelected({
                      request: r,
                      lng: track?.driverLng ?? r.pickupLng ?? 0,
                      lat: track?.driverLat ?? r.pickupLat ?? 0,
                    });
                  }}
                >
                  {/* Status + GPS indicator */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cfg?.bg} ${cfg?.text}`}>
                      {cfg?.icon} {cfg?.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {hasGps && (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          GPS
                        </span>
                      )}
                      <Link
                        href={`/transport-requests/${r.id}`}
                        className="text-teal-600 hover:text-teal-800"
                        onClick={e => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Client */}
                  <p className="text-sm font-semibold text-gray-900">
                    {r.client.firstName} {r.client.lastName}
                  </p>

                  {/* Driver */}
                  {r.driver && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Truck className="h-3 w-3" />
                      {r.driver.user.firstName} {r.driver.user.lastName} · {VEHICLE_LABELS[r.driver.vehicleType] ?? r.driver.vehicleType}
                    </p>
                  )}

                  {/* Route */}
                  <div className="mt-1.5 space-y-0.5">
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      {truncate(r.pickupAddress, 32)}
                    </p>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                      {truncate(r.deliveryAddress, 32)}
                    </p>
                  </div>

                  {/* Price + distance */}
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs font-semibold text-teal-700">
                      {Number(r.totalPrice).toLocaleString('fr-FR')} EGP
                    </span>
                    <span className="text-xs text-gray-400">{r.distance?.toFixed(1)} km</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Fit all button */}
        {filtered.length > 0 && (
          <div className="p-3 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={fitAllMarkers}
              className="w-full flex items-center justify-center gap-2 text-sm bg-teal-50 text-teal-700 hover:bg-teal-100 py-2 rounded-lg transition-colors font-medium"
            >
              <Navigation className="h-4 w-4" />
              Vue d'ensemble de la flotte
            </button>
          </div>
        )}
      </div>

      {/* ── Map Area ────────────────────────────────────────────────────────── */}
      <div className="relative flex-1 overflow-hidden">
        {/* Toggle Sidebar */}
        <button
          onClick={() => setSidebarOpen(v => !v)}
          className="absolute left-3 top-3 z-20 bg-white shadow-md rounded-lg p-2 hover:bg-gray-50 transition-colors"
          title={sidebarOpen ? 'Masquer le panneau' : 'Afficher le panneau'}
        >
          {sidebarOpen
            ? <PanelLeftClose className="h-5 w-5 text-gray-700" />
            : <PanelLeftOpen  className="h-5 w-5 text-gray-700" />
          }
        </button>

        {/* Top Stats Bar */}
        <div className="absolute top-3 left-14 right-3 z-20 bg-white/95 backdrop-blur-sm rounded-xl shadow-md px-4 py-2.5 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
            <Truck className="h-4 w-4 text-teal-600" />
            <span>{requests.length} livraisons actives</span>
          </div>
          <div className="h-4 w-px bg-gray-200" />
          {ACTIVE_STATUSES.slice(2, 7).map(s => {
            const count = requests.filter(r => r.status === s).length;
            if (!count) return null;
            const cfg = STATUS_CONFIG[s];
            return (
              <span key={s} className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cfg.bg} ${cfg.text}`}>
                {cfg.icon} {count}
              </span>
            );
          })}
          <div className="ml-auto flex items-center gap-3">
            {lastUpdate && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
            <button
              onClick={() => fetchData(false)}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Mapbox Map */}
        <Map
          ref={mapRef}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          initialViewState={INITIAL_VIEW_STATE}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          onClick={() => setSelected(null)}
        >
          <NavigationControl position="bottom-right" />

          {/* ── Route lines (pickup → delivery, dashed gray) */}
          <Source id="routes" type="geojson" data={routeGeoJson}>
            <Layer
              id="route-lines"
              type="line"
              paint={{
                'line-color': '#CBD5E1',
                'line-width': 2,
                'line-dasharray': [4, 4],
                'line-opacity': 0.8,
              }}
            />
          </Source>

          {/* ── Driver path lines (driver → destination, colored) */}
          <Source id="driver-lines" type="geojson" data={driverLineGeoJson}>
            <Layer
              id="driver-path-lines"
              type="line"
              paint={{
                'line-color': ['get', 'hex'],
                'line-width': 3,
                'line-opacity': 0.9,
              }}
            />
          </Source>

          {/* ── Pickup markers (green P) */}
          {filtered
            .filter(r => r.pickupLat && r.pickupLng)
            .map(r => (
              <Marker
                key={`pickup-${r.id}`}
                longitude={r.pickupLng!}
                latitude={r.pickupLat!}
                anchor="center"
                onClick={e => {
                  e.originalEvent.stopPropagation();
                  setSelected({ request: r, lng: r.pickupLng!, lat: r.pickupLat! });
                }}
              >
                <div className="w-7 h-7 bg-green-500 rounded-full border-2 border-white shadow-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <span className="text-white text-xs font-bold">P</span>
                </div>
              </Marker>
            ))}

          {/* ── Delivery markers (red L) */}
          {filtered
            .filter(r => r.deliveryLat && r.deliveryLng)
            .map(r => (
              <Marker
                key={`delivery-${r.id}`}
                longitude={r.deliveryLng!}
                latitude={r.deliveryLat!}
                anchor="center"
                onClick={e => {
                  e.originalEvent.stopPropagation();
                  setSelected({ request: r, lng: r.deliveryLng!, lat: r.deliveryLat! });
                }}
              >
                <div className="w-7 h-7 bg-red-500 rounded-full border-2 border-white shadow-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <span className="text-white text-xs font-bold">L</span>
                </div>
              </Marker>
            ))}

          {/* ── Driver markers (truck, status-colored) */}
          {filtered
            .filter(r => r.driverId && tracking[r.id]?.driverLat && tracking[r.id]?.driverLng)
            .map(r => {
              const track = tracking[r.id];
              const hex = STATUS_CONFIG[r.status]?.hex ?? '#888';
              return (
                <Marker
                  key={`driver-${r.id}`}
                  longitude={track.driverLng!}
                  latitude={track.driverLat!}
                  anchor="center"
                  onClick={e => {
                    e.originalEvent.stopPropagation();
                    setSelected({ request: r, lng: track.driverLng!, lat: track.driverLat! });
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full border-3 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform text-lg"
                    style={{ backgroundColor: hex, borderWidth: 3, borderColor: 'white' }}
                  >
                    🚚
                  </div>
                </Marker>
              );
            })}

          {/* ── Popup */}
          {selected && (
            <Popup
              longitude={selected.lng}
              latitude={selected.lat}
              anchor="bottom"
              onClose={() => setSelected(null)}
              maxWidth="300px"
              closeOnClick={false}
            >
              <PopupContent
                request={selected.request}
                tracking={tracking[selected.request.id]}
              />
            </Popup>
          )}
        </Map>

        {/* Empty state overlay */}
        {requests.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl px-8 py-6 text-center max-w-xs">
              <Truck className="h-14 w-14 mx-auto text-gray-300 mb-3" />
              <h3 className="font-bold text-gray-700 text-lg mb-1">Aucune livraison active</h3>
              <p className="text-sm text-gray-500">Les livraisons en cours apparaîtront ici automatiquement.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Popup Content ─────────────────────────────────────────────────────────

function PopupContent({
  request: r,
  tracking: track,
}: {
  request: TransportRequest;
  tracking: TrackingInfo | undefined;
}) {
  const cfg = STATUS_CONFIG[r.status];
  const hasGps = !!(track?.driverLat && track?.driverLng);

  return (
    <div className="text-sm min-w-[260px]">
      {/* Status */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-t-lg mb-2 ${cfg?.bg} ${cfg?.text}`}>
        <span className="text-base">{cfg?.icon}</span>
        <span className="font-bold">{cfg?.label}</span>
        {hasGps && (
          <span className="ml-auto flex items-center gap-1 text-xs">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            GPS actif
          </span>
        )}
      </div>

      <div className="px-1 space-y-2">
        {/* Client */}
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase">Client</p>
          <p className="font-semibold text-gray-800">{r.client.firstName} {r.client.lastName}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Phone className="h-3 w-3" /> {r.client.phone}
          </p>
        </div>

        {/* Driver */}
        {r.driver && (
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Chauffeur</p>
            <p className="font-semibold text-gray-800">
              {r.driver.user.firstName} {r.driver.user.lastName}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Phone className="h-3 w-3" /> {r.driver.user.phone}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Truck className="h-3 w-3" />
              {VEHICLE_LABELS[r.driver.vehicleType] ?? r.driver.vehicleType} · {r.driver.vehiclePlate}
            </p>
          </div>
        )}

        {/* Route */}
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase">Itinéraire</p>
          <div className="space-y-1 mt-1">
            <div className="flex items-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-700">{r.pickupAddress}</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-700">{r.deliveryAddress}</p>
            </div>
          </div>
        </div>

        {/* GPS update */}
        {track?.lastUpdate && (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Pos. mise à jour : {new Date(track.lastUpdate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}

        {/* Price + distance */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
          <span className="font-bold text-teal-700">{Number(r.totalPrice).toLocaleString('fr-FR')} EGP</span>
          <span className="text-xs text-gray-400">{r.distance?.toFixed(1)} km</span>
        </div>

        {/* Detail link */}
        <Link
          href={`/transport-requests/${r.id}`}
          className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white text-xs py-2 rounded-lg hover:bg-gray-800 transition-colors mt-1"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Voir les détails complets
        </Link>
      </div>
    </div>
  );
}
