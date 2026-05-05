'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Navigation, Truck, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:          { label: 'En attente de chauffeur', color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={16} /> },
  accepted:         { label: 'Chauffeur assigné',        color: 'bg-blue-100 text-blue-800',    icon: <Truck size={16} /> },
  heading_to_pickup:{ label: 'Chauffeur en route',       color: 'bg-indigo-100 text-indigo-800',icon: <Navigation size={16} /> },
  arrived_at_pickup:{ label: 'Chauffeur arrivé',         color: 'bg-purple-100 text-purple-800',icon: <MapPin size={16} /> },
  in_transit:       { label: 'En transit',               color: 'bg-teal-100 text-teal-800',    icon: <Truck size={16} /> },
  completed:        { label: 'Livraison effectuée',      color: 'bg-green-100 text-green-800',  icon: <CheckCircle size={16} /> },
  cancelled:        { label: 'Annulée',                  color: 'bg-red-100 text-red-800',      icon: <XCircle size={16} /> },
};

interface TrackingData {
  status: string;
  estimatedArrival: string | null;
  isImmediate: boolean;
  pickupAddress: string;
  deliveryAddress: string;
  driverLat: number | null;
  driverLng: number | null;
  lastUpdate: string | null;
  driverName: string | null;
  vehicleType: string | null;
  vehiclePlate: string | null;
}

// --- Leaflet map component (no iframe) ---
function DriverMap({ lat, lng }: { lat: number; lng: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const loadLeaflet = async () => {
      // Inject CSS once
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load JS if not already loaded
      if (!(window as any).L) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => resolve();
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const L = (window as any).L;

      if (mapRef.current) {
        // Map already exists — just move the marker
        markerRef.current?.setLatLng([lat, lng]);
        mapRef.current.setView([lat, lng], mapRef.current.getZoom());
        return;
      }

      // Fix default icon paths broken by webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false }).setView([lat, lng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup('🚛 Position du chauffeur').openPopup();

      mapRef.current = map;
      markerRef.current = marker;
    };

    loadLeaflet().catch(console.error);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // Only re-run if lat/lng change meaningfully
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  return <div ref={containerRef} style={{ height: 260, width: '100%' }} />;
}

// --- Main page ---
export default function PublicTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<TrackingData | null>(null);
  const [error, setError] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const res = await window.fetch(`${API_URL.replace('/api/v1', '')}/api/v1/transport/${id}/public-tracking`);
      if (!res.ok) throw new Error();
      setData(await res.json());
      setLastRefresh(new Date());
      setError(false);
    } catch {
      setError(true);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 10000);
    return () => clearInterval(timer);
  }, [fetchData]);

  const statusInfo = data ? (STATUS_LABELS[data.status] ?? { label: data.status, color: 'bg-gray-100 text-gray-800', icon: null }) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm">C</div>
          <span className="font-bold text-gray-800">CheckAll@t — Suivi en direct</span>
        </div>
        <button onClick={fetchData} className="text-gray-400 hover:text-teal-500 transition-colors" title="Actualiser">
          <RefreshCw size={18} />
        </button>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center text-red-700 text-sm">
            Impossible de charger le suivi. Vérifiez l'URL ou réessayez.
          </div>
        )}

        {!data && !error && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <div className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Chargement du suivi...</span>
          </div>
        )}

        {data && (
          <>
            {/* Statut */}
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm ${statusInfo?.color}`}>
              {statusInfo?.icon}
              {statusInfo?.label}
            </div>

            {/* Chauffeur */}
            {data.driverName && (
              <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-lg">
                  {data.driverName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{data.driverName}</p>
                  {data.vehicleType && (
                    <p className="text-sm text-gray-500">
                      🚛 {data.vehicleType}
                      {data.vehiclePlate ? ` · ${data.vehiclePlate}` : ''}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Itinéraire */}
            <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-3">
              <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400">Itinéraire</h2>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Chargement</p>
                  <p className="text-sm text-gray-700">{data.pickupAddress}</p>
                </div>
              </div>
              <div className="ml-1.5 w-px h-4 bg-gray-200" />
              <div className="flex items-start gap-3">
                <div className="mt-1 w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Livraison</p>
                  <p className="text-sm text-gray-700">{data.deliveryAddress}</p>
                </div>
              </div>
            </div>

            {/* Heure estimée */}
            {data.estimatedArrival && !data.isImmediate && (
              <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
                <Clock size={20} className="text-teal-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Date prévue</p>
                  <p className="text-sm text-gray-700">
                    {new Date(data.estimatedArrival).toLocaleDateString('fr-FR', {
                      weekday: 'long', day: 'numeric', month: 'long',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Position GPS */}
            {data.driverLat && data.driverLng ? (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 pt-3 pb-2 flex items-center gap-2">
                  <Navigation size={16} className="text-teal-500" />
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Position du chauffeur</span>
                </div>
                <DriverMap lat={data.driverLat} lng={data.driverLng} />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-500">
                Position GPS non disponible pour le moment
              </div>
            )}

            {/* Dernière mise à jour */}
            <p className="text-center text-xs text-gray-400">
              Mis à jour à {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · Actualisation automatique toutes les 10s
            </p>
          </>
        )}
      </main>
    </div>
  );
}
