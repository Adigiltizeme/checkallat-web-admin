'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import { MapPin, User, Clock, CheckCircle, XCircle, RefreshCw, Wrench } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:     { label: 'En attente d\'un prestataire', color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={16} /> },
  accepted:    { label: 'Prestataire assigné',          color: 'bg-blue-100 text-blue-800',    icon: <User size={16} /> },
  en_route:    { label: 'Prestataire en route',         color: 'bg-indigo-100 text-indigo-800',icon: <MapPin size={16} /> },
  arrived:     { label: 'Prestataire arrivé',           color: 'bg-purple-100 text-purple-800',icon: <MapPin size={16} /> },
  in_progress: { label: 'Prestation en cours',          color: 'bg-teal-100 text-teal-800',    icon: <Wrench size={16} /> },
  completed:   { label: 'Prestation terminée',          color: 'bg-green-100 text-green-800',  icon: <CheckCircle size={16} /> },
  cancelled:   { label: 'Annulée',                      color: 'bg-red-100 text-red-800',      icon: <XCircle size={16} /> },
};

const MILESTONES = [
  { key: 'pending',     label: 'Demande créée' },
  { key: 'accepted',    label: 'Prestataire assigné' },
  { key: 'en_route',   label: 'En route' },
  { key: 'arrived',    label: 'Arrivé sur place' },
  { key: 'in_progress',label: 'Prestation en cours' },
  { key: 'completed',  label: 'Terminée' },
];

const STATUS_ORDER = ['pending', 'accepted', 'en_route', 'arrived', 'in_progress', 'completed'];

interface TrackingData {
  status: string;
  categoryNameFr: string | null;
  categoryNameEn: string | null;
  address: string | null;
  addressLat: number | null;
  addressLng: number | null;
  proName: string | null;
  scheduledAt: string | null;
}

export default function BookingTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<TrackingData | null>(null);
  const [error, setError] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const res = await window.fetch(`${API_URL.replace('/api/v1', '')}/api/v1/bookings/${id}/public-tracking`);
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

  const statusInfo = data
    ? (STATUS_LABELS[data.status] ?? { label: data.status, color: 'bg-gray-100 text-gray-800', icon: null })
    : null;

  const currentIdx = data ? STATUS_ORDER.indexOf(data.status) : -1;
  const hasMap = data && data.addressLat && data.addressLng;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm">C</div>
          <div>
            <span className="font-bold text-gray-800">CheckAll@t — Suivi en direct</span>
            {data?.categoryNameFr && (
              <span className="ml-2 text-sm text-gray-500">{data.categoryNameFr}</span>
            )}
          </div>
        </div>
        <button onClick={fetchData} className="text-gray-400 hover:text-teal-500 transition-colors" title="Actualiser">
          <RefreshCw size={18} />
        </button>
      </header>

      {/* Map — address pin */}
      {hasMap && (
        <div className="w-full flex-shrink-0" style={{ height: 260 }}>
          <Map
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            initialViewState={{ longitude: data!.addressLng!, latitude: data!.addressLat!, zoom: 14 }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            scrollZoom={true}
          >
            <NavigationControl position="bottom-right" />
            <Marker longitude={data!.addressLng!} latitude={data!.addressLat!} anchor="center">
              <div className="w-10 h-10 rounded-full bg-teal-500 border-2 border-white shadow-lg flex items-center justify-center text-lg">
                📍
              </div>
            </Marker>
          </Map>
        </div>
      )}

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 flex flex-col gap-4">
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

            {/* Prestataire */}
            {data.proName ? (
              <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-lg">
                  {data.proName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{data.proName}</p>
                  <p className="text-sm text-gray-500">Prestataire assigné</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 text-gray-400">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-300 text-lg">
                  <User size={24} />
                </div>
                <p className="text-sm">En attente d'un prestataire</p>
              </div>
            )}

            {/* Adresse */}
            {data.address && (
              <div className="bg-white rounded-xl shadow-sm p-4 flex items-start gap-3">
                <MapPin size={18} className="text-teal-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Adresse d'intervention</p>
                  <p className="text-sm text-gray-700">{data.address}</p>
                </div>
              </div>
            )}

            {/* Date planifiée */}
            {data.scheduledAt && (
              <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
                <Clock size={18} className="text-teal-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Date prévue</p>
                  <p className="text-sm text-gray-700">
                    {new Date(data.scheduledAt).toLocaleDateString('fr-FR', {
                      weekday: 'long', day: 'numeric', month: 'long',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Timeline */}
            {data.status !== 'cancelled' && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">Avancement</h2>
                <div className="flex flex-col gap-3">
                  {MILESTONES.map((m, i) => {
                    const done = currentIdx >= STATUS_ORDER.indexOf(m.key);
                    const active = STATUS_ORDER.indexOf(m.key) === currentIdx;
                    return (
                      <div key={m.key} className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                          done
                            ? 'bg-teal-500 border-teal-500'
                            : 'bg-white border-gray-300'
                        }`} />
                        <span className={`text-sm ${active ? 'font-semibold text-teal-700' : done ? 'text-gray-700' : 'text-gray-400'}`}>
                          {m.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dernière mise à jour */}
            <p className="text-center text-xs text-gray-400 pb-4">
              Mis à jour à {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · Actualisation automatique toutes les 10s
            </p>
          </>
        )}
      </main>
    </div>
  );
}
