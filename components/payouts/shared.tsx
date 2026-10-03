'use client';

import { isCourierVehicle } from '@/lib/driverScope';

export interface PayoutAccount {
  id: string;
  accountType: string;
  country: string;
  accountHolderName: string;
  accountDetails: Record<string, string>;
  isDefault: boolean;
  isVerified: boolean;
}

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
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
  expresso:           'E-Money (Expresso)',
  moov_money:         'Moov Money',
  stc_pay:            'STC Pay',
  sadad:              'SADAD',
  etisalat_wallet:    'E& Wallet',
};

/** Statuts d'un gain (opération) */
export const PAYOUT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  on_hold:    { label: 'En garantie',          color: 'bg-indigo-100 text-indigo-800' },
  blocked:    { label: 'Bloqué (litige)',      color: 'bg-orange-100 text-orange-800' },
  pending:    { label: 'Disponible',           color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'En cours de virement', color: 'bg-blue-100 text-blue-800' },
  paid:       { label: 'Versé',                color: 'bg-green-100 text-green-800' },
  failed:     { label: 'Échoué',               color: 'bg-red-100 text-red-800' },
  cancelled:  { label: 'Annulé (remboursé)',   color: 'bg-gray-100 text-gray-600' },
};

/** Statuts d'un virement groupé */
export const TRANSFER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:    { label: 'À exécuter', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Envoyé',     color: 'bg-blue-100 text-blue-800' },
  paid:       { label: 'Versé',      color: 'bg-green-100 text-green-800' },
  failed:     { label: 'Échoué',     color: 'bg-red-100 text-red-800' },
  cancelled:  { label: 'Annulé',     color: 'bg-gray-100 text-gray-600' },
};

export const money = (n: number | null | undefined, currency?: string | null) =>
  `${(n ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${currency ? ` ${currency}` : ''}`;

export const beneficiaryKindLabel = (kind: 'driver' | 'pro' | 'seller', vehicleType?: string | null) =>
  kind === 'driver' ? (isCourierVehicle(vehicleType ?? undefined) ? 'Livreur CheckAllPack' : 'Chauffeur') : kind === 'pro' ? 'Prestataire' : 'Vendeur';

export function accountSummary(account: PayoutAccount) {
  const details = (account.accountDetails ?? {}) as Record<string, string>;
  return details.ipaAddress ?? details.phoneNumber ?? details.iban ?? details.accountNumber ?? '';
}

export function AccountBadge({ account, onVerify, verifying }: {
  account: PayoutAccount;
  onVerify?: (id: string) => void;
  verifying?: boolean;
}) {
  const label = ACCOUNT_TYPE_LABELS[account.accountType] ?? account.accountType;
  const detail = accountSummary(account);
  return (
    <div className="inline-flex flex-col gap-1">
      <div className={`text-xs px-2 py-1 rounded inline-flex items-center gap-1 ${account.isVerified ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
        <span className="font-medium">{label}</span>
        {detail && <span className="opacity-70">{detail}</span>}
        {account.isVerified ? <span title="Vérifié">✓</span> : <span title="Non vérifié">⏳</span>}
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

export function StatusPill({ status, map }: { status: string; map: Record<string, { label: string; color: string }> }) {
  const cfg = map[status] ?? { label: status, color: 'bg-gray-100 text-gray-600' };
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${cfg.color}`}>{cfg.label}</span>;
}
