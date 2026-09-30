'use client';

import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { apiClient } from '@/lib/api';
import { ACCOUNT_TYPE_LABELS, PayoutAccount, StatusPill, TRANSFER_STATUS_LABELS, beneficiaryKindLabel, money } from './shared';

interface Transfer {
  id: string;
  driverId: string | null;
  proId: string | null;
  sellerId: string | null;
  driver?: { vehicleType?: string; user: { firstName: string; lastName: string; phone: string } } | null;
  pro?: { user: { firstName: string; lastName: string; phone: string } } | null;
  seller?: { businessName?: string; user: { firstName: string; lastName: string; phone: string } } | null;
  currency: string;
  grossAmount: number;
  cashCommissionOffset: number;
  amount: number;
  status: string;
  trigger: 'manual' | 'automatic';
  provider: string;
  providerReference: string | null;
  failureReason: string | null;
  payoutAccount: PayoutAccount | null;
  createdByEmail: string | null;
  processedAt: string | null;
  processedByEmail: string | null;
  adminNotes: string | null;
  createdAt: string;
  _count: { payouts: number };
}

export function TransfersView({ sector, zone, reloadKey }: { sector: string; zone: string | null; reloadKey: number }) {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [paying, setPaying] = useState<Transfer | null>(null);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (status !== 'all') params.status = status;
    if (sector !== 'all') params.sector = sector;
    if (zone) params.zone = zone;
    apiClient
      .get('/payouts/admin/transfers', { params })
      .then((res: any) => { setTransfers(res.transfers ?? []); setTotal(res.total ?? 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status, sector, zone]);

  useEffect(() => { load(); }, [load, reloadKey]);

  const who = (t: Transfer) => {
    const u = t.driver?.user ?? t.pro?.user ?? t.seller?.user;
    return {
      name: u ? `${u.firstName} ${u.lastName}` : '—',
      phone: u?.phone ?? '',
      type: beneficiaryKindLabel(t.driverId ? 'driver' : t.proId ? 'pro' : 'seller', t.driver?.vehicleType),
    };
  };

  const markPaid = async () => {
    if (!paying) return;
    setBusy(true);
    try {
      await apiClient.post(`/payouts/admin/transfers/${paying.id}/mark-paid`, {
        providerReference: reference || undefined,
        notes: notes || undefined,
      });
      setPaying(null);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Opération impossible');
    } finally {
      setBusy(false);
    }
  };

  const markFailed = async (t: Transfer, cancel: boolean) => {
    const reason = window.prompt(
      cancel
        ? 'Motif de l’annulation (les gains redeviennent disponibles) :'
        : 'Motif de l’échec (les gains redeviennent disponibles et la commission cash compensée est de nouveau due) :',
    );
    if (!reason?.trim()) return;
    setBusy(true);
    try {
      await apiClient.post(`/payouts/admin/transfers/${t.id}/mark-failed`, { reason: reason.trim(), cancel });
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Opération impossible');
    } finally {
      setBusy(false);
    }
  };

  const toExecute = transfers.filter((t) => t.status === 'pending' || t.status === 'processing');
  const toExecuteByCurrency = toExecute.reduce<Record<string, number>>((acc, t) => {
    acc[t.currency] = (acc[t.currency] ?? 0) + t.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="pending">À exécuter</option>
          <option value="processing">Envoyés (en attente de confirmation)</option>
          <option value="paid">Versés</option>
          <option value="failed">Échoués</option>
          <option value="cancelled">Annulés</option>
          <option value="all">Tous</option>
        </select>
        <span className="text-sm text-gray-500">{total} virement(s)</span>
        {Object.entries(toExecuteByCurrency).map(([cur, sum]) => (
          <span key={cur} className="rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-800 tabular-nums">
            À virer : {money(sum, cur)}
          </span>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Chargement…</div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium uppercase text-gray-500">
                <th className="px-4 py-3">Préparé le</th>
                <th className="px-4 py-3">Bénéficiaire</th>
                <th className="px-4 py-3">Coordonnées de versement</th>
                <th className="px-4 py-3 text-right">Gains</th>
                <th className="px-4 py-3 text-right">Commission cash</th>
                <th className="px-4 py-3 text-right">À virer</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transfers.map((t) => {
                const b = who(t);
                const details = (t.payoutAccount?.accountDetails ?? {}) as Record<string, string>;
                return (
                  <tr key={t.id} className="align-top hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">
                      {format(new Date(t.createdAt), 'dd/MM/yy HH:mm', { locale: fr })}
                      <p className="text-xs text-gray-400">{t.trigger === 'automatic' ? 'Automatique' : t.createdByEmail ?? 'Manuel'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{b.name}</p>
                      <p className="text-xs text-gray-500">{b.type} · {t._count.payouts} opération(s)</p>
                      {b.phone && <p className="text-xs text-gray-400">{b.phone}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">
                      {t.payoutAccount ? (
                        <>
                          <p className="font-medium">{ACCOUNT_TYPE_LABELS[t.payoutAccount.accountType] ?? t.payoutAccount.accountType}</p>
                          <p>{t.payoutAccount.accountHolderName}</p>
                          {Object.values(details).filter(Boolean).map((v) => <p key={v} className="font-mono">{v}</p>)}
                        </>
                      ) : (
                        <span className="font-medium text-red-500">⚠ Aucun compte</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{money(t.grossAmount, t.currency)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-red-600">
                      {t.cashCommissionOffset ? `− ${money(t.cashCommissionOffset, t.currency)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-green-700">{money(t.amount, t.currency)}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={t.status} map={TRANSFER_STATUS_LABELS} />
                      {t.provider === 'offset' && <p className="mt-1 text-xs text-gray-500">Entièrement compensé</p>}
                      {t.providerReference && <p className="mt-1 text-xs text-gray-500">Réf. {t.providerReference}</p>}
                      {t.failureReason && <p className="mt-1 max-w-[180px] text-xs text-red-600">{t.failureReason}</p>}
                      {t.processedByEmail && t.status !== 'pending' && <p className="mt-1 text-xs text-gray-400">{t.processedByEmail}</p>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(t.status === 'pending' || t.status === 'processing') && (
                        <div className="flex flex-col items-end gap-1">
                          <button
                            onClick={() => { setPaying(t); setReference(''); setNotes(''); }}
                            disabled={busy}
                            className="text-sm font-medium text-green-700 hover:text-green-900 disabled:opacity-50"
                          >
                            Marquer versé
                          </button>
                          <button onClick={() => markFailed(t, false)} disabled={busy} className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50">
                            Échec
                          </button>
                          <button onClick={() => markFailed(t, true)} disabled={busy} className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50">
                            Annuler
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {transfers.length === 0 && <div className="py-12 text-center text-gray-500">Aucun virement</div>}
        </div>
      )}

      {paying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Confirmer le versement</h2>
            <p className="text-sm text-gray-600">
              {who(paying).name} — <strong className="text-green-700">{money(paying.amount, paying.currency)}</strong>
            </p>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Référence du virement (ex. Wave TX12345)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (facultatif)"
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setPaying(null)} className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Annuler
              </button>
              <button
                onClick={markPaid}
                disabled={busy}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {busy ? 'En cours…' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
