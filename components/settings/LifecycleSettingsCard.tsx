'use client';

import { SettingsSection } from './SettingsSection';

/**
 * Délais, annulations et clôture automatique — transport et services à domicile.
 * Valeurs enregistrées dans PlatformSettings (lifecycleSettings + cancellationFee*), bornées côté serveur.
 */

type Section = 'transport' | 'booking';

interface Field {
  key: string;
  label: string;
  help: string;
  unit: string;
  min: number;
  max: number;
  fallback: number;
}

const FIELDS: Record<Section, { title: string; icon: string; groups: { title: string; fields: Field[] }[] }> = {
  transport: {
    title: 'Transport & CheckAllPack',
    icon: '🚚',
    groups: [
      {
        title: 'Attribution',
        fields: [
          { key: 'adminPriorityWindowSec', label: 'Priorité admin', help: "Délai pendant lequel l'admin peut assigner un chauffeur avant que la demande soit envoyée aux chauffeurs.", unit: 's', min: 0, max: 600, fallback: 30 },
          { key: 'driverAcceptWindowMin', label: 'Délai d’acceptation', help: "Temps laissé aux chauffeurs notifiés ; ensuite, le meilleur chauffeur disponible est assigné automatiquement.", unit: 'min', min: 1, max: 60, fallback: 2 },
          { key: 'pendingExpiryAfterSlotMin', label: 'Expiration sans chauffeur', help: "Une demande toujours sans chauffeur est annulée et remboursée ce délai après l'horaire prévu.", unit: 'min', min: 15, max: 1440, fallback: 60 },
        ],
      },
      {
        title: 'Annulation par le client',
        fields: [
          { key: 'freeCancelHoursBeforeSlot', label: 'Annulation gratuite jusqu’à', help: 'Avant ce délai précédant le créneau, le client est intégralement remboursé ; ensuite, aucun remboursement.', unit: 'h avant', min: 0, max: 72, fallback: 2 },
          { key: 'headingFreeCancelMin', label: 'Chauffeur en route : gratuit pendant', help: "Au-delà, ou si le chauffeur est arrivé, les frais d'annulation s'appliquent.", unit: 'min', min: 0, max: 60, fallback: 5 },
          { key: 'abuseThreshold', label: 'Alerte abus à partir de', help: "Nombre d'annulations remboursées déclenchant un litige « fraude » à examiner.", unit: 'annulations', min: 1, max: 50, fallback: 3 },
          { key: 'abuseWindowDays', label: 'Sur une période de', help: '', unit: 'jours', min: 1, max: 365, fallback: 30 },
        ],
      },
      {
        title: 'Annulations par le chauffeur',
        fields: [
          { key: 'providerDropThreshold', label: 'Suspension des espèces à partir de', help: "Commandes payées dans l'app que le chauffeur annule après les avoir acceptées (sans motif légitime). Le moyen de paiement ne lui est communiqué qu'après acceptation ; il est averti une annulation avant le seuil.", unit: 'annulations', min: 1, max: 50, fallback: 3 },
          { key: 'providerDropWindowDays', label: 'Sur une période de', help: '', unit: 'jours', min: 1, max: 365, fallback: 30 },
          { key: 'cashSuspensionDays', label: 'Durée de la suspension', help: "Pendant cette durée, il ne reçoit plus de commandes payées en espèces.", unit: 'jours', min: 1, max: 90, fallback: 7 },
        ],
      },
      {
        title: 'Fin de course',
        fields: [
          { key: 'autoConfirmCompletionHours', label: 'Confirmation automatique après', help: "Course terminée non confirmée par le client (sans litige ouvert) : confirmée automatiquement et le chauffeur est payé.", unit: 'h', min: 1, max: 336, fallback: 48 },
          { key: 'completionReminderHoursBefore', label: 'Rappel au client', help: "Push de rappel envoyé au client avant la confirmation automatique (il est aussi prévenu dès la fin déclarée). La confirmation n'a jamais lieu moins d'1 h après ce rappel.", unit: 'h avant', min: 1, max: 168, fallback: 12 },
        ],
      },
    ],
  },
  booking: {
    title: 'Services à domicile',
    icon: '🔧',
    groups: [
      {
        title: 'Attribution',
        fields: [
          { key: 'adminPriorityWindowSec', label: 'Priorité admin', help: "Délai pendant lequel l'admin peut attribuer un prestataire avant diffusion (demandes automatiques).", unit: 's', min: 0, max: 600, fallback: 30 },
          { key: 'proAcceptWindowMin', label: 'Délai d’acceptation', help: "Temps laissé aux prestataires notifiés ; ensuite, le plus proche est attribué automatiquement.", unit: 'min', min: 1, max: 1440, fallback: 30 },
          { key: 'pendingExpiryAfterSlotMin', label: 'Expiration sans prestataire', help: "Une demande toujours en attente est annulée et remboursée ce délai après le début du créneau (ou après la demande, si immédiate).", unit: 'min', min: 15, max: 2880, fallback: 120 },
          { key: 'proNoShowAfterSlotHours', label: 'Prestataire absent après', help: "Prestataire ayant accepté mais jamais parti : réservation annulée et client remboursé.", unit: 'h', min: 1, max: 168, fallback: 24 },
        ],
      },
      {
        title: 'Annulation par le client',
        fields: [
          { key: 'freeCancelHoursBeforeSlot', label: 'Annulation gratuite jusqu’à', help: 'Avant ce délai précédant le créneau, le client est intégralement remboursé ; ensuite, aucun remboursement.', unit: 'h avant', min: 0, max: 72, fallback: 2 },
          { key: 'enRouteFreeCancelMin', label: 'Prestataire en route : gratuit pendant', help: "Au-delà, ou si le prestataire est arrivé, les frais d'annulation s'appliquent.", unit: 'min', min: 0, max: 60, fallback: 5 },
          { key: 'abuseThreshold', label: 'Alerte abus à partir de', help: "Nombre d'annulations remboursées déclenchant un litige « fraude » à examiner.", unit: 'annulations', min: 1, max: 50, fallback: 3 },
          { key: 'abuseWindowDays', label: 'Sur une période de', help: '', unit: 'jours', min: 1, max: 365, fallback: 30 },
        ],
      },
      {
        title: 'Annulations par le prestataire',
        fields: [
          { key: 'providerDropThreshold', label: 'Suspension des espèces à partir de', help: "Commandes payées dans l'app que le prestataire annule après les avoir acceptées (sans motif légitime) ou auxquelles il ne se présente pas. Le moyen de paiement ne lui est communiqué qu'après acceptation ; il est averti une annulation avant le seuil.", unit: 'annulations', min: 1, max: 50, fallback: 3 },
          { key: 'providerDropWindowDays', label: 'Sur une période de', help: '', unit: 'jours', min: 1, max: 365, fallback: 30 },
          { key: 'cashSuspensionDays', label: 'Durée de la suspension', help: "Pendant cette durée, il ne reçoit plus de commandes payées en espèces.", unit: 'jours', min: 1, max: 90, fallback: 7 },
        ],
      },
      {
        title: 'Fin de prestation',
        fields: [
          { key: 'autoCompleteHours', label: 'Confirmation automatique après', help: "Fin déclarée par le prestataire non confirmée par le client (sans litige ouvert) : confirmée automatiquement et le prestataire est payé.", unit: 'h', min: 1, max: 336, fallback: 48 },
          { key: 'completionReminderHoursBefore', label: 'Rappel au client', help: "Push de rappel envoyé au client avant la confirmation automatique (il est aussi prévenu dès la fin déclarée). La confirmation n'a jamais lieu moins d'1 h après ce rappel.", unit: 'h avant', min: 1, max: 168, fallback: 12 },
        ],
      },
    ],
  },
};

