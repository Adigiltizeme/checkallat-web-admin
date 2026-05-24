'use client';

import { useEffect, useRef, useState } from 'react';
import Map, { Marker, Popup, Source, Layer, NavigationControl, MapRef } from 'react-map-gl/mapbox';
import { apiClient } from '@/lib/api';
import { MapPin } from 'lucide-react';

interface ProTracking {
  proLat: number | null;
  proLng: number | null;
  proName?: string;
  proPhone?: string;
  lastUpdate: string | null;
}

interface Props {
  bookingId: string;
  addressLat: number | null;
  addressLng: number | null;
  address: string;
  status: string;
  proId: string | null;
}

const LIVE_STATUSES = ['en_route', 'arrived', 'in_progress'];

export default function BookingDetailMap({
  bookingId,
  addressLat,
  addressLng,
  address,
  status,
  proId,
}: Props) {
  const mapRef = useRef<MapRef>(null);
  const [tracking, setTracking] = useState<ProTracking | null>(null);
  const [popup, setPopup] = useState<'service' | 'pro' | null>(null);

  const hasCoords = !!(addressLat && addressLng);
  const shouldTrack = !!(proId && LIVE_STATUSES.includes(status));
  const hasPro = !!(tracking?.proLat && tracking?.proLng);

  const fetchTracking = async () => {
    if (!shouldTrack) return;
    try {
      const data: any = await apiClient.get(`/admin/bookings/${bookingId}/tracking`);
      const proUser = data.booking?.pro?.user;
      setTracking({
        proLat: data.proLocation?.lat ?? null,
        proLng: data.proLocation?.lng ?? null,
        proName: proUser ? `${proUser.firstName ?? ''} ${proUser.lastName ?? ''}`.trim() : undefined,
        proPhone: proUser?.phone ?? undefined,
        lastUpdate: data.proLocation?.lastUpdate ?? null,
      });
    } catch { /* non-blocking */ }
  };

  useEffect(() => {
    fetchTracking();
    const interval = shouldTrack ? setInterval(fetchTracking, 10_000) : null;
    return () => { if (interval) clearInterval(interval); };
  }, [bookingId, status, proId]);

  useEffect(() => {
    if (!hasCoords || !mapRef.current) return;
    const lngs = [addressLng!];
    const lats = [addressLat!];
    if (tracking?.proLng) lngs.push(tracking.proLng);
    if (tracking?.proLat) lats.push(tracking.proLat);
    if (lngs.length === 1) {
      mapRef.current.flyTo({ center: [addressLng!, addressLat!], zoom: 14, duration: 800 });
    } else {
      mapRef.current.fitBounds(
        [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
        { padding: 80, duration: 800 },
      );
    }
  }, [tracking?.proLat, tracking?.proLng]);

  if (!hasCoords) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center text-gray-400">
          <MapPin className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Coordonnées GPS non disponibles</p>
          <p className="text-xs mt-1">Adresse : {address || '—'}</p>
        </div>
      </div>
    );
  }

  const proLineGeoJson = hasPro
    ? {
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: [[tracking!.proLng!, tracking!.proLat!], [addressLng!, addressLat!]],
        },
        properties: {},
      }
    : null;

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-gray-200">
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        initialViewState={{ longitude: addressLng!, latitude: addressLat!, zoom: 14 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onClick={() => setPopup(null)}
      >
        <NavigationControl position="bottom-right" />

        {/* Line: pro → service address */}
        {proLineGeoJson && (
          <Source id="pro-line" type="geojson" data={proLineGeoJson}>
            <Layer
              id="pro-path"
              type="line"
              paint={{ 'line-color': '#10B981', 'line-width': 3, 'line-opacity': 0.9 }}
            />
          </Source>
        )}

        {/* Service address marker */}
        <Marker longitude={addressLng!} latitude={addressLat!} anchor="center"
          onClick={e => { e.originalEvent.stopPropagation(); setPopup('service'); }}>
          <div className="w-10 h-10 bg-emerald-500 rounded-full border-2 border-white shadow-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform text-lg">
            📍
          </div>
        </Marker>

        {/* Pro location marker */}
        {hasPro && (
          <Marker longitude={tracking!.proLng!} latitude={tracking!.proLat!} anchor="center"
            onClick={e => { e.originalEvent.stopPropagation(); setPopup('pro'); }}>
            <div className="w-10 h-10 bg-teal-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform text-lg">
              🔧
            </div>
          </Marker>
        )}

        {/* Popups */}
        {popup === 'service' && (
          <Popup longitude={addressLng!} latitude={addressLat!} anchor="bottom" onClose={() => setPopup(null)} closeOnClick={false}>
            <div className="text-sm p-1 min-w-[180px]">
              <p className="font-semibold text-emerald-700 mb-1">📍 Adresse d'intervention</p>
              <p className="text-gray-700">{address}</p>
            </div>
          </Popup>
        )}
        {popup === 'pro' && hasPro && (
          <Popup longitude={tracking!.proLng!} latitude={tracking!.proLat!} anchor="bottom" onClose={() => setPopup(null)} closeOnClick={false}>
            <div className="text-sm p-1 min-w-[180px]">
              <p className="font-semibold text-teal-700 mb-1">🔧 {tracking?.proName ?? 'Prestataire'}</p>
              {tracking?.proPhone && <p className="text-gray-600">📞 {tracking.proPhone}</p>}
              {tracking?.lastUpdate && (
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {new Date(tracking.lastUpdate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              )}
            </div>
          </Popup>
        )}
      </Map>

      {/* GPS live indicator */}
      {shouldTrack && hasPro && tracking?.lastUpdate && (
        <div className="absolute bottom-10 left-3 bg-white/90 backdrop-blur rounded-lg px-2.5 py-1.5 text-xs text-gray-600 shadow flex items-center gap-1.5 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          GPS {new Date(tracking.lastUpdate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      )}
      {shouldTrack && !hasPro && (
        <div className="absolute bottom-10 left-3 bg-white/90 backdrop-blur rounded-lg px-2.5 py-1.5 text-xs text-gray-500 shadow flex items-center gap-1.5 pointer-events-none">
          <span className="inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          Position GPS en attente...
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-lg px-3 py-2 text-xs shadow space-y-1 pointer-events-none">
        <div className="flex items-center gap-2"><span className="text-sm">📍</span> Adresse d'intervention</div>
        {proId && <div className="flex items-center gap-2"><span className="text-sm">🔧</span> Prestataire (live)</div>}
      </div>
    </div>
  );
}
