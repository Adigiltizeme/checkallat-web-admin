/**
 * Relecture des paramètres avant enregistrement : liste lisible des changements,
 * repérage des réglages sensibles et contrôles de cohérence (bloquants ou simples avertissements).
 */

export interface SettingChange {
  path: string;
  label: string;
  before: unknown;
  after: unknown;
  sensitive: boolean;
}

const TOP_LABELS: Record<string, string> = {
  minBookingAmount: 'Montant minimum de réservation',
  maxBookingAmount: 'Montant maximum de réservation',
  currency: 'Devise de référence',
  baseCurrency: 'Devise de référence (taux de change)',
  exchangeRates: 'Taux de change',
  supportEmail: 'E-mail du support',
  supportPhone: 'Téléphone du support',
  cancellationFeeEnabled: "Frais d'annulation activés",
  cancellationFeeRatePct: "Taux des frais d'annulation (%)",
  extraApprovalMode: "Mode d'approbation des suppléments",
  extraAutoApprovalThreshold: "Seuil d'approbation automatique des suppléments",
  commissionRates: 'Taux de commission',
  lifecycleSettings: 'Délais et annulations',
  payoutSettings: 'Versements',
  courierSettings: 'CheckAllPack',
  marketplaceSettings: 'Marketplace',
  serviceZones: 'Zones de service',
};

const SECTION_PREFIX: Record<string, string> = {
  'lifecycleSettings.transport': 'Transport',
  'lifecycleSettings.booking': 'Services',
  payoutSettings: 'Versements',
  courierSettings: 'CheckAllPack',
  marketplaceSettings: 'Marketplace',
  commissionRates: 'Commission',
};

const LEAF_LABELS: Record<string, string> = {
  adminPriorityWindowSec: 'priorité admin (s)',
  driverAcceptWindowMin: "délai d'acceptation chauffeur (min)",
  proAcceptWindowMin: "délai d'acceptation prestataire (min)",
  pendingExpiryAfterSlotMin: 'expiration sans attribution (min)',
  proNoShowAfterSlotHours: 'prestataire absent après (h)',
  freeCancelHoursBeforeSlot: 'annulation gratuite jusqu’à (h avant)',
  headingFreeCancelMin: 'chauffeur en route : gratuit pendant (min)',
  enRouteFreeCancelMin: 'prestataire en route : gratuit pendant (min)',
  autoConfirmCompletionHours: 'confirmation automatique après (h)',
  autoCompleteHours: 'clôture automatique après (h)',
  completionReminderHoursBefore: 'rappel au client (h avant)',
  abuseThreshold: "seuil d'alerte abus",
  abuseWindowDays: "période d'alerte abus (jours)",
  mode: 'mode',
  frequency: 'périodicité',
  weekday: 'jour de la semaine',
  monthDay: 'jour du mois',
  runHour: 'heure',
  holdDays: 'garantie (jours)',
  minimumPayout: 'minimum de virement',
  netCashCommissions: 'compensation des commissions cash',
  cashRestrictionThreshold: 'seuil de suspension du cash',
  minOrderAmount: 'montant minimum de commande',
  sellerConfirmTimeoutMin: 'délai de confirmation vendeur (min)',
  claimWindowHours: 'délai de réclamation (h)',
  standard: 'standard (%)',
  premium: 'premium (%)',
};

/** Réglages qui touchent l'argent ou les droits des utilisateurs : récapitulatif obligatoire avant enregistrement */
const SENSITIVE_PREFIXES = [
  'commissionRates',
  'cancellationFeeEnabled',
  'cancellationFeeRatePct',
  'payoutSettings',
  'lifecycleSettings.transport.autoConfirmCompletionHours',
  'lifecycleSettings.booking.autoCompleteHours',
  'marketplaceSettings.autoCompleteHours',
  'marketplaceSettings.claimWindowHours',
  'minBookingAmount',
  'maxBookingAmount',
  'currency',
  'baseCurrency',
];

const isPlainObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

export function labelFor(path: string): string {
  if (TOP_LABELS[path]) return TOP_LABELS[path];
  const parts = path.split('.');
  for (let i = parts.length - 1; i > 0; i--) {
    const prefix = parts.slice(0, i).join('.');
    if (SECTION_PREFIX[prefix]) {
      const rest = parts.slice(i).map((p) => LEAF_LABELS[p] ?? p).join(' · ');
      return `${SECTION_PREFIX[prefix]} — ${rest}`;
    }
  }
  return parts.map((p) => LEAF_LABELS[p] ?? TOP_LABELS[p] ?? p).join(' · ');
}