interface Props {
  settings: Record<string, any>;
  setSettings: (next: Record<string, any>) => void;
}

export function LifecycleSettingsCard({ settings, setSettings }: Props) {
  const lifecycle = settings.lifecycleSettings ?? {};
  const setField = (section: Section, key: string, value: number) =>
    setSettings({
      ...settings,
      lifecycleSettings: { ...lifecycle, [section]: { ...(lifecycle[section] ?? {}), [key]: value } },
    });

  return (
    <SettingsSection
      id="lifecycle"
      saveMode="bar"
      icon="⏱️"
      title="Délais, annulations et clôture automatique"
      description={<>Règles appliquées automatiquement par la plateforme. Les annulations automatiques remboursent toujours intégralement le client. Pensez à enregistrer en bas de page.</>}
    >
      {/* Frais d'annulation communs */}
      <div className="mb-6 rounded-md border border-gray-200 p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">Frais d&apos;annulation tardive (transport et services)</h3>
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={settings.cancellationFeeEnabled ?? true}
              onChange={(e) => setSettings({ ...settings, cancellationFeeEnabled: e.target.checked })}
              className="h-4 w-4 accent-primary"
            />
            Activer les frais
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Taux</span>
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={settings.cancellationFeeRatePct ?? 20}
              onChange={(e) => setSettings({ ...settings, cancellationFeeRatePct: Number(e.target.value) })}
              disabled={!(settings.cancellationFeeEnabled ?? true)}
              className="w-20 rounded-md border border-gray-300 px-3 py-2 tabular-nums focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-400"
            />
            <span className="text-sm text-gray-500">% du montant</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          S&apos;appliquent quand le client annule alors que le chauffeur ou le prestataire est arrivé, ou en route depuis
          plus que le délai gratuit. Paiement dans l&apos;app : les frais sont retenus et le reste est restitué aussitôt ;
          paiement cash : ils sont réglés avant la commande suivante.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {(Object.keys(FIELDS) as Section[]).map((section) => {
          const cfg = FIELDS[section];
          return (
            <div key={section} className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">
                {cfg.icon} {cfg.title}
              </h3>
              {cfg.groups.map((group) => (
                <div key={group.title}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{group.title}</p>
                  <div className="space-y-3">
                    {group.fields.map((f) => (
                      <div key={f.key}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label htmlFor={`${section}-${f.key}`} className="text-sm font-medium text-gray-700">
                            {f.label}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              id={`${section}-${f.key}`}
                              type="number"
                              min={f.min}
                              max={f.max}
                              step={1}
                              value={lifecycle[section]?.[f.key] ?? f.fallback}
                              onChange={(e) => setField(section, f.key, Number(e.target.value))}
                              className="w-24 rounded-md border border-gray-300 px-3 py-1.5 text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <span className="w-20 text-xs text-gray-500">{f.unit}</span>
                          </div>
                        </div>
                        {f.help && <p className="mt-0.5 text-xs text-gray-500">{f.help}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </SettingsSection>
  );
}
