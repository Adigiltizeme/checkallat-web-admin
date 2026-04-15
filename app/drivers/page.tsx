'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { DriverForm } from '@/components/forms/DriverForm';

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
  });
  const [searchInput, setSearchInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);

  const loadDrivers = (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setFetching(true);
    }
    apiClient
      .get('/admin/drivers', { params: filters })
      .then((data: any) => setDrivers(data.drivers || data))
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setFetching(false);
      });
  };

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Load drivers on mount and when filters change
  useEffect(() => {
    loadDrivers(loading);
    const interval = setInterval(() => loadDrivers(false), 10000);
    return () => clearInterval(interval);
  }, [filters.search, filters.status]);

  const handleValidate = async (driverId: string, approved: boolean) => {
    if (!confirm(`Êtes-vous sûr de vouloir ${approved ? 'approuver' : 'rejeter'} ce chauffeur ?`)) {
      return;
    }

    try {
      await apiClient.put(`/admin/drivers/${driverId}/validate`, { approved });
      alert(`Chauffeur ${approved ? 'approuvé' : 'rejeté'} avec succès`);
      loadDrivers(false);
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Erreur inconnue'));
    }
  };

  const handleSuspend = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir suspendre ce chauffeur ?')) {
      return;
    }

    try {
      await apiClient.patch(`/admin/users/${userId}/suspend`);
      alert('Chauffeur suspendu avec succès');
      loadDrivers(false);
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Erreur inconnue'));
    }
  };

  const handleReactivate = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir réactiver ce chauffeur ?')) {
      return;
    }

    try {
      await apiClient.patch(`/admin/users/${userId}/reactivate`);
      alert('Chauffeur réactivé avec succès');
      loadDrivers(false);
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Erreur inconnue'));
    }
  };

  const openCreateModal = () => {
    setSelectedDriver(null);
    setIsModalOpen(true);
  };

  const openEditModal = (driver: any) => {
    setSelectedDriver(driver);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDriver(null);
  };

  const handleFormSuccess = () => {
    closeModal();
    loadDrivers(false);
  };

  const handleDelete = async (driverId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir SUPPRIMER définitivement ce chauffeur ? Cette action est irréversible.')) {
      return;
    }

    try {
      await apiClient.delete(`/admin/drivers/${driverId}`);
      alert('Chauffeur supprimé avec succès');
      loadDrivers(false);
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Erreur inconnue'));
    }
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Chauffeurs</h1>
          <p className="text-gray-600">
            Validation et gestion des chauffeurs de transport
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un chauffeur
        </button>
      </div>

      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Rechercher par nom, téléphone..."
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

        {fetching && (
          <div className="text-sm text-gray-500">Chargement...</div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chauffeur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Véhicule
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
            {drivers.map((driver: any) => (
              <tr key={driver.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {driver.user?.firstName} {driver.user?.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{driver.user?.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{driver.vehicleType}</div>
                  <div className="text-sm text-gray-500">{driver.licensePlate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      driver.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : driver.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {driver.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {driver.averageRating ? `${driver.averageRating.toFixed(1)}/5` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/drivers/${driver.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Détails
                    </Link>
                    <button
                      onClick={() => openEditModal(driver)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Modifier
                    </button>
                    {driver.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleValidate(driver.id, true)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approuver
                        </button>
                        <button
                          onClick={() => handleValidate(driver.id, false)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Rejeter
                        </button>
                      </>
                    )}
                    {driver.status === 'active' && (
                      <button
                        onClick={() => handleSuspend(driver.user?.id)}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        Suspendre
                      </button>
                    )}
                    {driver.status === 'suspended' && (
                      <button
                        onClick={() => handleReactivate(driver.user?.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Réactiver
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(driver.id)}
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

        {drivers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun chauffeur trouvé
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedDriver ? 'Modifier le chauffeur' : 'Ajouter un chauffeur'}
        size="xl"
      >
        <DriverForm driver={selectedDriver} onSuccess={handleFormSuccess} onCancel={closeModal} />
      </Modal>
    </div>
  );
}
