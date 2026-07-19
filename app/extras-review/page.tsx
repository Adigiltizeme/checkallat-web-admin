'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExtraItem {
  id: string;
  label: string;
  price: number;
  isOptional: boolean;
  status: 'pending' | 'approved' | 'rejected';
  adminNote: string | null;
  createdAt: string;
  offering: {
    id: string;
    category: { nameFr: string; slug: string };
    pro: {
      id: string;
      user: { firstName: string; lastName: string; email: string };
    };
  };
}

interface CategoryMeta {
  slug: string;
  nameFr: string;
  icon: string;
  basePrice: number | null;
  currency: string | null;
}

// ─── Groupage par pro → catégorie ────────────────────────────────────────────

interface CategoryGroup {
  slug: string;
  nameFr: string;
  icon: string;
  adminBasePrice: number | null;
  currency: string | null;
  extras: ExtraItem[];
}

interface ProGroup {
  proId: string;
  proName: string;
  proEmail: string;
  categories: CategoryGroup[];
  totalPending: number;
}

function groupExtras(items: ExtraItem[], categoryMeta: Record<string, CategoryMeta>): ProGroup[] {
  const byPro = new Map<string, { proId: string; proName: string; proEmail: string; bySlug: Map<string, CategoryGroup> }>();

  for (const extra of items) {
    const { pro, category } = extra.offering;
    const proName = `${pro.user.firstName} ${pro.user.lastName}`;
    const proEmail = pro.user.email;

    if (!byPro.has(pro.id)) {
      byPro.set(pro.id, { proId: pro.id, proName, proEmail, bySlug: new Map() });
    }
    const proEntry = byPro.get(pro.id)!;

    if (!proEntry.bySlug.has(category.slug)) {
      const meta = categoryMeta[category.slug];
      proEntry.bySlug.set(category.slug, {
        slug: category.slug,
        nameFr: meta?.nameFr ?? category.nameFr,
        icon: meta?.icon ?? '🔧',
        adminBasePrice: meta?.basePrice ?? null,
        currency: meta?.currency ?? 'EGP',
        extras: [],
      });
    }
    proEntry.bySlug.get(category.slug)!.extras.push(extra);
  }

  return Array.from(byPro.values()).map(({ proId, proName, proEmail, bySlug }) => {
    const categories = Array.from(bySlug.values());
    return {
      proId,
      proName,
      proEmail,
      categories,
      totalPending: categories.reduce((s, c) => s + c.extras.length, 0),
    };
  });
}

// ─── Composant extra row ──────────────────────────────────────────────────────

