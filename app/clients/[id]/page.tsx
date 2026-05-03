'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

const TRANSPORT_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  accepted: 'Accepté',
  heading_to_pickup: 'En route',
  arrived_at_pickup: 'Arrivé',
  loading: 'Chargement',
  in_transit: 'En transit',
  arrived_at_delivery: 'Livraison',
  unloading: 'Déchargement',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

const TRANSPORT_STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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

  useEffect(() => {
    loadClient();
  }, [params.id]);

  const doAction = async (action: () => Promise<void>, successMsg: string) => {
    setProcessing(true);
    try {
      await action();
      alert(successMsg);
      await loadClient();
    } catch (err: any) {
      alert('Erreur: ' + (err.response?.data?.message || 'Erreur inconnue'));
    } finally {
      setProcessing(false);
    }
  };

  const handleSuspend = () =>
    doAction(
      () => apiClient.patch(`/admin/users/${params.id}/suspend`) as any,
      'Compte suspendu',
    );

  const handleReactivate = () =>
    doAction(
      () => apiClient.patch(`/admin/users/${params.id}/reactivate`) as any,
      'Compte réactivé',
    );

  const handleRestrictCash = () =>
    doAction(
      () => apiClient.patch(`/admin/users/${params.id}/restrict-cash-client`) as any,
      'Restriction cash appliquée',
    );

  const handleLiftCash = () =>
    doAction(
      () => apiClient.patch(`/admin/users/${params.id}/lift-cash-client`) as any,
      'Restriction cash levée',
    );

  const handleDelete = async () => {
    if (!confirm('Supprimer définitivement ce compte client ?')) return;
    setProcessing(true);
    try {
      await apiClient.delete(`/admin/users/${params.id}`);
      alert('Compte supprimé');
      router.push('/clients');
    } catch (err: any) {
      alert('Erreur: ' + (err.response?.data?.message || 'Erreur inconnue'));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="text-center py-12">Chargement...</div>;
  if (!client) return <div className="text-center py-12 text-red-500">Client introuvable</div>;

  const isSuspended = client.status === 'suspended';
  const isActive = client.status === 'active';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
            ← Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {client.firstName} {client.lastName}
          </h1>
          <p className="text-gray-500 text-sm">{client.phone}</p>
        </div>
        <div className="flex items-center gap-3">
          {isActive && (
            <button
              onClick={handleSuspend}
              disabled={processing}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 text-sm"
            >
              Suspendre
            </button>
          )}
          {isSuspended && (
            <button
              onClick={handleReactivate}
              disabled={processing}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              Réactiver
            </button>
          )}
          {!client.isCashRestricted ? (
            <button
              onClick={handleRestrictCash}
              disabled={processing}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 text-sm"
            >
              Restreindre cash
            </button>
          ) : (
            <button
              onClick={handleLiftCash}
              disabled={processing}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 text-sm"
            >
              Lever restriction cash
            </button>
          )}
          {client.status !== 'deleted' && (
            <button
              onClick={handleDelete}
              disabled={processing}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
            >
              Supprimer le compte
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Informations générales */}
        <div className="bg-white rounded-lg shadow p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Informations générales</h2>
          <Row label="ID" value={client.id} mono />
          <Row label="Prénom" value={client.firstName} />
          <Row label="Nom" value={client.lastName} />
          <Row label="Email" value={client.email || '—'} />
          <Row label="Téléphone" value={client.phone} />
          <Row label="Langue" value={client.preferredLanguage?.toUpperCase() || '—'} />
          <Row
            label="Statut"
            value={
              <span
                className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                  client.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : client.status === 'suspended'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {client.status}
              </span>
            }
          />
          <Row label="Email vérifié" value={client.emailVerified ? 'Oui' : 'Non'} />
          <Row label="Tél vérifié" value={client.phoneVerified ? 'Oui' : 'Non'} />
          <Row label="Inscrit le" value={new Date(client.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} />
        </div>

        {/* Anti-fraude */}
        <div className="bg-white rounded-lg shadow p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Anti-fraude & Restrictions</h2>
          <Row
            label="Alertes fraude cash"
            value={
              <span className={`font-semibold ${client.cashFraudWarnings > 0 ? 'text-red-600' : 'text-gray-700'}`}>
                {client.cashFraudWarnings}
              </span>
            }
          />
          <Row
            label="Restriction cash"
            value={
              client.isCashRestricted ? (
                <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full font-medium">Actif — paiement in-app obligatoire</span>
              ) : (
                <span className="text-gray-500">Aucune</span>
              )
            }
          />
          {client.cashRestrictionEnd && (
            <Row label="Restriction jusqu'au" value={new Date(client.cashRestrictionEnd).toLocaleDateString('fr-FR')} />
          )}
          <Row
            label="Suspensions totales"
            value={<span className={`font-semibold ${client.suspensionCount > 0 ? 'text-red-600' : 'text-gray-700'}`}>{client.suspensionCount}</span>}
          />
          {client.accountSuspendedUntil && (
            <Row label="Suspendu jusqu'au" value={new Date(client.accountSuspendedUntil).toLocaleDateString('fr-FR')} />
          )}

          {/* Frais d'annulation impayés */}
          {client.transportRequests?.some((t: any) => t.cancellationFeeAmount > 0 && !t.cancellationFeePaid) && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm font-medium text-yellow-800">Frais d'annulation impayés détectés</p>
              {client.transportRequests
                .filter((t: any) => t.cancellationFeeAmount > 0 && !t.cancellationFeePaid)
                .map((t: any) => (
                  <div key={t.id} className="text-xs text-yellow-700 mt-1">
                    Transport{' '}
                    <Link href={`/transport-requests/${t.id}`} className="underline hover:text-yellow-900">
                      {t.id.slice(0, 8)}…
                    </Link>{' '}
                    — {t.cancellationFeeAmount} {t.currency}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Historique transports */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Historique transports ({client.transportRequests?.length ?? 0})
          </h2>
        </div>
        {client.transportRequests?.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frais annulation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {client.transportRequests.map((t: any) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-xs text-gray-500 font-mono">{t.id.slice(0, 8)}…</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${TRANSPORT_STATUS_COLORS[t.status] || 'bg-blue-100 text-blue-800'}`}>
                      {TRANSPORT_STATUS_LABELS[t.status] || t.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">
                    {t.totalPrice} {t.currency}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {new Date(t.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-3">
                    {t.cancellationFeeAmount > 0 ? (
                      <span className={`text-xs font-medium ${t.cancellationFeePaid ? 'text-green-600' : 'text-red-600'}`}>
                        {t.cancellationFeeAmount} {t.currency} {t.cancellationFeePaid ? '(payé)' : '(impayé)'}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <Link href={`/transport-requests/${t.id}`} className="text-blue-600 hover:text-blue-900 text-xs">
                      Voir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm">Aucun transport</div>
        )}
      </div>

      {/* Historique commandes marketplace */}
      {client.marketplaceOrders?.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              Commandes marketplace ({client.marketplaceOrders.length})
            </h2>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {client.marketplaceOrders.map((o: any) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-xs text-gray-500 font-mono">{o.id.slice(0, 8)}…</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{o.status}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start text-sm">
      <span className="text-gray-500 shrink-0 pr-4">{label}</span>
      <span className={`text-gray-900 text-right ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  );
}
