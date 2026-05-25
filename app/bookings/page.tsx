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
import { CategoryTabs, CategoryTabItem } from '@/components/shared/CategoryTabs';

interface Booking {
  id: string;
  status: string;
  bookingType: string;
  scheduledAt: string | null;
  createdAt: string;
  address: string;
  estimatedPrice: number | null;
  finalPrice: number | null;
  paymentMethod: string;
  cashAmountDeclaredByPro?: number | null;
  cashPaymentStatus?: string | null;
  categoryData: any;
  clientDescription: string | null;
  client: { firstName: string; lastName: string; email: string; phone: string };
  pro?: { companyName?: string; user?: { firstName: string; lastName: string; phone: string; email: string } };
  category?: { nameFr: string; nameEn: string; nameAr: string; slug: string; icon?: string };
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  pending:     { label: 'En attente',  color: 'bg-yellow-100 text-yellow-800' },
  accepted:    { label: 'Acceptée',    color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'En cours',    color: 'bg-indigo-100 text-indigo-800' },
  completed:   { label: 'Terminée',    color: 'bg-green-100 text-green-800' },
  cancelled:   { label: 'Annulée',     color: 'bg-red-100 text-red-800' },
  rejected:    { label: 'Refusée',     color: 'bg-gray-100 text-gray-800' },
};

const TERMINAL_STATUSES = new Set(['completed', 'cancelled', 'rejected']);

const toDay = (d: string | null) => (d ? new Date(d).toLocaleDateString('en-CA') : '');

