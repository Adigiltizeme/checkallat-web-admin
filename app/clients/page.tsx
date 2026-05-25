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

type Segment = 'all' | 'confirmed_client' | 'pro_only' | 'pro_and_client' | 'inactive';

const SEGMENTS: { key: Segment; label: string; description: string }[] = [
  { key: 'all',             label: 'Tous',             description: 'Tous les utilisateurs inscrits' },
  { key: 'confirmed_client',label: 'Clients avérés',   description: 'Au moins 1 réservation, pas pro' },
  { key: 'pro_only',        label: 'Pros uniquement',  description: 'Profil pro, aucune réservation client' },
  { key: 'pro_and_client',  label: 'Pros + Clients',   description: 'Profil pro ET réservations client' },
  { key: 'inactive',        label: 'Sans activité',    description: 'Inscrits sans aucune activité' },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [segment, setSegment] = useState<Segment>('all');
  const [filters, setFilters] = useState({ status: 'all', cashRestricted: 'all', search: '' });
  const [searchInput, setSearchInput] = useState('');

  const loadClients = (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true);
    else setFetching(true);

    const params: Record<string, string> = {};
    if (filters.status !== 'all') params.status = filters.status;
    if (filters.cashRestricted === 'yes') params.cashRestricted = 'true';
    if (filters.search) params.search = filters.search;
    if (segment !== 'all') params.segment = segment;

    apiClient
      .get('/admin/users', { params })
      .then((data: any) => setClients(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => { setLoading(false); setFetching(false); });
  };

  useEffect(() => {
    const t = setTimeout(() => setFilters((p) => ({ ...p, search: searchInput })), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    loadClients(loading);
    const iv = setInterval(() => loadClients(false), 10000);
    return () => clearInterval(iv);
  }, [filters.status, filters.cashRestricted, filters.search, segment]);

  const handleSuspend = async (userId: string) => {
    if (!confirm('Suspendre ce compte ?')) return;
    try { await apiClient.patch(`/admin/users/${userId}/suspend`); loadClients(false); }
    catch (err: any) { alert('Erreur: ' + (err.response?.data?.message || 'Erreur inconnue')); }
  };

  const handleReactivate = async (userId: string) => {
    if (!confirm('Réactiver ce compte ?')) return;
    try { await apiClient.patch(`/admin/users/${userId}/reactivate`); loadClients(false); }
    catch (err: any) { alert('Erreur: ' + (err.response?.data?.message || 'Erreur inconnue')); }
  };

  const handleRestrictCash = async (userId: string) => {
    if (!confirm('Restreindre aux paiements in-app ?')) return;
    try { await apiClient.patch(`/admin/users/${userId}/restrict-cash-client`); loadClients(false); }
    catch (err: any) { alert('Erreur: ' + (err.response?.data?.message || 'Erreur inconnue')); }
  };

  const handleLiftCash = async (userId: string) => {
    if (!confirm('Lever la restriction cash ?')) return;
    try { await apiClient.patch(`/admin/users/${userId}/lift-cash-client`); loadClients(false); }
    catch (err: any) { alert('Erreur: ' + (err.response?.data?.message || 'Erreur inconnue')); }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Supprimer définitivement ce compte ? (soft-delete)')) return;
    try { await apiClient.delete(`/admin/users/${userId}`); loadClients(false); }
    catch (err: any) { alert('Erreur: ' + (err.response?.data?.message || 'Erreur inconnue')); }
  };

  if (loading) return <div className="text-center py-12">Chargement...</div>;

  const activeCount    = clients.filter((c) => c.status === 'active').length;
  const suspendedCount = clients.filter((c) => c.status === 'suspended').length;
  const cashRestrictedCount = clients.filter((c) => c.isCashRestricted).length;
  const proCount       = clients.filter((c) => c.pro).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600">Supervision, segmentation et modération des comptes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          <div className="text-sm text-gray-500">Actifs</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{suspendedCount}</div>
          <div className="text-sm text-gray-500">Suspendus</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{proCount}</div>
          <div className="text-sm text-gray-500">Profil pro/chauffeur</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{cashRestrictedCount}</div>
          <div className="text-sm text-gray-500">Restreints cash</div>
        </div>
      </div>

      {/* Onglets segment */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-1 overflow-x-auto">
          {SEGMENTS.map(({ key, label, description }) => (
            <button
              key={key}
              onClick={() => setSegment(key)}
              title={description}
              className={`whitespace-nowrap py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                segment === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
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
      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activité client</th>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{client.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[client.status] || 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_LABELS[client.status] || client.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {client.pro && (
                      <RoleBadge
                        icon="🔧"
                        label={`Pro ${client.pro.serviceCategories?.slice(0,2).join(', ') || ''}`}
                        color={client.pro.status === 'active' ? 'emerald' : 'yellow'}
                      />
                    )}
                    {client.driver && (
                      <RoleBadge icon="🚚" label={`Chauffeur (${client.driver.vehicleType || '—'})`} color="blue" />
                    )}
                    {client.marketplaceSeller && (
                      <RoleBadge icon="🛍️" label={client.marketplaceSeller.businessName || 'Vendeur'} color="purple" />
                    )}
                    {!client.pro && !client.driver && !client.marketplaceSeller && (
                      <span className="text-xs text-gray-400">Client uniquement</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 space-y-0.5">
                  <div>{client._count?.transportRequests ?? 0} transport(s)</div>
                  <div>{client._count?.bookings ?? 0} réservation(s)</div>
                  {client._count?.marketplaceOrders > 0 && (
                    <div>{client._count.marketplaceOrders} commande(s)</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    {client.isCashRestricted && (
                      <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full font-medium">Cash restreint</span>
                    )}
                    {client.cashFraudWarnings > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full font-medium">
                        {client.cashFraudWarnings} alerte(s)
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
                    <Link href={`/clients/${client.id}`} className="text-blue-600 hover:text-blue-900">Détails</Link>
                    {client.status === 'active' && (
                      <button onClick={() => handleSuspend(client.id)} className="text-orange-600 hover:text-orange-900">Suspendre</button>
                    )}
                    {client.status === 'suspended' && (
                      <button onClick={() => handleReactivate(client.id)} className="text-green-600 hover:text-green-900">Réactiver</button>
                    )}
                    {!client.isCashRestricted ? (
                      <button onClick={() => handleRestrictCash(client.id)} className="text-amber-600 hover:text-amber-900">Restr. cash</button>
                    ) : (
                      <button onClick={() => handleLiftCash(client.id)} className="text-teal-600 hover:text-teal-900">Lever restr.</button>
                    )}
                    {client.status !== 'deleted' && (
                      <button onClick={() => handleDelete(client.id)} className="text-red-600 hover:text-red-900">Supprimer</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {clients.length === 0 && (
          <div className="text-center py-12 text-gray-500">Aucun utilisateur trouvé pour ce segment</div>
        )}
      </div>
    </div>
  );
}

function RoleBadge({ icon, label, color }: { icon: string; label: string; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-700',
    yellow:  'bg-yellow-100 text-yellow-700',
    blue:    'bg-blue-100 text-blue-700',
    purple:  'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium ${colors[color] || 'bg-gray-100 text-gray-600'}`}>
      {icon} {label}
    </span>
  );
}
