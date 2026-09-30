'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { SettingsSection } from './SettingsSection';
import { usePendingSummary } from '@/contexts/PendingSummaryContext';

interface ProviderInfo {
  name: 'paymob' | 'moneroo' | 'wave' | 'stripe_connect';
  label: string;
  countries: string[];
  configured: boolean;
  enabled: boolean;
}

const PROVIDER_HELP: Record<ProviderInfo['name'], string> = {
  paymob: 'Égypte — Vodafone Cash, Etisalat Cash, Orange Cash (versement instantané).',
  moneroo: 'Sénégal, Mali, Côte d’Ivoire — Orange Money, Wave, Free Money, MTN, Moov.',
  wave: 'Sénégal, Côte d’Ivoire — comptes Wave, en direct (prioritaire sur Moneroo pour Wave).',
  stripe_connect: 'France — virement SEPA via le compte Stripe Connect du bénéficiaire.',
};

/**
 * Versements aux chauffeurs, prestataires et vendeurs : mode, périodicité, garantie,
 * minimum par pays, compensation et seuil des commissions cash.
 * Valeurs enregistrées dans PlatformSettings.payoutSettings, bornées côté serveur.
 */

interface Props {
  settings: Record<string, any>;
  setSettings: (next: Record<string, any>) => void;
}

const WEEKDAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const FREQUENCIES: { value: string; label: string }[] = [
  { value: 'daily', label: 'Chaque jour' },
  { value: 'weekly', label: 'Chaque semaine' },
  { value: 'biweekly', label: 'Toutes les deux semaines' },
  { value: 'monthly', label: 'Chaque mois' },
];

const DEFAULTS = {
  mode: 'manual',
  frequency: 'weekly',
  weekday: 1,
  monthDay: 1,
  runHour: 9,
  holdDays: 3,
  minimumPayout: { default: 0 },
  netCashCommissions: true,
  cashRestrictionThreshold: { default: 50 },
  providers: { paymob: false, moneroo: false, wave: false, stripe_connect: false } as Record<string, boolean>,
};

const inputCls =
  'rounded-md border border-gray-300 px-3 py-1.5 tabular-nums focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-400';

