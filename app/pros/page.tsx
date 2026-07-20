'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { ProForm } from '@/components/forms/ProForm';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge, StatusConfig } from '@/components/shared/StatusBadge';
import { CategoryTabs, CategoryTabItem } from '@/components/shared/CategoryTabs';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { BulkActionBar } from '@/components/shared/BulkActionBar';

interface ServiceCategory {
  id: string;
  slug: string;
  nameFr: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  proCount: number;
  bookingCount: number;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  pending:   { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  active:    { label: 'Actif',      color: 'bg-green-100 text-green-800' },
  suspended: { label: 'Suspendu',   color: 'bg-orange-100 text-orange-800' },
  rejected:  { label: 'Rejeté',     color: 'bg-red-100 text-red-800' },
};

export default function ProsPage() {
  const [allPros, setAllPros]           = useState<any[]>([]);
  const [categories, setCategories]     = useState<ServiceCategory[]>([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchInput, setSearchInput]   = useState('');
  const [search, setSearch]             = useState('');
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [selectedPro, setSelectedPro]   = useState<any>(null);
  const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set());
  const [bulkActioning, setBulkActioning] = useState(false);

  const loadData = () => {
    Promise.all([
      apiClient.get('/admin/pros') as Promise<any>,
      apiClient.get('/admin/service-categories') as Promise<any>,
    ])
      .then(([prosData, catsData]) => {
        setAllPros(Array.isArray(prosData) ? prosData : (prosData.pros ?? []));
        setCategories(Array.isArray(catsData) ? catsData : (catsData.categories ?? []));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(), 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => { setSelectedIds(new Set()); }, [statusFilter, categoryFilter, search]);

  // ── Comptages par catégorie depuis les données chargées ───────
  const catCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allPros.length };
    for (const pro of allPros) {
      for (const slug of (pro.serviceCategories ?? [])) {
        counts[slug] = (counts[slug] ?? 0) + 1;
      }
    }
    return counts;
  }, [allPros]);

  const categoryTabs: CategoryTabItem[] = useMemo(() => {
    const base: CategoryTabItem[] = [{ key: 'all', label: 'Toutes catégories', count: catCounts.all ?? 0 }];
    const fromApi = categories.map(c => ({
      key: c.slug,
      label: c.nameFr,
      icon: c.icon,
      count: catCounts[c.slug] ?? 0,
    }));
    // Fallback : catégories présentes dans les pros mais absentes de l'API
    const apiSlugs = new Set(categories.map(c => c.slug));
    const extra = Object.keys(catCounts)
      .filter(s => s !== 'all' && !apiSlugs.has(s))
      .map(s => ({ key: s, label: s, count: catCounts[s] }));
    return [...base, ...fromApi, ...extra];
  }, [categories, catCounts]);

