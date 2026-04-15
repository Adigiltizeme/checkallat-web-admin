import { useSettings } from '@/contexts/SettingsContext';
import { formatCurrency as formatCurrencyUtil, formatCurrencyCompact as formatCurrencyCompactUtil } from '@/lib/utils';

/**
 * Hook personnalisé pour formater les montants avec conversion de devise
 */
export function useCurrency() {
  const { settings } = useSettings();
  const currency = settings?.currency || 'EGP';
  const baseCurrency = settings?.baseCurrency || 'EGP';
  const exchangeRates = settings?.exchangeRates || { EGP: 1 };

  /**
   * Convertit un montant de la devise de base vers la devise d'affichage
   * @param amount - Montant dans la devise de base (baseCurrency)
   * @returns Montant converti dans la devise d'affichage (currency)
   */
  const convertAmount = (amount: number): number => {
    if (baseCurrency === currency) {
      return amount; // Pas de conversion nécessaire
    }

    const rate = exchangeRates[currency];
    if (!rate) {
      console.warn(`Exchange rate not found for ${currency}, using base currency`);
      return amount;
    }

    return amount * rate;
  };

  const formatCurrency = (amountInBaseCurrency: number) => {
    const convertedAmount = convertAmount(amountInBaseCurrency);
    return formatCurrencyUtil(convertedAmount, currency);
  };

  const formatCurrencyCompact = (amountInBaseCurrency: number) => {
    const convertedAmount = convertAmount(amountInBaseCurrency);
    return formatCurrencyCompactUtil(convertedAmount, currency);
  };

  return {
    currency,
    baseCurrency,
    exchangeRates,
    convertAmount,
    formatCurrency,
    formatCurrencyCompact,
  };
}
