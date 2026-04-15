'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';

export default function CashDisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    // Récupérer tous les transports avec statut disputed
    apiClient.get('/transport/admin/all')
      .then((data: any) => {
        const allRequests = Array.isArray(data) ? data : (data.requests || []);
        // Filtrer uniquement ceux avec cashPaymentStatus = 'disputed'
        const cashDisputes = allRequests.filter((r: any) => r.cashPaymentStatus === 'disputed');
        setDisputes(cashDisputes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">💰 Litiges Paiement Cash</h1>
        <p className="text-gray-600">
          Transports avec divergence entre les montants déclarés par le client et le chauffeur
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-red-50 rounded-lg shadow p-6 border border-red-200">
          <h3 className="text-sm font-medium text-red-700">Litiges actifs</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{disputes.length}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-6 border border-yellow-200">
          <h3 className="text-sm font-medium text-yellow-700">Montant total en litige</h3>
          <p className="text-2xl font-bold text-yellow-600 mt-2">
            {formatCurrency(disputes.reduce((sum: number, d: any) => sum + (d.totalPrice || 0), 0))}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-6 border border-blue-200">
          <h3 className="text-sm font-medium text-blue-700">Action requise</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">🚨 Urgent</p>
        </div>
      </div>

      {/* Table des litiges cash */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Transport
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chauffeur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix attendu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant Driver
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Écart
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {disputes.map((dispute: any) => {
              const clientAmount = dispute.cashAmountDeclaredByClient || 0;
              const driverAmount = dispute.cashAmountDeclaredByDriver || 0;
              const expectedAmount = dispute.totalPrice || 0;
              const difference = Math.abs(clientAmount - driverAmount);
              const differencePercent = expectedAmount > 0 ? (difference / expectedAmount * 100) : 0;

              return (
                <tr key={dispute.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">
                    {dispute.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {dispute.client?.firstName} {dispute.client?.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {dispute.driver?.user?.firstName} {dispute.driver?.user?.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {formatCurrency(expectedAmount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-blue-600 font-medium">
                    {formatCurrency(clientAmount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-purple-600 font-medium">
                    {formatCurrency(driverAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      -{formatCurrency(difference)} ({differencePercent.toFixed(1)}%)
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDateTime(dispute.completedAt || dispute.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      href={`/transport-requests/${dispute.id}`}
                      className="text-primary hover:text-primary-dark"
                    >
                      Voir détails
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {disputes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">✅ Aucun litige de paiement cash</p>
            <p className="text-sm mt-2">Tous les paiements cash sont conformes</p>
          </div>
        )}
      </div>

      {/* Légende */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Comment gérer un litige :</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Cliquez sur "Voir détails" pour consulter l'ensemble des informations du transport</li>
          <li>• Vérifiez les notes laissées par le client et le chauffeur dans cashPaymentNotes</li>
          <li>• Contactez les deux parties si nécessaire pour clarification</li>
          <li>• Les écarts &gt; 1% du prix attendu sont automatiquement marqués comme litigieux</li>
          <li>• Après résolution, mettez à jour le statut du transport manuellement dans la base de données</li>
        </ul>
      </div>

      {/* Statistiques par chauffeur */}
      {disputes.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Chauffeurs avec litiges</h3>
          <div className="space-y-2">
            {Object.entries(
              disputes.reduce((acc: any, d: any) => {
                const driverId = d.driver?.id || 'unknown';
                const driverName = `${d.driver?.user?.firstName || ''} ${d.driver?.user?.lastName || ''}`.trim() || 'Inconnu';
                if (!acc[driverId]) {
                  acc[driverId] = { name: driverName, count: 0, warnings: d.driver?.cashFraudWarnings || 0 };
                }
                acc[driverId].count++;
                return acc;
              }, {})
            ).map(([driverId, data]: [string, any]) => (
              <div key={driverId} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{data.name}</span>
                  <span className="ml-2 text-sm text-gray-500">({data.count} litige{data.count > 1 ? 's' : ''})</span>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded ${
                  data.warnings >= 3 ? 'bg-red-100 text-red-800' :
                  data.warnings >= 2 ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {data.warnings} avertissement{data.warnings > 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
