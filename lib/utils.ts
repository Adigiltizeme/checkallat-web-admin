import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Formate un montant avec la devise appropriée selon le marché
 * @param amount - Montant à formater
 * @param currency - Code devise ISO (EGP, EUR, USD, MAD, TND, XOF, etc.)
 * @param locale - Locale pour le formatage (défaut: détecté selon devise)
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'EGP',
  locale?: string
) => {
  // Détection automatique du locale selon la devise si non fourni
  const autoLocale = locale || getCurrencyLocale(currency);

  try {
    return new Intl.NumberFormat(autoLocale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback si la devise n'est pas supportée
    console.warn(`Currency ${currency} not supported, falling back to symbol format`);
    return `${amount.toFixed(2)} ${currency}`;
  }
};

/**
 * Retourne le locale approprié selon la devise
 */
function getCurrencyLocale(currency: string): string {
  const localeMap: Record<string, string> = {
    'EGP': 'en-EG',  // Livre égyptienne (chiffres occidentaux pour admin)
    'EUR': 'fr-FR',  // Euro
    'USD': 'en-US',  // Dollar américain
    'MAD': 'fr-MA',  // Dirham marocain (chiffres occidentaux)
    'TND': 'fr-TN',  // Dinar tunisien (chiffres occidentaux)
    'XOF': 'fr-CI',  // Franc CFA (Côte d'Ivoire, Sénégal)
    'GBP': 'en-GB',  // Livre sterling
    'SAR': 'en-SA',  // Riyal saoudien (chiffres occidentaux)
    'AED': 'en-AE',  // Dirham émirati (chiffres occidentaux)
  };

  return localeMap[currency] || 'fr-FR';
}

/**
 * Version simplifiée pour affichage compact (sans décimales si entier)
 */
export const formatCurrencyCompact = (amount: number, currency: string = 'EGP') => {
  const isInteger = amount % 1 === 0;
  const locale = getCurrencyLocale(currency);

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: isInteger ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDateTime = (date: Date | string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};
