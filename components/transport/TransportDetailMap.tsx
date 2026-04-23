'use client';

import { useEffect, useRef, useState } from 'react';
import Map, { Marker, Popup, Source, Layer, NavigationControl, MapRef } from 'react-map-gl/mapbox';
import { apiClient } from '@/lib/api';
import { MapPin, RefreshCw } from 'lucide-react';

interface TrackingInfo {
  status: string;
  driverLat: number | null;
  driverLng: number | null;
  driverName?: string;
  driverPhone?: string;
  lastUpdate: string | null;
  estimatedArrival: string | null;
}

interface Props {
  requestId: string;
  pickupLat: number | null;
  pickupLng: number | null;
  pickupAddress: string;
  deliveryLat: number | null;
  deliveryLng: number | null;
  deliveryAddress: string;
  status: string;
  driverId: string | null;
}

export default function TransportDetailMap({
  requestId,
  pickupLat,
  pickupLng,
  pickupAddress,
  deliveryLat,
  deliveryLng,
  deliveryAddress,
  status,
  driverId,
}: Props) {
  const mapRef = useRef<MapRef>(null);
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [popup, setPopup] = useState<'pickup' | 'delivery' | 'driver' | null>(null);

  const hasCoords = pickupLat && pickupLng && deliveryLat && deliveryLng;
  const hasDriver = !!(driverId && tracking?.driverLat && tracking?.driverLng);

  const TRACKING_STATUSES = ['heading_to_pickup', 'arrived_at_pickup', 'loading', 'in_transit', 'arrived_at_delivery', 'unloading'];
  const shouldTrack = driverId && TRACKING_STATUSES.includes(status);

  // Fetch tracking info
  const fetchTracking = async () => {
    if (!shouldTrack) return;
    try {
      const data = await apiClient.get<TrackingInfo>(`/transport/${requestId}/tracking`);
      setTracking(data);
    } catch { /* non-blocking */ }
  };

  useEffect(() => {
    fetchTracking();
    const interval = shouldTrack ? setInterval(fetchTracking, 10_000) : null;
    return () => { if (interval) clearInterval(interval); };
  }, [requestId, status, driverId]);

  // Fit bounds once coords are known
  useEffect(() => {
    if (!hasCoords || !mapRef.current) return;
    const lngs = [pickupLng!, deliveryLng!];
    const lats = [pickupLat!, deliveryLat!];
    if (tracking?.driverLng) lngs.push(tracking.driverLng);
    if (tracking?.driverLat) lats.push(tracking.driverLat);
    mapRef.current.fitBounds(
      [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
      { padding: 60, duration: 800 },
    );
  }, [tracking?.driverLat, tracking?.driverLng]);

  if (!hasCoords) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center text-gray-400">
          <MapPin className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Coordonnées GPS non disponibles</p>
        </div>
      </div>
    );
  }

  const isGoingToPickup = ['heading_to_pickup', 'arrived_at_pickup', 'loading'].includes(status);
  const destLng = isGoingToPickup ? pickupLng! : deliveryLng!;
  const destLat = isGoingToPickup ? pickupLat! : deliveryLat!;

  const routeGeoJson = {
    type: 'Feature' as const,
    geometry: {
      type: 'LineString' as const,
      coordinates: [[pickupLng!, pickupLat!], [deliveryLng!, deliveryLat!]],
    },
    properties: {},
  };

  const driverLineGeoJson = hasDriver
    ? {
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: [[tracking!.driverLng!, tracking!.driverLat!], [destLng, destLat]],
        },
        properties: {},
      }
    : null;

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-gray-200">
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        initialViewState={{
          longitude: (pickupLng! + deliveryLng!) / 2,
          latitude: (pickupLat! + deliveryLat!) / 2,
          zoom: 11,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onClick={() => setPopup(null)}
      >
        <NavigationControl position="bottom-right" />

        {/* Route line pickup → delivery */}
        <Source id="route" type="geojson" data={routeGeoJson}>
          <Layer
            id="route-line"
            type="line"
            paint={{ 'line-color': '#CBD5E1', 'line-width': 2, 'line-dasharray': [4, 4] }}
          />
        </Source>

        {/* Driver path → destination */}
        {driverLineGeoJson && (
          <Source id="driver-line" type="geojson" data={driverLineGeoJson}>
            <Layer
              id="driver-path"
              type="line"
              paint={{ 'line-color': '#00B8A9', 'line-width': 3, 'line-opacity': 0.9 }}
            />
          </Source>
        )}

        {/* Pickup marker */}
        <Marker longitude={pickupLng!} latitude={pickupLat!} anchor="center"
          onClick={e => { e.originalEvent.stopPropagation(); setPopup('pickup'); }}>
          <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white shadow-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
            <span className="text-white text-xs font-bold">P</span>
          </div>
        </Marker>

        {/* Delivery marker */}
        <Marker longitude={deliveryLng!} latitude={deliveryLat!} anchor="center"
          onClick={e => { e.originalEvent.stopPropagation(); setPopup('delivery'); }}>
          <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
            <span className="text-white text-xs font-bold">L</span>
          </div>
        </Marker>

        {/* Driver marker */}
        {hasDriver && (
          <Marker longitude={tracking!.driverLng!} latitude={tracking!.driverLat!} anchor="center"
            onClick={e => { e.originalEvent.stopPropagation(); setPopup('driver'); }}>
            <div className="w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform text-lg bg-teal-500">
              🚚
            </div>
          </Marker>
        )}

        {/* Popups */}
        {popup === 'pickup' && (
          <Popup longitude={pickupLng!} latitude={pickupLat!} anchor="bottom" onClose={() => setPopup(null)} closeOnClick={false}>
            <div className="text-sm p-1 min-w-[160px]">
              <p className="font-semibold text-green-700 mb-1">📍 Point de retrait</p>
              <p className="text-gray-700">{pickupAddress}</p>
            </div>
          </Popup>
        )}
        {popup === 'delivery' && (
          <Popup longitude={deliveryLng!} latitude={deliveryLat!} anchor="bottom" onClose={() => setPopup(null)} closeOnClick={false}>
            <div className="text-sm p-1 min-w-[160px]">
              <p className="font-semibold text-red-700 mb-1">🏠 Point de livraison</p>
              <p className="text-gray-700">{deliveryAddress}</p>
            </div>
          </Popup>
        )}
        {popup === 'driver' && hasDriver && (
          <Popup longitude={tracking!.driverLng!} latitude={tracking!.driverLat!} anchor="bottom" onClose={() => setPopup(null)} closeOnClick={false}>
            <div className="text-sm p-1 min-w-[180px]">
              <p className="font-semibold text-teal-700 mb-1">🚚 {tracking?.driverName ?? 'Chauffeur'}</p>
              {tracking?.driverPhone && <p className="text-gray-600">📞 {tracking.driverPhone}</p>}
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

      {/* GPS refresh indicator */}
      {shouldTrack && tracking?.lastUpdate && (
        <div className="absolute bottom-10 left-3 bg-white/90 backdrop-blur rounded-lg px-2.5 py-1.5 text-xs text-gray-600 shadow flex items-center gap-1.5 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          GPS {new Date(tracking.lastUpdate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      )}

      {/* No GPS yet */}
      {shouldTrack && !tracking?.driverLat && (
        <div className="absolute bottom-10 left-3 bg-white/90 backdrop-blur rounded-lg px-2.5 py-1.5 text-xs text-gray-500 shadow flex items-center gap-1.5 pointer-events-none">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Position GPS en attente...
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-lg px-3 py-2 text-xs shadow space-y-1 pointer-events-none">
        <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-[10px]">P</span> Retrait</div>
        <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-[10px]">L</span> Livraison</div>
        {driverId && <div className="flex items-center gap-2"><span className="text-sm">🚚</span> Chauffeur</div>}
      </div>
    </div>
  );
}