export function PayoutSettingsCard({ settings, setSettings }: Props) {
  const payout = { ...DEFAULTS, ...(settings.payoutSettings ?? {}) };
  const set = (patch: Record<string, unknown>) =>
    setSettings({ ...settings, payoutSettings: { ...payout, ...patch } });
  const setAmount = (key: 'minimumPayout' | 'cashRestrictionThreshold', country: string, value: string) => {
    const map = { ...(payout[key] ?? {}) } as Record<string, number>;
    if (value === '' && country !== 'default') delete map[country];
    else map[country] = Math.max(0, Number(value) || 0);
    set({ [key]: map });
  };

  // Pays configurés dans les zones de service (code ISO + devise)
  const countries: { code: string; name: string; currency: string }[] = [];
  for (const z of (settings.serviceZones ?? []) as any[]) {
    const code = String(z?.countryCode ?? '').toUpperCase();
    if (/^[A-Z]{2}$/.test(code) && !countries.some((c) => c.code === code)) {
      countries.push({ code, name: z.country ?? code, currency: z.currency ?? '' });
    }
  }

  const automatic = payout.mode === 'automatic';
  const { summary } = usePendingSummary();

  // Prestataires de virement : identifiants présents sur le serveur (jamais affichés) et activation
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  useEffect(() => {
    apiClient.get<ProviderInfo[]>('/payouts/admin/providers').then(setProviders).catch(() => setProviders([]));
  }, []);
  const providerEnabled = (name: ProviderInfo['name']) => !!(payout.providers ?? {})[name];
  const toggleProvider = (name: ProviderInfo['name'], value: boolean) =>
    set({ providers: { ...(payout.providers ?? {}), [name]: value } });

  return (
    <SettingsSection
      id="payouts"
      saveMode="bar"
      icon="💸"
      title="Versements aux chauffeurs, prestataires et vendeurs"
      description={<>Chaque gain est d&apos;abord <strong>en garantie</strong> (délai de contestation), puis <strong>disponible</strong> et conservé de côté par la plateforme, sur le solde du bénéficiaire, jusqu&apos;au virement que vous déclenchez ou programmez. Un litige ouvert bloque le gain concerné. Pensez à enregistrer en bas de page.</>}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Déclenchement */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Déclenchement des virements</p>
          <div className="flex flex-col gap-2">
            <label className="flex items-start gap-2 text-sm text-gray-700">
              <input type="radio" name="payout-mode" checked={!automatic} onChange={() => set({ mode: 'manual' })} className="mt-0.5 accent-primary" />
              <span>
                <strong>Manuel</strong> — vous préparez les virements depuis « Versements presta. », quand vous le souhaitez.
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm text-gray-700">
              <input type="radio" name="payout-mode" checked={automatic} onChange={() => set({ mode: 'automatic' })} className="mt-0.5 accent-primary" />
              <span>
                <strong>Automatique</strong> — les virements sont préparés selon la périodicité ci-dessous (le versement
                manuel reste possible à tout moment).
              </span>
            </label>
          </div>

          <div className={`grid gap-3 sm:grid-cols-2 ${automatic ? '' : 'opacity-50'}`}>
            <label className="text-sm text-gray-700">
              Périodicité
              <select
                value={payout.frequency}
                onChange={(e) => set({ frequency: e.target.value })}
                disabled={!automatic}
                className={`mt-1 w-full ${inputCls}`}
              >
                {FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </label>
            {(payout.frequency === 'weekly' || payout.frequency === 'biweekly') && (
              <label className="text-sm text-gray-700">
                Jour
                <select
                  value={payout.weekday}
                  onChange={(e) => set({ weekday: Number(e.target.value) })}
                  disabled={!automatic}
                  className={`mt-1 w-full ${inputCls}`}
                >
                  {WEEKDAYS.map((d, i) => <option key={d} value={i + 1}>{d}</option>)}
                </select>
              </label>
            )}
            {payout.frequency === 'monthly' && (
              <label className="text-sm text-gray-700">
                Jour du mois
                <input
                  type="number" min={1} max={28}
                  value={payout.monthDay}
                  onChange={(e) => set({ monthDay: Number(e.target.value) })}
                  disabled={!automatic}
                  className={`mt-1 w-full ${inputCls}`}
                />
              </label>
            )}
            <label className="text-sm text-gray-700">
              Heure
              <select
                value={payout.runHour}
                onChange={(e) => set({ runHour: Number(e.target.value) })}
                disabled={!automatic}
                className={`mt-1 w-full ${inputCls}`}
              >
                {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
              </select>
            </label>
          </div>
          {automatic && (
            <p className="text-xs text-gray-500">
              Sans prestataire de paiement branché pour le pays, un virement automatique est préparé puis reste
              « à exécuter » : vous le réglez (banque, mobile money) et le marquez « versé ».
            </p>
          )}
        </div>

        {/* Garantie et compensation */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Garantie et commissions cash</p>
          <div>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="payout-hold" className="text-sm font-medium text-gray-700">Durée de garantie</label>
              <div className="flex items-center gap-2">
                <input
                  id="payout-hold" type="number" min={0} max={30}
                  value={payout.holdDays}
                  onChange={(e) => set({ holdDays: Number(e.target.value) })}
                  className={`w-20 text-right ${inputCls}`}
                />
                <span className="w-10 text-xs text-gray-500">jours</span>
              </div>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              Délai après la fin confirmée (ou confirmée automatiquement) pendant lequel le client peut encore ouvrir un
              litige ; le gain ne peut pas être viré avant. 0 = disponible immédiatement.
            </p>
          </div>
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={payout.netCashCommissions}
              onChange={(e) => set({ netCashCommissions: e.target.checked })}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <span>
              <strong>Compenser les commissions cash</strong> — la commission due sur les courses et prestations payées en
              espèces est déduite du virement (et apparaît sur le détail du virement).
            </span>
          </label>
        </div>
      </div>

      {/* Prestataires de virement */}
      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Prestataires de virement</p>
        <p className="mt-1 text-xs text-gray-500">
          Un virement est envoyé automatiquement par le premier prestataire activé qui couvre le pays et le compte du
          bénéficiaire ; sinon il reste « à exécuter » par vous. Les identifiants se règlent sur le serveur, jamais ici.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {providers.map((prov) => (
            <label
              key={prov.name}
              className={`flex items-start gap-3 rounded-md border p-3 text-sm ${
                prov.configured ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-70'
              }`}
            >
              <input
                type="checkbox"
                checked={providerEnabled(prov.name)}
                disabled={!prov.configured}
                onChange={(e) => toggleProvider(prov.name, e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <span className="flex-1">
                <span className="flex flex-wrap items-center gap-2 font-medium text-gray-900">
                  {prov.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      prov.configured ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {prov.configured ? 'Identifiants présents' : 'Identifiants manquants sur le serveur'}
                  </span>
                </span>
                <span className="mt-0.5 block text-xs text-gray-500">{PROVIDER_HELP[prov.name]}</span>
              </span>
            </label>
          ))}
          {providers.length === 0 && <p className="text-sm text-gray-500">Liste des prestataires indisponible.</p>}
        </div>
        <p className="mt-2 text-xs text-amber-800">
          🔒 Les virements automatiques ne partent que vers des comptes de versement <strong>vérifiés</strong> par un admin ;
          un compte dont le bénéficiaire modifie les coordonnées doit être vérifié à nouveau.
          {(summary?.unverifiedPayoutAccounts ?? 0) > 0 && (
            <> {summary!.unverifiedPayoutAccounts} compte(s) à vérifier dans <a href="/payouts" className="underline">Versements presta.</a></>
          )}
        </p>
        <div>
        </div>
      </div>

      {/* Montants par pays */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="py-2 pr-4 font-semibold">Pays</th>
              <th className="py-2 pr-4 font-semibold">Minimum d&apos;un virement automatique</th>
              <th className="py-2 font-semibold">Suspension du cash au-delà de (commission due)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[{ code: 'default', name: 'Par défaut (autres pays)', currency: '' }, ...countries].map((c) => (
              <tr key={c.code}>
                <td className="py-2 pr-4 text-gray-800">
                  {c.name} {c.currency && <span className="text-xs text-gray-500">({c.currency})</span>}
                </td>
                <td className="py-2 pr-4">
                  <input
                    type="number" min={0} step={1}
                    placeholder={c.code === 'default' ? '0' : 'par défaut'}
                    value={payout.minimumPayout?.[c.code] ?? ''}
                    onChange={(e) => setAmount('minimumPayout', c.code, e.target.value)}
                    className={`w-32 text-right ${inputCls}`}
                  />
                </td>
                <td className="py-2">
                  <input
                    type="number" min={0} step={1}
                    placeholder={c.code === 'default' ? '0' : 'par défaut'}
                    value={payout.cashRestrictionThreshold?.[c.code] ?? ''}
                    onChange={(e) => setAmount('cashRestrictionThreshold', c.code, e.target.value)}
                    className={`w-32 text-right ${inputCls}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-gray-500">
          Montants dans la devise du pays. Suspension du cash : le chauffeur ou le prestataire ne peut plus accepter de
          paiement en espèces tant que sa commission due dépasse ce montant (0 = jamais).
        </p>
      </div>
    </SettingsSection>
  );
}