/** Différences feuille par feuille entre deux valeurs (objets imbriqués aplatis) */
export function diffValues(before: unknown, after: unknown, path = ''): SettingChange[] {
  if (isPlainObject(before) || isPlainObject(after)) {
    const b = isPlainObject(before) ? before : {};
    const a = isPlainObject(after) ? after : {};
    return Array.from(new Set([...Object.keys(b), ...Object.keys(a)])).flatMap((k) =>
      diffValues(b[k], a[k], path ? `${path}.${k}` : k),
    );
  }
  if (JSON.stringify(before ?? null) === JSON.stringify(after ?? null)) return [];
  return [{
    path,
    label: labelFor(path),
    before,
    after,
    sensitive: SENSITIVE_PREFIXES.some((p) => path === p || path.startsWith(`${p}.`)),
  }];
}

export function computeChanges(saved: Record<string, any>, current: Record<string, any>, keys: string[]): SettingChange[] {
  return keys.flatMap((k) => diffValues(saved[k], current[k], k));
}

export function formatValue(v: unknown): string {
  if (v === undefined || v === null || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'oui' : 'non';
  if (Array.isArray(v) || isPlainObject(v)) return JSON.stringify(v);
  return String(v);
}

/** Contrôles de cohérence : erreurs (bloquantes) et avertissements */
export function validateSettings(s: Record<string, any>): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : Number(v));

  const min = num(s.minBookingAmount);
  const max = num(s.maxBookingAmount);
  if (min > 0 && max > 0 && min >= max) errors.push('Le montant minimum de réservation doit être inférieur au maximum.');

  const fee = num(s.cancellationFeeRatePct ?? 20);
  if (fee < 0 || fee > 100) errors.push("Le taux des frais d'annulation doit être compris entre 0 et 100 %.");
  if ((s.cancellationFeeEnabled ?? true) && fee === 0) warnings.push("Les frais d'annulation sont activés avec un taux de 0 % : aucun frais ne sera retenu.");

  const lt = s.lifecycleSettings?.transport ?? {};
  const lb = s.lifecycleSettings?.booking ?? {};
  if (num(lt.completionReminderHoursBefore ?? 12) >= num(lt.autoConfirmCompletionHours ?? 48)) {
    errors.push('Transport : le rappel au client doit partir avant la confirmation automatique.');
  }
  if (num(lb.completionReminderHoursBefore ?? 12) >= num(lb.autoCompleteHours ?? 48)) {
    errors.push('Services : le rappel au client doit partir avant la clôture automatique.');
  }
  const mk = s.marketplaceSettings ?? {};
  if (num(mk.completionReminderHoursBefore ?? 6) >= num(mk.autoCompleteHours ?? 24)) {
    errors.push('Marketplace : le rappel au client doit partir avant la clôture automatique.');
  }
  if (num(mk.claimWindowHours ?? 48) < num(mk.autoCompleteHours ?? 24)) {
    warnings.push('Marketplace : le délai de réclamation est plus court que la clôture automatique ; le client ne pourra plus réclamer après la clôture.');
  }

  const payout = s.payoutSettings ?? {};
  const holdDays = num(payout.holdDays ?? 3);
  if (holdDays === 0) warnings.push('Versements : sans garantie, un litige ouvert après la fin de la prestation ne pourra plus bloquer le versement.');
  if (holdDays * 24 < num(mk.claimWindowHours ?? 48)) {
    warnings.push(
      `Versements : la garantie (${holdDays} j) est plus courte que le délai de réclamation Marketplace (${num(mk.claimWindowHours ?? 48)} h) ; un vendeur peut être payé avant la fin des réclamations.`,
    );
  }

  if ((s.extraApprovalMode ?? 'threshold') === 'threshold' && !(num(s.extraAutoApprovalThreshold) > 0)) {
    errors.push("Suppléments : indiquez un seuil d'approbation automatique supérieur à 0.");
  }
  if (s.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s.supportEmail))) {
    errors.push("L'e-mail du support n'est pas valide.");
  }
  return { errors, warnings };
}
