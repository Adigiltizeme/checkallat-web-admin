'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';

interface CashRequest {
  id: string;
  totalPrice: number;
  cashCommissionRate: number | null;
  cashCommissionAmount: number | null;
  cashNetAmount: number | null;
  cashPaymentConfirmedAt: string | null;
  pickupAddress: string;
  deliveryAddress: string;
}

interface DriverCommission {
  id: string;
  pendingCashCommission: number;
  totalCashCommissionPaid: number;
  totalCashPayments: number;
  vehiclePlate: string;
  user: { id: string; firstName: string; lastName: string; phone: string };
  transportRequests: CashRequest[];
}

interface CommissionData {
  drivers: DriverCommission[];
  totalPending: number;
}

export default function CashCommissionsPage() {
  const [data, setData] = useState<CommissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [collectingId, setCollectingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { formatCurrency } = useCurrency();

  const load = useCallback(() => {
    apiClient.get('/admin/drivers/cash-commissions')
      .then((d: any) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCollect = async (driver: DriverCommission) => {
    if (!confirm(
      `Confirmer la collecte de ${formatCurrency(driver.pendingCashCommission)} ` +
      `auprès de ${driver.user.firstName} ${driver.user.lastName} (${driver.user.phone}) ?`
    )) return;
    setCollectingId(driver.id);
    try {
      await apiClient.post(`/admin/drivers/${driver.id}/collect-commission`, {});
      load();
    } catch {
      alert('Erreur lors de l\'encaissement');
    } finally {
      setCollectingId(null);
    }
  };

  if (loading) return <div className="text-center py-12">Chargement...</div>;

  const drivers = data?.drivers ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Commissions Cash</h1>
        <p className="text-gray-600">Commissions plateforme dues sur les paiements en espèces</p>
      </div>

      {/* Résumé global */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total en attente</h3>
          <p className="text-2xl font-bold text-orange-600 mt-2">{formatCurrency(data?.totalPending ?? 0)}</p>
          <p className="text-xs text-gray-400 mt-1">{drivers.length} chauffeur(s)</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Taux de commission</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">10%</p>
          <p className="text-xs text-gray-400 mt-1">Transport (paiement cash)</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Chauffeurs concernés</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{drivers.length}</p>
          <p className="text-xs text-gray-400 mt-1">avec commission &gt; 0</p>
        </div>
      </div>

      {/* Liste des chauffeurs */}
      {drivers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          ✅ Aucune commission cash en attente
        </div>
      ) : (
        <div className="space-y-4">
          {drivers.map((driver) => (
            <div key={driver.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* En-tête chauffeur */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {driver.user.firstName} {driver.user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{driver.user.phone} · {driver.vehiclePlate}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">{formatCurrency(driver.pendingCashCommission)}</div>
                    <div className="text-xs text-gray-400">en attente</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-600">{formatCurrency(driver.totalCashCommissionPaid)}</div>
                    <div className="text-xs text-gray-400">déjà collecté</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setExpandedId(expandedId === driver.id ? null : driver.id)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {expandedId === driver.id ? 'Masquer' : `Détail (${driver.transportRequests.length})`}
                  </button>
                  <button
                    onClick={() => handleCollect(driver)}
                    disabled={collectingId === driver.id}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {collectingId === driver.id ? '…' : '✓ Encaisser'}
                  </button>
                </div>
              </div>

              {/* Détail des transports cash */}
              {expandedId === driver.id && (
                <div className="border-t border-gray-100">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Date', 'Trajet', 'Brut', 'Commission (10%)', 'Net chauffeur'].map(h => (
                          <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {driver.transportRequests.map(req => (
                        <tr key={req.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {req.cashPaymentConfirmedAt ? formatDateTime(req.cashPaymentConfirmedAt) : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="max-w-xs truncate text-gray-700">📍 {req.pickupAddress}</div>
                            <div className="max-w-xs truncate text-gray-500">🏁 {req.deliveryAddress}</div>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(req.totalPrice)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-orange-600">
                            {req.cashCommissionAmount != null ? formatCurrency(req.cashCommissionAmount) : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-green-600">
                            {req.cashNetAmount != null ? formatCurrency(req.cashNetAmount) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
