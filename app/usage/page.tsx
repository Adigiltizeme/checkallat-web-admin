'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { RefreshCw, Users, UserMinus, UserPlus, Activity, Star, AlertCircle, Info, Route } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useZone } from '@/contexts/ZoneContext';

type Counts = Record<string, number>;

interface SectorStats {
  total: number;
  completed: number;
  cancelled: number;
  completionRate: number | null;
  cancellationRate: number | null;
  byStatus: Counts;
  cancelledBy: Counts;
  paymentMethods: Counts;
  medianAssignmentMinutes?: number | null;
}

interface UsageStats {
  period: { days: number; since: string; country: string | null };
  users: {
    total: number;
    newInPeriod: number;
    deletedInPeriod: number;
    activeDay: number;
    activeWeek: number;
    activeMonth: number;
    stickiness: number | null;
    series: { date: string; signups: number; deletions: number }[];
  };
  applications: { drivers: Counts; couriers: Counts; pros: Counts; sellers: Counts };
  sectors: { transport: SectorStats; courier: SectorStats; services: SectorStats; marketplace: SectorStats };
  journeys: {
    events: number;
    devices: number;
    consent: { accepted: number; refused: number; notAsked: number };
    topScreens: { screen: string; views: number; devices: number }[];
    funnels: {
      key: string;
      steps: { key: string; devices: number; fromStart: number | null; fromPrevious: number | null }[];
    }[];
  };
  quality: {
    disputes: number;
    disputeRate: number | null;
    disputesByCategory: Counts;
    averageRating: number | null;
    reviewCount: number;
    lowRatingShare: number | null;
  };
  revenue: { currency: string; payments: number; amount: number; commission: number }[];
}

const PERIODS = [7, 30, 90, 365];

const SECTOR_LABELS: Record<keyof UsageStats['sectors'], string> = {
  transport: 'Transport / déménagement',
  courier: 'CheckAllPack (2 roues)',
  services: 'Services (réservations)',
  marketplace: 'Marketplace',
};

const APPLICATION_LABELS: Record<keyof UsageStats['applications'], string> = {
  drivers: 'Chauffeurs',
  couriers: 'Coursiers 2 roues',
  pros: 'Prestataires',
  sellers: 'Vendeurs',
};

/** Parcours suivis dans l'application (clés renvoyées par le serveur) */
const FUNNEL_LABELS: Record<string, { title: string; steps: Record<string, string> }> = {
  signup: {
    title: 'Inscription',
    steps: { app_open: "Ouverture de l'app", register_screen: "Écran d'inscription", register: 'Compte créé', phone_verified: 'Numéro confirmé (code SMS)' },
  },
  transport: {
    title: 'Demande de transport',
    steps: { step1: 'Étape 1 (objets)', summary: 'Récapitulatif', created: 'Demande envoyée' },
  },
  services: {
    title: 'Réservation de service',
    steps: { step1: 'Étape 1 (besoin)', summary: 'Récapitulatif', created: 'Réservation envoyée' },
  },
  marketplace: {
    title: 'Achat marketplace',
    steps: { product: 'Fiche produit', cart: 'Panier', checkout: 'Paiement lancé' },
  },
};

/** Noms techniques des écrans → libellés lisibles (les autres restent affichés tels quels) */
const SCREEN_LABELS: Record<string, string> = {
  HomeScreen: 'Accueil',
  Home: 'Accueil',
  SearchHome: 'Recherche',
  Login: 'Connexion',
  Register: 'Inscription',
  OTP: 'Code de vérification',
  ProfileHome: 'Profil',
  Notifications: 'Notifications',
  TransportRequestStep1: 'Transport — étape 1',
  TransportRequestStep2: 'Transport — étape 2',
  TransportRequestStep3: 'Transport — étape 3',
  TransportRequestStep4: 'Transport — étape 4',
  TransportRequestStep5: 'Transport — récapitulatif',
  TransportTracking: 'Suivi transport',
  BookingRequestStep1: 'Service — étape 1',
  BookingRequestStep2: 'Service — étape 2',
  BookingRequestStep3: 'Service — étape 3',
  BookingRequestStep4: 'Service — étape 4',
  BookingRequestStep5: 'Service — récapitulatif',
  BookingTracking: 'Suivi prestation',
  MarketplaceHome: 'Marketplace',
  ProductDetail: 'Fiche produit',
  Cart: 'Panier',
  StripePayment: 'Paiement',
  DriverHome: 'Accueil chauffeur',
  ProHome: 'Accueil prestataire',
  SellerHome: 'Accueil vendeur',
};

