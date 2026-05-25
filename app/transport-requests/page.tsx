'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DateRange, DATE_RANGE_EMPTY } from '@/lib/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge, StatusConfig } from '@/components/shared/StatusBadge';
import { TemporalFilterTabs } from '@/components/shared/TemporalFilterTabs';
import { DateRangeFilter } from '@/components/shared/DateRangeFilter';
import { BulkActionBar } from '@/components/shared/BulkActionBar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';

interface TransportRequest {
  id: string;
  status: string;
  transportType: string;
  transportTypes?: string[];
  pickupAddress: string;
  deliveryAddress: string;
  distance: number;
  totalPrice: number;
  scheduledDate: string;
  createdAt: string;
  client: { firstName: string; lastName: string; email: string; phone: string };
  driver?: {
    vehicleType: string;
    vehiclePlate: string;
    user: { firstName: string; lastName: string; phone: string };
  };
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  pending:              { label: 'En attente',            color: 'bg-yellow-100 text-yellow-800' },
  accepted:             { label: 'Acceptée',              color: 'bg-blue-100 text-blue-800' },
  heading_to_pickup:    { label: 'En route vers retrait', color: 'bg-indigo-100 text-indigo-800' },
  arrived_at_pickup:    { label: 'Arrivé au retrait',     color: 'bg-purple-100 text-purple-800' },
  loading:              { label: 'Chargement',            color: 'bg-orange-100 text-orange-800' },
  in_transit:           { label: 'En transit',            color: 'bg-cyan-100 text-cyan-800' },
  arrived_at_delivery:  { label: 'Arrivé à livraison',   color: 'bg-violet-100 text-violet-800' },
  unloading:            { label: 'Déchargement',          color: 'bg-pink-100 text-pink-800' },
  completed:            { label: 'Terminée',              color: 'bg-green-100 text-green-800' },
  cancelled:            { label: 'Annulée',               color: 'bg-red-100 text-red-800' },
};

const OBJECT_TYPE_LABELS: Record<string, string> = {
  furniture:  'Meubles',
  appliances: 'Électroménager',
  boxes:      'Cartons',
  vehicle:    'Véhicule',
  other:      'Autre',
};

const STATUS_FILTER_OPTIONS = [
  { value: 'pending',    label: 'En attente' },
  { value: 'accepted',   label: 'Acceptée' },
  { value: 'in_transit', label: 'En transit' },
  { value: 'completed',  label: 'Terminée' },
  { value: 'cancelled',  label: 'Annulée' },
];

const TERMINAL_STATUSES = new Set(['completed', 'cancelled']);

const toDay = (d: string) => (d ? new Date(d).toLocaleDateString('en-CA') : '');

