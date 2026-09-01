'use client';

/**
 * KybFranceCard — affichage des documents légaux France côté admin
 *
 * Utilisé sur : drivers/[id], pros/[id], sellers/[id],
 * et tout futur module (auto-moto, tourisme, etc.) opérant en France.
 * Rendu uniquement si au moins un champ KYB France est présent.
 */

const LEGAL_STATUS_LABELS: Record<string, string> = {
  auto_entrepreneur: 'Auto-entrepreneur',
  eurl:  'EURL',
  sasu:  'SASU',
  sarl:  'SARL',
  sas:   'SAS',
  other: 'Autre',
};

interface KybFranceCardProps {
  legalStatus?:       string | null;
  siret?:             string | null;
  apeNafCode?:        string | null;
  rcProInsuranceUrl?: string | null;
  onLightbox?:        (src: string) => void;
}

export function KybFranceCard({
  legalStatus,
  siret,
  apeNafCode,
  rcProInsuranceUrl,
  onLightbox,
}: KybFranceCardProps) {
  const hasData = legalStatus || siret || apeNafCode || rcProInsuranceUrl;
  if (!hasData) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
        🇫🇷 Documents légaux France (KYB)
      </h2>
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
        Ces informations sont requises pour les acteurs opérant en France. Vérifiez leur cohérence avant de valider.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 mb-4">
        {legalStatus && (
          <InfoRow
            label="Statut juridique"
            value={LEGAL_STATUS_LABELS[legalStatus] ?? legalStatus}
          />
        )}
        {siret && (
          <InfoRow
            label="Numéro SIRET"
            value={siret}
            mono
          />
        )}
        {apeNafCode && (
          <InfoRow
            label="Code APE / NAF"
            value={apeNafCode}
            mono
          />
        )}
      </div>

      {rcProInsuranceUrl && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
            Attestation RC professionnelle
          </p>
          <button
            onClick={() => onLightbox?.(rcProInsuranceUrl)}
            className="relative group overflow-hidden rounded-lg border border-gray-200 inline-block hover:border-amber-400 transition-colors"
          >
            <img
              src={rcProInsuranceUrl}
              alt="Attestation RC Pro"
              className="max-h-48 max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </button>
          <p className="mt-2 text-xs text-gray-400">Cliquez pour agrandir</p>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      <span className={`text-sm text-gray-900 ${mono ? 'font-mono' : 'font-medium'}`}>{value}</span>
    </div>
  );
}
