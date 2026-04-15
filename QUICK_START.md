# 🚀 Démarrage Rapide Web Admin

## ⚠️ Les erreurs TypeScript sont normales AVANT l'installation !

Les fichiers `.ts` et `.tsx` montrent des erreurs car les dépendances ne sont pas encore installées.

## 📦 Étapes obligatoires

### 1️⃣ Installer les dépendances (OBLIGATOIRE)

```bash
cd web-admin
npm install
```

**⏱️ Temps estimé : 2-3 minutes**

Cela installera :
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Radix UI components
- Axios, Zustand, etc.

### 2️⃣ Initialiser shadcn

```bash
npx shadcn@latest init
```

**Choisir :**
- Base color: **Slate** ⬅️ Descendez avec les flèches
- CSS variables: **Yes**
- Autres options: **Default (Entrée)**

### 3️⃣ Installer les composants UI

```bash
npx shadcn@latest add button card input label select table badge avatar skeleton textarea
```

### 4️⃣ Démarrer le serveur de développement

```bash
npm run dev
```

**L'application sera accessible sur : http://localhost:3001**

## ✅ Vérification

Une fois les étapes ci-dessus complétées :

1. ✅ Les erreurs TypeScript disparaîtront
2. ✅ Le serveur démarrera sans erreur
3. ✅ Vous pourrez accéder à http://localhost:3001
4. ✅ La page de login s'affichera

## 🔧 Si des erreurs persistent

### Erreur : Cannot find module 'next'
**Solution :** Vous avez oublié `npm install`

### Erreur : Module not found: Can't resolve '@/components/ui/...'
**Solution :** Vous avez oublié `npx shadcn-ui@latest add [component]`

### Erreur : Cannot find module 'lucide-react'
**Solution :** Relancer `npm install`

## 📝 Backend requis

Le frontend se connecte à l'API backend sur `http://localhost:3000/api/v1`

Assurez-vous que le backend est démarré :
```bash
cd backend_checkallat
npm run start:dev
```

## 🎯 Compte Admin pour tester

Créez un compte admin dans le backend ou utilisez un compte existant avec role admin.

## 📚 Structure après installation

```
web-admin/
├── node_modules/          ← Créé après npm install
├── .next/                 ← Créé après npm run dev
├── components/
│   ├── ui/               ← Créé après shadcn init/add
│   └── layout/
├── app/
├── lib/
├── package.json
└── ...
```

---

**⚡ TL;DR : Lancez simplement `npm install` et les erreurs disparaîtront !**
