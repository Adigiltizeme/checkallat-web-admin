'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function DriverDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [driver, setDriver] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const driverData = await apiClient.get(`/admin/drivers/${params.id}`);
        setDriver(driverData);

        // Charger les statistiques calculées
        const statsData = await apiClient.get(`/transport/driver/${params.id}/stats`);
        setStats(statsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id]);

  const handleValidate = async (validated: boolean) => {
    if (!validated && !reason.trim()) {
      alert('Veuillez fournir une raison pour le rejet');
      return;
    }

    setProcessing(true);
    try {
      await apiClient.put(`/admin/drivers/${params.id}/validate`, {
        validated,
        reason: validated ? undefined : reason,
      });

      alert(validated ? 'Chauffeur validé avec succès' : 'Chauffeur rejeté');
      router.push('/drivers');
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Une erreur est survenue'));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  if (!driver) {
    return <div className="text-center py-12">Chauffeur non trouvé</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {driver.user?.firstName} {driver.user?.lastName}
          </h1>
          <p className="text-gray-600">{driver.vehicleType}</p>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            driver.status === 'active'
              ? 'bg-green-100 text-green-800'
              : driver.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {driver.status}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations</h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Téléphone:</span>
              <span className="ml-2 text-gray-900">{driver.user?.phone || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Type de véhicule:</span>
              <span className="ml-2 text-gray-900">{driver.vehicleType}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Plaque:</span>
              <span className="ml-2 text-gray-900">{driver.vehiclePlate || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Permis:</span>
              <span className="ml-2 text-gray-900">{driver.drivingLicense || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Créé le:</span>
              <span className="ml-2 text-gray-900">
                {formatDate(driver.createdAt || new Date())}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistiques</h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Note moyenne:</span>
              <span className="ml-2 text-gray-900">
                {stats?.averageRating ? `${stats.averageRating.toFixed(1)}/5` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Courses complétées:</span>
              <span className="ml-2 text-gray-900">
                {stats?.completedDeliveries || 0}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Taux de ponctualité:</span>
              <span className="ml-2 text-gray-900">
                {stats?.onTimeRate ? `${stats.onTimeRate.toFixed(0)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {driver.status === 'pending' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Validation</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison du rejet (si applicable)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Expliquer pourquoi le profil est rejeté..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleValidate(true)}
                disabled={processing}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                ✓ Valider
              </button>
              <button
                onClick={() => handleValidate(false)}
                disabled={!reason.trim() || processing}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                ✗ Rejeter
              </button>
              <button
                onClick={() => router.push('/drivers')}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
