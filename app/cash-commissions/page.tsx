'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';
import { useSettings } from '@/contexts/SettingsContext';

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

interface ProBookingCommission {
  id: string;
  finalPrice: number | null;
  cashCommissionRate: number | null;
  cashCommissionAmount: number | null;
  cashNetAmount: number | null;
  address: string | null;
  updatedAt: string;
}

interface ProCommission {
  proId: string;
  proName: string;
  phone: string;
  userId: string;
  isCashRestricted: boolean;
  serviceCategories: string[];
  totalCommission: number;
  totalCashCommissionPaid: number;
  bookings: ProBookingCommission[];
}

interface ProCommissionData {
  pros: ProCommission[];
  totalPending: number;
}

export default function CashCommissionsPage() {
  const [data, setData] = useState<CommissionData | null>(null);
  const [prosData, setProsData] = useState<ProCommissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [collectingId, setCollectingId] = useState<string | null>(null);
  const [collectingProId, setCollectingProId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedProId, setExpandedProId] = useState<string | null>(null);
  const { formatCurrency } = useCurrency();
  const { settings } = useSettings();
  const transportCommissionRate = settings?.commissionRates?.['moving_transport']?.standard ?? 10;

  const load = useCallback(() => {
    Promise.all([
      apiClient.get('/admin/drivers/cash-commissions'),
      apiClient.get('/admin/pros/cash-commissions'),
    ])
      .then(([drivers, pros]: any[]) => { setData(drivers); setProsData(pros); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const handleCollectPro = async (pro: ProCommission) => {
    if (!confirm(
      `Confirmer la collecte de ${formatCurrency(pro.totalCommission)} ` +
      `auprès de ${pro.proName} (${pro.phone}) ?`
    )) return;
    setCollectingProId(pro.proId);
    try {
      await apiClient.post(`/admin/pros/${pro.proId}/collect-commission`, {});
      load();
    } catch {
      alert('Erreur lors de l\'encaissement');
    } finally {
      setCollectingProId(null);
    }
  };

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
  const pros = prosData?.pros ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Commissions Cash</h1>
        <p className="text-gray-600">Commissions plateforme dues sur les paiements en espèces</p>
      </div>

      {/* Résumé global */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Transport — en attente</h3>
          <p className="text-2xl font-bold text-orange-600 mt-2">{formatCurrency(data?.totalPending ?? 0)}</p>
          <p className="text-xs text-gray-400 mt-1">{drivers.length} chauffeur(s)</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Taux transport</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{transportCommissionRate}%</p>
          <p className="text-xs text-gray-400 mt-1">paiement cash</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Services — en attente</h3>
          <p className="text-2xl font-bold text-purple-600 mt-2">{formatCurrency(prosData?.totalPending ?? 0)}</p>
          <p className="text-xs text-gray-400 mt-1">{pros.length} prestataire(s)</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total global</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency((data?.totalPending ?? 0) + (prosData?.totalPending ?? 0))}</p>
          <p className="text-xs text-gray-400 mt-1">transport + services</p>
        </div>
      </div>

      {/* Section chauffeurs */}
      <h2 className="text-xl font-semibold text-gray-900">🚚 Chauffeurs — Transport</h2>
      {drivers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          ✅ Aucune commission cash transport en attente
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
                <div className="border-t border-gray-100 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Date', 'Trajet', 'Brut', `Commission (${transportCommissionRate}%)`, 'Net chauffeur'].map(h => (
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

      {/* Section prestataires */}
      <h2 className="text-xl font-semibold text-gray-900">🔧 Prestataires — Services</h2>
      {pros.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          ✅ Aucune commission cash services en attente
        </div>
      ) : (
        <div className="space-y-4">
          {pros.map((pro) => (
            <div key={pro.proId} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-semibold text-gray-900">{pro.proName}</div>
                    <div className="text-sm text-gray-500">{pro.phone}</div>
                    <div className="text-xs text-gray-400">{pro.serviceCategories.join(', ')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">{formatCurrency(pro.totalCommission)}</div>
                    <div className="text-xs text-gray-400">en attente</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-600">{formatCurrency(pro.totalCashCommissionPaid)}</div>
                    <div className="text-xs text-gray-400">déjà collecté</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setExpandedProId(expandedProId === pro.proId ? null : pro.proId)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {expandedProId === pro.proId ? 'Masquer' : `Détail (${pro.bookings.length})`}
                  </button>
                  <button
                    onClick={() => handleCollectPro(pro)}
                    disabled={collectingProId === pro.proId}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {collectingProId === pro.proId ? '…' : '✓ Encaisser'}
                  </button>
                </div>
              </div>
              {expandedProId === pro.proId && (
                <div className="border-t border-gray-100 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Date', 'Adresse', 'Brut', 'Commission', 'Net prestataire'].map(h => (
                          <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pro.bookings.map(b => (
                        <tr key={b.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(b.updatedAt)}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{b.address ?? '—'}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{b.finalPrice != null ? formatCurrency(b.finalPrice) : '—'}</td>
                          <td className="px-4 py-3 text-sm font-medium text-orange-600">
                            {b.cashCommissionAmount != null ? `${formatCurrency(b.cashCommissionAmount)} (${b.cashCommissionRate}%)` : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-green-600">
                            {b.cashNetAmount != null ? formatCurrency(b.cashNetAmount) : '—'}
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
