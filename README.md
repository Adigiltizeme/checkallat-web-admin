# CheckAll@t Web Admin

Interface d'administration Next.js 14 pour la plateforme CheckAll@t.

## ✅ Fichiers Créés

### Configuration
- ✅ `package.json` - Dépendances et scripts
- ✅ `next.config.js` - Configuration Next.js
- ✅ `tsconfig.json` - Configuration TypeScript
- ✅ `tailwind.config.ts` - Configuration Tailwind CSS
- ✅ `postcss.config.js` - Configuration PostCSS
- ✅ `.env.local` - Variables d'environnement

### Styles
- ✅ `app/globals.css` - Styles globaux avec variables CSS

### Utilitaires (/lib)
- ✅ `lib/utils.ts` - Fonctions utilitaires (cn, formatCurrency, formatDate)
- ✅ `lib/auth.ts` - Authentification (login, logout, tokens)
- ✅ `lib/api.ts` - Client API avec interceptors

### Layout (/components/layout)
- ✅ `components/layout/Sidebar.tsx` - Menu navigation latéral
- ✅ `components/layout/Header.tsx` - En-tête avec user info

### Pages (/app)
- ✅ `app/layout.tsx` - Layout principal
- ✅ `app/page.tsx` - Dashboard avec stats
- ✅ `app/login/page.tsx` - Page de connexion
- ✅ `app/pros/page.tsx` - Liste des professionnels

## 🚀 Installation

```bash
cd web-admin
npm install
```

## 📦 Installation shadcn/ui

```bash
# Initialiser shadcn/ui
npx shadcn-ui@latest init

# Installer les composants nécessaires
npx shadcn-ui@latest add button card input label select table badge avatar dropdown-menu dialog toast tabs skeleton textarea
```

## 🏃 Démarrage

```bash
npm run dev
```

L'application sera accessible sur **http://localhost:3001**

## 📋 Pages Restantes à Créer

Toutes ces pages suivent le même pattern que `/app/pros/page.tsx` :

### 1. Drivers Management
```typescript
// app/drivers/page.tsx - Liste des chauffeurs
// app/drivers/[id]/page.tsx - Détail + validation chauffeur
```

### 2. Sellers Management
```typescript
// app/sellers/page.tsx - Liste des vendeurs
// app/sellers/[id]/page.tsx - Détail + validation vendeur
```

### 3. Products Moderation
```typescript
// app/products/page.tsx - Modération des produits marketplace
```

### 4. Transactions
```typescript
// app/transactions/page.tsx - Liste des transactions/paiements
```

### 5. Disputes
```typescript
// app/disputes/page.tsx - Liste des litiges
// app/disputes/[id]/page.tsx - Détail litige + résolution
```

### 6. Settings
```typescript
// app/settings/page.tsx - Paramètres plateforme
```

## 🎨 Pattern de Base pour Nouvelle Page

```typescript
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export default function NewPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/endpoint')
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Titre</h1>
      {/* Contenu */}
    </div>
  );
}
```

## 🔧 Composants Dashboard à Implémenter

Ces composants peuvent être ajoutés dans `app/page.tsx` :

### RevenueChart (Recharts)
```typescript
// components/dashboard/RevenueChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
```

### RecentActivity
```typescript
// components/dashboard/RecentActivity.tsx
// Liste des dernières actions sur la plateforme
```

### TransactionsTable
```typescript
// components/dashboard/TransactionsTable.tsx
// Tableau des dernières transactions
```

## 🔗 Endpoints API Backend Requis

L'admin utilise ces endpoints (à implémenter dans le backend si manquants) :

```typescript
// Stats
GET /admin/stats - Statistiques globales

// Pros
GET /pros - Liste pros (avec filtres)
GET /pros/:id - Détail pro
PUT /pros/:id/validate - Valider/Rejeter pro

// Drivers
GET /drivers - Liste drivers
GET /drivers/:id - Détail driver
PUT /drivers/:id/validate - Valider/Rejeter driver

// Sellers
GET /sellers - Liste sellers
GET /sellers/:id - Détail seller
PUT /sellers/:id/validate - Valider/Rejeter seller

// Products
GET /products - Liste produits (modération)
PUT /products/:id/moderate - Approuver/Rejeter produit

// Transactions
GET /payments - Liste paiements

// Disputes
GET /disputes - Liste litiges
GET /disputes/:id - Détail litige
PUT /disputes/:id/resolve - Résoudre litige
```

## 🎯 Prochaines Étapes

1. **Installer shadcn/ui** (voir commandes ci-dessus)
2. **Tester la connexion** avec un compte admin
3. **Créer les pages manquantes** (drivers, sellers, etc.)
4. **Implémenter les composants dashboard** (charts, activity)
5. **Ajouter les endpoints admin** dans le backend
6. **Déployer sur Vercel**

## 📦 Build Production

```bash
npm run build
npm run start
```

## 🚀 Déploiement Vercel

```bash
vercel
```

Configurer la variable d'environnement:
- `NEXT_PUBLIC_API_URL` = URL de votre API backend en production

---

**Tous les fichiers essentiels sont créés. Suivez SETUP_INSTRUCTIONS.md pour les détails complets.**
