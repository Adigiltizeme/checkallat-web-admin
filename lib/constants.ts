/**
 * Constantes de l'application CheckAll@t Admin
 */

// Devises supportées par marché géographique
export const SUPPORTED_CURRENCIES = {
  EGP: {
    code: 'EGP',
    name: 'Livre égyptienne',
    symbol: 'ج.م',
    locale: 'ar-EG',
    market: 'Égypte',
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    locale: 'fr-FR',
    market: 'France / Europe',
  },
  USD: {
    code: 'USD',
    name: 'Dollar américain',
    symbol: '$',
    locale: 'en-US',
    market: 'International',
  },
  MAD: {
    code: 'MAD',
    name: 'Dirham marocain',
    symbol: 'د.م.',
    locale: 'ar-MA',
    market: 'Maroc',
  },
  TND: {
    code: 'TND',
    name: 'Dinar tunisien',
    symbol: 'د.ت',
    locale: 'ar-TN',
    market: 'Tunisie',
  },
  XOF: {
    code: 'XOF',
    name: 'Franc CFA',
    symbol: 'CFA',
    locale: 'fr-CI',
    market: 'Afrique de l\'Ouest',
  },
  DZD: {
    code: 'DZD',
    name: 'Dinar algérien',
    symbol: 'د.ج',
    locale: 'ar-DZ',
    market: 'Algérie',
  },
  SAR: {
    code: 'SAR',
    name: 'Riyal saoudien',
    symbol: 'ر.س',
    locale: 'ar-SA',
    market: 'Arabie Saoudite',
  },
  AED: {
    code: 'AED',
    name: 'Dirham émirati',
    symbol: 'د.إ',
    locale: 'ar-AE',
    market: 'Émirats Arabes Unis',
  },
} as const;

// Devise par défaut (MVP Égypte)
export const DEFAULT_CURRENCY = 'EGP';

// Taux de commission par catégorie et segment
export const COMMISSION_RATES = {
  moving_transport: {
    standard: 10,
    premium: 12,
  },
  electricity: {
    standard: 12,
    premium: 14,
  },
  plumbing: {
    standard: 12,
    premium: 14,
  },
  painting: {
    standard: 10,
    premium: 12,
  },
  cleaning: {
    standard: 10,
    premium: 12,
  },
  marketplace: {
    standard: 15,
    premium: 15, // Pas de différence pour marketplace
  },
} as const;

// Statuts de réservation
export const BOOKING_STATUSES = {
  pending: { label: 'En attente', color: 'yellow' },
  confirmed: { label: 'Confirmée', color: 'green' },
  in_progress: { label: 'En cours', color: 'blue' },
  completed: { label: 'Terminée', color: 'green' },
  cancelled: { label: 'Annulée', color: 'red' },
} as const;

// Statuts de paiement
export const PAYMENT_STATUSES = {
  pending: { label: 'En attente', color: 'yellow' },
  completed: { label: 'Complété', color: 'green' },
  failed: { label: 'Échoué', color: 'red' },
  refunded: { label: 'Remboursé', color: 'gray' },
} as const;

// Statuts escrow
export const ESCROW_STATUSES = {
  captured: { label: 'Capturé', color: 'blue' },
  held: { label: 'Retenu', color: 'yellow' },
  released: { label: 'Libéré', color: 'green' },
  refunded: { label: 'Remboursé', color: 'red' },
} as const;

// Rôles utilisateurs
export const USER_ROLES = {
  client: 'Client',
  pro: 'Professionnel',
  driver: 'Chauffeur',
  seller: 'Vendeur',
  admin: 'Administrateur',
} as const;

// Statuts de validation
export const VALIDATION_STATUSES = {
  pending: { label: 'En attente', color: 'yellow' },
  active: { label: 'Actif', color: 'green' },
  suspended: { label: 'Suspendu', color: 'orange' },
  rejected: { label: 'Rejeté', color: 'red' },
} as const;

// Catégories de services
export const SERVICE_CATEGORIES = [
  { value: 'moving', label: 'Déménagement & Transport', icon: '🚚' },
  { value: 'electricity', label: 'Électricité', icon: '⚡' },
  { value: 'plumbing', label: 'Plomberie', icon: '🔧' },
  { value: 'painting', label: 'Peinture', icon: '🎨' },
  { value: 'handyman', label: 'Bricolage', icon: '🔨' },
  { value: 'cleaning', label: 'Nettoyage', icon: '🧹' },
] as const;

// Types de véhicules (Transport)
export const VEHICLE_TYPES = {
  van: { label: 'Fourgonnette', capacity: '0-15 m³', baseFare: 200 },
  small_truck: { label: 'Petit camion', capacity: '15-30 m³', baseFare: 350 },
  large_truck: { label: 'Grand camion', capacity: '30+ m³', baseFare: 500 },
} as const;

// Catégories Marketplace
export const MARKETPLACE_CATEGORIES = [
  { value: 'food', label: 'Plats cuisinés / Pâtisserie', icon: '🍰' },
  { value: 'crafts', label: 'Artisanat', icon: '🎨' },
  { value: 'furniture', label: 'Meubles', icon: '🪑' },
  { value: 'electronics', label: 'Électronique', icon: '📱' },
  { value: 'clothing', label: 'Vêtements', icon: '👕' },
  { value: 'other', label: 'Autre', icon: '📦' },
] as const;

// Types de litiges
export const DISPUTE_TYPES = {
  quality: 'Problème de qualité',
  payment: 'Problème de paiement',
  cancellation: 'Annulation litigieuse',
  fraud: 'Suspicion de fraude',
  other: 'Autre',
} as const;

// Langues supportées
export const SUPPORTED_LANGUAGES = {
  fr: { code: 'fr', name: 'Français', flag: '🇫🇷' },
  en: { code: 'en', name: 'English', flag: '🇬🇧' },
  ar: { code: 'ar', name: 'العربية', flag: '🇪🇬' },
} as const;

// Marchés géographiques (roadmap)
export const MARKETS = [
  {
    id: 'egypt',
    name: 'Égypte',
    flag: '🇪🇬',
    currency: 'EGP',
    phase: 'MVP',
    launchDate: '2026-03',
  },
  {
    id: 'france',
    name: 'France',
    flag: '🇫🇷',
    currency: 'EUR',
    phase: 'Phase 2',
    launchDate: '2027-Q1',
  },
  {
    id: 'senegal',
    name: 'Sénégal',
    flag: '🇸🇳',
    currency: 'XOF',
    phase: 'Phase 3',
    launchDate: '2028-Q1',
  },
  {
    id: 'mali',
    name: 'Mali',
    flag: '🇲🇱',
    currency: 'XOF',
    phase: 'Phase 3',
    launchDate: '2028-Q2',
  },
] as const;
