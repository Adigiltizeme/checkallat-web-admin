'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { SellerForm } from '@/components/forms/SellerForm';

export default function SellersPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [filters, setFilters] = useState({ status: 'all', search: '' });
  const [searchInput, setSearchInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<any>(null);

  const loadSellers = (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true); else setFetching(true);
    apiClient
      .get('/admin/sellers', { params: filters })
      .then((data: any) => setSellers(data.sellers || data))
      .catch(console.error)
      .finally(() => { setLoading(false); setFetching(false); });
  };

  useEffect(() => {
    const id = setTimeout(() => setFilters((prev) => ({ ...prev, search: searchInput })), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    loadSellers(loading);
  }, [filters.search, filters.status]);

  const handleValidate = async (sellerId: string, approved: boolean) => {
    if (!confirm(`Êtes-vous sûr de vouloir ${approved ? 'approuver' : 'rejeter'} ce vendeur ?`)) {
      return;
    }

    try {
      await apiClient.put(`/admin/sellers/${sellerId}/validate`, { approved });
      alert(`Vendeur ${approved ? 'approuvé' : 'rejeté'} avec succès`);
      loadSellers();
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Erreur inconnue'));
    }
  };

  const handleSuspend = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir suspendre ce vendeur ?')) {
      return;
    }

    try {
      await apiClient.patch(`/admin/users/${userId}/suspend`);
      alert('Vendeur suspendu avec succès');
      loadSellers();
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Erreur inconnue'));
    }
  };

  const handleReactivate = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir réactiver ce vendeur ?')) {
      return;
    }

    try {
      await apiClient.patch(`/admin/users/${userId}/reactivate`);
      alert('Vendeur réactivé avec succès');
      loadSellers();
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Erreur inconnue'));
    }
  };

  const openCreateModal = () => {
    setSelectedSeller(null);
    setIsModalOpen(true);
  };

  const openEditModal = (seller: any) => {
    setSelectedSeller(seller);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSeller(null);
  };

  const handleFormSuccess = () => {
    closeModal();
    loadSellers();
  };

  const handleDelete = async (sellerId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir SUPPRIMER définitivement ce vendeur ? Cette action est irréversible.')) {
      return;
    }

    try {
      await apiClient.delete(`/admin/sellers/${sellerId}`);
      alert('Vendeur supprimé avec succès');
      loadSellers();
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Erreur inconnue'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Vendeurs Marketplace</h1>
          <p className="text-gray-600">
            Validation et gestion des vendeurs de la marketplace
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un vendeur
        </button>
      </div>

      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Rechercher par nom, entreprise..."
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
          <option value="pending">En attente</option>
          <option value="active">Actifs</option>
          <option value="suspended">Suspendus</option>
          <option value="rejected">Rejetés</option>
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
                Vendeur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie produits
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Note
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sellers.map((seller: any) => (
              <tr key={seller.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {seller.businessName}
                  </div>
                  <div className="text-sm text-gray-500">{seller.user?.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {seller.categories?.join(', ') || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      seller.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : seller.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {seller.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {seller.averageRating ? `${seller.averageRating.toFixed(1)}/5` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/sellers/${seller.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Détails
                    </Link>
                    <button
                      onClick={() => openEditModal(seller)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Modifier
                    </button>
                    {seller.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleValidate(seller.id, true)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approuver
                        </button>
                        <button
                          onClick={() => handleValidate(seller.id, false)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Rejeter
                        </button>
                      </>
                    )}
                    {seller.status === 'active' && (
                      <button
                        onClick={() => handleSuspend(seller.user?.id)}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        Suspendre
                      </button>
                    )}
                    {seller.status === 'suspended' && (
                      <button
                        onClick={() => handleReactivate(seller.user?.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Réactiver
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(seller.id)}
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

        {!loading && sellers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun vendeur trouvé
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedSeller ? 'Modifier le vendeur' : 'Ajouter un vendeur'}
        size="xl"
      >
        <SellerForm seller={selectedSeller} onSuccess={handleFormSuccess} onCancel={closeModal} />
      </Modal>
    </div>
  );
}