const VALUE_LABELS: Record<string, string> = {
  pending: 'En attente',
  active: 'Actif',
  approved: 'Approuvé',
  rejected: 'Refusé',
  suspended: 'Suspendu',
  banned: 'Banni',
  client: 'Client',
  driver: 'Chauffeur',
  pro: 'Prestataire',
  seller: 'Vendeur',
  admin: 'Admin',
  system: 'Automatique',
  cash: 'Espèces',
  in_app: 'Dans l’app',
  cash_on_delivery: 'Espèces à la livraison',
  cash_on_pickup: 'Espèces au retrait',
  inconnu: 'Non précisé',
};
const label = (v: string) => VALUE_LABELS[v] ?? v;

const fmt = (n: number | null | undefined, suffix = '') =>
  n == null ? '—' : `${n.toLocaleString('fr-FR')}${suffix}`;

function Kpi({
  icon: Icon, title, value, hint, tone = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'good' | 'warn' | 'bad';
}) {
  const tones = {
    default: 'bg-gray-100 text-gray-600',
    good: 'bg-emerald-50 text-emerald-600',
    warn: 'bg-amber-50 text-amber-600',
    bad: 'bg-rose-50 text-rose-600',
  };
  return (
    <div className="bg-white rounded-lg shadow p-5 flex gap-4 items-start">
      <div className={`p-2 rounded-lg ${tones[tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
        {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
      </div>
    </div>
  );
}

function Breakdown({ data, total }: { data: Counts; total?: number }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const sum = total ?? entries.reduce((a, [, n]) => a + n, 0);
  if (!entries.length) return <p className="text-sm text-gray-400">Aucune donnée</p>;
  return (
    <ul className="space-y-1.5">
      {entries.map(([k, n]) => (
        <li key={k} className="text-sm">
          <div className="flex justify-between gap-2">
            <span className="text-gray-700">{label(k)}</span>
            <span className="tabular-nums text-gray-900 font-medium">
              {n}
              {sum > 0 && <span className="text-gray-400 font-normal"> · {Math.round((n / sum) * 100)} %</span>}
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded mt-1">
            <div className="h-1.5 bg-primary rounded" style={{ width: sum ? `${(n / sum) * 100}%` : 0 }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function rateTone(rate: number | null, warnAbove: number, badAbove: number) {
  if (rate == null) return 'text-gray-400';
  if (rate >= badAbove) return 'text-rose-600';
  if (rate >= warnAbove) return 'text-amber-600';
  return 'text-emerald-600';
}

export default function UsagePage() {
  const { selectedZone, selectedZoneObj } = useZone();
  const [days, setDays] = useState(30);
  const [data, setData] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params: Record<string, string | number> = { days };
    if (selectedZone) params.zone = selectedZone;
    apiClient
      .get<UsageStats>('/admin/stats/usage', { params })
      .then(setData)
      .catch(() => setError('Impossible de charger les statistiques. Vérifiez la connexion au serveur puis réessayez.'))
      .finally(() => setLoading(false));
  }, [days, selectedZone]);

  useEffect(() => {
    load();
  }, [load]);

  const u = data?.users;
  const q = data?.quality;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistiques d&apos;usage</h1>
          <p className="text-gray-600">
            Inscriptions, utilisation, suppressions et qualité du service
            {selectedZoneObj ? ` — ${selectedZoneObj.flag ?? ''} ${selectedZoneObj.nameFr}` : ' — tous les pays'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1" role="group" aria-label="Période">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setDays(p)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  days === p ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p === 365 ? '12 mois' : `${p} jours`}
              </button>
            ))}
          </div>
          <button
            onClick={load}
            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
            title="Actualiser"
            aria-label="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-lg p-4 text-sm">{error}</div>
      )}

      {!data && loading && <div className="h-96 bg-gray-200 rounded animate-pulse" />}

      {data && u && q && (
        <>
          {/* Utilisateurs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Kpi icon={Users} title="Comptes existants" value={fmt(u.total)} hint="Hors comptes supprimés" />
            <Kpi icon={UserPlus} title={`Inscriptions (${days} j)`} value={fmt(u.newInPeriod)} tone="good" />
            <Kpi
              icon={UserMinus}
              title={`Comptes supprimés (${days} j)`}
              value={fmt(u.deletedInPeriod)}
              tone={u.deletedInPeriod > 0 ? 'warn' : 'default'}
              hint={u.newInPeriod ? `${Math.round((u.deletedInPeriod / u.newInPeriod) * 100)} % des inscriptions` : undefined}
            />
            <Kpi
              icon={Activity}
              title="Utilisateurs actifs"
              value={`${fmt(u.activeDay)} / ${fmt(u.activeWeek)} / ${fmt(u.activeMonth)}`}
              hint={`Jour / 7 jours / 30 jours${u.stickiness != null ? ` · fidélité ${u.stickiness} %` : ''}`}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Inscriptions et suppressions par jour</h2>
            <p className="text-sm text-gray-500 mb-4">
              Les téléchargements et désinstallations se consultent dans App Store Connect et Google Play Console.
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={u.series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  minTickGap={24}
                  fontSize={12}
                />
                <YAxis allowDecimals={false} fontSize={12} width={32} />
                <Tooltip labelFormatter={(d: string) => new Date(d).toLocaleDateString('fr-FR', { dateStyle: 'long' })} />
                <Legend />
                <Area type="monotone" dataKey="signups" name="Inscriptions" stroke="#00B8A9" fill="#00B8A9" fillOpacity={0.15} strokeWidth={2} />
                <Area type="monotone" dataKey="deletions" name="Suppressions" stroke="#F43F5E" fill="#F43F5E" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Commandes par secteur */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Commandes par secteur ({days} jours)</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {(Object.keys(SECTOR_LABELS) as (keyof UsageStats['sectors'])[]).map((key) => {
                const s = data.sectors[key];
                return (
                  <div key={key} className="bg-white rounded-lg shadow p-5 space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{SECTOR_LABELS[key]}</h3>
                      <p className="text-3xl font-bold text-gray-900 tabular-nums">{s.total}</p>
                      <p className="text-xs text-gray-500">commandes créées</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Terminées</p>
                        <p className={`font-semibold tabular-nums ${rateTone(s.completionRate == null ? null : 100 - s.completionRate, 40, 60)}`}>
                          {s.completed} · {fmt(s.completionRate, ' %')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Annulées</p>
                        <p className={`font-semibold tabular-nums ${rateTone(s.cancellationRate, 15, 30)}`}>
                          {s.cancelled} · {fmt(s.cancellationRate, ' %')}
                        </p>
                      </div>
                    </div>
                    {key === 'transport' && (
                      <p className="text-sm text-gray-600">
                        Délai médian d&apos;acceptation par un chauffeur :{' '}
                        <strong className="tabular-nums">{fmt(s.medianAssignmentMinutes, ' min')}</strong>
                      </p>
                    )}
                    {s.cancelled > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Annulées par</p>
                        <Breakdown data={s.cancelledBy} />
                      </div>
                    )}
                    {s.total > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Mode de paiement</p>
                        <Breakdown data={s.paymentMethods} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Qualité */}
          <div className="grid gap-4 md:grid-cols-3">
            <Kpi
              icon={Star}
              title="Note moyenne"
              value={q.averageRating != null ? `${q.averageRating} / 5` : '—'}
              hint={`${q.reviewCount} avis${q.lowRatingShare != null ? ` · ${q.lowRatingShare} % notés 1 ou 2` : ''}`}
              tone={q.averageRating == null ? 'default' : q.averageRating >= 4.5 ? 'good' : q.averageRating >= 4 ? 'warn' : 'bad'}
            />
            <Kpi
              icon={AlertCircle}
              title="Litiges ouverts sur la période"
              value={fmt(q.disputes)}
              hint={q.disputeRate != null ? `${q.disputeRate} % des commandes terminées` : undefined}
              tone={q.disputes === 0 ? 'good' : (q.disputeRate ?? 0) >= 5 ? 'bad' : 'warn'}
            />
            <div className="bg-white rounded-lg shadow p-5">
              <p className="text-sm text-gray-500 mb-3">Paiements dans l&apos;application</p>
              {data.revenue.length === 0 ? (
                <p className="text-sm text-gray-400">Aucun paiement sur la période</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-left">
                      <th className="font-normal">Devise</th>
                      <th className="font-normal text-right">Nb</th>
                      <th className="font-normal text-right">Montant</th>
                      <th className="font-normal text-right">Commission</th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums">
                    {data.revenue.map((r) => (
                      <tr key={r.currency}>
                        <td className="py-1 font-medium">{r.currency}</td>
                        <td className="text-right">{r.payments}</td>
                        <td className="text-right">{r.amount.toLocaleString('fr-FR')}</td>
                        <td className="text-right">{r.commission.toLocaleString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {Object.keys(q.disputesByCategory).length > 0 && (
            <div className="bg-white rounded-lg shadow p-5 max-w-xl">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Motifs des litiges</p>
              <Breakdown data={q.disputesByCategory} />
            </div>
          )}

          {/* Parcours dans l'application */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Route className="w-5 h-5 text-primary" /> Parcours dans l&apos;application ({days} jours)
              </h2>
              <p className="text-sm text-gray-500">
                {fmt(data.journeys.devices)} appareils · {fmt(data.journeys.events)} événements · accord donné par{' '}
                {fmt(data.journeys.consent.accepted)} comptes, refusé par {fmt(data.journeys.consent.refused)},
                non encore demandé à {fmt(data.journeys.consent.notAsked)}
              </p>
            </div>

            {data.journeys.events === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-sm text-gray-500">
                Aucun parcours enregistré sur la période. Les données arrivent dès que des personnes ayant accepté la
                mesure d&apos;usage utilisent la nouvelle version de l&apos;application.
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
                  {data.journeys.funnels.map((f) => {
                    const labels = FUNNEL_LABELS[f.key];
                    return (
                      <div key={f.key} className="bg-white rounded-lg shadow p-5">
                        <h3 className="font-semibold text-gray-900 mb-3">{labels?.title ?? f.key}</h3>
                        <ol className="space-y-2">
                          {f.steps.map((st, i) => (
                            <li key={st.key}>
                              <div className="flex justify-between gap-2 text-sm">
                                <span className="text-gray-700">{labels?.steps[st.key] ?? st.key}</span>
                                <span className="tabular-nums font-medium text-gray-900">
                                  {st.devices}
                                  {i > 0 && st.fromPrevious != null && (
                                    <span className={`font-normal ${st.fromPrevious < 50 ? 'text-rose-600' : 'text-gray-400'}`}>
                                      {' '}· {st.fromPrevious} %
                                    </span>
                                  )}
                                </span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded mt-1">
                                <div className="h-2 bg-primary rounded" style={{ width: `${st.fromStart ?? 0}%` }} />
                              </div>
                            </li>
                          ))}
                        </ol>
                        {f.steps[0].devices > 0 && (
                          <p className="text-xs text-gray-500 mt-3">
                            Taux de conversion : {fmt(f.steps[f.steps.length - 1].fromStart, ' %')}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="bg-white rounded-lg shadow p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Écrans les plus consultés</h3>
                  {data.journeys.topScreens.length === 0 ? (
                    <p className="text-sm text-gray-400">Aucune donnée</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-500 text-left">
                          <th className="font-normal">Écran</th>
                          <th className="font-normal text-right">Vues</th>
                          <th className="font-normal text-right">Appareils</th>
                        </tr>
                      </thead>
                      <tbody className="tabular-nums">
                        {data.journeys.topScreens.map((r) => (
                          <tr key={r.screen}>
                            <td className="py-1 text-gray-700">{SCREEN_LABELS[r.screen] ?? r.screen}</td>
                            <td className="text-right">{r.views}</td>
                            <td className="text-right">{r.devices}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500">
              Pourcentage affiché à chaque étape = part des appareils de l&apos;étape précédente qui l&apos;ont atteinte
              (en rouge sous 50 %). Mesure limitée aux personnes ayant accepté ; les événements sont supprimés après 13 mois.
            </p>
          </div>

          {/* Candidatures */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Candidatures reçues ({days} jours)</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {(Object.keys(APPLICATION_LABELS) as (keyof UsageStats['applications'])[]).map((key) => (
                <div key={key} className="bg-white rounded-lg shadow p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">{APPLICATION_LABELS[key]}</h3>
                  <Breakdown data={data.applications[key]} />
                </div>
              ))}
            </div>
          </div>

          <p className="flex gap-2 text-xs text-gray-500">
            <Info className="w-4 h-4 shrink-0" />
            « Actifs » = personnes ayant utilisé l&apos;application connectées (mesure mise à jour au plus toutes les
            15 minutes, à partir de la mise en production de cette page). Les plantages et la stabilité se suivent dans
            Sentry et les consoles des stores.
          </p>
        </>
      )}
    </div>
  );
}
