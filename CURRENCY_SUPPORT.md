# Support Multi-Devises - CheckAll@t Admin

## 📋 Vue d'ensemble

L'interface admin CheckAll@t supporte **9 devises** pour gérer l'expansion géographique progressive de la plateforme, conformément à la roadmap définie dans le cahier des charges.

## 💰 Devises supportées

| Devise | Code | Symbole | Marché | Phase | Lancement |
|--------|------|---------|--------|-------|-----------|
| 🇪🇬 Livre égyptienne | EGP | ج.م | Égypte | MVP | Mars 2026 |
| 🇫🇷 Euro | EUR | € | France / Europe | Phase 2 | 2027 Q1 |
| 🇺🇸 Dollar américain | USD | $ | International | Future | TBD |
| 🇲🇦 Dirham marocain | MAD | د.م. | Maroc | Phase 3 | 2028 Q1 |
| 🇹🇳 Dinar tunisien | TND | د.ت | Tunisie | Phase 3 | 2028 Q2 |
| 🇸🇳 Franc CFA | XOF | CFA | Afrique de l'Ouest | Phase 3 | 2028 Q3 |
| 🇸🇦 Riyal saoudien | SAR | ر.س | Arabie Saoudite | Future | TBD |
| 🇦🇪 Dirham émirati | AED | د.إ | Émirats Arabes Unis | Future | TBD |
| 🇬🇧 Livre sterling | GBP | £ | Royaume-Uni | Future | TBD |

## 🎯 Fonctionnalités

### Formatage automatique
- Détection automatique du **locale** selon la devise
- Affichage correct des **symboles de devises**
- Formatage des **nombres** selon les conventions locales
- Support de l'**écriture arabe** pour les marchés MENA

### Gestion des décimales
- Affichage intelligent : **0 décimale** pour les montants entiers
- **2 décimales** maximum pour les montants non entiers
- Option compacte pour les UI condensées

### Robustesse
- **Fallback** automatique si devise non supportée
- **Validation** des codes ISO 4217
- **Logs** d'avertissement en cas d'erreur

## 📝 Utilisation

### Importation
```typescript
import { formatCurrency, formatCurrencyCompact } from '@/lib/utils';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from '@/lib/constants';
```

### Exemples de base

```typescript
// Égypte (devise par défaut)
formatCurrency(1500)
// Résultat: "١٬٥٠٠ ج.م" (format arabe)

formatCurrency(1500.50, 'EGP')
// Résultat: "١٬٥٠٠٫٥٠ ج.م"

// France
formatCurrency(150, 'EUR')
// Résultat: "150 €"

formatCurrency(150.75, 'EUR')
// Résultat: "150,75 €"

// Maroc
formatCurrency(500, 'MAD')
// Résultat: "٥٠٠٫٠٠ د.م."

// Sénégal (Franc CFA)
formatCurrency(10000, 'XOF')
// Résultat: "10 000 CFA"
```

### Version compacte

```typescript
// Supprime les décimales inutiles
formatCurrencyCompact(1500, 'EGP')
// Résultat: "١٬٥٠٠ ج.م" (pas de décimales)

formatCurrencyCompact(1500.50, 'EUR')
// Résultat: "1 500,50 €" (avec décimales)
```

### Avec locale personnalisé

```typescript
// Forcer un locale spécifique
formatCurrency(1000, 'EGP', 'fr-FR')
// Résultat: "1 000 EGP" (format français)

formatCurrency(1000, 'EGP', 'ar-EG')
// Résultat: "١٬٠٠٠ ج.م" (format arabe)
```

## 🗂️ Constantes disponibles

### SUPPORTED_CURRENCIES
Objet contenant toutes les informations sur les devises :
```typescript
SUPPORTED_CURRENCIES.EGP
// {
//   code: 'EGP',
//   name: 'Livre égyptienne',
//   symbol: 'ج.م',
//   locale: 'ar-EG',
//   market: 'Égypte',
// }
```

### DEFAULT_CURRENCY
```typescript
DEFAULT_CURRENCY // 'EGP'
```

### COMMISSION_RATES
Taux de commission par catégorie et segment :
```typescript
COMMISSION_RATES.transport.standard // 10
COMMISSION_RATES.transport.premium // 12
COMMISSION_RATES.marketplace.standard // 15
```

