'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';
import { useSettings } from '@/contexts/SettingsContext';

// ── Types ────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string;
  amount: number;
  paymentMethod: string;
  type: string;
  status: string;
  date: string;
  participant: string | null;
  categoryLabel: string | null;
  categorySlug: string | null;
  reference: string | null;
}

interface ServiceCategory {
  id: string;
  nameFr: string;
  slug: string;
}

interface DateRange {
  start: string | null;
  end: string | null;
  mode: 'range' | 'single';
  singleDate: string | null;
}

interface CashTransportReq {
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
  vehiclePlate: string;
  isCashRestricted: boolean;
  user: { id: string; firstName: string; lastName: string; phone: string };
  transportRequests: CashTransportReq[];
}

interface DriverCommissionData { drivers: DriverCommission[]; totalPending: number; }

interface CashBooking {
  id: string;
  finalPrice: number | null;
  cashCommissionRate: number | null;
  cashCommissionAmount: number | null;
  cashNetAmount: number | null;
  address: string;
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
  bookings: CashBooking[];
}

interface ProCommissionData { pros: ProCommission[]; totalPending: number; }

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; className: string; icon: string }> = {
  transport: { label: 'Transport',   className: 'bg-purple-100 text-purple-800', icon: '🚚' },
  booking:   { label: 'Réservation', className: 'bg-green-100 text-green-800',   icon: '🔧' },
  order:     { label: 'Commande',    className: 'bg-indigo-100 text-indigo-800',  icon: '🛍️' },
};

const METHOD_LABELS: Record<string, string> = {
  cash: 'Cash', in_app: 'In-App', cash_on_delivery: 'Cash livraison', cash_on_pickup: 'Cash retrait',
};

const toDay = (d: string) => d ? new Date(d).toLocaleDateString('en-CA') : '';
type MainTab = 'transactions' | 'commissions';
type CommTab = 'drivers' | 'pros';

