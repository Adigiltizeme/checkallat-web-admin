# CheckAll@t Admin - Setup Instructions

## 📦 Installation

### 1. Installer les dépendances
```bash
cd web-admin
npm install
```

### 2. Initialiser shadcn/ui
```bash
npx shadcn-ui@latest init
```

Choisir les options suivantes:
- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**

### 3. Installer les composants shadcn/ui nécessaires
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add textarea
```

## 🏗️ Structure des fichiers créés

✅ **Déjà créés:**
- `package.json` - Dépendances
- `next.config.js` - Configuration Next.js
- `tsconfig.json` - Configuration TypeScript
- `tailwind.config.ts` - Configuration Tailwind
- `postcss.config.js` - Configuration PostCSS
- `.env.local` - Variables d'environnement
- `app/globals.css` - Styles globaux
- `lib/utils.ts` - Utilitaires
- `lib/auth.ts` - Authentification
- `lib/api.ts` - Client API

## 📝 Fichiers à créer manuellement

### Layout Components

**components/layout/Sidebar.tsx** - Menu de navigation latéral
**components/layout/Header.tsx** - En-tête avec user dropdown

### App Layout

**app/layout.tsx** - Layout principal avec Sidebar + Header

### Pages

**app/page.tsx** - Dashboard avec statistiques
**app/login/page.tsx** - Page de connexion
**app/pros/page.tsx** - Liste des professionnels
**app/pros/[id]/page.tsx** - Détail d'un professionnel

## 🚀 Démarrage

```bash
npm run dev
```

L'application sera accessible sur http://localhost:3001

## 📋 Pages à implémenter (patterns similaires)

Toutes ces pages suivent le même pattern que `app/pros/`:

1. **app/drivers/page.tsx** - Liste des chauffeurs
2. **app/drivers/[id]/page.tsx** - Détail chauffeur
3. **app/sellers/page.tsx** - Liste des vendeurs
4. **app/sellers/[id]/page.tsx** - Détail vendeur
5. **app/products/page.tsx** - Modération produits
6. **app/transactions/page.tsx** - Liste transactions
7. **app/disputes/page.tsx** - Liste litiges
8. **app/disputes/[id]/page.tsx** - Détail litige
9. **app/settings/page.tsx** - Paramètres

## 🎨 Pattern de base pour une page

```typescript
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ExamplePage() {
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
      <h1 className="text-3xl font-bold">Titre Page</h1>
      <Card>
        <CardHeader>
          <CardTitle>Section</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Contenu */}
        </CardContent>
      </Card>
    </div>
  );
}
```

## 🔗 Endpoints API utilisés

- `GET /admin/stats` - Statistiques dashboard
- `GET /pros` - Liste pros
- `GET /pros/:id` - Détail pro
- `PUT /pros/:id/validate` - Valider/Rejeter pro
- `GET /drivers` - Liste drivers
- `GET /sellers` - Liste sellers
- `GET /products` - Liste produits
- `GET /transactions` - Liste transactions
- `GET /disputes` - Liste litiges

## 🎯 Prochaines étapes

1. Créer les composants layout (Sidebar, Header)
2. Créer app/layout.tsx
3. Créer app/page.tsx (Dashboard)
4. Créer app/login/page.tsx
5. Créer app/pros/page.tsx et app/pros/[id]/page.tsx
6. Répliquer le pattern pour les autres sections
7. Tester avec le backend

## 📦 Build Production

```bash
npm run build
npm run start
```

## 🚀 Déploiement Vercel

```bash
vercel
```

Configurer les variables d'environnement dans Vercel:
- `NEXT_PUBLIC_API_URL` - URL de votre API backend
