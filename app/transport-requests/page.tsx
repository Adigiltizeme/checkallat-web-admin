'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  driver?: {
    vehicleType: string;
    vehiclePlate: string;
    user: {
      firstName: string;
      lastName: string;
      phone: string;
    };
  };
}

interface DateRange {
  start: string | null;
  end: string | null;
  mode: 'range' | 'single';
  singleDate: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  accepted: 'Acceptée',
  heading_to_pickup: 'En route vers retrait',
  arrived_at_pickup: 'Arrivé au retrait',
  loading: 'Chargement en cours',
  in_transit: 'En transit',
  arrived_at_delivery: 'Arrivé à la livraison',
  unloading: 'Déchargement en cours',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  heading_to_pickup: 'bg-indigo-100 text-indigo-800',
  arrived_at_pickup: 'bg-purple-100 text-purple-800',
  loading: 'bg-orange-100 text-orange-800',
  in_transit: 'bg-cyan-100 text-cyan-800',
  arrived_at_delivery: 'bg-violet-100 text-violet-800',
  unloading: 'bg-pink-100 text-pink-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const OBJECT_TYPE_LABELS: Record<string, string> = {
  furniture: 'Meubles',
  appliances: 'Électroménager',
  boxes: 'Cartons',
  vehicle: 'Véhicule',
  other: 'Autre',
};

const toDay = (dateStr: string) => dateStr ? new Date(dateStr).toLocaleDateString('en-CA') : '';

