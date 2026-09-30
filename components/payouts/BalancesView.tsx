'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { apiClient } from '@/lib/api';
import { AccountBadge, PayoutAccount, beneficiaryKindLabel, money } from './shared';
import { usePendingSummary } from '@/contexts/PendingSummaryContext';

interface BalanceItem {
  kind: 'driver' | 'pro' | 'seller';
  id: string;
  name: string;
  businessName: string | null;
  phone: string | null;
  vehicleType: string | null;
  countryId: string | null;
  currency: string | null;
  onHold: number;
  blocked: number;
  available: number;
  processing: number;
  operations: number;
  cashCommissionDue: number;
  isCashRestricted: boolean;
  nextTransferAmount: number;
  minimum: number;
  account: PayoutAccount | null;
  eligible: boolean;
}

interface BalancesResponse {
  items: BalanceItem[];
  totals: Record<string, { onHold: number; blocked: number; available: number; processing: number; cashCommissionDue: number }>;
  schedule: { mode: 'manual' | 'automatic'; frequency: string; holdDays: number; netCashCommissions: boolean; nextRunAt: string | null };
}

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'chaque jour',
  weekly: 'chaque semaine',
  biweekly: 'toutes les deux semaines',
  monthly: 'chaque mois',
};

export function BalancesView({ sector, zone, onTransferCreated }: { sector: string; zone: string | null; onTransferCreated: () => void }) {
  const [data, setData] = useState<BalancesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<BalanceItem | null>(null);
  const [notes, setNotes] = useState('');
  const [verifying, setVerifying] = useState<string | null>(null);
  const [onlyUnverified, setOnlyUnverified] = useState(false);
  const { refresh: refreshSummary } = usePendingSummary();

  // Vérification d'un compte : à faire après contrôle des coordonnées (titulaire, numéro, IBAN)
  const verifyAccount = async (accountId: string) => {
    if (!window.confirm('Confirmez-vous avoir contrôlé ce compte (titulaire et coordonnées) ? Les virements automatiques pourront y être envoyés.')) return;
    setVerifying(accountId);
    try {
      await apiClient.post(`/payout-accounts/admin/${accountId}/verify`, {});
      load();
      refreshSummary();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Vérification impossible');
    } finally {
      setVerifying(null);
    }
  };

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (sector !== 'all') params.sector = sector;
    if (zone) params.zone = zone;
    apiClient
      .get('/payouts/admin/balances', { params })
      .then((res: any) => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sector, zone]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  const createTransfer = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      await apiClient.post('/payouts/admin/transfers', { kind: confirm.kind, id: confirm.id, notes: notes || undefined });
      setConfirm(null);
      setNotes('');
      load();
      onTransferCreated();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Préparation du virement impossible');
    } finally {
      setBusy(false);
    }
  };

  const runAll = async () => {
    if (!window.confirm('Préparer un virement pour chaque bénéficiaire éligible (compte renseigné et montant disponible au moins égal au minimum du pays) ?')) return;
    setBusy(true);
    try {
      const body: Record<string, string> = {};
      if (sector !== 'all') body.sector = sector;
      if (zone) body.zone = zone;
      const res: any = await apiClient.post('/payouts/admin/transfers/run-all', body);
      alert(
        `${res.created} virement(s) préparé(s), ${res.skipped} bénéficiaire(s) non éligible(s).` +
          (res.errors?.length ? `\n\nErreurs :\n${res.errors.join('\n')}` : ''),
      );
      load();
      if (res.created) onTransferCreated();
    } finally {
      setBusy(false);
    }
  };

  if (loading && !data) return <div className="text-center py-12 text-gray-500">Chargement…</div>;
  if (!data) return <div className="text-center py-12 text-gray-500">Soldes indisponibles</div>;

  const { schedule } = data;
  const eligibleCount = data.items.filter((i) => i.eligible).length;
  const unverifiedCount = data.items.filter((i) => i.account && !i.account.isVerified).length;
  const rows = onlyUnverified ? data.items.filter((i) => i.account && !i.account.isVerified) : data.items;

  return (
    <div className="space-y-6">
      {/* Règles en vigueur */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4 text-sm">
        <div className="space-y-1 text-gray-700">
          <p>
            <strong>{schedule.mode === 'automatic' ? 'Versements automatiques' : 'Versements manuels'}</strong>
            {schedule.mode === 'automatic' && (
              <>
                {' '}— {FREQUENCY_LABELS[schedule.frequency] ?? schedule.frequency}
                {schedule.nextRunAt && <> · prochain : {format(new Date(schedule.nextRunAt), 'EEEE d MMM à HH:mm', { locale: fr })}</>}
              </>
            )}
          </p>
          <p className="text-xs text-gray-500">
            Garantie : {schedule.holdDays} jour(s) après la fin de la prestation ·{' '}
            {schedule.netCashCommissions ? 'commissions cash déduites des virements' : 'commissions cash non compensées'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/settings" className="text-sm text-primary hover:underline">Modifier les règles</Link>
          <button
            onClick={runAll}
            disabled={busy || eligibleCount === 0}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            Préparer tous les virements ({eligibleCount})
          </button>
        </div>
      </div>

      {unverifiedCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <p>
            ⚠ {unverifiedCount} compte(s) de versement non vérifié(s) : leurs virements restent « à exécuter » par vous,
            même si un prestataire de paiement est activé. Contrôlez le titulaire et les coordonnées, puis vérifiez-les.
          </p>
          <label className="flex items-center gap-2 font-medium">
            <input type="checkbox" checked={onlyUnverified} onChange={(e) => setOnlyUnverified(e.target.checked)} className="accent-primary" />
            Afficher seulement ces comptes
          </label>
        </div>
      )}

      {/* Totaux par devise */}
      {Object.entries(data.totals).map(([currency, t]) => (
        <div key={currency} className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            { label: 'En garantie', value: t.onHold, cls: 'text-indigo-700' },
            { label: 'Bloqué (litige)', value: t.blocked, cls: 'text-orange-700' },
            { label: 'Disponible', value: t.available, cls: 'text-yellow-700' },
            { label: 'En cours de virement', value: t.processing, cls: 'text-blue-700' },
            { label: 'Commission cash due', value: t.cashCommissionDue, cls: 'text-red-700' },
          ].map((c) => (
            <div key={c.label} className="rounded-lg bg-white p-4 shadow">
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className={`text-xl font-bold tabular-nums ${c.cls}`}>{money(c.value, currency)}</p>
            </div>
          ))}
        </div>
      ))}

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-medium uppercase text-gray-500">
              <th className="px-4 py-3">Bénéficiaire</th>
              <th className="px-4 py-3">Compte de versement</th>
              <th className="px-4 py-3 text-right">En garantie</th>
              <th className="px-4 py-3 text-right">Bloqué</th>
              <th className="px-4 py-3 text-right">Disponible</th>
              <th className="px-4 py-3 text-right">Commission cash due</th>
              <th className="px-4 py-3 text-right">Prochain virement</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((b) => (
              <tr key={`${b.kind}:${b.id}`} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{b.name}</p>
                  <p className="text-xs text-gray-500">
                    {beneficiaryKindLabel(b.kind, b.vehicleType)}
                    {b.businessName && b.kind === 'seller' ? ` · ${b.businessName}` : ''}
                    {b.countryId ? ` · ${b.countryId}` : ''}
                  </p>
                  {b.phone && <p className="text-xs text-gray-400">{b.phone}</p>}
                </td>
                <td className="px-4 py-3">
                  {b.account ? (
                    <div className="space-y-1">
                      <AccountBadge account={b.account} onVerify={verifyAccount} verifying={verifying === b.account.id} />
                      <p className="text-xs text-gray-500">{b.account.accountHolderName}</p>
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-red-500">⚠ Aucun compte</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-indigo-700">{b.onHold ? money(b.onHold, b.currency) : '—'}</td>
                <td className="px-4 py-3 text-right tabular-nums text-orange-700">{b.blocked ? money(b.blocked, b.currency) : '—'}</td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold text-gray-900">
                  {b.available ? money(b.available, b.currency) : '—'}
                  {b.processing > 0 && <p className="text-xs font-normal text-blue-600">+ {money(b.processing, b.currency)} en virement</p>}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-red-600">
                  {b.cashCommissionDue ? money(b.cashCommissionDue, b.currency) : '—'}
                  {b.isCashRestricted && <p className="text-xs">cash suspendu</p>}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold text-green-700">
                  {b.available ? money(b.nextTransferAmount, b.currency) : '—'}
                  {b.available > 0 && b.available < b.minimum && (
                    <p className="text-xs font-normal text-gray-500">sous le minimum ({money(b.minimum, b.currency)})</p>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {b.available > 0 && (
                    <button
                      onClick={() => { setConfirm(b); setNotes(''); }}
                      disabled={busy}
                      className="rounded-md border border-green-600 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
                    >
                      Verser
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.items.length === 0 && <div className="py-12 text-center text-gray-500">Aucun solde en attente</div>}
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg space-y-4 rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Préparer le virement</h2>
            <p className="text-sm text-gray-600">
              Bénéficiaire : <strong>{confirm.name}</strong> ({beneficiaryKindLabel(confirm.kind, confirm.vehicleType)})
            </p>
            <dl className="space-y-1 rounded-md bg-gray-50 p-3 text-sm tabular-nums">
              <div className="flex justify-between"><dt>Gains disponibles</dt><dd>{money(confirm.available, confirm.currency)}</dd></div>
              {confirm.available !== confirm.nextTransferAmount && (
                <div className="flex justify-between text-red-600">
                  <dt>Commission cash compensée</dt><dd>− {money(confirm.available - confirm.nextTransferAmount, confirm.currency)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-1 font-semibold text-green-700">
                <dt>Montant à virer</dt><dd>{money(confirm.nextTransferAmount, confirm.currency)}</dd>
              </div>
            </dl>
            {confirm.account ? (
              <div className="text-sm text-gray-700">
                Compte : <AccountBadge account={confirm.account} />
                <p className="text-xs text-gray-500 mt-1">{confirm.account.accountHolderName}</p>
              </div>
            ) : (
              <p className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                ⚠ Aucun compte de versement renseigné : précisez les modalités dans les notes.
              </p>
            )}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (facultatif)"
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-500">
              Le virement apparaît ensuite dans l&apos;onglet « Virements », à exécuter puis à marquer « versé ».
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirm(null)} className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Annuler
              </button>
              <button
                onClick={createTransfer}
                disabled={busy}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {busy ? 'En cours…' : 'Préparer le virement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