  // ── Filtrage client-side ───────────────────────────────────
  const filteredPros = useMemo(() => {
    let result = [...allPros];
    if (statusFilter !== 'all') result = result.filter(p => p.status === statusFilter);
    if (categoryFilter !== 'all') result = result.filter(p => (p.serviceCategories ?? []).includes(categoryFilter));
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        (p.companyName ?? '').toLowerCase().includes(q) ||
        (p.user?.email ?? '').toLowerCase().includes(q) ||
        (p.user?.firstName ?? '').toLowerCase().includes(q) ||
        (p.user?.lastName ?? '').toLowerCase().includes(q),
      );
    }
    return result;
  }, [allPros, statusFilter, categoryFilter, search]);

  const allVisibleSelected = filteredPros.length > 0 && filteredPros.every(p => selectedIds.has(p.id));
  const someSelected       = filteredPros.some(p => selectedIds.has(p.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(prev => { const n = new Set(prev); filteredPros.forEach(p => n.delete(p.id)); return n; });
    } else {
      setSelectedIds(prev => { const n = new Set(prev); filteredPros.forEach(p => n.add(p.id)); return n; });
    }
  };
  const toggleSelect = (id: string) =>
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // ── Actions individuelles ──────────────────────────────────
  const handleValidate = async (proId: string, approved: boolean) => {
    if (!confirm(`Êtes-vous sûr de vouloir ${approved ? 'approuver' : 'rejeter'} ce prestataire ?`)) return;
    try {
      await apiClient.put(`/admin/pros/${proId}/validate`, { approved });
      loadData();
    } catch (e: any) {
      alert('Erreur : ' + (e.response?.data?.message || 'Erreur inconnue'));
    }
  };

  const handleSuspend = async (userId: string) => {
    if (!confirm('Suspendre ce prestataire ?')) return;
    try { await apiClient.patch(`/admin/users/${userId}/suspend`); loadData(); }
    catch (e: any) { alert('Erreur : ' + (e.response?.data?.message || 'Erreur inconnue')); }
  };

  const handleReactivate = async (userId: string) => {
    if (!confirm('Réactiver ce prestataire ?')) return;
    try { await apiClient.patch(`/admin/users/${userId}/reactivate`); loadData(); }
    catch (e: any) { alert('Erreur : ' + (e.response?.data?.message || 'Erreur inconnue')); }
  };

  const handleDelete = async (proId: string) => {
    if (!confirm('SUPPRIMER définitivement ce prestataire ? Action irréversible.')) return;
    try { await apiClient.delete(`/admin/pros/${proId}`); loadData(); }
    catch (e: any) { alert('Erreur : ' + (e.response?.data?.message || 'Erreur inconnue')); }
  };

  // ── Bulk actions ───────────────────────────────────────────
  const handleBulkSuspend = async () => {
    const ids = [...selectedIds];
    if (!confirm(`Suspendre ${ids.length} prestataire${ids.length > 1 ? 's' : ''} ?`)) return;
    setBulkActioning(true);
    try {
      const pros = allPros.filter(p => ids.includes(p.id));
      await Promise.all(pros.map(p => apiClient.patch(`/admin/users/${p.userId}/suspend`)));
      setSelectedIds(new Set());
      loadData();
    } catch { alert('Erreur lors de la suspension groupée'); }
    finally { setBulkActioning(false); }
  };

  const handleBulkApprove = async () => {
    const ids = [...selectedIds];
    const pendingIds = ids.filter(id => allPros.find(p => p.id === id)?.status === 'pending');
    if (!pendingIds.length) { alert('Aucun prestataire en attente sélectionné.'); return; }
    if (!confirm(`Approuver ${pendingIds.length} prestataire${pendingIds.length > 1 ? 's' : ''} ?`)) return;
    setBulkActioning(true);
    try {
      await Promise.all(pendingIds.map(id => apiClient.put(`/admin/pros/${id}/validate`, { approved: true })));
      setSelectedIds(new Set());
      loadData();
    } catch { alert('Erreur lors de l\'approbation groupée'); }
    finally { setBulkActioning(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prestataires de Services"
        description="Validation et gestion des professionnels par catégorie"
        actions={
          <button
            onClick={() => { setSelectedPro(null); setIsModalOpen(true); }}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <span className="text-lg leading-none">+</span>
            Ajouter un prestataire
          </button>
        }
      />

      {/* Onglets catégories */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <CategoryTabs tabs={categoryTabs} active={categoryFilter} onChange={cat => { setCategoryFilter(cat); setSelectedIds(new Set()); }} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Tous statuts</option>
              {Object.entries(STATUS_CONFIG).map(([v, cfg]) => (
                <option key={v} value={v}>{cfg.label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Nom, email, entreprise..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <BulkActionBar
          count={selectedIds.size}
          nounSingular="prestataire"
          onClear={() => setSelectedIds(new Set())}
          loading={bulkActioning}
          actions={[
            { label: '✓ Approuver (en attente)', variant: 'default', onClick: handleBulkApprove },
            { label: '⏸ Suspendre',              variant: 'warning', onClick: handleBulkSuspend },
          ]}
        />
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : filteredPros.length === 0 ? (
          <EmptyState message="Aucun prestataire trouvé" icon="👷" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      ref={el => { if (el) el.indeterminate = someSelected && !allVisibleSelected; }}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-primary border-gray-300 rounded cursor-pointer"
                    />
                  </th>
                  {['Prestataire', 'Catégories', 'Segment', 'Note', 'Statut', 'Disponible', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPros.map(pro => {
                  const isSelected = selectedIds.has(pro.id);
                  const displayCats: string[] = (pro.serviceCategories ?? []).slice(0, 3);
                  const extra = (pro.serviceCategories ?? []).length - displayCats.length;
                  return (
                    <tr key={pro.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                      <td className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(pro.id)}
                          className="w-4 h-4 text-primary border-gray-300 rounded cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 text-sm">
                          {pro.companyName || `${pro.user?.firstName ?? ''} ${pro.user?.lastName ?? ''}`.trim() || '—'}
                        </div>
                        <div className="text-xs text-gray-500">{pro.user?.email}</div>
                        {pro.user?.phone && <div className="text-xs text-gray-400">{pro.user.phone}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {displayCats.map((cat: string) => {
                            const catDef = categories.find(c => c.slug === cat);
                            return (
                              <span key={cat} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                                {catDef?.icon && <span>{catDef.icon}</span>}
                                {catDef?.nameFr ?? cat}
                              </span>
                            );
                          })}
                          {extra > 0 && (
                            <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">+{extra}</span>
                          )}
                          {displayCats.length === 0 && <span className="text-xs text-gray-400 italic">—</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pro.segment === 'premium' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                          {pro.segment === 'premium' ? '⭐ Premium' : 'Standard'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {pro.averageRating ? `⭐ ${Number(pro.averageRating).toFixed(1)}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={pro.status} config={STATUS_CONFIG} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {pro.status === 'active' ? (
                          <span className="flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${pro.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <span className={`text-xs font-medium ${pro.isAvailable ? 'text-green-700' : 'text-gray-500'}`}>
                              {pro.isAvailable ? 'Disponible' : 'Indisponible'}
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/pros/${pro.id}`} className="text-primary hover:underline text-xs font-medium">
                            Détails →
                          </Link>
                          <button onClick={() => { setSelectedPro(pro); setIsModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900 text-xs">
                            Modifier
                          </button>
                          {pro.status === 'pending' && (
                            <>
                              <button onClick={() => handleValidate(pro.id, true)}  className="text-green-600 hover:text-green-900 text-xs">Approuver</button>
                              <button onClick={() => handleValidate(pro.id, false)} className="text-red-600 hover:text-red-900 text-xs">Rejeter</button>
                            </>
                          )}
                          {pro.status === 'active'    && <button onClick={() => handleSuspend(pro.userId)}    className="text-orange-600 hover:text-orange-900 text-xs">Suspendre</button>}
                          {pro.status === 'suspended' && <button onClick={() => handleReactivate(pro.userId)} className="text-green-600 hover:text-green-900 text-xs">Réactiver</button>}
                          <button onClick={() => handleDelete(pro.id)} className="text-red-600 hover:text-red-900 text-xs">Supprimer</button>
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

      {/* Footer */}
      {!loading && (
        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {filteredPros.length} prestataire{filteredPros.length !== 1 ? 's' : ''} affiché{filteredPros.length !== 1 ? 's' : ''}
            {filteredPros.length !== allPros.length && ` (sur ${allPros.length} au total)`}
          </p>
          {selectedIds.size > 0 && (
            <p className="text-sm font-medium text-primary">{selectedIds.size} sélectionné{selectedIds.size !== 1 ? 's' : ''}</p>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedPro(null); }}
        title={selectedPro ? 'Modifier le prestataire' : 'Ajouter un prestataire'}
        size="xl"
      >
        <ProForm
          pro={selectedPro}
          onSuccess={() => { setIsModalOpen(false); setSelectedPro(null); loadData(); }}
          onCancel={() => { setIsModalOpen(false); setSelectedPro(null); }}
        />
      </Modal>
    </div>
  );
}
