'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  active: 'Actif',
  suspended: 'Suspendu',
  rejected: 'Rejeté',
  banned: 'Banni',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-orange-100 text-orange-800',
  rejected: 'bg-red-100 text-red-800',
  banned: 'bg-red-200 text-red-900',
};

const VEHICLE_LABELS: Record<string, string> = {
  van: 'Camionnette',
  small_truck: 'Petit camion',
  large_truck: 'Grand camion',
};

export default function DriverDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [driver, setDriver] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const driverData = await apiClient.get(`/admin/drivers/${params.id}`);
      setDriver(driverData);
      const statsData = await apiClient.get(`/transport/driver/${params.id}/stats`);
      setStats(statsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [params.id]);

  const handleValidate = async (approved: boolean) => {
    if (!approved && !reason.trim()) {
      alert('Veuillez fournir une raison pour le rejet');
      return;
    }
    setProcessing(true);
    try {
      await apiClient.put(`/admin/drivers/${params.id}/validate`, {
        approved,
        reason: approved ? undefined : reason,
      });
      alert(approved ? 'Chauffeur approuvé avec succès' : 'Chauffeur rejeté');
      loadData();
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Une erreur est survenue'));
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleAvailability = async () => {
    setProcessing(true);
    try {
      await apiClient.patch(`/admin/drivers/${params.id}/availability`, {
        isAvailable: !driver.isAvailable,
      });
      setDriver((d: any) => ({ ...d, isAvailable: !d.isAvailable }));
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Une erreur est survenue'));
    } finally {
      setProcessing(false);
    }
  };

  const handleSuspend = async () => {
    if (!confirm('Suspendre ce chauffeur ?')) return;
    setProcessing(true);
    try {
      await apiClient.patch(`/admin/users/${driver.user?.id}/suspend`);
      loadData();
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Une erreur est survenue'));
    } finally {
      setProcessing(false);
    }
  };

  const handleReactivate = async () => {
    if (!confirm('Réactiver ce chauffeur ?')) return;
    setProcessing(true);
    try {
      await apiClient.patch(`/admin/users/${driver.user?.id}/reactivate`);
      loadData();
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Une erreur est survenue'));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Chargement...</div>;
  if (!driver) return <div className="text-center py-12 text-gray-500">Chauffeur non trouvé</div>;

  const vehiclePhotos: string[] = driver.vehiclePhotos || [];
  const licenseUrl: string | null = driver.drivingLicense || null;
  const vehicleDocUrl: string | null = driver.vehicleInsurance || null;

  return (
    <div className="space-y-6">
      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightboxSrc(null)}
        >
          <img
            src={lightboxSrc}
            alt="Document"
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold leading-none"
            onClick={() => setLightboxSrc(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <button
            onClick={() => router.push('/drivers')}
            className="text-sm text-gray-500 hover:text-gray-700 mb-1 flex items-center gap-1"
          >
            ← Retour aux chauffeurs
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {driver.user?.firstName} {driver.user?.lastName}
          </h1>
          <p className="text-gray-500">{VEHICLE_LABELS[driver.vehicleType] || driver.vehicleType}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${STATUS_COLORS[driver.status] || 'bg-gray-100 text-gray-700'}`}>
            {STATUS_LABELS[driver.status] || driver.status}
          </span>
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${driver.isAvailable ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
            <span className={`w-2 h-2 rounded-full ${driver.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
            {driver.isAvailable ? 'Disponible' : 'Indisponible'}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Infos personnelles */}
        <div className="bg-white rounded-lg shadow p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Informations</h2>
          <InfoRow label="Téléphone" value={driver.user?.phone} />
          <InfoRow label="Email" value={driver.user?.email || '—'} />
          <InfoRow label="Type de véhicule" value={VEHICLE_LABELS[driver.vehicleType] || driver.vehicleType} />
          <InfoRow label="Plaque" value={driver.vehiclePlate || '—'} />
          <InfoRow label="Capacité" value={driver.vehicleCapacity ? `${driver.vehicleCapacity} m³` : '—'} />
          <InfoRow label="Zone service" value={driver.serviceRadius ? `${driver.serviceRadius} km` : '—'} />
          <InfoRow label="Inscrit le" value={formatDate(driver.createdAt)} />
        </div>

        {/* Statistiques */}
        <div className="bg-white rounded-lg shadow p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Statistiques</h2>
          <InfoRow label="Note moyenne" value={stats?.averageRating ? `${Number(stats.averageRating).toFixed(1)} / 5` : '—'} />
          <InfoRow label="Courses complétées" value={String(stats?.completedDeliveries ?? driver.totalTransports ?? 0)} />
          <InfoRow label="Ponctualité" value={stats?.onTimeRate ? `${Number(stats.onTimeRate).toFixed(0)} %` : '0 %'} />
          <InfoRow label="Commission cash due" value={driver.pendingCashCommission ? `${driver.pendingCashCommission.toFixed(2)} €` : '0 €'} />
          <InfoRow label="Restriction cash" value={driver.isCashRestricted ? 'Oui' : 'Non'} />
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Actions</h2>

          {/* Toggle disponibilité */}
          {driver.status === 'active' && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Disponibilité</span>
              <button
                onClick={handleToggleAvailability}
                disabled={processing}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${driver.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${driver.isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          )}

          {driver.status === 'active' && (
            <button
              onClick={handleSuspend}
              disabled={processing}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 text-sm font-medium"
            >
              Suspendre le chauffeur
            </button>
          )}
          {driver.status === 'suspended' && (
            <button
              onClick={handleReactivate}
              disabled={processing}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
            >
              Réactiver le chauffeur
            </button>
          )}
          <button
            onClick={() => router.push('/drivers')}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
          >
            ← Retour à la liste
          </button>
        </div>
      </div>

      {/* Photos du véhicule */}
      {vehiclePhotos.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Photos du véhicule
            <span className="ml-2 text-sm font-normal text-gray-400">({vehiclePhotos.length} photo{vehiclePhotos.length > 1 ? 's' : ''})</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {vehiclePhotos.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxSrc(url)}
                className="relative group overflow-hidden rounded-lg border border-gray-200 aspect-video bg-gray-100 hover:border-primary transition-colors"
              >
                <img
                  src={url}
                  alt={`Véhicule ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
                {idx === 0 && (
                  <span className="absolute top-2 left-2 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium">Face</span>
                )}
                {idx === 1 && (
                  <span className="absolute top-2 left-2 text-xs bg-indigo-600 text-white px-1.5 py-0.5 rounded font-medium">Profil</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Permis de conduire */}
      {licenseUrl && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Permis de conduire</h2>
          <button
            onClick={() => setLightboxSrc(licenseUrl)}
            className="relative group overflow-hidden rounded-lg border border-gray-200 inline-block hover:border-primary transition-colors"
          >
            <img
              src={licenseUrl}
              alt="Permis de conduire"
              className="max-h-64 max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </button>
          <p className="mt-2 text-xs text-gray-400">Cliquez pour agrandir</p>
        </div>
      )}

      {/* Document du véhicule (carte grise) */}
      {vehicleDocUrl && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Document du véhicule</h2>
          <button
            onClick={() => setLightboxSrc(vehicleDocUrl)}
            className="relative group overflow-hidden rounded-lg border border-gray-200 inline-block hover:border-primary transition-colors"
          >
            <img
              src={vehicleDocUrl}
              alt="Document du véhicule"
              className="max-h-64 max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </button>
          <p className="mt-2 text-xs text-gray-400">Cliquez pour agrandir</p>
        </div>
      )}

      {/* Validation candidature en attente */}
      {driver.status === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-amber-900 mb-1 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Candidature en attente de validation
          </h2>
          <p className="text-sm text-amber-700 mb-4">
            Vérifiez les photos du véhicule (plaque lisible) et le permis de conduire avant de valider.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motif de rejet (obligatoire si rejet)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Expliquer pourquoi la candidature est rejetée..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleValidate(true)}
              disabled={processing}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Approuver
            </button>
            <button
              onClick={() => handleValidate(false)}
              disabled={!reason.trim() || processing}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Rejeter
            </button>
          </div>
        </div>
      )}

      {/* Historique des courses */}
      {driver.transportRequests && driver.transportRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dernières courses (20)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {driver.transportRequests.map((tr: any) => (
                  <tr key={tr.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-600">{formatDate(tr.createdAt)}</td>
                    <td className="px-4 py-2 text-gray-900">
                      {tr.client?.firstName} {tr.client?.lastName}
                    </td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {tr.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-900">
                      {tr.totalPrice ? `${Number(tr.totalPrice).toFixed(2)} €` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-sm font-medium text-gray-500 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 text-right">{value || '—'}</span>
    </div>
  );
}
