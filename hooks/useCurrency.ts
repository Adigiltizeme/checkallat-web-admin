import { useSettings } from '@/contexts/SettingsContext';
import { useZone } from '@/contexts/ZoneContext';
import { formatCurrency as formatCurrencyUtil, formatCurrencyCompact as formatCurrencyCompactUtil } from '@/lib/utils';

export function useCurrency() {
  const { settings } = useSettings();
  const { selectedZoneObj } = useZone();

  const globalCurrency = settings?.currency ?? '';
  const baseCurrency = settings?.baseCurrency ?? '';
  const exchangeRates = (settings?.exchangeRates as Record<string, number>) || {};

  // Quand une zone est sélectionnée, les montants sont déjà dans la devise de la zone
  // — pas de conversion nécessaire. Sans zone, on applique le taux global.
  const zoneCurrency = selectedZoneObj?.currency ?? '';
  const currency = zoneCurrency || globalCurrency;
  const isMixed = !zoneCurrency && !!globalCurrency; // données multi-zones affichées ensemble

  const convertAmount = (amount: number): number => {
    if (zoneCurrency) return amount; // déjà dans la bonne devise
    if (baseCurrency === globalCurrency) return amount;
    const rate = exchangeRates[globalCurrency];
    if (!rate) return amount;
    return amount * rate;
  };

  const formatCurrency = (amount: number, overrideCurrency?: string) => {
    if (overrideCurrency) return formatCurrencyUtil(amount, overrideCurrency);
    return formatCurrencyUtil(convertAmount(amount), currency);
  };

  const formatCurrencyCompact = (amount: number, overrideCurrency?: string) => {
    if (overrideCurrency) return formatCurrencyCompactUtil(amount, overrideCurrency);
    return formatCurrencyCompactUtil(convertAmount(amount), currency);
  };

  return {
    currency,
    baseCurrency,
    exchangeRates,
    isMixed,
    convertAmount,
    formatCurrency,
    formatCurrencyCompact,
  };
}
