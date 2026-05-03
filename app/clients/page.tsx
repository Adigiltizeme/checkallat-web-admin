'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  suspended: 'Suspendu',
  deleted: 'Supprimé',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-red-100 text-red-800',
  deleted: 'bg-gray-100 text-gray-500',
};

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    cashRestricted: 'all',
    search: '',
  });
  const [searchInput, setSearchInput] = useState('');

  const loadClients = (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true);
    else setFetching(true);

    const params: Record<string, string> = {};
    if (filters.status !== 'all') params.status = filters.status;
    if (filters.cashRestricted === 'yes') params.cashRestricted = 'true';
    if (filters.search) params.search = filters.search;

    apiClient
      .get('/admin/users', { params })
      .then((data: any) => setClients(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setFetching(false);
      });
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    loadClients(loading);
    const interval = setInterval(() => loadClients(false), 10000);
    return () => clearInterval(interval);
  }, [filters.status, filters.cashRestricted, filters.search]);

  const handleSuspend = async (userId: string) => {
    if (!confirm('Suspendre ce compte client ?')) return;
    try {
      await apiClient.patch(`/admin/users/${userId}/suspend`);
      loadClients(false);
    } catch (err: any) {
      alert('Erreur: ' + (err.response?.data?.message || 'Erreur inconnue'));
    }
  };

  const handleReactivate = async (userId: string) => {
    if (!confirm('Réactiver ce compte client ?')) return;
    try {
      await apiClient.patch(`/admin/users/${userId}/reactivate`);
      loadClients(false);
    } catch (err: any) {
      alert('Erreur: ' + (err.response?.data?.message || 'Erreur inconnue'));
    }
  };

  const handleRestrictCash = async (userId: string) => {
    if (!confirm('Restreindre ce client aux paiements in-app uniquement ?')) return;
    try {
      await apiClient.patch(`/admin/users/${userId}/restrict-cash-client`);
      loadClients(false);
    } catch (err: any) {
      alert('Erreur: ' + (err.response?.data?.message || 'Erreur inconnue'));
    }
  };

  const handleLiftCash = async (userId: string) => {
    if (!confirm('Lever la restriction cash de ce client ?')) return;
    try {
      await apiClient.patch(`/admin/users/${userId}/lift-cash-client`);
      loadClients(false);
    } catch (err: any) {
      alert('Erreur: ' + (err.response?.data?.message || 'Erreur inconnue'));
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Supprimer définitivement ce compte client ? (soft-delete)')) return;
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      loadClients(false);
    } catch (err: any) {
      alert('Erreur: ' + (err.response?.data?.message || 'Erreur inconnue'));
    }
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  const activeCount = clients.filter((c) => c.status === 'active').length;
  const suspendedCount = clients.filter((c) => c.status === 'suspended').length;
  const cashRestrictedCount = clients.filter((c) => c.isCashRestricted).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Clients</h1>
          <p className="text-gray-600">Supervision et modération des comptes clients</p>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          <div className="text-sm text-gray-500">Actifs</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{suspendedCount}</div>
          <div className="text-sm text-gray-500">Suspendus</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{cashRestrictedCount}</div>
          <div className="text-sm text-gray-500">Restreints cash</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 items-center flex-wrap">
        <input
          type="text"
          placeholder="Rechercher par nom, email, téléphone..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1 min-w-[240px] max-w-sm px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Tous statuts</option>
          <option value="active">Actifs</option>
          <option value="suspended">Suspendus</option>
          <option value="deleted">Supprimés</option>
        </select>
        <select
          value={filters.cashRestricted}
          onChange={(e) => setFilters({ ...filters, cashRestricted: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Tous (cash)</option>
          <option value="yes">Restreints cash uniquement</option>
        </select>
        {fetching && <span className="text-sm text-gray-400">Actualisation...</span>}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anti-fraude</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inscrit le</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client: any) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {client.firstName} {client.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{client.email || '—'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {client.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[client.status] || 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_LABELS[client.status] || client.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 space-y-0.5">
                  <div>{client._count?.transportRequests ?? 0} transports</div>
                  <div>{client._count?.bookings ?? 0} réservations</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    {client.isCashRestricted && (
                      <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full font-medium">
                        Cash restreint
                      </span>
                    )}
                    {client.cashFraudWarnings > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full font-medium">
                        {client.cashFraudWarnings} alerte(s) fraude
                      </span>
                    )}
                    {!client.isCashRestricted && client.cashFraudWarnings === 0 && (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Link href={`/clients/${client.id}`} className="text-blue-600 hover:text-blue-900">
                      Détails
                    </Link>
                    {client.status === 'active' && (
                      <button onClick={() => handleSuspend(client.id)} className="text-orange-600 hover:text-orange-900">
                        Suspendre
                      </button>
                    )}
                    {client.status === 'suspended' && (
                      <button onClick={() => handleReactivate(client.id)} className="text-green-600 hover:text-green-900">
                        Réactiver
                      </button>
                    )}
                    {!client.isCashRestricted ? (
                      <button onClick={() => handleRestrictCash(client.id)} className="text-amber-600 hover:text-amber-900">
                        Restreindre cash
                      </button>
                    ) : (
                      <button onClick={() => handleLiftCash(client.id)} className="text-teal-600 hover:text-teal-900">
                        Lever restriction
                      </button>
                    )}
                    {client.status !== 'deleted' && (
                      <button onClick={() => handleDelete(client.id)} className="text-red-600 hover:text-red-900">
                        Supprimer
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {clients.length === 0 && (
          <div className="text-center py-12 text-gray-500">Aucun client trouvé</div>
        )}
      </div>
    </div>
  );
}
