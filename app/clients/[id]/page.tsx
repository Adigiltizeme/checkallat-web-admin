'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

/* ─── Labels & couleurs ─────────────────────────────────────────────────── */

const BOOKING_STATUS: Record<string, { label: string; color: string }> = {
  pending:     { label: 'En attente',   color: 'bg-yellow-100 text-yellow-800' },
  accepted:    { label: 'Accepté',      color: 'bg-blue-100 text-blue-800'    },
  en_route:    { label: 'En route',     color: 'bg-blue-100 text-blue-800'    },
  arrived:     { label: 'Arrivé',       color: 'bg-indigo-100 text-indigo-800'},
  in_progress: { label: 'En cours',     color: 'bg-purple-100 text-purple-800'},
  completed:   { label: 'Terminé',      color: 'bg-green-100 text-green-800'  },
  cancelled:   { label: 'Annulé',       color: 'bg-red-100 text-red-800'      },
};

const TRANSPORT_STATUS: Record<string, { label: string; color: string }> = {
  pending:              { label: 'En attente',  color: 'bg-yellow-100 text-yellow-800' },
  accepted:             { label: 'Accepté',     color: 'bg-blue-100 text-blue-800'    },
  heading_to_pickup:    { label: 'En route',    color: 'bg-blue-100 text-blue-800'    },
  arrived_at_pickup:    { label: 'Arrivé',      color: 'bg-indigo-100 text-indigo-800'},
  in_transit:           { label: 'En transit',  color: 'bg-purple-100 text-purple-800'},
  completed:            { label: 'Terminé',     color: 'bg-green-100 text-green-800'  },
  cancelled:            { label: 'Annulé',      color: 'bg-red-100 text-red-800'      },
};

const PRO_STATUS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'En attente',  color: 'bg-yellow-100 text-yellow-800' },
  active:    { label: 'Actif',       color: 'bg-green-100 text-green-800'   },
  suspended: { label: 'Suspendu',    color: 'bg-red-100 text-red-800'       },
  rejected:  { label: 'Refusé',      color: 'bg-gray-100 text-gray-600'     },
};

/* ─── Tabs ──────────────────────────────────────────────────────────────── */

type ActivityTab = 'client' | 'pro' | 'driver' | 'marketplace';