export default function TransportRequestsPage() {
  const [allRequests, setAllRequests] = useState<TransportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [temporalFilter, setTemporalFilter] = useState<'all' | 'today' | 'upcoming' | 'history'>('all');
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null, mode: 'range', singleDate: null });
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [deleteMenuId, setDeleteMenuId] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);

  // Sélection multiple
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
    const interval = setInterval(() => loadRequests(showHidden), 10000);
    return () => clearInterval(interval);
  }, [showHidden]);

  // Réinitialiser la sélection quand les filtres changent
  useEffect(() => { setSelectedIds(new Set()); }, [statusFilter, search, temporalFilter, dateRange, showHidden]);

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const todayStr = new Date().toLocaleDateString('en-CA');

  const temporalCounts = useMemo(() => {
    const base = allRequests;
    return {
      all: base.length,
      today: base.filter(r => toDay(r.scheduledDate) === todayStr).length,
      upcoming: base.filter(r => toDay(r.scheduledDate) > todayStr).length,
      history: base.filter(r => ['completed', 'cancelled'].includes(r.status)).length,
    };
  }, [allRequests, todayStr]);

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
        (r.driver?.vehiclePlate?.toLowerCase().includes(q) ?? false)
      );
    }
    if (temporalFilter !== 'all') {
      result = result.filter(r => {
        const d = toDay(r.scheduledDate);
        switch (temporalFilter) {
          case 'today': return d === todayStr;
          case 'upcoming': return d > todayStr;
          case 'history': return ['completed', 'cancelled'].includes(r.status);
          default: return true;
        }
      });
    }
    if (dateRange.start) result = result.filter(r => toDay(r.scheduledDate) >= dateRange.start!);
    if (dateRange.end) result = result.filter(r => toDay(r.scheduledDate) <= dateRange.end!);
    return result;
  }, [allRequests, statusFilter, search, temporalFilter, dateRange, todayStr]);

  // Gestion de l'état indéterminé de la case "tout sélectionner"
  const allVisibleSelected = filteredRequests.length > 0 && filteredRequests.every(r => selectedIds.has(r.id));
  const someSelected = filteredRequests.some(r => selectedIds.has(r.id));
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected && !allVisibleSelected;
    }
  }, [someSelected, allVisibleSelected]);

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filteredRequests.forEach(r => next.delete(r.id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filteredRequests.forEach(r => next.add(r.id));
        return next;
      });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Actions individuelles ──────────────────────────────────────
  const handleHide = async (id: string) => {
    setDeleteMenuId(null);
    if (!confirm('Masquer cette demande de la vue admin ? Le client et le chauffeur pourront toujours la voir.')) return;
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
    if (!confirm('Supprimer définitivement pour TOUS les utilisateurs ? Cette action est irréversible et supprime toutes les données liées.')) return;
    setActioningId(id);
    try {
      await apiClient.delete(`/admin/transport-requests/${id}/force`);
      setAllRequests(prev => prev.filter(r => r.id !== id));
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    } catch { alert('Erreur lors de la suppression'); }
    finally { setActioningId(null); }
  };

  // ── Actions groupées ──────────────────────────────────────────
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Demandes de transport</h1>
        <p className="text-gray-600">Gérez toutes les demandes de transport de la plateforme</p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-2 sm:flex sm:space-x-1 gap-1 sm:gap-0 bg-gray-100 p-1 rounded-lg">
          {[
            { key: 'all', label: `Toutes (${temporalCounts.all})`, desc: 'Toutes les demandes' },
            { key: 'today', label: `Aujourd'hui (${temporalCounts.today})`, desc: 'Demandes du jour' },
            { key: 'upcoming', label: `À venir (${temporalCounts.upcoming})`, desc: 'Demandes futures' },
            { key: 'history', label: `Historique (${temporalCounts.history})`, desc: 'Demandes passées / terminées' },
          ].map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => setTemporalFilter(key as typeof temporalFilter)}
              title={desc}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors text-center ${
                temporalFilter === key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <span className="text-sm text-gray-500 shrink-0">Date planifiée :</span>
          <select
            value={dateRange.mode}
            onChange={(e) => setDateRange({ start: null, end: null, mode: e.target.value as 'range' | 'single', singleDate: null })}
            className="border rounded-lg px-3 py-2 text-sm bg-white border-gray-300 w-full sm:w-auto"
          >
            <option value="range">Période</option>
            <option value="single">Date unique</option>
          </select>
          {dateRange.mode === 'single' ? (
            <input type="date" value={dateRange.singleDate || ''}
              onChange={e => setDateRange(prev => ({ ...prev, singleDate: e.target.value, start: e.target.value, end: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm bg-white border-gray-300 w-full sm:w-auto" />
          ) : (
            <div className="flex items-center gap-2">
              <input type="date" value={dateRange.start || ''}
                onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm bg-white border-gray-300" />
              <span className="text-gray-500 text-sm">à</span>
              <input type="date" value={dateRange.end || ''}
                onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm bg-white border-gray-300" />
            </div>
          )}
          {((dateRange.mode === 'single' && dateRange.singleDate) || (dateRange.mode === 'range' && (dateRange.start || dateRange.end))) && (
            <button onClick={() => setDateRange({ start: null, end: null, mode: dateRange.mode, singleDate: null })}
              className="text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap">
              Réinitialiser
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="accepted">Acceptée</option>
              <option value="in_transit">En transit</option>
              <option value="completed">Terminée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Client, chauffeur, adresse, plaque..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
              <span className="text-sm text-gray-700">Afficher les masqués</span>
            </label>
          </div>
        </div>
      </div>

      {/* Barre d'actions groupées */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-blue-800">
            {selectedIds.size} demande{selectedIds.size > 1 ? 's' : ''} sélectionnée{selectedIds.size > 1 ? 's' : ''}
          </span>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setSelectedIds(new Set())}
              disabled={bulkActioning}
              className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Désélectionner
            </button>
            <button
              onClick={handleBulkHide}
              disabled={bulkActioning}
              className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1.5"
            >
              {bulkActioning ? '…' : '👁 Masquer la sélection'}
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkActioning}
              className="px-3 py-1.5 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5"
            >
              {bulkActioning ? '…' : '🗑 Supprimer la sélection'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucune demande de transport trouvée</div>
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
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                      title={allVisibleSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                    />
                  </th>
                  {['Client', 'Objets', 'Itinéraire', 'Date', 'Driver', 'Prix', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => {
                  const isSelected = selectedIds.has(request.id);
                  return (
                    <tr key={request.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                      <td className="px-4 py-4 w-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(request.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.client.firstName} {request.client.lastName}</div>
                        <div className="text-sm text-gray-500">{request.client.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(request.transportTypes && request.transportTypes.length > 0 ? request.transportTypes : [request.transportType]).map((type, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {OBJECT_TYPE_LABELS[type] || type}
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
                        <div className="text-sm text-gray-900">{format(new Date(request.scheduledDate), 'dd MMM yyyy', { locale: fr })}</div>
                        <div className="text-xs text-gray-500">Créée le {format(new Date(request.createdAt), 'dd/MM/yy', { locale: fr })}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.driver ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.driver.user.firstName} {request.driver.user.lastName}</div>
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
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[request.status] || 'bg-gray-100 text-gray-800'}`}>
                          {STATUS_LABELS[request.status] || request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <Link href={`/transport-requests/${request.id}`} className="text-blue-600 hover:text-blue-900">Détails</Link>
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
                                <button onClick={() => handleHide(request.id)}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 border-b border-gray-100">
                                  👁 Masquer (admin uniquement)
                                </button>
                                <button onClick={() => handleHardDelete(request.id)}
                                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600">
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
        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {filteredRequests.length} demande{filteredRequests.length > 1 ? 's' : ''} affichée{filteredRequests.length > 1 ? 's' : ''}
            {filteredRequests.length !== allRequests.length && ` (sur ${allRequests.length} au total)`}
          </p>
          {selectedIds.size > 0 && (
            <p className="text-sm font-medium text-blue-600">
              {selectedIds.size} sélectionnée{selectedIds.size > 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
