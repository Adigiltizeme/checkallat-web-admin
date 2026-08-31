import { SUPPORTED_CURRENCIES } from './constants';

/**
 * Formate un montant avec la bonne devise (symbole, séparateurs, décimales)
 * selon les règles de chaque devise dans SUPPORTED_CURRENCIES.
 */
export function formatCurrency(amount: number | null | undefined, currencyCode?: string): string {
  if (amount == null || isNaN(amount)) return '—';
  const code = currencyCode ?? '';
  if (!code) return `${amount.toFixed(2)} —`;
  const curr = SUPPORTED_CURRENCIES[code as keyof typeof SUPPORTED_CURRENCIES];
  if (!curr) return `${amount.toFixed(2)} ${code}`;

  const decimals = code === 'XOF' || code === 'XAF' ? 0 : 2;
  // Forcer les numéraux latins pour les locales arabes (évite les chiffres hindous ٠١٢...)
  const locale = curr.locale.startsWith('ar') ? `${curr.locale}-u-nu-latn` : curr.locale;
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  return `${formatted} ${curr.symbol}`;
}

/**
 * Convertit un montant d'une devise vers une autre en utilisant les taux de change.
 * Les taux sont relatifs à une devise de base (ex: EGP = 1).
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRates: Record<string, number>,
): number {
  if (fromCurrency === toCurrency) return amount;
  const fromRate = exchangeRates[fromCurrency] ?? 1;
  const toRate = exchangeRates[toCurrency] ?? 1;
  // Convertit d'abord en devise de base, puis vers la devise cible
  return (amount / fromRate) * toRate;
}

/**
 * Retourne le symbole d'une devise (ou le code si inconnu).
 */
export function getCurrencySymbol(currencyCode: string): string {
  const curr = SUPPORTED_CURRENCIES[currencyCode as keyof typeof SUPPORTED_CURRENCIES];
  return curr?.symbol ?? currencyCode;
}
