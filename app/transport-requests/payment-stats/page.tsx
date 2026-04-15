'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useCurrency } from '@/hooks/useCurrency';

interface PaymentStats {
  totalTransports: number;
  completedTransports: number;
  cashTransports: number;
  inAppTransports: number;
  cashPercentage: number;
  inAppPercentage: number;
  totalRevenueCash: number;
  totalRevenueInApp: number;
  averageTransportValue: number;
  disputedTransports: number;
  confirmedCashPayments: number;
  pendingCashPayments: number;
}

interface DriverPaymentStats {
  driverId: string;
  driverName: string;
  totalCashPayments: number;
  totalInAppPayments: number;
  inAppRate: number;
  hasSecurePaymentBadge: boolean;
  cashFraudWarnings: number;
  isCashRestricted: boolean;
  status: string;
}

export default function PaymentStatsPage() {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [driverStats, setDriverStats] = useState<DriverPaymentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Récupérer tous les transports
      const transports: any = await apiClient.get('/transport/admin/all');
      const allTransports = Array.isArray(transports) ? transports : (transports.requests || []);

      // Calculer les statistiques globales
      const completedTransports = allTransports.filter((t: any) => t.status === 'completed');
      const cashTransports = completedTransports.filter((t: any) => t.paymentMethod === 'cash');
      const inAppTransports = completedTransports.filter((t: any) => t.paymentMethod === 'in_app');

      const totalRevenueCash = cashTransports.reduce((sum: number, t: any) => sum + (t.totalPrice || 0), 0);
      const totalRevenueInApp = inAppTransports.reduce((sum: number, t: any) => sum + (t.totalPrice || 0), 0);

      const disputedTransports = allTransports.filter((t: any) => t.cashPaymentStatus === 'disputed');
      const confirmedCashPayments = allTransports.filter((t: any) => t.cashPaymentStatus === 'confirmed');
      const pendingCashPayments = cashTransports.filter((t: any) =>
        t.clientConfirmedCompletion && t.driverConfirmedCompletion && !t.cashPaymentStatus
      );

      setStats({
        totalTransports: allTransports.length,
        completedTransports: completedTransports.length,
        cashTransports: cashTransports.length,
        inAppTransports: inAppTransports.length,
        cashPercentage: completedTransports.length > 0 ? (cashTransports.length / completedTransports.length * 100) : 0,
        inAppPercentage: completedTransports.length > 0 ? (inAppTransports.length / completedTransports.length * 100) : 0,
        totalRevenueCash,
        totalRevenueInApp,
        averageTransportValue: completedTransports.length > 0
          ? (totalRevenueCash + totalRevenueInApp) / completedTransports.length
          : 0,
        disputedTransports: disputedTransports.length,
        confirmedCashPayments: confirmedCashPayments.length,
        pendingCashPayments: pendingCashPayments.length,
      });

      // Récupérer les statistiques par chauffeur
      const drivers: any = await apiClient.get('/admin/drivers');
      const allDrivers = Array.isArray(drivers) ? drivers : (drivers.drivers || []);

      // Calculer les compteurs de paiements par chauffeur depuis les transports
      const cashByDriver: Record<string, number> = {};
      const inAppByDriver: Record<string, number> = {};
      for (const t of completedTransports) {
        if (!t.driverId) continue;
        if (t.paymentMethod === 'cash') {
          cashByDriver[t.driverId] = (cashByDriver[t.driverId] || 0) + 1;
        } else if (t.paymentMethod === 'in_app') {
          inAppByDriver[t.driverId] = (inAppByDriver[t.driverId] || 0) + 1;
        }
      }

      const driverStatsData = allDrivers.map((driver: any) => {
        const totalCash = cashByDriver[driver.id] || 0;
        const totalInApp = inAppByDriver[driver.id] || 0;
        const totalPayments = totalCash + totalInApp;
        const inAppRate = totalPayments > 0 ? (totalInApp / totalPayments * 100) : 0;
        const hasSecurePaymentBadge = inAppRate >= 90 && totalPayments >= 10;

        return {
          driverId: driver.id,
          driverName: `${driver.user?.firstName || ''} ${driver.user?.lastName || ''}`.trim() || 'Inconnu',
          totalCashPayments: totalCash,
          totalInAppPayments: totalInApp,
          inAppRate,
          hasSecurePaymentBadge,
          cashFraudWarnings: driver.cashFraudWarnings || 0,
          isCashRestricted: driver.isCashRestricted || false,
          status: driver.status,
        };
      }).sort((a: DriverPaymentStats, b: DriverPaymentStats) => b.inAppRate - a.inAppRate);

      setDriverStats(driverStatsData);
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  if (!stats) {
    return <div className="text-center py-12 text-red-600">Erreur de chargement</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💳 Statistiques des Paiements</h1>
          <p className="text-gray-600">
            Vue d'ensemble des paiements cash et in-app
          </p>
        </div>
        <Link
          href="/transport-requests/cash-disputes"
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          🚨 Voir les litiges ({stats.disputedTransports})
        </Link>
      </div>

      {/* Vue d'ensemble */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Transports terminés</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedTransports}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Valeur moyenne</h3>
          <p className="text-3xl font-bold text-primary mt-2">
            {formatCurrency(stats.averageTransportValue)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Litiges actifs</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.disputedTransports}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Cash en attente</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingCashPayments}</p>
        </div>
      </div>

      {/* Répartition des paiements */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">💰 Paiements Cash</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Nombre de transports</span>
              <span className="text-2xl font-bold text-orange-600">{stats.cashTransports}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pourcentage</span>
              <span className="text-2xl font-bold text-orange-600">{stats.cashPercentage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revenu total</span>
              <span className="text-2xl font-bold text-orange-600">
                {formatCurrency(stats.totalRevenueCash)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-gray-600">✅ Confirmés</span>
              <span className="font-semibold text-green-600">{stats.confirmedCashPayments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">❌ Litigieux</span>
              <span className="font-semibold text-red-600">{stats.disputedTransports}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">💳 Paiements In-App</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Nombre de transports</span>
              <span className="text-2xl font-bold text-blue-600">{stats.inAppTransports}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pourcentage</span>
              <span className="text-2xl font-bold text-blue-600">{stats.inAppPercentage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revenu total</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats.totalRevenueInApp)}
              </span>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-green-600 font-medium">
                ✅ Sécurisé à 100% (pas de litige possible)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique visuel de répartition */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">📊 Répartition visuelle</h2>
        <div className="flex h-12 rounded-lg overflow-hidden">
          <div
            style={{ width: `${stats.inAppPercentage}%` }}
            className="bg-blue-500 flex items-center justify-center text-white font-semibold text-sm"
          >
            {stats.inAppPercentage > 10 && `${stats.inAppPercentage.toFixed(0)}% In-App`}
          </div>
          <div
            style={{ width: `${stats.cashPercentage}%` }}
            className="bg-orange-500 flex items-center justify-center text-white font-semibold text-sm"
          >
            {stats.cashPercentage > 10 && `${stats.cashPercentage.toFixed(0)}% Cash`}
          </div>
        </div>
      </div>

      {/* Classement des chauffeurs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">🏆 Classement des Chauffeurs par Paiement Sécurisé</h2>
          <p className="text-sm text-gray-600 mt-1">
            Chauffeurs avec le plus haut taux de paiements in-app (badge 🏆 = ≥90%)
          </p>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rang</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chauffeur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paiements Cash</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paiements In-App</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taux In-App</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Badge</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avertissements</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {driverStats.map((driver, index) => (
              <tr key={driver.driverId} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `#${index + 1}`}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {driver.driverName}
                </td>
                <td className="px-6 py-4 text-sm text-orange-600 font-medium">
                  {driver.totalCashPayments}
                </td>
                <td className="px-6 py-4 text-sm text-blue-600 font-medium">
                  {driver.totalInAppPayments}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min(driver.inAppRate, 100)}%` }}
                      />
                    </div>
                    <span className="font-semibold">{driver.inAppRate.toFixed(0)}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  {driver.hasSecurePaymentBadge ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      🏆 Paiement Sécurisé
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  {driver.cashFraudWarnings > 0 ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      driver.cashFraudWarnings >= 3 ? 'bg-red-100 text-red-800' :
                      driver.cashFraudWarnings >= 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      ⚠️ {driver.cashFraudWarnings}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">Aucun</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    driver.status === 'active' ? 'bg-green-100 text-green-800' :
                    driver.status === 'suspended' ? 'bg-red-100 text-red-800' :
                    driver.status === 'banned' ? 'bg-black text-white' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {driver.status}
                  </span>
                  {driver.isCashRestricted && (
                    <span className="ml-1 text-xs text-orange-600">🚫 Cash</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
