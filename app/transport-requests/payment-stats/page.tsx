'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useCurrency } from '@/hooks/useCurrency';

interface ActivityStats {
  total: number;
  cashCount: number;
  inAppCount: number;
  cashRevenue: number;
  inAppRevenue: number;
  totalRevenue: number;
  disputedCount: number;
  confirmedCashCount: number;
  cashCommission: number;
}

interface CategoryStats extends ActivityStats {
  slug: string;
  nameFr: string;
}

interface MarketplaceTypeStats {
  type: string;
  total: number;
  cashCount: number;
  inAppCount: number;
  cashRevenue: number;
  inAppRevenue: number;
  totalRevenue: number;
}

interface GlobalStats {
  totalRevenue: number;
  cashRevenue: number;
  inAppRevenue: number;
  cashPercentage: number;
  inAppPercentage: number;
  disputedCount: number;
  cashCommission: number;
}

interface PaymentStats {
  global: GlobalStats;
  transport: ActivityStats;
  services: ActivityStats;
  marketplace: ActivityStats;
  servicesByCategory: CategoryStats[];
  marketplaceByType: MarketplaceTypeStats[];
}

interface DriverStat {
  driverId: string;
  driverName: string;
  totalCash: number;
  totalInApp: number;
  inAppRate: number;
  hasSecureBadge: boolean;
  cashFraudWarnings: number;
  isCashRestricted: boolean;
  status: string;
}

type Tab = 'overview' | 'services_detail' | 'marketplace_detail' | 'drivers';

