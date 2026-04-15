'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { ProForm } from '@/components/forms/ProForm';

export default function ProsPage() {
  const [pros, setPros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [filters, setFilters] = useState({ status: 'all', search: '' });
  const [searchInput, setSearchInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPro, setSelectedPro] = useState<any>(null);

  const loadPros = (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true); else setFetching(true);
    apiClient
      .get('/admin/pros', { params: filters })
      .then((data: any) => setPros(data.pros || data))
      .catch(console.error)
      .finally(() => { setLoading(false); setFetching(false); });
  };

  useEffect(() => {
    const id = setTimeout(() => setFilters((prev) => ({ ...prev, search: searchInput })), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    loadPros(loading);
  }, [filters.search, filters.status]);

  const handleValidate = async (proId: string, approved: boolean) => {
    if (!confirm(`Êtes-vous sûr de vouloir ${approved ? 'approuver' : 'rejeter'} ce professionnel ?`)) {
      return;
    }

    try {
      await apiClient.put(`/admin/pros/${proId}/validate`, { approved });
      alert(`Professionnel ${approved ? 'approuvé' : 'rejeté'} avec succès`);
      loadPros();
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Erreur inconnue'));
    }
  };

  const handleSuspend = async (proId: string, userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir suspendre ce professionnel ?')) {
      return;
    }

    try {
      await apiClient.patch(`/admin/users/${userId}/suspend`);
      alert('Professionnel suspendu avec succès');
      loadPros();
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Erreur inconnue'));
    }
  };

  const handleReactivate = async (proId: string, userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir réactiver ce professionnel ?')) {
      return;
    }

    try {
      await apiClient.patch(`/admin/users/${userId}/reactivate`);
      alert('Professionnel réactivé avec succès');
      loadPros();
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Erreur inconnue'));
    }
  };

  const handleDelete = async (proId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir SUPPRIMER définitivement ce professionnel ? Cette action est irréversible.')) {
      return;
    }

    try {
      await apiClient.delete(`/admin/pros/${proId}`);
      alert('Professionnel supprimé avec succès');
      loadPros();
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Erreur inconnue'));
    }
  };

  const openCreateModal = () => {
    setSelectedPro(null);
    setIsModalOpen(true);
  };

  const openEditModal = (pro: any) => {
    setSelectedPro(pro);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPro(null);
  };

  const handleFormSuccess = () => {
    closeModal();
    loadPros();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Pros</h1>
          <p className="text-gray-600">
            Validation et gestion des professionnels
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un pro
        </button>
      </div>

      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Rechercher par nom, email..."
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
                Pro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégories
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
            {pros.map((pro: any) => (
              <tr key={pro.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {pro.companyName || pro.businessName || 'Professionnel indépendant'}
                  </div>
                  <div className="text-sm text-gray-500">{pro.user?.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {pro.serviceCategories
                      ?.filter((cat: string) =>
                        // Afficher uniquement les catégories françaises (sans version anglaise)
                        ['plomberie', 'chauffage', 'électricité', 'menuiserie', 'peinture',
                         'jardinage', 'nettoyage', 'déménagement', 'rénovation', 'toiture',
                         'serrurerie', 'maçonnerie', 'carrelage', 'climatisation'].includes(cat.toLowerCase())
                      )
                      .join(', ') || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      pro.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : pro.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {pro.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {pro.averageRating ? `${pro.averageRating.toFixed(1)}/5` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/pros/${pro.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Détails
                    </Link>
                    <button
                      onClick={() => openEditModal(pro)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Modifier
                    </button>
                    {pro.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleValidate(pro.id, true)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approuver
                        </button>
                        <button
                          onClick={() => handleValidate(pro.id, false)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Rejeter
                        </button>
                      </>
                    )}
                    {pro.status === 'active' && (
                      <button
                        onClick={() => handleSuspend(pro.id, pro.userId)}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        Suspendre
                      </button>
                    )}
                    {pro.status === 'suspended' && (
                      <button
                        onClick={() => handleReactivate(pro.id, pro.userId)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Réactiver
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(pro.id)}
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

        {!loading && pros.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun professionnel trouvé
          </div>
        )}
      </div>

      {/* Modal Créer/Modifier */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedPro ? 'Modifier le professionnel' : 'Ajouter un professionnel'}
        size="xl"
      >
        <ProForm
          pro={selectedPro}
          onSuccess={handleFormSuccess}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
