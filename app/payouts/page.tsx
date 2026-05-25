'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PayoutAccount {
  id: string;
  accountType: string;
  country: string;
  accountHolderName: string;
  accountDetails: Record<string, string>;
  isDefault: boolean;
  isVerified: boolean;
}

interface Payout {
  id: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  status: string;
  payoutMethod: string | null;
  driverId: string | null;
  proId: string | null;
  sellerId: string | null;
  driver?: {
    user: { firstName: string; lastName: string; phone: string };
    payoutAccounts?: PayoutAccount[];
  } | null;
  pro?: {
    user: { firstName: string; lastName: string; phone: string };
    payoutAccounts?: PayoutAccount[];
  } | null;
  seller?: {
    user: { firstName: string; lastName: string; phone: string };
    payoutAccounts?: PayoutAccount[];
  } | null;
  payment?: { id: string; paymentProvider: string; amount: number; createdAt: string } | null;
  payoutAccount?: PayoutAccount | null;
  processedAt: string | null;
  processedByEmail: string | null;
  adminNotes: string | null;
  createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:    { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'En cours',   color: 'bg-blue-100 text-blue-800' },
  paid:       { label: 'Versé',      color: 'bg-green-100 text-green-800' },
  failed:     { label: 'Échoué',     color: 'bg-red-100 text-red-800' },
};

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  bank_transfer:      'Virement bancaire',
  instapay:           'InstaPay',
  vodafone_cash:      'Vodafone Cash',
  orange_cash:        'Orange Cash',
  etisalat_cash:      'E& Cash',
  fawry:              'Fawry',
  aman:               'Aman',
  orange_money:       'Orange Money',
  inwi_money:         'Inwi Money',
  barid_cash:         'Barid Cash',
  cih_money:          'CIH Money',
  wafacash:           'Wafacash',
  poste_tunisienne:   'Poste Tunisienne',
  ooredoo_money:      'Ooredoo Money',
  temtem:             'Temtem',
  wave:               'Wave',
  free_money:         'Free Money',
  mtn_momo:           'MTN MoMo',
  moov_money:         'Moov Money',
  stc_pay:            'STC Pay',
  sadad:              'SADAD',
  etisalat_wallet:    'E& Wallet',
};

