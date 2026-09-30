'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ORDER_STATUS } from '@/lib/marketplace';

interface Domain {
  id: string;
  nameFr: string;
  parentId: string | null;
  isActive: boolean;
  commissionRate: number | null;
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  suspended: 'bg-orange-100 text-orange-800',
  rejected: 'bg-red-100 text-red-800',
  deleted: 'bg-gray-200 text-gray-700',
};

const DAYS: Record<string, string> = { mon: 'Lun', tue: 'Mar', wed: 'Mer', thu: 'Jeu', fri: 'Ven', sat: 'Sam', sun: 'Dim' };

function DocLink({ label, url }: { label: string; url?: string | null }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-700">{label}</span>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
          Voir
        </a>
      ) : (
        <span className="text-sm text-gray-400">Non fourni</span>
      )}
    </div>
  );
}

export default function SellerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [seller, setSeller] = useState<any>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [domainIds, setDomainIds] = useState<string[]>([]);
  const [commissionRate, setCommissionRate] = useState<number | ''>('');
  const [savingSettings, setSavingSettings] = useState(false);

  const load = useCallback(() => {
    apiClient
      .get<any>(`/admin/sellers/${params.id}`)
      .then((data) => {
        setSeller(data);
        setDomainIds((data?.domains ?? []).map((d: Domain) => d.id));
        setCommissionRate(data?.commissionRate ?? '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    load();
    apiClient.get<Domain[]>('/admin/marketplace/domains').then((d) => setDomains(Array.isArray(d) ? d : [])).catch(() => {});
  }, [load]);

  const handleValidate = async (approved: boolean) => {
    if (!approved && !reason.trim()) {
      alert('Veuillez indiquer le motif du refus');
      return;
    }
    setProcessing(true);
    try {
      await apiClient.put(`/admin/sellers/${params.id}/validate`, {
        approved,
        reason: approved ? undefined : reason.trim(),
      });
      alert(approved ? 'Vendeur validé' : 'Candidature refusée');
      load();
    } catch (error: any) {
      alert('Erreur : ' + (error.response?.data?.message || 'Une erreur est survenue'));
    } finally {
      setProcessing(false);
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await apiClient.patch(`/admin/marketplace/sellers/${params.id}`, {
        domainIds,
        commissionRate: commissionRate === '' ? null : commissionRate,
      });
      load();
    } catch (error: any) {
      alert('Erreur : ' + (error.response?.data?.message || 'Une erreur est survenue'));
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) return <div className="text-center py-12">Chargement...</div>;
  if (!seller) return <div className="text-center py-12">Vendeur non trouvé</div>;

  const openingHours = (seller.openingHours ?? null) as Record<string, Array<{ open: string; close: string }>> | null;
  const rootDomains = domains.filter((d) => !d.parentId && d.isActive);

  return (
    <div className="space-y-6">
      <button onClick={() => router.push('/sellers')} className="text-sm text-gray-500 hover:text-gray-800">
        ← Vendeurs
      </button>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          {seller.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={seller.logo} alt="" className="w-16 h-16 rounded-lg object-cover border" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-purple-100 flex items-center justify-center text-2xl">🛍️</div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{seller.businessName}</h1>
            <p className="text-gray-600">
              {seller.user?.firstName} {seller.user?.lastName} · {seller.user?.phone}
              {seller.user?.email ? ` · ${seller.user.email}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {seller.isTemporarilyClosed && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">Fermée temporairement</span>
          )}
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${STATUS_STYLES[seller.status] ?? 'bg-gray-100 text-gray-800'}`}>
            {seller.status}
          </span>
        </div>
      </div>

      {seller.status === 'rejected' && seller.rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          <strong>Motif du refus :</strong> {seller.rejectionReason}
        </div>
      )}

      {seller.status === 'pending' && (
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Candidature à valider</h2>
          <p className="text-sm text-gray-600 mb-4">
            Vérifiez l&apos;identité, les documents et les domaines de vente avant de valider.
            {domainIds.length === 0 && ' Attribuez au moins un domaine de vente (section ci-dessous) pour pouvoir valider.'}
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motif du refus (obligatoire pour refuser, communiqué au vendeur)"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary mb-4"
          />
          <div className="flex gap-3">
            <button
              onClick={() => handleValidate(true)}
              disabled={processing || (seller.domains ?? []).length === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Valider la boutique
            </button>
            <button
              onClick={() => handleValidate(false)}
              disabled={processing || !reason.trim()}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Refuser
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Boutique</h2>
          <p className="text-sm text-gray-700 whitespace-pre-line mb-3">{seller.description || '—'}</p>
          <dl className="text-sm space-y-1">
            <div><dt className="inline text-gray-500">Adresse : </dt><dd className="inline">{seller.address || '—'}</dd></div>
            <div><dt className="inline text-gray-500">Pays : </dt><dd className="inline">{seller.countryId || '—'}</dd></div>
            <div><dt className="inline text-gray-500">Préparation : </dt><dd className="inline">{seller.preparationTimeMin} min</dd></div>
            <div><dt className="inline text-gray-500">Créée le : </dt><dd className="inline">{formatDate(seller.createdAt)}</dd></div>
          </dl>
          {openingHours && Object.keys(openingHours).length > 0 && (
            <div className="mt-3 text-sm">
              <p className="text-gray-500 mb-1">Horaires</p>
              {Object.entries(openingHours).map(([day, slots]) => (
                <div key={day}>
                  <span className="inline-block w-10 text-gray-600">{DAYS[day] ?? day}</span>
                  {slots.length ? slots.map((s) => `${s.open}–${s.close}`).join(', ') : 'Fermé'}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Modes de remise</h2>
          <ul className="text-sm space-y-2">
            <li>✅ Livraison CheckAll@t / CheckAllPack (automatique)</li>
            <li>{seller.offersPickup ? '✅' : '❌'} Retrait en boutique{seller.pickupInstructions ? ` — ${seller.pickupInstructions}` : ''}</li>
            <li>
              {seller.offersDelivery ? '✅' : '❌'} Livraison par le vendeur
              {seller.offersDelivery && ` — ${seller.sellerDeliveryFee ?? 0} (rayon ${seller.deliveryRadius ?? '—'} km)`}
            </li>
          </ul>
          <h3 className="text-sm font-semibold text-gray-900 mt-4 mb-1">Chiffres</h3>
          <dl className="text-sm space-y-1">
            <div><dt className="inline text-gray-500">Note : </dt><dd className="inline">{seller.averageRating ? `${seller.averageRating.toFixed(1)}/5` : '—'}</dd></div>
            <div><dt className="inline text-gray-500">Ventes terminées : </dt><dd className="inline">{seller.totalSales}</dd></div>
            <div><dt className="inline text-gray-500">Commandes : </dt><dd className="inline">{seller._count?.orders ?? 0}</dd></div>
            <div><dt className="inline text-gray-500">À verser : </dt><dd className="inline">{seller.pendingPayoutAmount}</dd></div>
            <div><dt className="inline text-gray-500">Déjà versé : </dt><dd className="inline">{seller.totalPayoutReceived}</dd></div>
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Documents</h2>
          <p className="text-xs text-gray-500 mb-2">Pièce : {seller.idDocumentType ?? '—'}</p>
          <DocLink label="Pièce d'identité (recto)" url={seller.idDocumentFront} />
          <DocLink label="Pièce d'identité (verso)" url={seller.idDocumentBack} />
          <DocLink label="Selfie" url={seller.selfiePhoto} />
          <DocLink label="Certificat sanitaire" url={seller.healthCertificate} />
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-gray-700">N° de licence</span>
            <span className="text-sm">{seller.licenseNumber || '—'}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Domaines de vente et commission</h2>
        <p className="text-sm text-gray-500 mb-4">Le vendeur ne peut publier que dans ces domaines et leurs sous-domaines.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {rootDomains.map((d) => (
            <label key={d.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={domainIds.includes(d.id)}
                onChange={() =>
                  setDomainIds((ids) => (ids.includes(d.id) ? ids.filter((x) => x !== d.id) : [...ids, d.id]))
                }
                className="rounded border-gray-300"
              />
              {d.nameFr}
              {d.commissionRate != null && <span className="text-xs text-gray-400">({d.commissionRate} %)</span>}
            </label>
          ))}
          {rootDomains.length === 0 && (
            <p className="text-sm text-amber-700 col-span-4">
              Aucun domaine actif. <Link href="/marketplace/domains" className="underline">Créer des domaines de vente</Link>
            </p>
          )}
        </div>
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Commission spécifique (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Taux par défaut"
              className="w-40 px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            onClick={saveSettings}
            disabled={savingSettings}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
          >
            {savingSettings ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Produits ({seller._count?.products ?? 0})</h2>
          <span className="text-sm text-gray-500">
            {(seller.sections ?? []).length} section(s) : {(seller.sections ?? []).map((s: any) => s.name).join(', ') || '—'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Domaine</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Prix</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(seller.products ?? []).map((p: any) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 flex items-center gap-2">
                    {p.images?.[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt="" className="w-8 h-8 rounded object-cover" />
                    )}
                    {p.name}
                  </td>
                  <td className="px-4 py-2">{p.domain?.nameFr ?? p.category}</td>
                  <td className="px-4 py-2">{p.section?.name ?? '—'}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{p.price} {p.currency}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{p.hasStock ? p.stockQuantity : '∞'}</td>
                  <td className="px-4 py-2">{p.isAvailable ? 'En vente' : 'Retiré'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(seller.products ?? []).length === 0 && <p className="text-center text-gray-500 py-6">Aucun produit</p>}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Dernières commandes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Commande</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(seller.orders ?? []).map((o: any) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <Link href={`/marketplace/orders/${o.id}`} className="text-blue-600 hover:underline font-mono">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{o.client?.firstName} {o.client?.lastName}</td>
                  <td className="px-4 py-2">{ORDER_STATUS[o.status]?.label ?? o.status}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{o.totalAmount} {o.currency}</td>
                  <td className="px-4 py-2">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(seller.orders ?? []).length === 0 && <p className="text-center text-gray-500 py-6">Aucune commande</p>}
        </div>
      </div>
    </div>
  );
}