/* ─── Composant principal ───────────────────────────────────────────────── */

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<ActivityTab>('client');

  const loadClient = async () => {
    try {
      const data = await apiClient.get(`/admin/users/${params.id}`);
      setClient(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadClient(); }, [params.id]);

  const doAction = async (action: () => Promise<void>, msg: string) => {
    setProcessing(true);
    try { await action(); alert(msg); await loadClient(); }
    catch (err: any) { alert('Erreur: ' + (err.response?.data?.message || 'Erreur inconnue')); }
    finally { setProcessing(false); }
  };

  if (loading) return <div className="text-center py-12">Chargement...</div>;
  if (!client) return <div className="text-center py-12 text-red-500">Utilisateur introuvable</div>;

  const isSuspended = client.status === 'suspended';
  const isActive    = client.status === 'active';
  const hasPro      = !!client.pro;
  const hasDriver   = !!client.driver;
  const hasSeller   = !!client.marketplaceSeller;

  const tabs: { key: ActivityTab; label: string; show: boolean }[] = [
    { key: 'client',      label: '👤 Client',      show: true },
    { key: 'pro',         label: '🔧 Pro',          show: hasPro },
    { key: 'driver',      label: '🚚 Chauffeur',    show: hasDriver },
    { key: 'marketplace', label: '🛍️ Marketplace',  show: hasSeller || (client.marketplaceOrders?.length > 0) },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* En-tête */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">← Retour</button>
          <h1 className="text-2xl font-bold text-gray-900">{client.firstName} {client.lastName}</h1>
          <p className="text-gray-500 text-sm">{client.phone}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {hasPro    && <RoleBadge icon="🔧" label="Pro" color="emerald" />}
            {hasDriver && <RoleBadge icon="🚚" label="Chauffeur" color="blue" />}
            {hasSeller && <RoleBadge icon="🛍️" label={client.marketplaceSeller?.businessName || 'Vendeur'} color="purple" />}
            {!hasPro && !hasDriver && !hasSeller && <RoleBadge icon="👤" label="Client uniquement" color="gray" />}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {isActive && (
            <button onClick={() => doAction(() => apiClient.patch(`/admin/users/${params.id}/suspend`) as any, 'Compte suspendu')}
              disabled={processing} className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 text-sm">
              Suspendre
            </button>
          )}
          {isSuspended && (
            <button onClick={() => doAction(() => apiClient.patch(`/admin/users/${params.id}/reactivate`) as any, 'Compte réactivé')}
              disabled={processing} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm">
              Réactiver
            </button>
          )}
          {!client.isCashRestricted ? (
            <button onClick={() => doAction(() => apiClient.patch(`/admin/users/${params.id}/restrict-cash-client`) as any, 'Restriction cash appliquée')}
              disabled={processing} className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 text-sm">
              Restreindre cash
            </button>
          ) : (
            <button onClick={() => doAction(() => apiClient.patch(`/admin/users/${params.id}/lift-cash-client`) as any, 'Restriction cash levée')}
              disabled={processing} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 text-sm">
              Lever restriction cash
            </button>
          )}
          {client.status !== 'deleted' && (
            <button onClick={async () => {
              if (!confirm('Supprimer définitivement ce compte ?')) return;
              setProcessing(true);
              try { await apiClient.delete(`/admin/users/${params.id}`); alert('Compte supprimé'); router.push('/clients'); }
              catch (err: any) { alert('Erreur: ' + (err.response?.data?.message || 'Erreur inconnue')); }
              finally { setProcessing(false); }
            }} disabled={processing} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm">
              Supprimer le compte
            </button>
          )}
        </div>
      </div>

      {/* Infos générales + Anti-fraude */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Informations générales</h2>
          <Row label="ID"       value={client.id} mono />
          <Row label="Prénom"   value={client.firstName} />
          <Row label="Nom"      value={client.lastName} />
          <Row label="Email"    value={client.email || '—'} />
          <Row label="Téléphone" value={client.phone} />
          <Row label="Langue"   value={client.preferredLanguage?.toUpperCase() || '—'} />
          <Row label="Statut"   value={<StatusBadge status={client.status} map={{ active: 'Actif', suspended: 'Suspendu', deleted: 'Supprimé' }} colors={{ active: 'bg-green-100 text-green-800', suspended: 'bg-red-100 text-red-800', deleted: 'bg-gray-100 text-gray-600' }} />} />
          <Row label="Email vérifié" value={client.emailVerified ? '✅ Oui' : '❌ Non'} />
          <Row label="Tél vérifié"   value={client.phoneVerified ? '✅ Oui' : '❌ Non'} />
          <Row label="Inscrit le"    value={new Date(client.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} />
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Anti-fraude & Restrictions</h2>
          <Row label="Alertes fraude cash" value={<span className={`font-semibold ${client.cashFraudWarnings > 0 ? 'text-red-600' : 'text-gray-700'}`}>{client.cashFraudWarnings}</span>} />
          <Row label="Restriction cash"    value={client.isCashRestricted
            ? <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full font-medium">Actif — paiement in-app obligatoire</span>
            : <span className="text-gray-500">Aucune</span>} />
          {client.cashRestrictionEnd && <Row label="Restriction jusqu'au" value={new Date(client.cashRestrictionEnd).toLocaleDateString('fr-FR')} />}
          <Row label="Suspensions totales" value={<span className={`font-semibold ${client.suspensionCount > 0 ? 'text-red-600' : 'text-gray-700'}`}>{client.suspensionCount}</span>} />
          {client.accountSuspendedUntil && <Row label="Suspendu jusqu'au" value={new Date(client.accountSuspendedUntil).toLocaleDateString('fr-FR')} />}

          {client.transportRequests?.some((t: any) => t.cancellationFeeAmount > 0 && !t.cancellationFeePaid) && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm font-medium text-yellow-800">⚠️ Frais d'annulation impayés</p>
              {client.transportRequests.filter((t: any) => t.cancellationFeeAmount > 0 && !t.cancellationFeePaid).map((t: any) => (
                <div key={t.id} className="text-xs text-yellow-700 mt-1">
                  Transport <Link href={`/transport-requests/${t.id}`} className="underline">{t.id.slice(0, 8)}…</Link>{' '}
                  — {t.cancellationFeeAmount} {t.currency}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Onglets activités */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 px-6 pt-4">
          <nav className="flex space-x-6">
            {tabs.filter((t) => t.show).map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">

          {/* ── Onglet CLIENT ─────────────────────────────────────────────── */}
          {activeTab === 'client' && (
            <div className="space-y-6">
              {/* Réservations services */}
              <section>
                <h3 className="font-semibold text-gray-700 mb-3">
                  Réservations services ({client.bookings?.length ?? 0})
                </h3>
                {client.bookings?.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <Th>ID</Th><Th>Catégorie</Th><Th>Pro</Th><Th>Statut</Th><Th>Montant</Th><Th>Date</Th><Th />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {client.bookings.map((b: any) => (
                        <tr key={b.id} className="hover:bg-gray-50">
                          <Td mono>{b.id.slice(0, 8)}…</Td>
                          <Td>{b.category?.nameFr || '—'}</Td>
                          <Td>{b.pro?.user ? `${b.pro.user.firstName} ${b.pro.user.lastName}` : '—'}</Td>
                          <Td><StatusPill status={b.status} map={BOOKING_STATUS} /></Td>
                          <Td>{b.finalPrice ?? b.estimatedPrice ?? '—'} {b.currency || 'EGP'}</Td>
                          <Td>{new Date(b.createdAt).toLocaleDateString('fr-FR')}</Td>
                          <Td><Link href={`/bookings/${b.id}`} className="text-blue-600 hover:underline text-xs">Voir →</Link></Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <Empty label="Aucune réservation service" />}
              </section>

              {/* Demandes de transport */}
              <section>
                <h3 className="font-semibold text-gray-700 mb-3">
                  Demandes de transport ({client.transportRequests?.length ?? 0})
                </h3>
                {client.transportRequests?.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <Th>ID</Th><Th>Statut</Th><Th>Montant</Th><Th>Date</Th><Th>Frais annulation</Th><Th />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {client.transportRequests.map((t: any) => (
                        <tr key={t.id} className="hover:bg-gray-50">
                          <Td mono>{t.id.slice(0, 8)}…</Td>
                          <Td><StatusPill status={t.status} map={TRANSPORT_STATUS} /></Td>
                          <Td>{t.totalPrice ?? '—'} {t.currency || ''}</Td>
                          <Td>{new Date(t.createdAt).toLocaleDateString('fr-FR')}</Td>
                          <Td>
                            {t.cancellationFeeAmount > 0 ? (
                              <span className={`text-xs font-medium ${t.cancellationFeePaid ? 'text-green-600' : 'text-red-600'}`}>
                                {t.cancellationFeeAmount} {t.currency} {t.cancellationFeePaid ? '(payé)' : '(impayé)'}
                              </span>
                            ) : <span className="text-gray-400">—</span>}
                          </Td>
                          <Td><Link href={`/transport-requests/${t.id}`} className="text-blue-600 hover:underline text-xs">Voir →</Link></Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <Empty label="Aucun transport" />}
              </section>
            </div>
          )}

          {/* ── Onglet PRO ────────────────────────────────────────────────── */}
          {activeTab === 'pro' && hasPro && (
            <div className="space-y-6">
              {/* Profil pro */}
              <section className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-700 mb-3">Profil professionnel</h3>
                  <Row label="Statut pro"     value={<StatusPill status={client.pro.status} map={PRO_STATUS} />} />
                  <Row label="Segment"        value={client.pro.segment === 'premium' ? '⭐ Premium' : 'Standard'} />
                  <Row label="Catégories"     value={client.pro.serviceCategories?.join(', ') || '—'} />
                  <Row label="Note moyenne"   value={`⭐ ${client.pro.averageRating?.toFixed(1) || '—'} (${client.pro.totalReviews} avis)`} />
                  <Row label="Missions terminées" value={client.pro.totalCompletedBookings ?? 0} />
                  <Row label="Taux d'acceptation" value={`${client.pro.acceptanceRate?.toFixed(0) ?? 0}%`} />
                  <Row label="Docs vérifiés"  value={client.pro.documentsVerified ? '✅ Oui' : '❌ Non'} />
                  {client.pro.companyName && <Row label="Entreprise" value={client.pro.companyName} />}
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-700 mb-3">Qualité & Alertes</h3>
                  <Row label="Mauvais avis"       value={<span className={client.pro.totalBadReviews > 0 ? 'text-red-600 font-semibold' : 'text-gray-700'}>{client.pro.totalBadReviews}</span>} />
                  <Row label="Avertissements qualité" value={<span className={client.pro.badReviewWarnings > 0 ? 'text-orange-600 font-semibold' : 'text-gray-700'}>{client.pro.badReviewWarnings}</span>} />
                  <Row label="Formation requise"  value={client.pro.requiresTraining ? '⚠️ Oui' : 'Non'} />
                  <Row label="Plan qualité actif" value={client.pro.qualityPlanActive ? '⚠️ Oui' : 'Non'} />
                  <Row label="Disponible"         value={client.pro.isAvailable ? '✅ Oui' : '❌ Non'} />
                </div>
              </section>

              {/* Offres de service */}
              {client.pro.serviceOfferings?.length > 0 && (
                <section>
                  <h3 className="font-semibold text-gray-700 mb-3">Offres de service ({client.pro.serviceOfferings.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {client.pro.serviceOfferings.map((o: any) => (
                      <span key={o.id} className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs border border-emerald-200">
                        {o.category?.nameFr || o.categoryId} — {o.priceMin}{o.priceMax ? `–${o.priceMax}` : '+'} EGP
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Missions assignées au pro */}
              <section>
                <h3 className="font-semibold text-gray-700 mb-3">
                  Missions assignées ({client.pro.bookings?.length ?? 0})
                </h3>
                {client.pro.bookings?.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr><Th>ID</Th><Th>Catégorie</Th><Th>Client</Th><Th>Statut</Th><Th>Montant</Th><Th>Date</Th><Th /></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {client.pro.bookings.map((b: any) => (
                        <tr key={b.id} className="hover:bg-gray-50">
                          <Td mono>{b.id.slice(0, 8)}…</Td>
                          <Td>{b.category?.nameFr || '—'}</Td>
                          <Td>{b.client ? `${b.client.firstName} ${b.client.lastName}` : '—'}</Td>
                          <Td><StatusPill status={b.status} map={BOOKING_STATUS} /></Td>
                          <Td>{b.finalPrice ?? b.estimatedPrice ?? '—'} EGP</Td>
                          <Td>{new Date(b.createdAt).toLocaleDateString('fr-FR')}</Td>
                          <Td><Link href={`/bookings/${b.id}`} className="text-blue-600 hover:underline text-xs">Voir →</Link></Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <Empty label="Aucune mission assignée" />}
              </section>

              {/* Avis reçus en tant que pro */}
              {client.pro.reviews?.length > 0 && (
                <section>
                  <h3 className="font-semibold text-gray-700 mb-3">Avis reçus ({client.pro.reviews.length})</h3>
                  <div className="space-y-2">
                    {client.pro.reviews.map((r: any) => (
                      <div key={r.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                        <span className="font-bold text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                        <span className="text-gray-600">{r.comment || <em className="text-gray-400">Sans commentaire</em>}</span>
                        <span className="ml-auto text-xs text-gray-400 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* ── Onglet CHAUFFEUR ──────────────────────────────────────────── */}
          {activeTab === 'driver' && hasDriver && (
            <div className="space-y-6">
              <section className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-700 mb-3">Profil chauffeur</h3>
                  <Row label="Type de véhicule"  value={client.driver.vehicleType || '—'} />
                  <Row label="Immatriculation"   value={client.driver.vehiclePlate || '—'} />
                  <Row label="Capacité"          value={client.driver.vehicleCapacity ? `${client.driver.vehicleCapacity} m³` : '—'} />
                  <Row label="Note moyenne"      value={`⭐ ${client.driver.averageRating?.toFixed(1) || '—'}`} />
                  <Row label="Transports terminés" value={client.driver.totalTransports ?? 0} />
                  <Row label="Taux ponctualité"  value={`${client.driver.onTimeRate?.toFixed(0) ?? 0}%`} />
                  <Row label="Disponible"        value={client.driver.isAvailable ? '✅ Oui' : '❌ Non'} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-700 mb-3">Équipements</h3>
                  {[
                    ['Aides déménagement', client.driver.hasHelpers],
                    ['Diable/Chariot',     client.driver.hasTrolleys],
                    ['Sangles',            client.driver.hasStraps],
                    ['Couvertures',        client.driver.hasBlankets],
                    ['Boîte à outils',     client.driver.hasToolkit],
                    ['Matériel emballage', client.driver.hasPackingMaterial],
                  ].map(([label, val]) => (
                    <Row key={label as string} label={label as string} value={val ? '✅' : '—'} />
                  ))}
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-gray-700 mb-3">
                  Transports assignés ({client.driver.transportRequests?.length ?? 0})
                </h3>
                {client.driver.transportRequests?.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr><Th>ID</Th><Th>Statut</Th><Th>Montant</Th><Th>Date</Th><Th /></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {client.driver.transportRequests.map((t: any) => (
                        <tr key={t.id} className="hover:bg-gray-50">
                          <Td mono>{t.id.slice(0, 8)}…</Td>
                          <Td><StatusPill status={t.status} map={TRANSPORT_STATUS} /></Td>
                          <Td>{t.totalPrice ?? '—'} {t.currency || ''}</Td>
                          <Td>{new Date(t.createdAt).toLocaleDateString('fr-FR')}</Td>
                          <Td><Link href={`/transport-requests/${t.id}`} className="text-blue-600 hover:underline text-xs">Voir →</Link></Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <Empty label="Aucun transport assigné" />}
              </section>
            </div>
          )}

          {/* ── Onglet MARKETPLACE ───────────────────────────────────────── */}
          {activeTab === 'marketplace' && (
            <div className="space-y-6">
              {hasSeller && (
                <section className="space-y-2">
                  <h3 className="font-semibold text-gray-700 mb-3">Profil vendeur</h3>
                  <Row label="Boutique"     value={client.marketplaceSeller.businessName || '—'} />
                  <Row label="Licence"      value={client.marketplaceSeller.hasBusinessLicense ? '✅ Oui' : '❌ Non'} />
                  <Row label="Statut"       value={client.marketplaceSeller.status || '—'} />
                  <Row label="Depuis"       value={client.marketplaceSeller.createdAt ? new Date(client.marketplaceSeller.createdAt).toLocaleDateString('fr-FR') : '—'} />
                </section>
              )}

              <section>
                <h3 className="font-semibold text-gray-700 mb-3">
                  Commandes ({client.marketplaceOrders?.length ?? 0})
                </h3>
                {client.marketplaceOrders?.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr><Th>ID</Th><Th>Statut</Th><Th>Date</Th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {client.marketplaceOrders.map((o: any) => (
                        <tr key={o.id} className="hover:bg-gray-50">
                          <Td mono>{o.id.slice(0, 8)}…</Td>
                          <Td>{o.status}</Td>
                          <Td>{new Date(o.createdAt).toLocaleDateString('fr-FR')}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <Empty label="Aucune commande marketplace" />}
              </section>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ─── Composants utilitaires ─────────────────────────────────────────────── */

function Row({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start text-sm">
      <span className="text-gray-500 shrink-0 pr-4">{label}</span>
      <span className={`text-gray-900 text-right ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>;
}

function Td({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return <td className={`px-4 py-3 text-sm text-gray-700 ${mono ? 'font-mono text-xs text-gray-500' : ''}`}>{children}</td>;
}

function Empty({ label }: { label: string }) {
  return <div className="text-center py-8 text-gray-400 text-sm">{label}</div>;
}

function RoleBadge({ icon, label, color }: { icon: string; label: string; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    blue:    'bg-blue-100 text-blue-700 border-blue-200',
    purple:  'bg-purple-100 text-purple-700 border-purple-200',
    gray:    'bg-gray-100 text-gray-600 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full font-medium border ${colors[color] || 'bg-gray-100 text-gray-600'}`}>
      {icon} {label}
    </span>
  );
}

function StatusBadge({ status, map, colors }: { status: string; map: Record<string, string>; colors: Record<string, string> }) {
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {map[status] || status}
    </span>
  );
}

function StatusPill({ status, map }: { status: string; map: Record<string, { label: string; color: string }> }) {
  const entry = map[status];
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${entry?.color || 'bg-gray-100 text-gray-600'}`}>
      {entry?.label || status}
    </span>
  );
}