export default function TransportRequestsPage() {
  const [allRequests, setAllRequests] = useState<TransportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [temporalFilter, setTemporalFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange>(DATE_RANGE_EMPTY);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [deleteMenuId, setDeleteMenuId] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActioning, setBulkActioning] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const deleteMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (deleteMenuRef.current && !deleteMenuRef.current.contains(e.target as Node)) {
        setDeleteMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadRequests = (hidden = showHidden) => {
    setLoading(true);
    apiClient
      .get('/admin/transport-requests', { params: { showHidden: hidden ? 'true' : undefined } })
      .then((data: any) => setAllRequests(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRequests(showHidden);
    const interval = setInterval(() => loadRequests(showHidden), 10_000);
    return () => clearInterval(interval);
  }, [showHidden]);

  useEffect(() => { setSelectedIds(new Set()); }, [statusFilter, search, temporalFilter, dateRange, showHidden]);

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const todayStr = new Date().toLocaleDateString('en-CA');

  const temporalCounts = useMemo(() => ({
    all:      allRequests.length,
    today:    allRequests.filter(r => toDay(r.scheduledDate) === todayStr).length,
    upcoming: allRequests.filter(r => toDay(r.scheduledDate) > todayStr).length,
    history:  allRequests.filter(r => TERMINAL_STATUSES.has(r.status)).length,
  }), [allRequests, todayStr]);

  const filteredRequests = useMemo(() => {
    let result = [...allRequests];
    if (statusFilter !== 'all') result = result.filter(r => r.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        `${r.client.firstName} ${r.client.lastName}`.toLowerCase().includes(q) ||
        r.pickupAddress.toLowerCase().includes(q) ||
        r.deliveryAddress.toLowerCase().includes(q) ||
        r.client.phone.includes(q) ||
        (r.driver ? `${r.driver.user.firstName} ${r.driver.user.lastName}`.toLowerCase().includes(q) : false) ||
        (r.driver?.vehiclePlate?.toLowerCase().includes(q) ?? false),
      );
    }
    if (temporalFilter !== 'all') {
      result = result.filter(r => {
        const d = toDay(r.scheduledDate);
        switch (temporalFilter) {
          case 'today':    return d === todayStr;
          case 'upcoming': return d > todayStr;
          case 'history':  return TERMINAL_STATUSES.has(r.status);
          default: return true;
        }
      });
    }
    if (dateRange.start) result = result.filter(r => toDay(r.scheduledDate) >= dateRange.start!);
    if (dateRange.end)   result = result.filter(r => toDay(r.scheduledDate) <= dateRange.end!);
    return result;
  }, [allRequests, statusFilter, search, temporalFilter, dateRange, todayStr]);

  const allVisibleSelected = filteredRequests.length > 0 && filteredRequests.every(r => selectedIds.has(r.id));
  const someSelected = filteredRequests.some(r => selectedIds.has(r.id));

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected && !allVisibleSelected;
  }, [someSelected, allVisibleSelected]);

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(prev => { const n = new Set(prev); filteredRequests.forEach(r => n.delete(r.id)); return n; });
    } else {
      setSelectedIds(prev => { const n = new Set(prev); filteredRequests.forEach(r => n.add(r.id)); return n; });
    }
  };
  const toggleSelect = (id: string) =>
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleHide = async (id: string) => {
    setDeleteMenuId(null);
    if (!confirm('Masquer cette demande de la vue admin ?')) return;
    setActioningId(id);
    try {
      await apiClient.patch(`/admin/transport-requests/${id}/hide`);
      setAllRequests(prev => prev.filter(r => r.id !== id));
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    } catch { alert('Erreur lors du masquage'); }
    finally { setActioningId(null); }
  };

  const handleHardDelete = async (id: string) => {
    setDeleteMenuId(null);
    if (!confirm('Supprimer définitivement pour TOUS les utilisateurs ? Action irréversible.')) return;
    setActioningId(id);
    try {
      await apiClient.delete(`/admin/transport-requests/${id}/force`);
      setAllRequests(prev => prev.filter(r => r.id !== id));
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    } catch { alert('Erreur lors de la suppression'); }
    finally { setActioningId(null); }
  };

  const handleBulkHide = async () => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    if (!confirm(`Masquer ${ids.length} demande${ids.length > 1 ? 's' : ''} de la vue admin ?`)) return;
    setBulkActioning(true);
    try {
      await Promise.all(ids.map(id => apiClient.patch(`/admin/transport-requests/${id}/hide`)));
      setAllRequests(prev => prev.filter(r => !ids.includes(r.id)));
      setSelectedIds(new Set());
    } catch { alert('Erreur lors du masquage groupé'); }
    finally { setBulkActioning(false); }
  };

  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    if (!confirm(`Supprimer définitivement ${ids.length} demande${ids.length > 1 ? 's' : ''} pour TOUS les utilisateurs ? Action irréversible.`)) return;
    setBulkActioning(true);
    try {
      await Promise.all(ids.map(id => apiClient.delete(`/admin/transport-requests/${id}/force`)));
      setAllRequests(prev => prev.filter(r => !ids.includes(r.id)));
      setSelectedIds(new Set());
    } catch { alert('Erreur lors de la suppression groupée'); }
    finally { setBulkActioning(false); }
  };

  const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} EGP`;
  const formatDistance = (km: number) => `${km.toFixed(1)} km`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demandes de transport"
        description="Gérez toutes les demandes de transport de la plateforme"
      />

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <TemporalFilterTabs
          tabs={[
            { key: 'all',      label: 'Toutes',       count: temporalCounts.all,      tooltip: 'Toutes les demandes' },
            { key: 'today',    label: "Aujourd'hui",  count: temporalCounts.today,    tooltip: 'Demandes planifiées aujourd\'hui' },
            { key: 'upcoming', label: 'À venir',      count: temporalCounts.upcoming, tooltip: 'Demandes futures' },
            { key: 'history',  label: 'Historique',   count: temporalCounts.history,  tooltip: 'Demandes terminées / annulées' },
          ]}
          active={temporalFilter}
          onChange={setTemporalFilter}
        />

        <DateRangeFilter
          label="Date planifiée :"
          value={dateRange}
          onChange={setDateRange}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Tous</option>
              {STATUS_FILTER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Client, chauffeur, adresse, plaque..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showHidden}
                onChange={e => setShowHidden(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Afficher les masqués</span>
            </label>
          </div>
        </div>
      </div>

      {/* Actions groupées */}
      {selectedIds.size > 0 && (
        <BulkActionBar
          count={selectedIds.size}
          nounSingular="demande"
          onClear={() => setSelectedIds(new Set())}
          loading={bulkActioning}
          actions={[
            { label: '👁 Masquer la sélection',    variant: 'default', onClick: handleBulkHide },
            { label: '🗑 Supprimer la sélection',  variant: 'danger',  onClick: handleBulkDelete },
          ]}
        />
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : filteredRequests.length === 0 ? (
          <EmptyState message="Aucune demande de transport trouvée" icon="🚛" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-primary border-gray-300 rounded cursor-pointer"
                      title={allVisibleSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                    />
                  </th>
                  {['Client', 'Objets', 'Itinéraire', 'Date', 'Driver', 'Prix', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map(request => {
                  const isSelected = selectedIds.has(request.id);
                  const types = request.transportTypes?.length ? request.transportTypes : [request.transportType];
                  return (
                    <tr key={request.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-primary/5' : ''}`}>
                      <td className="px-4 py-4 w-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(request.id)}
                          className="w-4 h-4 text-primary border-gray-300 rounded cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.client.firstName} {request.client.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{request.client.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {types.map((type, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {OBJECT_TYPE_LABELS[type] ?? type}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">📍 {request.pickupAddress}</div>
                        <div className="text-sm text-gray-900 max-w-xs truncate">🏁 {request.deliveryAddress}</div>
                        <div className="text-sm text-gray-500 mt-1">{formatDistance(request.distance)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(request.scheduledDate), 'dd MMM yyyy', { locale: fr })}
                        </div>
                        <div className="text-xs text-gray-500">
                          Créée le {format(new Date(request.createdAt), 'dd/MM/yy', { locale: fr })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.driver ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.driver.user.firstName} {request.driver.user.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{request.driver.vehiclePlate}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Non assigné</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(request.totalPrice)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={request.status} config={STATUS_CONFIG} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <Link href={`/transport-requests/${request.id}`} className="text-primary hover:underline">
                            Détails
                          </Link>
                          <div className="relative" ref={deleteMenuRef}>
                            <button
                              onClick={() => setDeleteMenuId(deleteMenuId === request.id ? null : request.id)}
                              disabled={actioningId === request.id}
                              className="text-red-500 hover:text-red-700 disabled:opacity-50"
                            >
                              {actioningId === request.id ? '…' : 'Supprimer ▾'}
                            </button>
                            {deleteMenuId === request.id && (
                              <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm">
                                <button
                                  onClick={() => handleHide(request.id)}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 border-b border-gray-100"
                                >
                                  👁 Masquer (admin uniquement)
                                </button>
                                <button
                                  onClick={() => handleHardDelete(request.id)}
                                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                                >
                                  🗑 Supprimer pour tous
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && (
        <div className="bg-white rounded-lg shadow p-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-gray-600">
            {filteredRequests.length} demande{filteredRequests.length > 1 ? 's' : ''} affichée
            {filteredRequests.length > 1 ? 's' : ''}
            {filteredRequests.length !== allRequests.length && ` (sur ${allRequests.length} au total)`}
          </p>
          {selectedIds.size > 0 && (
            <p className="text-sm font-medium text-primary">
              {selectedIds.size} sélectionnée{selectedIds.size > 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
