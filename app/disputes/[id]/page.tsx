'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { formatDateTime, formatCurrency } from '@/lib/utils';

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [dispute, setDispute] = useState<any>(null);
  const [resolution, setResolution] = useState('');
  const [resolvedInFavorOf, setResolvedInFavorOf] = useState<'client' | 'pro'>('client');
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get(`/admin/disputes/${params.id}`)
      .then(setDispute)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleResolve = async () => {
    if (!resolution.trim()) {
      alert('Veuillez fournir une résolution');
      return;
    }

    setProcessing(true);
    try {
      await apiClient.put(`/admin/disputes/${params.id}/resolve`, {
        resolution,
        resolvedInFavorOf,
      });
      alert('Litige résolu avec succès');
      router.push('/disputes');
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Une erreur est survenue'));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  if (!dispute) {
    return <div className="text-center py-12">Litige non trouvé</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Litige #{dispute.id.slice(0, 8)}
          </h1>
          <p className="text-gray-600">{dispute.type || 'N/A'}</p>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            dispute.status === 'resolved'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {dispute.status}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations</h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Demandeur:</span>
              <span className="ml-2 text-gray-900">
                {dispute.requestedBy?.firstName} {dispute.requestedBy?.lastName}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Réservation:</span>
              <span className="ml-2 text-gray-900 font-mono text-sm">
                {dispute.bookingId?.slice(0, 8) || 'N/A'}...
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Créé le:</span>
              <span className="ml-2 text-gray-900">
                {formatDateTime(dispute.createdAt || new Date())}
              </span>
            </div>
            {dispute.resolvedAt && (
              <div>
                <span className="font-medium text-gray-700">Résolu le:</span>
                <span className="ml-2 text-gray-900">
                  {formatDateTime(dispute.resolvedAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Montants</h2>
          <div className="space-y-3">
            {dispute.booking?.finalPrice && (
              <div>
                <span className="font-medium text-gray-700">Montant de la réservation:</span>
                <span className="ml-2 text-gray-900">
                  {formatCurrency(dispute.booking.finalPrice)}
                </span>
              </div>
            )}
            {dispute.refundAmount && (
              <div>
                <span className="font-medium text-gray-700">Montant du remboursement:</span>
                <span className="ml-2 text-green-600 font-semibold">
                  {formatCurrency(dispute.refundAmount)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
        <p className="text-gray-700 whitespace-pre-wrap">
          {dispute.description || 'Aucune description fournie'}
        </p>
      </div>

      {dispute.resolution && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Résolution</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{dispute.resolution}</p>
          {dispute.resolvedInFavorOf && (
            <p className="mt-4 text-sm text-gray-600">
              Résolu en faveur de: <span className="font-semibold">{dispute.resolvedInFavorOf}</span>
            </p>
          )}
        </div>
      )}

      {dispute.status === 'pending' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Résoudre le litige</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Résolution en faveur de:
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="favor"
                    value="client"
                    checked={resolvedInFavorOf === 'client'}
                    onChange={(e) => setResolvedInFavorOf(e.target.value as 'client')}
                    className="mr-2"
                  />
                  <span>Client</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="favor"
                    value="pro"
                    checked={resolvedInFavorOf === 'pro'}
                    onChange={(e) => setResolvedInFavorOf(e.target.value as 'pro')}
                    className="mr-2"
                  />
                  <span>Professionnel</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Explication de la résolution
              </label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Expliquer la décision et les actions prises..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleResolve}
                disabled={!resolution.trim() || processing}
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
              >
                Résoudre le litige
              </button>
              <button
                onClick={() => router.push('/disputes')}
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