export default function PaymentStatsPage() {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [driverStats, setDriverStats] = useState<DriverStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { formatCurrency } = useCurrency();

  const load = useCallback(async () => {
    try {
      const [statsData, transportsData, driversData]: [any, any, any] = await Promise.all([
        apiClient.get('/admin/payment-stats'),
        apiClient.get('/transport/admin/all'),
        apiClient.get('/admin/drivers'),
      ]);

      setStats(statsData);

      const allT = Array.isArray(transportsData) ? transportsData : (transportsData?.requests ?? []);
      const completed = allT.filter((t: any) => t.status === 'completed');
      const cashByD: Record<string, number> = {};
      const inAppByD: Record<string, number> = {};
      for (const t of completed) {
        if (!t.driverId) continue;
        if (t.paymentMethod === 'cash') cashByD[t.driverId] = (cashByD[t.driverId] || 0) + 1;
        else if (t.paymentMethod === 'in_app') inAppByD[t.driverId] = (inAppByD[t.driverId] || 0) + 1;
      }
      const allDrivers = driversData?.drivers ?? driversData ?? [];
      setDriverStats(
        (Array.isArray(allDrivers) ? allDrivers : []).map((d: any) => {
          const tc = cashByD[d.id] || 0;
          const ti = inAppByD[d.id] || 0;
          const tot = tc + ti;
          const rate = tot > 0 ? ti / tot * 100 : 0;
          return {
            driverId: d.id,
            driverName: `${d.user?.firstName || ''} ${d.user?.lastName || ''}`.trim() || 'Inconnu',
            totalCash: tc, totalInApp: ti, inAppRate: rate,
            hasSecureBadge: tot >= 10 && rate >= 90,
            cashFraudWarnings: d.cashFraudWarnings || 0,
            isCashRestricted: d.isCashRestricted || false,
            status: d.status,
          };
        }).sort((a: DriverStat, b: DriverStat) => b.inAppRate - a.inAppRate)
      );
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="text-center py-12">Chargement...</div>;
  if (!stats)  return <div className="text-center py-12 text-red-600">Erreur de chargement</div>;

  const { global: g } = stats;
  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview',           label: 'Vue d\'ensemble'            },
    { key: 'services_detail',    label: `🔧 Services par catégorie (${stats.servicesByCategory.length})`     },
    { key: 'marketplace_detail', label: `🛍️ Marketplace par type (${stats.marketplaceByType.length})`        },
    { key: 'drivers',            label: `🚚 Classement chauffeurs (${driverStats.length})`                   },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stats Paiements</h1>
          <p className="text-gray-600">Vue globale — transport, services par catégorie & marketplace</p>
        </div>
        <Link href="/transport-requests/cash-disputes"
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
          Litiges actifs ({g.disputedCount})
        </Link>
      </div>

      {/* KPIs globaux */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Revenu total',      value: formatCurrency(g.totalRevenue),   color: 'text-gray-900' },
          { label: 'Paiements cash',    value: formatCurrency(g.cashRevenue),    color: 'text-orange-600' },
          { label: 'Paiements in-app',  value: formatCurrency(g.inAppRevenue),   color: 'text-blue-600' },
          { label: 'Commissions cash',  value: formatCurrency(g.cashCommission), color: 'text-green-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-lg shadow p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Barre de répartition */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-sm font-semibold text-gray-600 mb-2">Répartition globale Cash / In-App</h2>
        <div className="flex h-8 rounded-lg overflow-hidden text-xs font-semibold">
          <div style={{ width: `${g.inAppPercentage}%` }} className="bg-blue-500 flex items-center justify-center text-white">
            {g.inAppPercentage > 8 && `${g.inAppPercentage.toFixed(0)}% In-App`}
          </div>
          <div style={{ width: `${g.cashPercentage}%` }} className="bg-orange-400 flex items-center justify-center text-white">
            {g.cashPercentage > 8 && `${g.cashPercentage.toFixed(0)}% Cash`}
          </div>
        </div>
        <div className="flex gap-6 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> In-App {g.inAppPercentage.toFixed(1)}%</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-orange-400 inline-block" /> Cash {g.cashPercentage.toFixed(1)}%</span>
          {g.disputedCount > 0 && <span className="text-red-600 font-medium">{g.disputedCount} litige(s) actif(s)</span>}
        </div>
      </div>

      {/* Cards activités */}
      <div className="grid gap-4 md:grid-cols-3">
        {([
          { key: 'transport' as const,   label: 'Transport',   icon: '🚚', color: 'border-purple-200', hdr: 'text-purple-700' },
          { key: 'services' as const,    label: 'Services',    icon: '🔧', color: 'border-green-200',  hdr: 'text-green-700'  },
          { key: 'marketplace' as const, label: 'Marketplace', icon: '🛍️', color: 'border-indigo-200', hdr: 'text-indigo-700' },
        ] as { key: keyof Omit<PaymentStats,'global'|'servicesByCategory'|'marketplaceByType'>; label: string; icon: string; color: string; hdr: string }[]).map(({ key, label, icon, color, hdr }) => {
          const s = stats[key] as ActivityStats;
          const cashPct = s.total > 0 ? (s.cashCount / s.total * 100) : 0;
          const inAppPct = s.total > 0 ? (s.inAppCount / s.total * 100) : 0;
          return (
            <div key={key} className={`bg-white rounded-lg shadow p-5 border-l-4 ${color}`}>
              <h3 className={`font-semibold ${hdr} mb-3`}>{icon} {label}</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Complétés</span><span className="font-medium">{s.total}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Revenu total</span><span className="font-semibold text-gray-900">{formatCurrency(s.totalRevenue)}</span></div>
                <div className="pt-1 border-t border-gray-100 space-y-1">
                  <div className="flex justify-between"><span className="text-orange-600">Cash ({cashPct.toFixed(0)}%)</span><span className="font-medium text-orange-700">{formatCurrency(s.cashRevenue)}</span></div>
                  <div className="flex justify-between"><span className="text-blue-600">In-App ({inAppPct.toFixed(0)}%)</span><span className="font-medium text-blue-700">{formatCurrency(s.inAppRevenue)}</span></div>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-100">
                  <span className="text-gray-500">Commission cash</span>
                  <span className="font-medium text-green-700">{formatCurrency(s.cashCommission)}</span>
                </div>
                {s.disputedCount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-red-500">Litiges cash</span>
                    <span className="font-semibold text-red-600">{s.disputedCount}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Onglets de détail */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-1 overflow-x-auto">
          {tabs.map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`whitespace-nowrap py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Vue d'ensemble */}
      {activeTab === 'overview' && (
        <div className="grid gap-4 md:grid-cols-2">
          {([
            { key: 'transport' as const,   label: 'Transport',   icon: '🚚' },
            { key: 'services' as const,    label: 'Services',    icon: '🔧' },
            { key: 'marketplace' as const, label: 'Marketplace', icon: '🛍️' },
          ] as { key: keyof Omit<PaymentStats,'global'|'servicesByCategory'|'marketplaceByType'>; label: string; icon: string }[]).map(({ key, label, icon }) => {
            const s = stats[key] as ActivityStats;
            return (
              <div key={key} className="bg-white rounded-lg shadow p-5">
                <h3 className="font-semibold text-gray-700 mb-3">{icon} {label} — détail cash</h3>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Cash confirmés</span><span className="font-medium text-green-600">{s.confirmedCashCount}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">En litige</span><span className={`font-medium ${s.disputedCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>{s.disputedCount}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Commission due</span><span className="font-medium text-green-700">{formatCurrency(s.cashCommission)}</span></div>
                </div>
              </div>
            );
          })}
          <div className="bg-white rounded-lg shadow p-5">
            <h3 className="font-semibold text-gray-700 mb-3">Synthèse commissions cash</h3>
            <div className="space-y-2 text-sm">
              {[
                { key: 'transport' as const,   label: '🚚 Transport'   },
                { key: 'services' as const,    label: '🔧 Services'    },
                { key: 'marketplace' as const, label: '🛍️ Marketplace' },
              ].map(({ key, label }) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-green-700">{formatCurrency((stats[key] as ActivityStats).cashCommission)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t font-semibold">
                <span>Total</span>
                <span className="text-green-700">{formatCurrency(g.cashCommission)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services par catégorie */}
      {activeTab === 'services_detail' && (
        <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
          {stats.servicesByCategory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Aucune donnée services</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Catégorie', 'Complétées', 'Revenu total', 'Cash', '% Cash', 'In-App', 'Commission', 'Litiges'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.servicesByCategory.map((cat) => {
                  const cashPct = cat.total > 0 ? (cat.cashCount / cat.total * 100) : 0;
                  return (
                    <tr key={cat.slug} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900">{cat.nameFr}</div>
                        <div className="text-xs text-gray-400">{cat.slug}</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">{cat.total}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-900">{formatCurrency(cat.totalRevenue)}</td>
                      <td className="px-5 py-4 text-sm text-orange-600">{formatCurrency(cat.cashRevenue)} <span className="text-gray-400 text-xs">({cat.cashCount})</span></td>
                      <td className="px-5 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${Math.min(cashPct, 100)}%` }} />
                          </div>
                          <span className="text-xs font-medium">{cashPct.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-blue-600">{formatCurrency(cat.inAppRevenue)} <span className="text-gray-400 text-xs">({cat.inAppCount})</span></td>
                      <td className="px-5 py-4 text-sm font-medium text-green-700">{formatCurrency(cat.cashCommission)}</td>
                      <td className="px-5 py-4 text-sm">
                        {cat.disputedCount > 0
                          ? <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">{cat.disputedCount}</span>
                          : <span className="text-gray-400">—</span>
                        }
                      </td>
                    </tr>
                  );
                })}
                {/* Total row */}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-5 py-4 text-sm text-gray-700">Total services</td>
                  <td className="px-5 py-4 text-sm">{stats.services.total}</td>
                  <td className="px-5 py-4 text-sm text-gray-900">{formatCurrency(stats.services.totalRevenue)}</td>
                  <td className="px-5 py-4 text-sm text-orange-600">{formatCurrency(stats.services.cashRevenue)}</td>
                  <td className="px-5 py-4 text-sm">{stats.services.total > 0 ? (stats.services.cashCount / stats.services.total * 100).toFixed(0) : 0}%</td>
                  <td className="px-5 py-4 text-sm text-blue-600">{formatCurrency(stats.services.inAppRevenue)}</td>
                  <td className="px-5 py-4 text-sm text-green-700">{formatCurrency(stats.services.cashCommission)}</td>
                  <td className="px-5 py-4 text-sm text-red-600">{stats.services.disputedCount || '—'}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Marketplace par type */}
      {activeTab === 'marketplace_detail' && (
        <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
          {stats.marketplaceByType.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Aucune donnée marketplace</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Type / Catégorie produit', 'Commandes', 'Revenu total', 'Cash', 'In-App', '% Cash'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.marketplaceByType.map((mt) => {
                  const cashPct = mt.total > 0 ? (mt.cashCount / mt.total * 100) : 0;
                  return (
                    <tr key={mt.type} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-sm font-medium text-gray-900 capitalize">{mt.type || '—'}</td>
                      <td className="px-5 py-4 text-sm text-gray-700">{mt.total}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-900">{formatCurrency(mt.totalRevenue)}</td>
                      <td className="px-5 py-4 text-sm text-orange-600">{formatCurrency(mt.cashRevenue)} <span className="text-gray-400 text-xs">({mt.cashCount})</span></td>
                      <td className="px-5 py-4 text-sm text-blue-600">{formatCurrency(mt.inAppRevenue)} <span className="text-gray-400 text-xs">({mt.inAppCount})</span></td>
                      <td className="px-5 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${Math.min(cashPct, 100)}%` }} />
                          </div>
                          <span className="text-xs font-medium">{cashPct.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-5 py-4 text-sm text-gray-700">Total marketplace</td>
                  <td className="px-5 py-4 text-sm">{stats.marketplace.total}</td>
                  <td className="px-5 py-4 text-sm text-gray-900">{formatCurrency(stats.marketplace.totalRevenue)}</td>
                  <td className="px-5 py-4 text-sm text-orange-600">{formatCurrency(stats.marketplace.cashRevenue)}</td>
                  <td className="px-5 py-4 text-sm text-blue-600">{formatCurrency(stats.marketplace.inAppRevenue)}</td>
                  <td className="px-5 py-4 text-sm">{stats.marketplace.total > 0 ? (stats.marketplace.cashCount / stats.marketplace.total * 100).toFixed(0) : 0}%</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Classement chauffeurs */}
      {activeTab === 'drivers' && (
        <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
          <div className="p-5 border-b">
            <h2 className="text-lg font-semibold">Classement par taux de paiement sécurisé</h2>
            <p className="text-sm text-gray-500 mt-0.5">Badge à partir de 10 transports avec ≥ 90% in-app</p>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Rang', 'Chauffeur', 'Cash', 'In-App', 'Taux In-App', 'Badge', 'Alertes', 'Statut'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {driverStats.map((d, i) => (
                <tr key={d.driverId} className="hover:bg-gray-50">
                  <td className="px-5 py-4 text-sm font-semibold text-gray-700">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-900">{d.driverName}</td>
                  <td className="px-5 py-4 text-sm text-orange-600 font-medium">{d.totalCash}</td>
                  <td className="px-5 py-4 text-sm text-blue-600 font-medium">{d.totalInApp}</td>
                  <td className="px-5 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.min(d.inAppRate, 100)}%` }} />
                      </div>
                      <span className="font-semibold">{d.inAppRate.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm">
                    {d.hasSecureBadge
                      ? <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">🏆 Sécurisé</span>
                      : <span className="text-gray-400 text-xs">—</span>
                    }
                  </td>
                  <td className="px-5 py-4 text-sm">
                    {d.cashFraudWarnings > 0
                      ? <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${d.cashFraudWarnings >= 3 ? 'bg-red-100 text-red-800' : d.cashFraudWarnings >= 2 ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          ⚠️ {d.cashFraudWarnings}
                        </span>
                      : <span className="text-gray-400 text-xs">Aucun</span>
                    }
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${d.status === 'active' ? 'bg-green-100 text-green-800' : d.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {d.status}
                    </span>
                    {d.isCashRestricted && <span className="ml-1 text-xs text-orange-600">🚫</span>}
                  </td>
                </tr>
              ))}
              {driverStats.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">Aucun chauffeur</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