## 🔄 Intégration dans les composants

### Dashboard - StatsCards
```typescript
import { formatCurrency } from '@/lib/utils';

// Affichage du revenu total
<div className="text-2xl font-bold">
  {formatCurrency(stats.totalRevenue, 'EGP')}
</div>
```

### Transactions Table
```typescript
import { formatCurrencyCompact } from '@/lib/utils';

{transactions.map((tx) => (
  <td>{formatCurrencyCompact(tx.amount, tx.currency || 'EGP')}</td>
))}
```

### Settings Page
```typescript
import { SUPPORTED_CURRENCIES } from '@/lib/constants';

<select>
  {Object.values(SUPPORTED_CURRENCIES).map((currency) => (
    <option key={currency.code} value={currency.code}>
      {currency.name} ({currency.code})
    </option>
  ))}
</select>
```

## 📊 Taux de commission

Les taux de commission varient selon la catégorie de service et le segment :

### Services & Transport

| Catégorie | Standard | Premium |
|-----------|----------|---------|
| Déménagement/Transport | 10% | 12% |
| Électricité/Plomberie | 12% | 14% |
| Peinture/Bricolage | 10% | 12% |
| Nettoyage | 10% | 12% |

### Marketplace
| Segment | Commission |
|---------|------------|
| Tous | 15% |

## 🌍 Roadmap d'expansion

### Phase 1 (2026) - MVP
- 🇪🇬 **Égypte** (Le Caire)
- Devise : EGP
- Lancement : Ramadan 2026 (mars)

### Phase 2 (2027)
- 🇫🇷 **France** (Paris → grandes villes)
- Devise : EUR
- Lancement : Q1 2027

### Phase 3 (2028)
- 🇲🇦 **Maroc** (Casablanca, Rabat)
- 🇹🇳 **Tunisie** (Tunis)
- 🇸🇳 **Sénégal** (Dakar)
- 🇨🇮 **Côte d'Ivoire** (Abidjan)
- Devises : MAD, TND, XOF
- Lancement : 2028 Q1-Q3

### Phase 4 (2029+)
- 🌎 Expansion mondiale
- Devises additionnelles selon les marchés

## ⚠️ Notes importantes

### Conversion de devises
- ❌ **Pas de conversion automatique** entre devises dans le MVP
- Chaque marché opère avec sa propre devise
- Les transactions sont toujours dans la devise locale

### Stockage en base de données
```prisma
model Payment {
  amount   Float
  currency String @default("EGP")  // Code ISO 4217
  // ...
}
```

### API Backend
Les endpoints doivent retourner le champ `currency` :
```json
{
  "amount": 1500,
  "currency": "EGP",
  "commissionRate": 12,
  "commissionAmount": 180
}
```

## 🔧 Maintenance

### Ajouter une nouvelle devise

1. **Mettre à jour** `lib/utils.ts` :
```typescript
function getCurrencyLocale(currency: string): string {
  const localeMap: Record<string, string> = {
    // ... devises existantes
    'NEW': 'xx-XX',  // Nouveau code devise
  };
  return localeMap[currency] || 'fr-FR';
}
```

2. **Mettre à jour** `lib/constants.ts` :
```typescript
export const SUPPORTED_CURRENCIES = {
  // ... devises existantes
  NEW: {
    code: 'NEW',
    name: 'Nouvelle devise',
    symbol: 'SYM',
    locale: 'xx-XX',
    market: 'Nouveau marché',
  },
} as const;
```

3. **Mettre à jour** cette documentation

## ✅ Tests

Pour tester le formatage des devises :
```typescript
import { formatCurrency } from '@/lib/utils';

// Test chaque devise
console.log(formatCurrency(1234.56, 'EGP')); // ١٬٢٣٤٫٥٦ ج.م
console.log(formatCurrency(1234.56, 'EUR')); // 1 234,56 €
console.log(formatCurrency(1234.56, 'USD')); // $1,234.56
console.log(formatCurrency(1234.56, 'MAD')); // ١٬٢٣٤٫٥٦ د.م.
```

---

**Dernière mise à jour** : 23 février 2026
**Contact** : adama.digiltizeme@gmail.com