export default function BookingsPage() {
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter]       = useState('all');
  const [categoryFilter, setCategoryFilter]   = useState('all');
  const [searchInput, setSearchInput]         = useState('');
  const [search, setSearch]                   = useState('');
  const [temporalFilter, setTemporalFilter]   = useState('all');
  const [dateRange, setDateRange]             = useState<DateRange>(DATE_RANGE_EMPTY);
  const [selectedIds, setSelectedIds]         = useState<Set<string>>(new Set());
  const [bulkActioning, setBulkActioning]     = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const loadBookings = () => {
    apiClient
      .get('/admin/bookings')
      .then((data: any) => {
        setAllBookings(Array.isArray(data) ? data : (data.bookings ?? []));
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadBookings();
    const interval = setInterval(loadBookings, 10_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => { setSelectedIds(new Set()); }, [statusFilter, categoryFilter, search, temporalFilter, dateRange]);

  const todayStr = new Date().toLocaleDateString('en-CA');

  // ── Onglets catégories (calculés depuis les données chargées) ──
  const categoryTabs: CategoryTabItem[] = useMemo(() => {
    const counts: Record<string, { count: number; label: string; icon?: string }> = {};
    for (const b of allBookings) {
      const slug  = b.category?.slug;
      const label = b.category?.nameFr ?? slug ?? '?';
      const icon  = (b.category as any)?.icon;
      if (slug) {
        if (!counts[slug]) counts[slug] = { count: 0, label, icon };
        counts[slug].count++;
      }
    }
    const base: CategoryTabItem[] = [{ key: 'all', label: 'Toutes catégories', count: allBookings.length }];
    const rest: CategoryTabItem[] = Object.entries(counts)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([slug, { count, label, icon }]) => ({ key: slug, label, icon, count }));
    return [...base, ...rest];
  }, [allBookings]);

  const temporalCounts = useMemo(() => ({
    all:      allBookings.length,
    today:    allBookings.filter(b => toDay(b.scheduledAt) === todayStr).length,
    upcoming: allBookings.filter(b => toDay(b.scheduledAt) > todayStr && !TERMINAL_STATUSES.has(b.status)).length,
    history:  allBookings.filter(b => TERMINAL_STATUSES.has(b.status)).length,
  }), [allBookings, todayStr]);

  const filteredBookings = useMemo(() => {
    let result = [...allBookings];
    if (categoryFilter !== 'all') result = result.filter(b => b.category?.slug === categoryFilter);
    if (statusFilter !== 'all')   result = result.filter(b => b.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        `${b.client.firstName} ${b.client.lastName}`.toLowerCase().includes(q) ||
        b.client.phone.includes(q) ||
        b.client.email.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        (b.pro?.user ? `${b.pro.user.firstName} ${b.pro.user.lastName}`.toLowerCase().includes(q) : false) ||
        (b.category?.nameFr?.toLowerCase().includes(q) ?? false) ||
        (b.category?.slug?.includes(q) ?? false),
      );
    }
    if (temporalFilter !== 'all') {
      const d = (b: Booking) => toDay(b.scheduledAt);
      result = result.filter(b => {
        switch (temporalFilter) {
          case 'today':    return d(b) === todayStr;
          case 'upcoming': return d(b) > todayStr && !TERMINAL_STATUSES.has(b.status);
          case 'history':  return TERMINAL_STATUSES.has(b.status);
          default: return true;
        }
      });
    }
    if (dateRange.start) result = result.filter(b => (toDay(b.scheduledAt) || toDay(b.createdAt)) >= dateRange.start!);
    if (dateRange.end)   result = result.filter(b => (toDay(b.scheduledAt) || toDay(b.createdAt)) <= dateRange.end!);
    return result;
  }, [allBookings, categoryFilter, statusFilter, search, temporalFilter, dateRange, todayStr]);

  const allVisibleSelected = filteredBookings.length > 0 && filteredBookings.every(b => selectedIds.has(b.id));
  const someSelected = filteredBookings.some(b => selectedIds.has(b.id));

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected && !allVisibleSelected;
  }, [someSelected, allVisibleSelected]);

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(prev => { const n = new Set(prev); filteredBookings.forEach(b => n.delete(b.id)); return n; });
    } else {
      setSelectedIds(prev => { const n = new Set(prev); filteredBookings.forEach(b => n.add(b.id)); return n; });
    }
  };
  const toggleSelect = (id: string) =>
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleBulkCancel = async () => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    const reason = prompt(`Annuler ${ids.length} réservation${ids.length > 1 ? 's' : ''} ?\n\nMotif d'annulation :`);
    if (reason === null) return;
    setBulkActioning(true);
    try {
      await Promise.all(ids.map(id =>
        apiClient.put(`/admin/bookings/${id}/status`, {
          status: 'cancelled',
          cancellationReason: reason.trim() || 'Annulation groupée admin',
        }),
      ));
      setSelectedIds(new Set());
      loadBookings();
    } catch { alert("Erreur lors de l'annulation groupée"); }
    finally { setBulkActioning(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Réservations Services"
        description="Gestion des réservations de services professionnels par catégorie"
      />

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">

        {/* Onglets catégories */}
        <CategoryTabs
          tabs={categoryTabs}
          active={categoryFilter}
          onChange={setCategoryFilter}
        />

        <TemporalFilterTabs
          tabs={[
            { key: 'all',      label: 'Toutes',       count: temporalCounts.all,      tooltip: 'Toutes les réservations' },
            { key: 'today',    label: "Aujourd'hui",  count: temporalCounts.today,    tooltip: "Réservations planifiées aujourd'hui" },
            { key: 'upcoming', label: 'À venir',      count: temporalCounts.upcoming, tooltip: 'Réservations futures actives' },
            { key: 'history',  label: 'Historique',   count: temporalCounts.history,  tooltip: 'Terminées / Annulées' },
          ]}
          active={temporalFilter}
          onChange={setTemporalFilter}
        />

        <DateRangeFilter
          label="Date planifiée :"
          value={dateRange}
          onChange={setDateRange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Tous les statuts</option>
              {Object.entries(STATUS_CONFIG).map(([v, cfg]) => (
                <option key={v} value={v}>{cfg.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Client, pro, adresse, service..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Actions groupées */}
      {selectedIds.size > 0 && (
        <BulkActionBar
          count={selectedIds.size}
          nounSingular="réservation"
          onClear={() => setSelectedIds(new Set())}
          loading={bulkActioning}
          actions={[
            { label: '✕ Annuler la sélection', variant: 'danger', onClick: handleBulkCancel },
          ]}
        />
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : filteredBookings.length === 0 ? (
          <EmptyState message="Aucune réservation trouvée" icon="📋" />
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
                  {['Client', 'Professionnel', 'Service', 'Adresse', 'Date', 'Prix', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map(booking => {
                  const isSelected  = selectedIds.has(booking.id);
                  const clientName  = `${booking.client.firstName} ${booking.client.lastName}`.trim();
                  const proUser     = booking.pro?.user;
                  const proName     = proUser
                    ? `${proUser.firstName} ${proUser.lastName}`
                    : booking.pro?.companyName ?? null;
                  const serviceName = booking.category?.nameFr ?? booking.category?.nameEn ?? booking.category?.slug ?? '—';
                  const isToday     = toDay(booking.scheduledAt) === todayStr;
                  const isUrgent    = booking.categoryData?.urgency === 'urgent';

                  return (
                    <tr
                      key={booking.id}
                      className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                    >
                      <td className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(booking.id)}
                          className="w-4 h-4 text-primary border-gray-300 rounded cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 text-sm">{clientName}</div>
                        <div className="text-xs text-gray-500">{booking.client.phone || booking.client.email}</div>
                      </td>

                      <td className="px-4 py-3">
                        {proName ? (
                          <>
                            <div className="font-medium text-gray-900 text-sm">{proName}</div>
                            <div className="text-xs text-gray-500">{proUser?.phone ?? ''}</div>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Non assigné</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          {(booking.category as any)?.icon && (
                            <span className="text-sm">{(booking.category as any).icon}</span>
                          )}
                          <span className="text-sm text-gray-800">{serviceName}</span>
                          {isUrgent && (
                            <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-semibold">
                              Urgent
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {booking.bookingType === 'scheduled' ? 'Planifiée' : 'Immédiate'}
                        </div>
                      </td>

                      <td className="px-4 py-3 max-w-[160px]">
                        <div className="text-sm text-gray-700 truncate" title={booking.address}>
                          {booking.address}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {booking.scheduledAt ? (
                          <>
                            <div className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-gray-900'}`}>
                              {isToday ? "Aujourd'hui" : format(new Date(booking.scheduledAt), 'dd MMM yyyy', { locale: fr })}
                            </div>
                            {booking.categoryData?.timeSlot && (
                              <div className="text-xs text-gray-500 capitalize">
                                {booking.categoryData.timeSlot}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-xs text-gray-400">
                            {format(new Date(booking.createdAt), 'dd/MM/yy', { locale: fr })}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.finalPrice != null
                            ? `${booking.finalPrice} EGP`
                            : booking.cashAmountDeclaredByPro != null
                              ? `${booking.cashAmountDeclaredByPro} EGP`
                              : booking.estimatedPrice != null
                                ? `~${booking.estimatedPrice} EGP`
                                : '—'}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          {booking.paymentMethod === 'cash' ? '💵 Espèces' : '💳 In-app'}
                          {booking.paymentMethod === 'cash' && booking.cashPaymentStatus === 'disputed' && (
                            <span className="text-red-600 font-semibold">⚠️</span>
                          )}
                          {booking.paymentMethod === 'cash' && booking.cashPaymentStatus === 'pending' && booking.status === 'completed' && (
                            <span className="text-yellow-600 font-semibold">⏳</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={booking.status} config={STATUS_CONFIG} />
                      </td>

                      <td className="px-4 py-3">
                        <Link
                          href={`/bookings/${booking.id}`}
                          className="text-primary hover:underline font-medium text-xs"
                        >
                          Voir →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && (
        <div className="bg-white rounded-lg shadow p-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-gray-600">
            {filteredBookings.length} réservation{filteredBookings.length !== 1 ? 's' : ''} affichée
            {filteredBookings.length !== 1 ? 's' : ''}
            {filteredBookings.length !== allBookings.length && ` (sur ${allBookings.length} au total)`}
          </p>
          {selectedIds.size > 0 && (
            <p className="text-sm font-medium text-primary">
              {selectedIds.size} sélectionnée{selectedIds.size !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