function AccountBadge({ account, onVerify, verifying }: {
  account: PayoutAccount;
  onVerify?: (id: string) => void;
  verifying?: boolean;
}) {
  const label = ACCOUNT_TYPE_LABELS[account.accountType] ?? account.accountType;
  const details = account.accountDetails as Record<string, string>;
  const detail = details.ipaAddress ?? details.phoneNumber ?? details.iban ?? details.accountNumber ?? '';
  return (
    <div className="inline-flex flex-col gap-1">
      <div className={`text-xs px-2 py-1 rounded inline-flex items-center gap-1 ${account.isVerified ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
        <span className="font-medium">{label}</span>
        {detail && <span className="opacity-70">{detail}</span>}
        {account.isVerified ? (
          <span title="Vérifié">✓</span>
        ) : (
          <span title="Non vérifié">⏳</span>
        )}
      </div>
      {!account.isVerified && onVerify && (
        <button
          onClick={() => onVerify(account.id)}
          disabled={verifying}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 text-left"
        >
          {verifying ? 'Vérification…' : '✓ Marquer comme vérifié'}
        </button>
      )}
    </div>
  );
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [modal, setModal] = useState<{ payout: Payout } | null>(null);
  const [modalNotes, setModalNotes] = useState('');
  const [modalAccountId, setModalAccountId] = useState<string>('');

  const load = useCallback(() => {
    setLoading(true);
    const params: any = { page: 1, limit: 50 };
    if (statusFilter !== 'all') params.status = statusFilter;
    apiClient
      .get('/payouts/admin', { params })
      .then((data: any) => {
        setPayouts(data.payouts ?? []);
        setTotal(data.total ?? 0);
        setSelected(new Set());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openModal = (payout: Payout) => {
    setModal({ payout });
    setModalNotes('');
    const accounts = payout.driver?.payoutAccounts ?? payout.pro?.payoutAccounts ?? payout.seller?.payoutAccounts ?? [];
    const defaultAcc = accounts.find((a) => a.isDefault) ?? accounts[0];
    setModalAccountId(defaultAcc?.id ?? '');
  };

  const handleMarkPaid = async () => {
    if (!modal) return;
    setProcessing(true);
    try {
      await apiClient.post(`/payouts/admin/${modal.payout.id}/mark-paid`, {
        notes: modalNotes || undefined,
        payoutAccountId: modalAccountId || undefined,
      });
      setModal(null);
      load();
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyAccount = async (accountId: string) => {
    setVerifying(accountId);
    try {
      await apiClient.post(`/payout-accounts/admin/${accountId}/verify`, {});
      load();
    } finally {
      setVerifying(null);
    }
  };

  const handleBatchPaid = async () => {
    if (selected.size === 0) return;
    setProcessing(true);
    try {
      const res: any = await apiClient.post('/payouts/admin/batch/mark-paid', { ids: Array.from(selected) });
      alert(`${res.succeeded} versement(s) marqué(s) comme payés. ${res.failed} échec(s).`);
      load();
    } finally {
      setProcessing(false);
    }
  };

  const toggleSelect = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleAll = () => {
    if (selected.size === payouts.length) setSelected(new Set());
    else setSelected(new Set(payouts.map((p) => p.id)));
  };

  const beneficiaryName = (p: Payout) => {
    const u = p.driver?.user ?? p.pro?.user ?? p.seller?.user;
    return u ? `${u.firstName} ${u.lastName}` : '—';
  };

  const beneficiaryType = (p: Payout) =>
    p.driverId ? 'Chauffeur' : p.proId ? 'Pro' : p.sellerId ? 'Vendeur' : '—';

  const getAccounts = (p: Payout): PayoutAccount[] =>
    p.driver?.payoutAccounts ?? p.pro?.payoutAccounts ?? p.seller?.payoutAccounts ?? [];

  const pendingTotal = payouts.filter((p) => p.status === 'pending').reduce((acc, p) => acc + p.netAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Versements prestataires</h1>
        <p className="text-gray-600">Règlements après déduction de la commission plateforme</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total versements</p>
          <p className="text-2xl font-bold text-gray-900">{total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Montant en attente</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingTotal.toFixed(2)} EGP</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Sélectionnés</p>
          <p className="text-2xl font-bold text-blue-600">{selected.size}</p>
        </div>
      </div>

      {/* Filters + bulk */}
      <div className="flex gap-4 items-center flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="processing">En cours</option>
          <option value="paid">Versés</option>
          <option value="failed">Échoués</option>
        </select>
        {selected.size > 0 && (
          <button
            onClick={handleBatchPaid}
            disabled={processing}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
          >
            ✅ Marquer {selected.size} comme versé(s) (compte par défaut)
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Chargement…</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3">
                  <input type="checkbox" checked={selected.size === payouts.length && payouts.length > 0} onChange={toggleAll} className="rounded" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bénéficiaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coordonnées bancaires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant brut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net à verser</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Créé le</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payouts.map((payout) => {
                const statusCfg = STATUS_LABELS[payout.status] ?? { label: payout.status, color: 'bg-gray-100 text-gray-600' };
                const accounts = getAccounts(payout);
                const defaultAccount = payout.payoutAccount ?? accounts.find((a) => a.isDefault) ?? accounts[0];
                return (
                  <tr key={payout.id} className={`hover:bg-gray-50 ${selected.has(payout.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-4">
                      {payout.status === 'pending' && (
                        <input type="checkbox" checked={selected.has(payout.id)} onChange={() => toggleSelect(payout.id)} className="rounded" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{beneficiaryName(payout)}</p>
                      <p className="text-xs text-gray-500">{beneficiaryType(payout)}</p>
                      <p className="text-xs text-gray-400">{payout.driver?.user?.phone ?? payout.pro?.user?.phone ?? payout.seller?.user?.phone ?? ''}</p>
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      {defaultAccount ? (
                        <div className="space-y-1">
                          <AccountBadge
                            account={defaultAccount}
                            onVerify={handleVerifyAccount}
                            verifying={verifying === defaultAccount.id}
                          />
                          <p className="text-xs text-gray-400">{defaultAccount.accountHolderName}</p>
                          {accounts.length > 1 && (
                            <p className="text-xs text-gray-400">+{accounts.length - 1} autre(s)</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-red-500 font-medium">⚠ Aucun compte renseigné</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">{payout.grossAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-red-600 font-mono">
                      -{payout.commissionAmount.toFixed(2)}
                      <span className="text-xs text-gray-400 ml-1">({payout.commissionRate}%)</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-green-700 font-mono font-semibold">{payout.netAmount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                      {payout.processedByEmail && (
                        <p className="text-xs text-gray-400 mt-1">{payout.processedByEmail}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(payout.createdAt), 'dd/MM/yy HH:mm', { locale: fr })}
                    </td>
                    <td className="px-6 py-4">
                      {payout.status === 'pending' && (
                        <button
                          onClick={() => openModal(payout)}
                          disabled={processing}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Marquer versé
                        </button>
                      )}
                      {payout.adminNotes && (
                        <p className="text-xs text-gray-400 mt-1 max-w-[120px] truncate" title={payout.adminNotes}>
                          {payout.adminNotes}
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {payouts.length === 0 && (
            <div className="text-center py-12 text-gray-500">Aucun versement trouvé</div>
          )}
        </div>
      )}

      {/* Modal confirmation versement */}
      {modal && (() => {
        const accounts = getAccounts(modal.payout);
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Confirmer le versement</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Bénéficiaire : <strong>{beneficiaryName(modal.payout)}</strong> — Montant net : <strong className="text-green-700">{modal.payout.netAmount.toFixed(2)} EGP</strong>
                </p>
              </div>

              {/* Sélection du compte */}
              {accounts.length > 0 ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Compte de versement</label>
                  <div className="space-y-2">
                    {accounts.map((acc) => (
                      <label key={acc.id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer ${modalAccountId === acc.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <input
                          type="radio"
                          name="payoutAccount"
                          value={acc.id}
                          checked={modalAccountId === acc.id}
                          onChange={() => setModalAccountId(acc.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-gray-900">
                              {ACCOUNT_TYPE_LABELS[acc.accountType] ?? acc.accountType}
                            </span>
                            {acc.isDefault && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Défaut</span>}
                            {acc.isVerified ? (
                              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">✓ Vérifié</span>
                            ) : (
                              <button
                                onClick={(e) => { e.preventDefault(); handleVerifyAccount(acc.id); }}
                                disabled={verifying === acc.id}
                                className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-300 px-1.5 py-0.5 rounded hover:bg-yellow-100 disabled:opacity-50"
                              >
                                {verifying === acc.id ? '…' : '⏳ Vérifier'}
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{acc.accountHolderName} · {acc.country}</p>
                          {Object.entries(acc.accountDetails).map(([k, v]) => (
                            <p key={k} className="text-xs text-gray-600 font-mono">{v}</p>
                          ))}
                        </div>
                      </label>
                    ))}
                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${modalAccountId === '' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="radio" name="payoutAccount" value="" checked={modalAccountId === ''} onChange={() => setModalAccountId('')} />
                      <span className="text-sm text-gray-600">Autre (préciser dans les notes)</span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">⚠ Ce prestataire n'a pas encore renseigné ses coordonnées bancaires.</p>
                  <p className="text-xs text-yellow-600 mt-1">Précisez les modalités dans les notes ci-dessous.</p>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Notes (référence virement, etc.)</label>
                <textarea
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Ex: Virement Wave ref #TX12345"
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setModal(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleMarkPaid}
                  disabled={processing}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {processing ? 'En cours…' : 'Confirmer le versement'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
