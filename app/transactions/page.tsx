'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';

interface Transaction {
  id: string;
  amount: number;
  paymentMethod: string;
  type: string;
  status: string;
  date: string;
}

interface DateRange {
  start: string | null;
  end: string | null;
  mode: 'range' | 'single';
  singleDate: string | null;
}

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
  isCashRestricted: boolean;
  user: { id: string; firstName: string; lastName: string; phone: string };
  transportRequests: CashRequest[];
}

interface CommissionData {
  drivers: DriverCommission[];
  totalPending: number;
}

const TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  transport: { label: 'Transport', className: 'bg-purple-100 text-purple-800' },
  booking: { label: 'Réservation', className: 'bg-green-100 text-green-800' },
  order: { label: 'Commande', className: 'bg-indigo-100 text-indigo-800' },
};

const METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  in_app: 'In-App',
  cash_on_delivery: 'Cash livraison',
  cash_on_pickup: 'Cash retrait',
};

const toDay = (dateStr: string) => dateStr ? new Date(dateStr).toLocaleDateString('en-CA') : '';

type Tab = 'transactions' | 'commissions';

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('transactions');

  // ── Transactions ──────────────────────────────────────────
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [temporalFilter, setTemporalFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null, mode: 'range', singleDate: null });

  // ── Commissions Cash ──────────────────────────────────────
  const [commissionData, setCommissionData] = useState<CommissionData | null>(null);
  const [loadingComm, setLoadingComm] = useState(false);
  const [collectingId, setCollectingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [blockingId, setBlockingId] = useState<string | null>(null);

  const { formatCurrency } = useCurrency();

  // ── Fetch transactions ────────────────────────────────────
  useEffect(() => {
    const fetch = () => {
      apiClient.get<Transaction[]>('/admin/transactions', { params: {} })
        .then((data: any) => setAllTransactions(Array.isArray(data) ? data : []))
        .catch(console.error)
        .finally(() => setLoadingTx(false));
    };
    setLoadingTx(true);
    fetch();
    const interval = setInterval(fetch, 10000);
    return () => clearInterval(interval);
  }, []);

  // ── Fetch commissions ─────────────────────────────────────
  const loadCommissions = useCallback(() => {
    setLoadingComm(true);
    apiClient.get('/admin/drivers/cash-commissions')
      .then((d: any) => setCommissionData(d))
      .catch(console.error)
      .finally(() => setLoadingComm(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'commissions') loadCommissions();
  }, [activeTab, loadCommissions]);

  // ── Transactions logic ────────────────────────────────────
  const todayStr = new Date().toLocaleDateString('en-CA');

  const getWeekRange = () => {
    const now = new Date();
    const day = now.getDay();
    const diffToMon = (day === 0 ? -6 : 1 - day);
    const mon = new Date(now); mon.setDate(now.getDate() + diffToMon);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    return { start: mon.toLocaleDateString('en-CA'), end: sun.toLocaleDateString('en-CA') };
  };

  const thisMonthPrefix = todayStr.slice(0, 7);

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
    let result = [...allTransactions];
    if (typeFilter !== 'all') result = result.filter(t => t.type === typeFilter);
    if (paymentFilter !== 'all') result = result.filter(t => t.paymentMethod === paymentFilter);
    if (temporalFilter !== 'all') {
      const week = getWeekRange();
      result = result.filter(t => {
        const d = toDay(t.date);
        switch (temporalFilter) {
          case 'today': return d === todayStr;
          case 'week': return d >= week.start && d <= week.end;
          case 'month': return d.startsWith(thisMonthPrefix);
          default: return true;
        }
      });
    }
    if (dateRange.start) result = result.filter(t => toDay(t.date) >= dateRange.start!);
    if (dateRange.end) result = result.filter(t => toDay(t.date) <= dateRange.end!);
    return result;
  }, [allTransactions, typeFilter, paymentFilter, temporalFilter, dateRange, todayStr, thisMonthPrefix]);

  const totalAmount = filteredTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const cashTotal = filteredTransactions.filter(t => t.paymentMethod === 'cash' || t.paymentMethod.startsWith('cash')).reduce((s, t) => s + t.amount, 0);
  const inAppTotal = filteredTransactions.filter(t => t.paymentMethod === 'in_app').reduce((s, t) => s + t.amount, 0);

  // ── Commission actions ────────────────────────────────────
  const handleCollect = async (driver: DriverCommission) => {
    if (!confirm(
      `Confirmer la collecte de ${formatCurrency(driver.pendingCashCommission)} ` +
      `auprès de ${driver.user.firstName} ${driver.user.lastName} (${driver.user.phone}) ?`
    )) return;
    setCollectingId(driver.id);
    try {
      await apiClient.post(`/admin/drivers/${driver.id}/collect-commission`, {});
      loadCommissions();
    } catch {
      alert('Erreur lors de l\'encaissement');
    } finally {
      setCollectingId(null);
    }
  };

  const handleBlockCash = async (driver: DriverCommission) => {
    if (driver.isCashRestricted) {
      if (!confirm(`Lever la restriction cash pour ${driver.user.firstName} ${driver.user.lastName} ?`)) return;
      setBlockingId(driver.id);
      try {
        await apiClient.patch(`/admin/users/${driver.user.id}/lift-cash-restriction`);
        loadCommissions();
      } catch {
        alert('Erreur lors de la levée de restriction');
      } finally {
        setBlockingId(null);
      }
    } else {
      if (!confirm(
        `Restreindre ${driver.user.firstName} ${driver.user.lastName} aux paiements in-app uniquement ` +
        `jusqu'au règlement de la commission (${formatCurrency(driver.pendingCashCommission)}) ?`
      )) return;
      setBlockingId(driver.id);
      try {
        await apiClient.patch(`/admin/users/${driver.user.id}/suspend-cash`);
        loadCommissions();
      } catch {
        alert('Erreur lors de la restriction');
      } finally {
        setBlockingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transactions & Commissions</h1>
        <p className="text-gray-600">Paiements et commissions de la plateforme</p>
      </div>

      {/* Onglets principaux */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'transactions' as Tab, label: 'Transactions in-app' },
          { key: 'commissions' as Tab, label: `Commissions cash${commissionData?.totalPending ? ` · ${formatCurrency(commissionData.totalPending)}` : ''}` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ═══════════════ TRANSACTIONS ═══════════════ */}
      {activeTab === 'transactions' && (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Volume affiché</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalAmount)}</p>
              <p className="text-xs text-gray-400 mt-1">{filteredTransactions.length} transactions</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Paiements Cash</h3>
              <p className="text-2xl font-bold text-orange-600 mt-2">{formatCurrency(cashTotal)}</p>
              <p className="text-xs text-gray-400 mt-1">{filteredTransactions.filter(t => t.paymentMethod === 'cash' || t.paymentMethod.startsWith('cash')).length} transactions</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Paiements In-App</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(inAppTotal)}</p>
              <p className="text-xs text-gray-400 mt-1">{filteredTransactions.filter(t => t.paymentMethod === 'in_app').length} transactions</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <div className="grid grid-cols-2 sm:flex sm:space-x-1 gap-1 sm:gap-0 bg-gray-100 p-1 rounded-lg">
              {[
                { key: 'all', label: `Toutes (${temporalCounts.all})` },
                { key: 'today', label: `Aujourd'hui (${temporalCounts.today})` },
                { key: 'week', label: `Cette semaine (${temporalCounts.week})` },
                { key: 'month', label: `Ce mois (${temporalCounts.month})` },
              ].map(({ key, label }) => (
                <button key={key} onClick={() => setTemporalFilter(key as typeof temporalFilter)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors text-center ${
                    temporalFilter === key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}>{label}</button>
              ))}
            </div>
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
                  onChange={e => setDateRange(prev => ({ ...prev, singleDate: e.target.value, start: e.target.value, end: e.target.value }))}
                  className="border rounded-lg px-3 py-2 text-sm bg-white border-gray-300 w-full sm:w-auto" />
              ) : (
                <div className="flex items-center gap-2">
                  <input type="date" value={dateRange.start || ''}
                    onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="border rounded-lg px-3 py-2 text-sm bg-white border-gray-300" />
                  <span className="text-gray-500 text-sm">à</span>
                  <input type="date" value={dateRange.end || ''}
                    onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="border rounded-lg px-3 py-2 text-sm bg-white border-gray-300" />
                </div>
              )}
              {((dateRange.mode === 'single' && dateRange.singleDate) || (dateRange.mode === 'range' && (dateRange.start || dateRange.end))) && (
                <button onClick={() => setDateRange({ start: null, end: null, mode: dateRange.mode, singleDate: null })}
                  className="text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap">Réinitialiser</button>
              )}
            </div>
            <div className="flex gap-4">
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="all">Tous types</option>
                <option value="transport">Transport</option>
                <option value="booking">Réservation</option>
                <option value="order">Commande</option>
              </select>
              <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="all">Tous paiements</option>
                <option value="cash">Cash</option>
                <option value="in_app">In-App</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loadingTx ? (
              <div className="text-center py-12">Chargement...</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['ID', 'Type', 'Montant', 'Paiement', 'Date'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">Aucune transaction trouvée</td></tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono text-gray-500">{tx.id.slice(0, 8)}...</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${TYPE_CONFIG[tx.type]?.className ?? 'bg-gray-100 text-gray-800'}`}>
                            {TYPE_CONFIG[tx.type]?.label ?? tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(tx.amount)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${tx.paymentMethod === 'cash' || tx.paymentMethod.startsWith('cash') ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                            {METHOD_LABELS[tx.paymentMethod] ?? tx.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(tx.date)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {!loadingTx && (
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">
                {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''} affichée{filteredTransactions.length > 1 ? 's' : ''}
                {filteredTransactions.length !== allTransactions.length && ` (sur ${allTransactions.length} au total)`}
              </p>
            </div>
          )}
        </>
      )}

      {/* ═══════════════ COMMISSIONS CASH ═══════════════ */}
      {activeTab === 'commissions' && (
        <>
          {loadingComm ? (
            <div className="text-center py-12">Chargement...</div>
          ) : (
            <>
              {/* Résumé */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500">Total en attente</h3>
                  <p className="text-2xl font-bold text-orange-600 mt-2">{formatCurrency(commissionData?.totalPending ?? 0)}</p>
                  <p className="text-xs text-gray-400 mt-1">{commissionData?.drivers.length ?? 0} prestataire(s)</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500">Taux transport</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-2">10%</p>
                  <p className="text-xs text-gray-400 mt-1">Appliqué à chaque paiement cash validé</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
                  <h3 className="text-sm font-medium text-gray-500">Mécanisme de recouvrement</h3>
                  <p className="text-xs text-gray-600 mt-2">
                    La restriction cash bloque le prestataire sur les paiements in-app jusqu'au règlement.
                  </p>
                </div>
              </div>

              {/* Liste */}
              {(commissionData?.drivers ?? []).length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                  ✅ Aucune commission cash en attente
                </div>
              ) : (
                <div className="space-y-4">
                  {(commissionData?.drivers ?? []).map((driver) => (
                    <div key={driver.id} className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="flex flex-wrap items-center justify-between gap-4 p-4">
                        <div className="flex items-center gap-6">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{driver.user.firstName} {driver.user.lastName}</span>
                              {driver.isCashRestricted && (
                                <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full font-medium">Restreint</span>
                              )}
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
                          <button
                            onClick={() => setExpandedId(expandedId === driver.id ? null : driver.id)}
                            className="px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50"
                          >
                            {expandedId === driver.id ? 'Masquer' : `Détail (${driver.transportRequests.length})`}
                          </button>
                          <button
                            onClick={() => handleBlockCash(driver)}
                            disabled={blockingId === driver.id}
                            className={`px-3 py-1.5 text-sm rounded-md disabled:opacity-50 ${
                              driver.isCashRestricted
                                ? 'text-gray-700 border border-gray-300 bg-gray-100 hover:bg-gray-200'
                                : 'text-orange-700 border border-orange-300 bg-orange-50 hover:bg-orange-100'
                            }`}
                          >
                            {blockingId === driver.id ? '…' : driver.isCashRestricted ? '🔓 Lever restriction' : '🔒 Restreindre cash'}
                          </button>
                          <button
                            onClick={() => handleCollect(driver)}
                            disabled={collectingId === driver.id}
                            className="px-3 py-1.5 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                          >
                            {collectingId === driver.id ? '…' : '✓ Marquer encaissé'}
                          </button>
                        </div>
                      </div>

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
            </>
          )}
        </>
      )}
    </div>
  );
}