function ExtraRow({
  extra,
  actionLoading,
  onApprove,
  onReject,
}: {
  extra: ExtraItem;
  actionLoading: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const isProcessing = actionLoading === extra.id;
  const date = new Date(extra.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="flex items-center gap-3 py-3 px-4 border-b last:border-b-0 border-gray-100 hover:bg-gray-50/50 transition-colors">
      {/* Infos supplément */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm">{extra.label}</span>
          {extra.isOptional ? (
            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full font-medium">Optionnel</span>
          ) : (
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full font-medium">Inclus</span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Soumis le {date}</p>
      </div>

      {/* Prix */}
      <div className="text-right flex-shrink-0 w-24">
        <p className="font-bold text-gray-900 text-sm">+{extra.price.toFixed(2)}</p>
        <p className="text-xs text-gray-400">{extra.offering.category.slug === 'eg' ? 'EGP' : 'EGP'}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 flex-shrink-0">
        <button
          onClick={() => onApprove(extra.id)}
          disabled={isProcessing}
          title="Approuver"
          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
        >
          {isProcessing ? <span className="animate-spin">⏳</span> : '✅'} Approuver
        </button>
        <button
          onClick={() => onReject(extra.id)}
          disabled={isProcessing}
          title="Rejeter"
          className="flex items-center gap-1 bg-red-50 hover:bg-red-100 disabled:opacity-40 text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
        >
          ❌ Rejeter
        </button>
      </div>
    </div>
  );
}

// ─── Composant bloc catégorie ─────────────────────────────────────────────────

function CategoryBlock({
  group,
  actionLoading,
  onApprove,
  onReject,
  onApproveAll,
}: {
  group: CategoryGroup;
  actionLoading: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onApproveAll: (ids: string[]) => void;
}) {
  const includedExtras = group.extras.filter(e => !e.isOptional);
  const optionalExtras = group.extras.filter(e => e.isOptional);
  // Prix total estimé si tous les inclus sont approuvés
  const totalIncluded = includedExtras.reduce((s, e) => s + e.price, 0);
  const total = (group.adminBasePrice ?? 0) + totalIncluded;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* En-tête catégorie */}
      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between gap-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-lg">{group.icon}</span>
          <div>
            <h4 className="font-bold text-gray-800 text-sm">{group.nameFr}</h4>
            <p className="text-xs text-gray-500">
              {group.extras.length} supplément(s) en attente
            </p>
          </div>
        </div>

        {/* Prix de base admin + total estimé */}
        <div className="flex items-center gap-6 text-right">
          {group.adminBasePrice !== null && (
            <div>
              <p className="text-xs text-gray-400 leading-none mb-0.5">Prix de base (admin)</p>
              <p className="text-sm font-semibold text-gray-700">
                {group.adminBasePrice.toFixed(2)} <span className="text-gray-400 font-normal">{group.currency ?? 'EGP'}</span>
              </p>
            </div>
          )}
          {group.adminBasePrice !== null && includedExtras.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 leading-none mb-0.5">Total si approuvés</p>
              <p className="text-sm font-bold text-emerald-600">
                {total.toFixed(2)} <span className="text-emerald-400 font-normal">{group.currency ?? 'EGP'}</span>
              </p>
            </div>
          )}
          {group.extras.length > 1 && (
            <button
              onClick={() => onApproveAll(group.extras.map(e => e.id))}
              disabled={!!actionLoading}
              className="text-xs bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              ✅ Tout approuver
            </button>
          )}
        </div>
      </div>

      {/* Suppléments inclus */}
      {includedExtras.length > 0 && (
        <div>
          <div className="px-4 pt-2 pb-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Inclus dans le prix ({includedExtras.length})
            </p>
          </div>
          {includedExtras.map(extra => (
            <ExtraRow
              key={extra.id}
              extra={extra}
              actionLoading={actionLoading}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))}
        </div>
      )}

      {/* Suppléments optionnels */}
      {optionalExtras.length > 0 && (
        <div className={includedExtras.length > 0 ? 'border-t border-gray-100' : ''}>
          <div className="px-4 pt-2 pb-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
              Optionnels ({optionalExtras.length})
            </p>
          </div>
          {optionalExtras.map(extra => (
            <ExtraRow
              key={extra.id}
              extra={extra}
              actionLoading={actionLoading}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function ExtrasReviewPage() {
  const [allExtras, setAllExtras] = useState<ExtraItem[]>([]);
  const [categoryMeta, setCategoryMeta] = useState<Record<string, CategoryMeta>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [extrasRes, catsRes] = await Promise.all([
        apiClient.get('/services/offerings/extras/pending?limit=200') as Promise<{ items: ExtraItem[]; total: number }>,
        apiClient.get('/services/categories?activeOnly=false') as Promise<CategoryMeta[]>,
      ]);
      setAllExtras(extrasRes.items ?? []);
      const meta: Record<string, CategoryMeta> = {};
      for (const c of (Array.isArray(catsRes) ? catsRes : [])) {
        meta[c.slug] = c;
      }
      setCategoryMeta(meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const proGroups = useMemo(() => {
    const filtered = search.trim()
      ? allExtras.filter(e =>
          e.label.toLowerCase().includes(search.toLowerCase()) ||
          `${e.offering.pro.user.firstName} ${e.offering.pro.user.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
          e.offering.category.nameFr.toLowerCase().includes(search.toLowerCase()),
        )
      : allExtras;
    return groupExtras(filtered, categoryMeta);
  }, [allExtras, categoryMeta, search]);

  const totalPending = allExtras.length;

  const doApprove = async (extraId: string) => {
    setActionLoading(extraId);
    try {
      await apiClient.patch(`/services/offerings/extras/${extraId}/review`, {
        decision: 'approved', reviewedBy: 'admin',
      });
      setAllExtras(prev => prev.filter(e => e.id !== extraId));
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const doApproveAll = async (ids: string[]) => {
    setActionLoading('bulk');
    try {
      await Promise.all(ids.map(id =>
        apiClient.patch(`/services/offerings/extras/${id}/review`, {
          decision: 'approved', reviewedBy: 'admin',
        }),
      ));
      setAllExtras(prev => prev.filter(e => !ids.includes(e.id)));
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const openRejectModal = (id: string) => { setRejectModalId(id); setRejectNote(''); };

  const doReject = async () => {
    if (!rejectModalId) return;
    setActionLoading(rejectModalId);
    try {
      await apiClient.patch(`/services/offerings/extras/${rejectModalId}/review`, {
        decision: 'rejected',
        adminNote: rejectNote.trim() || null,
        reviewedBy: 'admin',
      });
      setAllExtras(prev => prev.filter(e => e.id !== rejectModalId));
      setRejectModalId(null);
      setRejectNote('');
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Révision des suppléments"
        description={`${totalPending} supplément(s) en attente · classés par prestataire et catégorie`}
        actions={
          <input
            type="text"
            placeholder="Rechercher supplément, prestataire, catégorie..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        }
      />

      {loading ? (
        <LoadingSpinner />
      ) : proGroups.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-lg font-semibold text-gray-600">Aucun supplément en attente</p>
          <p className="text-sm mt-1">
            {search ? 'Aucun résultat pour cette recherche.' : 'Tous les suppléments ont été traités.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {proGroups.map(pro => (
            <div key={pro.proId} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* En-tête prestataire */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-base">
                      {pro.proName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">{pro.proName}</h3>
                    <p className="text-gray-300 text-xs">{pro.proEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full">
                    {pro.totalPending} en attente
                  </span>
                  <button
                    onClick={() => doApproveAll(pro.categories.flatMap(c => c.extras.map(e => e.id)))}
                    disabled={!!actionLoading}
                    className="bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    ✅ Tout approuver ({pro.totalPending})
                  </button>
                </div>
              </div>

              {/* Catégories */}
              <div className="p-4 space-y-4">
                {pro.categories.map(catGroup => (
                  <CategoryBlock
                    key={catGroup.slug}
                    group={catGroup}
                    actionLoading={actionLoading}
                    onApprove={doApprove}
                    onReject={openRejectModal}
                    onApproveAll={doApproveAll}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal rejet avec note */}
      {rejectModalId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Rejeter ce supplément</h2>
            <p className="text-sm text-gray-500 mb-4">
              Expliquez au prestataire pourquoi ce supplément est refusé. Il recevra cette note dans l'application.
            </p>
            <textarea
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              placeholder="Ex : Prix trop élevé par rapport au marché, libellé non conforme, doublon avec un supplément existant..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-red-300 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectModalId(null); setRejectNote(''); }}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={doReject}
                disabled={!!actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-bold transition-colors"
              >
                {actionLoading ? '⏳ Envoi...' : 'Confirmer le rejet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
