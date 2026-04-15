'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useCurrency } from '@/hooks/useCurrency';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [filters, setFilters] = useState({ status: 'all', search: '' });
  const [searchInput, setSearchInput] = useState('');
  const { formatCurrency } = useCurrency();

  const loadProducts = (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true); else setFetching(true);
    apiClient.get('/admin/products', { params: filters })
      .then((data: any) => setProducts(data.products || data))
      .catch(console.error)
      .finally(() => { setLoading(false); setFetching(false); });
  };

  useEffect(() => {
    const id = setTimeout(() => setFilters((prev) => ({ ...prev, search: searchInput })), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    loadProducts(loading);
  }, [filters.search, filters.status]);

  const handleModerate = async (productId: string, approved: boolean) => {
    if (!confirm(`Êtes-vous sûr de vouloir ${approved ? 'approuver' : 'rejeter'} ce produit ?`)) {
      return;
    }

    try {
      await apiClient.put(`/admin/products/${productId}/moderate`, { approved });
      alert(`Produit ${approved ? 'approuvé' : 'rejeté'} avec succès`);
      loadProducts();
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Erreur lors de la modération'));
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir SUPPRIMER définitivement ce produit ? Cette action est irréversible.')) {
      return;
    }

    try {
      await apiClient.delete(`/admin/products/${productId}`);
      alert('Produit supprimé avec succès');
      loadProducts();
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Erreur inconnue'));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Modération des Produits</h1>
        <p className="text-gray-600">
          Validation des produits en attente de modération
        </p>
      </div>

      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Rechercher par nom, description..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1 max-w-sm px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Tous statuts</option>
          <option value="active">Disponibles</option>
          <option value="inactive">Indisponibles</option>
        </select>
        {fetching && <span className="text-sm text-gray-400">Chargement...</span>}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendeur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product: any) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-500">{product.category}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {product.seller?.businessName || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatCurrency(product.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.isAvailable ? 'Disponible' : 'Indisponible'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleModerate(product.id, !product.isAvailable)}
                      className={`${
                        product.isAvailable
                          ? 'text-orange-600 hover:text-orange-900'
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {product.isAvailable ? 'Désactiver' : 'Activer'}
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun produit en attente de modération
          </div>
        )}
      </div>
    </div>
  );
}