// ── Component ─────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const [mainTab, setMainTab] = useState<MainTab>('transactions');
  const [commTab, setCommTab] = useState<CommTab>('drivers');

  // transactions state
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [temporalFilter, setTemporalFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null, mode: 'range', singleDate: null });

  // commissions state
  const [driverData, setDriverData] = useState<DriverCommissionData | null>(null);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [collectingDriverId, setCollectingDriverId] = useState<string | null>(null);
  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);
  const [blockingId, setBlockingId] = useState<string | null>(null);
  const [proData, setProData] = useState<ProCommissionData | null>(null);
  const [loadingPros, setLoadingPros] = useState(false);
  const [expandedProId, setExpandedProId] = useState<string | null>(null);
  const [collectingProId, setCollectingProId] = useState<string | null>(null);
  const [blockingProId, setBlockingProId] = useState<string | null>(null);

  const { formatCurrency } = useCurrency();
  const { settings } = useSettings();
  const transportRate = settings?.commissionRates?.['moving_transport']?.standard ?? 10;

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Load service categories once
    apiClient.get('/admin/service-categories')
      .then((data: any) => setServiceCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetch = () => {
      const params: Record<string, string> = {};
      if (categoryFilter !== 'all') params.categorySlug = categoryFilter;
      apiClient.get<Transaction[]>('/admin/transactions', { params })
        .then((data: any) => setAllTransactions(Array.isArray(data) ? data : []))
        .catch(console.error)
        .finally(() => setLoadingTx(false));
    };
    setLoadingTx(true);
    fetch();
    const iv = setInterval(fetch, 10000);
    return () => clearInterval(iv);
  }, [categoryFilter]);

  const loadDriverCommissions = useCallback(() => {
    setLoadingDrivers(true);
    apiClient.get('/admin/drivers/cash-commissions')
      .then((d: any) => setDriverData(d))
      .catch(console.error)
      .finally(() => setLoadingDrivers(false));
  }, []);

  const loadProCommissions = useCallback(() => {
    setLoadingPros(true);
    apiClient.get('/admin/pros/cash-commissions')
      .then((d: any) => setProData(d))
      .catch(console.error)
      .finally(() => setLoadingPros(false));
  }, []);

  useEffect(() => {
    if (mainTab !== 'commissions') return;
    if (commTab === 'drivers') loadDriverCommissions();
    else loadProCommissions();
  }, [mainTab, commTab, loadDriverCommissions, loadProCommissions]);

  // ── Filters ────────────────────────────────────────────────────────────────
  const todayStr = new Date().toLocaleDateString('en-CA');
  const thisMonthPrefix = todayStr.slice(0, 7);

  const getWeekRange = () => {
    const now = new Date();
    const diff = now.getDay() === 0 ? -6 : 1 - now.getDay();
    const mon = new Date(now); mon.setDate(now.getDate() + diff);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    return { start: mon.toLocaleDateString('en-CA'), end: sun.toLocaleDateString('en-CA') };
  };

  const temporalCounts = useMemo(() => {
    const week = getWeekRange();
    return {
      all: allTransactions.length,
      today: allTransactions.filter(t => toDay(t.date) === todayStr).length,
      week: allTransactions.filter(t => { const d = toDay(t.date); return d >= week.start && d <= week.end; }).length,
      month: allTransactions.filter(t => toDay(t.date).startsWith(thisMonthPrefix)).length,
    };
  }, [allTransactions, todayStr, thisMonthPrefix]);

  const filteredTransactions = useMemo(() => {
    let r = [...allTransactions];
    if (typeFilter !== 'all') r = r.filter(t => t.type === typeFilter);
    if (paymentFilter !== 'all') r = r.filter(t => t.paymentMethod === paymentFilter);
    if (temporalFilter !== 'all') {
      const week = getWeekRange();
      r = r.filter(t => {
        const d = toDay(t.date);
        if (temporalFilter === 'today') return d === todayStr;
        if (temporalFilter === 'week')  return d >= week.start && d <= week.end;
        if (temporalFilter === 'month') return d.startsWith(thisMonthPrefix);
        return true;
      });
    }
    if (dateRange.start) r = r.filter(t => toDay(t.date) >= dateRange.start!);
    if (dateRange.end)   r = r.filter(t => toDay(t.date) <= dateRange.end!);
    return r;
  }, [allTransactions, typeFilter, paymentFilter, temporalFilter, dateRange, todayStr, thisMonthPrefix]);

  const totalAmount = filteredTransactions.reduce((s, tx) => s + tx.amount, 0);
  const cashTotal   = filteredTransactions.filter(t => t.paymentMethod === 'cash' || t.paymentMethod.startsWith('cash')).reduce((s, t) => s + t.amount, 0);
  const inAppTotal  = filteredTransactions.filter(t => t.paymentMethod === 'in_app').reduce((s, t) => s + t.amount, 0);

  // Stats par type
  const statsByType = useMemo(() => {
    const r: Record<string, { count: number; total: number }> = {};
    for (const tx of filteredTransactions) {
      if (!r[tx.type]) r[tx.type] = { count: 0, total: 0 };
      r[tx.type].count++;
      r[tx.type].total += tx.amount;
    }
    return r;
  }, [filteredTransactions]);

  // ── Driver actions ─────────────────────────────────────────────────────────
  const handleCollectDriver = async (driver: DriverCommission) => {
    if (!confirm(`Confirmer la collecte de ${formatCurrency(driver.pendingCashCommission)} auprès de ${driver.user.firstName} ${driver.user.lastName} ?`)) return;
    setCollectingDriverId(driver.id);
    try { await apiClient.post(`/admin/drivers/${driver.id}/collect-commission`, {}); loadDriverCommissions(); }
    catch { alert('Erreur lors de l\'encaissement'); }
    finally { setCollectingDriverId(null); }
  };

  const handleBlockDriver = async (driver: DriverCommission) => {
    if (driver.isCashRestricted) {
      if (!confirm(`Lever la restriction cash pour ${driver.user.firstName} ?`)) return;
      setBlockingId(driver.id);
      try { await apiClient.patch(`/admin/users/${driver.user.id}/lift-cash-restriction`); loadDriverCommissions(); }
      catch { alert('Erreur'); } finally { setBlockingId(null); }
    } else {
      if (!confirm(`Restreindre ${driver.user.firstName} ${driver.user.lastName} aux paiements in-app ?`)) return;
      setBlockingId(driver.id);
      try { await apiClient.patch(`/admin/users/${driver.user.id}/suspend-cash`); loadDriverCommissions(); }
      catch { alert('Erreur'); } finally { setBlockingId(null); }
    }
  };

  // ── Pro actions ────────────────────────────────────────────────────────────
  const handleCollectPro = async (pro: ProCommission) => {
    if (!confirm(`Confirmer la collecte de ${formatCurrency(pro.totalCommission)} auprès de ${pro.proName} ?`)) return;
    setCollectingProId(pro.proId);
    try { await apiClient.post(`/admin/pros/${pro.proId}/collect-commission`, {}); loadProCommissions(); }
    catch { alert('Erreur lors de l\'encaissement'); }
    finally { setCollectingProId(null); }
  };

  const handleBlockPro = async (pro: ProCommission) => {
    if (pro.isCashRestricted) {
      if (!confirm(`Lever la restriction cash pour ${pro.proName} ?`)) return;
      setBlockingProId(pro.proId);
      try { await apiClient.post(`/admin/pros/${pro.proId}/lift-cash-restriction`, {}); loadProCommissions(); }
      catch { alert('Erreur'); } finally { setBlockingProId(null); }
    } else {
      if (!confirm(`Restreindre ${pro.proName} aux paiements in-app ?`)) return;
      setBlockingProId(pro.proId);
      try { await apiClient.post(`/admin/pros/${pro.proId}/restrict-cash`, {}); loadProCommissions(); }
      catch { alert('Erreur'); } finally { setBlockingProId(null); }
    }
  };

  const totalCommPending = (driverData?.totalPending ?? 0) + (proData?.totalPending ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transactions & Commissions</h1>
        <p className="text-gray-600">Toutes les activités financières : transport, services & marketplace</p>
      </div>

      {/* Onglets principaux */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {([
          { key: 'transactions', label: 'Transactions' },
          { key: 'commissions',  label: `Commissions cash${totalCommPending > 0 ? ` · ${formatCurrency(totalCommPending)}` : ''}` },
        ] as { key: MainTab; label: string }[]).map(({ key, label }) => (
          <button key={key} onClick={() => setMainTab(key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mainTab === key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ═══ TRANSACTIONS ═══ */}
      {mainTab === 'transactions' && (
        <>
          {/* KPIs */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-white rounded-lg shadow p-5">
              <p className="text-sm text-gray-500">Volume total affiché</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalAmount)}</p>
              <p className="text-xs text-gray-400 mt-0.5">{filteredTransactions.length} transactions</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5">
              <p className="text-sm text-gray-500">Cash</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(cashTotal)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5">
              <p className="text-sm text-gray-500">In-App</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(inAppTotal)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5">
              <p className="text-sm text-gray-500 mb-1">Répartition</p>
              {(['transport', 'booking', 'order'] as const).map(t => {
                const cfg = TYPE_CONFIG[t];
                const s = statsByType[t];
                if (!s) return null;
                return (
                  <div key={t} className="flex justify-between text-xs mt-0.5">
                    <span className="text-gray-500">{cfg.icon} {cfg.label}</span>
                    <span className="font-medium">{formatCurrency(s.total)} <span className="text-gray-400">({s.count})</span></span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            {/* Périodes */}
            <div className="grid grid-cols-2 sm:flex sm:space-x-1 gap-1 sm:gap-0 bg-gray-100 p-1 rounded-lg">
              {([
                { key: 'all',   label: `Toutes (${temporalCounts.all})`         },
                { key: 'today', label: `Aujourd'hui (${temporalCounts.today})`   },
                { key: 'week',  label: `Cette semaine (${temporalCounts.week})`  },
                { key: 'month', label: `Ce mois (${temporalCounts.month})`       },
              ] as { key: typeof temporalFilter; label: string }[]).map(({ key, label }) => (
                <button key={key} onClick={() => setTemporalFilter(key)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors text-center ${temporalFilter === key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white/50'}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Plage de dates */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-sm text-gray-500 shrink-0">Date :</span>
              <select value={dateRange.mode}
                onChange={(e) => setDateRange({ start: null, end: null, mode: e.target.value as 'range' | 'single', singleDate: null })}
                className="border rounded-lg px-3 py-2 text-sm bg-white border-gray-300 w-full sm:w-auto">
                <option value="range">Période</option>
                <option value="single">Date unique</option>
              </select>
              {dateRange.mode === 'single' ? (
                <input type="date" value={dateRange.singleDate || ''}
                  onChange={e => setDateRange(p => ({ ...p, singleDate: e.target.value, start: e.target.value, end: e.target.value }))}
                  className="border rounded-lg px-3 py-2 text-sm bg-white border-gray-300 w-full sm:w-auto" />
              ) : (
                <div className="flex items-center gap-2">
                  <input type="date" value={dateRange.start || ''}
                    onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))}
                    className="border rounded-lg px-3 py-2 text-sm bg-white border-gray-300" />
                  <span className="text-gray-500 text-sm">à</span>
                  <input type="date" value={dateRange.end || ''}
                    onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))}
                    className="border rounded-lg px-3 py-2 text-sm bg-white border-gray-300" />
                </div>
              )}
              {((dateRange.mode === 'single' && dateRange.singleDate) || (dateRange.mode === 'range' && (dateRange.start || dateRange.end))) && (
                <button onClick={() => setDateRange({ start: null, end: null, mode: dateRange.mode, singleDate: null })}
                  className="text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap">Réinitialiser</button>
              )}
            </div>

            {/* Filtres type, paiement, catégorie */}
            <div className="flex flex-wrap gap-3">
              <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); if (e.target.value !== 'booking' && e.target.value !== 'all') setCategoryFilter('all'); }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="all">Tous types</option>
                <option value="transport">🚚 Transport</option>
                <option value="booking">🔧 Réservation service</option>
                <option value="order">🛍️ Commande marketplace</option>
              </select>
              <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="all">Tous paiements</option>
                <option value="cash">Cash</option>
                <option value="in_app">In-App</option>
              </select>
              {(typeFilter === 'all' || typeFilter === 'booking') && serviceCategories.length > 0 && (
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="all">Toutes catégories</option>
                  {serviceCategories.map(c => (
                    <option key={c.slug} value={c.slug}>{c.nameFr}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Table transactions */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            {loadingTx ? (
              <div className="text-center py-12">Chargement...</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['ID', 'Type & catégorie', 'Participant', 'Référence', 'Montant', 'Paiement', 'Date'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">Aucune transaction trouvée</td></tr>
                  ) : filteredTransactions.map((tx) => {
                    const cfg = TYPE_CONFIG[tx.type];
                    return (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 text-xs font-mono text-gray-400">{tx.id.slice(0, 8)}…</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cfg?.className ?? 'bg-gray-100 text-gray-800'}`}>
                            {cfg?.icon} {cfg?.label ?? tx.type}
                          </span>
                          {tx.categoryLabel && (
                            <div className="text-xs text-gray-500 mt-0.5">{tx.categoryLabel}</div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-700">{tx.participant || <span className="text-gray-300">—</span>}</td>
                        <td className="px-5 py-4 text-xs text-gray-500 max-w-[160px] truncate">{tx.reference || '—'}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-gray-900">{formatCurrency(tx.amount)}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${tx.paymentMethod === 'cash' || tx.paymentMethod.startsWith('cash') ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                            {METHOD_LABELS[tx.paymentMethod] ?? tx.paymentMethod}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDateTime(tx.date)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!loadingTx && (
            <p className="text-sm text-gray-500">
              {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''} affichée{filteredTransactions.length > 1 ? 's' : ''}
              {filteredTransactions.length !== allTransactions.length && ` (sur ${allTransactions.length} au total)`}
            </p>
          )}
        </>
      )}

      {/* ═══ COMMISSIONS CASH ═══ */}
      {mainTab === 'commissions' && (
        <>
          {/* Sous-onglets */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6">
              {([
                { key: 'drivers', label: `🚚 Chauffeurs${driverData?.totalPending ? ` · ${formatCurrency(driverData.totalPending)}` : ''}` },
                { key: 'pros',    label: `🔧 Prestataires services${proData?.totalPending ? ` · ${formatCurrency(proData.totalPending)}` : ''}` },
              ] as { key: CommTab; label: string }[]).map(({ key, label }) => (
                <button key={key} onClick={() => setCommTab(key)}
                  className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${commTab === key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* ── Chauffeurs ── */}
          {commTab === 'drivers' && (
            <>
              {loadingDrivers ? <div className="text-center py-12">Chargement...</div> : (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="bg-white rounded-lg shadow p-5">
                      <p className="text-sm text-gray-500">Total en attente</p>
                      <p className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(driverData?.totalPending ?? 0)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{driverData?.drivers.length ?? 0} chauffeur(s)</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-5">
                      <p className="text-sm text-gray-500">Taux transport</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{transportRate}%</p>
                      <p className="text-xs text-gray-400 mt-0.5">Appliqué sur chaque paiement cash validé</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-5">
                      <p className="text-sm text-gray-500">Recouvrement</p>
                      <p className="text-xs text-gray-600 mt-2">La restriction cash bloque le chauffeur sur paiements in-app jusqu'au règlement de sa dette.</p>
                    </div>
                  </div>

                  {(driverData?.drivers ?? []).length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">✅ Aucune commission chauffeur en attente</div>
                  ) : (
                    <div className="space-y-4">
                      {(driverData?.drivers ?? []).map((driver) => (
                        <div key={driver.id} className="bg-white rounded-lg shadow overflow-hidden">
                          <div className="flex flex-wrap items-center justify-between gap-4 p-4">
                            <div className="flex items-center gap-6">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{driver.user.firstName} {driver.user.lastName}</span>
                                  {driver.isCashRestricted && <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">Restreint</span>}
                                </div>
                                <div className="text-sm text-gray-500">{driver.user.phone} · {driver.vehiclePlate}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xl font-bold text-orange-600">{formatCurrency(driver.pendingCashCommission)}</div>
                                <div className="text-xs text-gray-400">en attente</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-medium text-green-600">{formatCurrency(driver.totalCashCommissionPaid)}</div>
                                <div className="text-xs text-gray-400">collecté</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <button onClick={() => setExpandedDriverId(expandedDriverId === driver.id ? null : driver.id)}
                                className="px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50">
                                {expandedDriverId === driver.id ? 'Masquer' : `Détail (${driver.transportRequests.length})`}
                              </button>
                              <button onClick={() => handleBlockDriver(driver)} disabled={blockingId === driver.id}
                                className={`px-3 py-1.5 text-sm rounded-md disabled:opacity-50 ${driver.isCashRestricted ? 'text-gray-700 border border-gray-300 bg-gray-100 hover:bg-gray-200' : 'text-orange-700 border border-orange-300 bg-orange-50 hover:bg-orange-100'}`}>
                                {blockingId === driver.id ? '…' : driver.isCashRestricted ? '🔓 Lever restriction' : '🔒 Restreindre cash'}
                              </button>
                              <button onClick={() => handleCollectDriver(driver)} disabled={collectingDriverId === driver.id}
                                className="px-3 py-1.5 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50">
                                {collectingDriverId === driver.id ? '…' : '✓ Marquer encaissé'}
                              </button>
                            </div>
                          </div>
                          {expandedDriverId === driver.id && (
                            <div className="border-t overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                  <tr>{['Date', 'Trajet', 'Brut', `Comm. (${transportRate}%)`, 'Net chauffeur'].map(h => (
                                    <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                                  ))}</tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {driver.transportRequests.map(req => (
                                    <tr key={req.id} className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-500">{req.cashPaymentConfirmedAt ? formatDateTime(req.cashPaymentConfirmedAt) : '—'}</td>
                                      <td className="px-4 py-3 text-sm max-w-xs">
                                        <div className="truncate text-gray-700">📍 {req.pickupAddress}</div>
                                        <div className="truncate text-gray-500">🏁 {req.deliveryAddress}</div>
                                      </td>
                                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(req.totalPrice)}</td>
                                      <td className="px-4 py-3 text-sm font-medium text-orange-600">{req.cashCommissionAmount != null ? formatCurrency(req.cashCommissionAmount) : '—'}</td>
                                      <td className="px-4 py-3 text-sm font-medium text-green-600">{req.cashNetAmount != null ? formatCurrency(req.cashNetAmount) : '—'}</td>
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
                </>
              )}
            </>
          )}

          {/* ── Prestataires ── */}
          {commTab === 'pros' && (
            <>
              {loadingPros ? <div className="text-center py-12">Chargement...</div> : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-white rounded-lg shadow p-5">
                      <p className="text-sm text-gray-500">Total commissions services</p>
                      <p className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(proData?.totalPending ?? 0)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{proData?.pros.length ?? 0} prestataire(s) concerné(s)</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-5">
                      <p className="text-sm text-gray-500">Taux par catégorie</p>
                      <p className="text-xs text-gray-600 mt-2">Les taux de commission varient selon la catégorie de service (définis dans les paramètres plateforme). Le montant affiché par réservation est calculé au moment de la confirmation.</p>
                    </div>
                  </div>

                  {(proData?.pros ?? []).length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">✅ Aucune commission prestataire en attente</div>
                  ) : (
                    <div className="space-y-4">
                      {(proData?.pros ?? []).map((pro) => (
                        <div key={pro.proId} className="bg-white rounded-lg shadow overflow-hidden">
                          <div className="flex flex-wrap items-center justify-between gap-4 p-4">
                            <div className="flex items-center gap-6">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{pro.proName}</span>
                                  {pro.isCashRestricted && <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">Cash restreint</span>}
                                </div>
                                <div className="text-sm text-gray-500">{pro.phone}</div>
                                {pro.serviceCategories.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {pro.serviceCategories.slice(0, 4).map(cat => (
                                      <span key={cat} className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">{cat}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="text-center">
                                <div className="text-xl font-bold text-orange-600">{formatCurrency(pro.totalCommission)}</div>
                                <div className="text-xs text-gray-400">commission totale</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-medium text-gray-700">{pro.bookings.length}</div>
                                <div className="text-xs text-gray-400">réservation(s)</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <button onClick={() => setExpandedProId(expandedProId === pro.proId ? null : pro.proId)}
                                className="px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50">
                                {expandedProId === pro.proId ? 'Masquer' : `Détail (${pro.bookings.length})`}
                              </button>
                              <button onClick={() => handleBlockPro(pro)} disabled={blockingProId === pro.proId}
                                className={`px-3 py-1.5 text-sm rounded-md disabled:opacity-50 ${pro.isCashRestricted ? 'text-gray-700 border border-gray-300 bg-gray-100 hover:bg-gray-200' : 'text-orange-700 border border-orange-300 bg-orange-50 hover:bg-orange-100'}`}>
                                {blockingProId === pro.proId ? '…' : pro.isCashRestricted ? '🔓 Lever restriction' : '🔒 Restreindre cash'}
                              </button>
                              <button onClick={() => handleCollectPro(pro)} disabled={collectingProId === pro.proId}
                                className="px-3 py-1.5 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50">
                                {collectingProId === pro.proId ? '…' : '✓ Marquer encaissé'}
                              </button>
                            </div>
                          </div>
                          {expandedProId === pro.proId && (
                            <div className="border-t overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                  <tr>{['Date', 'Adresse', 'Prix final', 'Taux', 'Commission', 'Net pro'].map(h => (
                                    <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                                  ))}</tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {pro.bookings.map(b => (
                                    <tr key={b.id} className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDateTime(b.updatedAt)}</td>
                                      <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">📍 {b.address}</td>
                                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{b.finalPrice != null ? formatCurrency(b.finalPrice) : '—'}</td>
                                      <td className="px-4 py-3 text-sm text-gray-500">{b.cashCommissionRate != null ? `${b.cashCommissionRate}%` : '—'}</td>
                                      <td className="px-4 py-3 text-sm font-medium text-orange-600">{b.cashCommissionAmount != null ? formatCurrency(b.cashCommissionAmount) : '—'}</td>
                                      <td className="px-4 py-3 text-sm font-medium text-green-600">{b.cashNetAmount != null ? formatCurrency(b.cashNetAmount) : '—'}</td>
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
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
