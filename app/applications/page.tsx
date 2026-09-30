'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { apiClient } from '@/lib/api';
import { useZone } from '@/contexts/ZoneContext';
import { usePendingSummary } from '@/contexts/PendingSummaryContext';

type Kind = 'driver' | 'courier' | 'pro' | 'seller';

interface Application {
  kind: Kind;
  id: string;
  submittedAt: string;
  countryId: string | null;
  detail: string | null;
  user: { id: string; firstName: string; lastName: string; phone: string | null; email: string | null; profilePicture: string | null };
}

const KIND_CONFIG: Record<Kind, { label: string; icon: string; href: (id: string) => string; pill: string }> = {
  driver: { label: 'Chauffeur', icon: '🚚', href: (id) => `/drivers/${id}`, pill: 'bg-amber-100 text-amber-800' },
  courier: { label: 'Livreur CheckAllPack', icon: '🛵', href: (id) => `/drivers/${id}`, pill: 'bg-orange-100 text-orange-800' },
  pro: { label: 'Prestataire', icon: '🔧', href: (id) => `/pros/${id}`, pill: 'bg-emerald-100 text-emerald-800' },
  seller: { label: 'Vendeur', icon: '🛍️', href: (id) => `/sellers/${id}`, pill: 'bg-violet-100 text-violet-800' },
};

const TABS: { key: string; label: string; countKey?: 'drivers' | 'couriers' | 'pros' | 'sellers' }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'drivers', label: '🚚 Chauffeurs', countKey: 'drivers' },
  { key: 'couriers', label: '🛵 CheckAllPack', countKey: 'couriers' },
  { key: 'pros', label: '🔧 Prestataires', countKey: 'pros' },
  { key: 'sellers', label: '🛍️ Vendeurs', countKey: 'sellers' },
];

const VEHICLE_LABELS: Record<string, string> = {
  van: 'Camionnette',
  small_truck: 'Petit camion',
  large_truck: 'Grand camion',
  motorbike: 'Moto / scooter',
  bicycle: 'Vélo',
};

/** Au-delà de ce délai sans traitement, la candidature est signalée comme en retard */
const LATE_AFTER_HOURS = 48;

export default function ApplicationsPage() {
  const { selectedZone } = useZone();
  const { summary } = usePendingSummary();
  const [tab, setTab] = useState('all');
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const params: Record<string, string> = { type: tab };
    if (selectedZone) params.zone = selectedZone;
    apiClient
      .get('/admin/applications', { params })
      .then((data: any) => setItems(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tab, selectedZone]);

  useEffect(() => {
    setLoading(true);
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  const count = (key?: 'drivers' | 'couriers' | 'pros' | 'sellers') =>
    key ? summary?.applications[key] ?? 0 : summary?.applications.total ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Candidatures</h1>
        <p className="text-gray-600">
          Chauffeurs, livreurs, prestataires et vendeurs en attente de validation, du plus ancien au plus récent.
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex flex-wrap gap-x-6" aria-label="Type de candidature">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                tab === t.key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {t.label}
              {count(t.countKey) > 0 && (
                <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-bold text-white">
                  {count(t.countKey)}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Chargement…</div>
      ) : items.length === 0 ? (
        <div className="rounded-lg bg-white py-16 text-center shadow">
          <p className="text-4xl">✅</p>
          <p className="mt-2 font-medium text-gray-800">Aucune candidature en attente</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium uppercase text-gray-500">
                <th className="px-4 py-3">Candidat</th>
                <th className="px-4 py-3">Activité</th>
                <th className="px-4 py-3">Détail</th>
                <th className="px-4 py-3">Pays</th>
                <th className="px-4 py-3">Déposée</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((a) => {
                const cfg = KIND_CONFIG[a.kind];
                const submitted = new Date(a.submittedAt);
                const late = Date.now() - submitted.getTime() > LATE_AFTER_HOURS * 3_600_000;
                return (
                  <tr key={`${a.kind}:${a.id}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{a.user.firstName} {a.user.lastName}</p>
                      <p className="text-xs text-gray-500">{a.user.phone ?? a.user.email ?? ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${cfg.pill}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </td>
                    <td className="max-w-[280px] px-4 py-3 text-gray-700">
                      {a.kind === 'driver' || a.kind === 'courier' ? VEHICLE_LABELS[a.detail ?? ''] ?? a.detail : a.detail || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{a.countryId ?? '—'}</td>
                    <td className="px-4 py-3">
                      <p className={late ? 'font-semibold text-red-600' : 'text-gray-700'}>
                        {formatDistanceToNow(submitted, { addSuffix: true, locale: fr })}
                        {late && ' · en retard'}
                      </p>
                      <p className="text-xs text-gray-400">{format(submitted, 'dd/MM/yy HH:mm', { locale: fr })}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={cfg.href(a.id)}
                        className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark"
                      >
                        Examiner
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
