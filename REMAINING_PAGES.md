# Pages Restantes à Créer - Web Admin

## ✅ Pages Déjà Créées

- ✅ app/page.tsx - Dashboard
- ✅ app/login/page.tsx - Connexion
- ✅ app/pros/page.tsx - Liste pros
- ✅ app/pros/[id]/page.tsx - Détail pro + validation
- ✅ app/drivers/page.tsx - Liste chauffeurs
- ✅ app/drivers/[id]/page.tsx - Détail chauffeur + validation

## 📋 Pages à Créer (Pattern Identique)

### 1. Sellers (Vendeurs Marketplace)

**app/sellers/page.tsx** - Copier/coller `app/drivers/page.tsx`
- Changer: `drivers` → `sellers`
- Changer titre: "Gestion des Vendeurs Marketplace"
- Colonnes table: Vendeur, Catégorie produits, Statut, Note, Actions

**app/sellers/[id]/page.tsx** - Copier/coller `app/drivers/[id]/page.tsx`
- Changer: `drivers` → `sellers`
- Afficher: businessName, address, categories, verifiedAt

### 2. Products (Modération Produits)

**app/products/page.tsx**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/products')
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const handleModerate = async (productId: string, approved: boolean) => {
    try {
      await apiClient.put(`/products/${productId}/moderate`, { approved });
      alert('Produit modéré');
      // Recharger la liste
      setProducts(products.filter((p: any) => p.id !== productId));
    } catch (error) {
      alert('Erreur');
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Modération des Produits</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Produit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Vendeur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Prix
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product: any) => (
              <tr key={product.id}>
                <td className="px-6 py-4">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">{product.category}</div>
                </td>
                <td className="px-6 py-4">{product.seller?.businessName}</td>
                <td className="px-6 py-4">{formatCurrency(product.price)}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleModerate(product.id, true)}
                    className="text-green-600 hover:text-green-900 mr-4"
                  >
                    Approuver
                  </button>
                  <button
                    onClick={() => handleModerate(product.id, false)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Rejeter
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### 3. Transactions (Paiements)

**app/transactions/page.tsx**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/payments')
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Transactions</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Statut Escrow
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Commission
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((tx: any) => (
              <tr key={tx.id}>
                <td className="px-6 py-4 text-sm font-mono">{tx.id.slice(0, 8)}...</td>
                <td className="px-6 py-4">{formatCurrency(tx.amount)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    tx.escrowStatus === 'released' ? 'bg-green-100 text-green-800' :
                    tx.escrowStatus === 'held' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {tx.escrowStatus}
                  </span>
                </td>
                <td className="px-6 py-4">{formatCurrency(tx.commissionAmount)}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDateTime(tx.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### 4. Disputes (Litiges)

**app/disputes/page.tsx** - Liste des litiges
```typescript
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

export default function DisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/disputes')
      .then(setDisputes)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestion des Litiges</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">ID</th>
              <th className="px-6 py-3 text-left">Type</th>
              <th className="px-6 py-3 text-left">Statut</th>
              <th className="px-6 py-3 text-left">Créé le</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {disputes.map((dispute: any) => (
              <tr key={dispute.id}>
                <td className="px-6 py-4">{dispute.id.slice(0, 8)}...</td>
                <td className="px-6 py-4">{dispute.type}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    dispute.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {dispute.status}
                  </span>
                </td>
                <td className="px-6 py-4">{new Date(dispute.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <Link href={`/disputes/${dispute.id}`} className="text-primary hover:underline">
                    Gérer
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

**app/disputes/[id]/page.tsx** - Résolution litige
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [dispute, setDispute] = useState<any>(null);
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    apiClient.get(`/disputes/${params.id}`).then(setDispute);
  }, [params.id]);

  const handleResolve = async () => {
    try {
      await apiClient.put(`/disputes/${params.id}/resolve`, {
        resolution,
        resolvedInFavorOf: 'client', // ou 'pro'
      });
      alert('Litige résolu');
      router.push('/disputes');
    } catch (error) {
      alert('Erreur');
    }
  };

  if (!dispute) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Litige #{dispute.id.slice(0, 8)}</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Détails</h2>
        <p className="mb-4">{dispute.description}</p>

        <div className="space-y-4">
          <textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="Résolution du litige..."
            rows={6}
            className="w-full px-3 py-2 border rounded-md"
          />

          <button
            onClick={handleResolve}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Résoudre le litige
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 5. Settings (Paramètres)

**app/settings/page.tsx**
```typescript
'use client';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Paramètres</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Configuration de la plateforme</h2>
        <p className="text-gray-600">
          Interface de configuration des paramètres globaux
          (commissions, zones, catégories, etc.)
        </p>
        <p className="text-sm text-gray-500 mt-4">
          TODO: Implémenter les paramètres système
        </p>
      </div>
    </div>
  );
}
```

## 🚀 Résumé

**Pour créer rapidement les pages manquantes :**

1. **Sellers** - Copier drivers/ et adapter
2. **Products** - Utiliser le code ci-dessus
3. **Transactions** - Utiliser le code ci-dessus
4. **Disputes** - Utiliser le code ci-dessus
5. **Settings** - Utiliser le code ci-dessus

**Tous les patterns sont identiques, seuls changent :**
- Les endpoints API (`/pros`, `/drivers`, `/sellers`, etc.)
- Les champs affichés selon le modèle
- Les labels/textes

✅ **Le Web Admin sera complet !**
