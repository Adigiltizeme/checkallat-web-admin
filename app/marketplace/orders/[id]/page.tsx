'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { FULFILLMENT_LABELS, ORDER_STATUS } from '@/lib/marketplace';

const TIMELINE: Array<{ key: string; label: string }> = [
  { key: 'createdAt', label: 'Commande payée' },
  { key: 'confirmedAt', label: 'Acceptée par le vendeur' },
  { key: 'preparingAt', label: 'En préparation' },
  { key: 'readyAt', label: 'Prête' },
  { key: 'deliveredAt', label: 'Livrée / remise' },
  { key: 'completedAt', label: 'Clôturée (fonds libérés)' },
  { key: 'cancelledAt', label: 'Annulée' },
];

function Money({ value, currency }: { value: number; currency: string }) {
  return <span className="tabular-nums">{value?.toFixed?.(2) ?? value} {currency}</span>;
}

export default function MarketplaceOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(() => {
    apiClient
      .get<any>(`/admin/marketplace/orders/${params.id}`)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10_000);
    return () => clearInterval(interval);
  }, [load]);

  const cancel = async () => {
    if (!cancelReason.trim()) return;
    if (!confirm('Annuler la commande et rembourser intégralement le client ?')) return;
    setCancelling(true);
    try {
      await apiClient.post(`/admin/marketplace/orders/${params.id}/cancel`, { reason: cancelReason.trim() });
      setCancelReason('');
      load();
    } catch (error: any) {
      alert('Erreur : ' + (error.response?.data?.message || 'Erreur inconnue'));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="text-center py-12">Chargement...</div>;
  if (!order) return <div className="text-center py-12">Commande introuvable</div>;

  const status = ORDER_STATUS[order.status];
  const isClosed = ['completed', 'cancelled'].includes(order.status);
  const transport = order.transportRequest;
  const driverShare = order.fulfillmentType === 'checkallpack' || order.fulfillmentType === 'transport' ? order.deliveryFee : 0;

  return (
    <div className="space-y-6">
      <button onClick={() => router.push('/marketplace/orders')} className="text-sm text-gray-500 hover:text-gray-800">
        ← Commandes Marketplace
      </button>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-mono">#{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-gray-600">
            {FULFILLMENT_LABELS[order.fulfillmentType] ?? order.fulfillmentType} · {formatDate(order.createdAt)}
          </p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${status?.color ?? 'bg-gray-100'}`}>
          {status?.label ?? order.status}
        </span>
      </div>

      {order.status === 'cancelled' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          Annulée par <strong>{order.cancelledBy}</strong> — {order.cancellationReason}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">Boutique</h2>
          <Link href={`/sellers/${order.seller.id}`} className="text-blue-600 hover:underline font-medium">
            {order.seller.businessName}
          </Link>
          <p className="text-sm text-gray-600 mt-1">{order.seller.address}</p>
          <p className="text-sm text-gray-600">
            {order.seller.user?.firstName} {order.seller.user?.lastName} · {order.seller.user?.phone}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">Client</h2>
          <p className="font-medium">{order.client.firstName} {order.client.lastName}</p>
          <p className="text-sm text-gray-600">{order.client.phone}{order.client.email ? ` · ${order.client.email}` : ''}</p>
          {order.deliveryAddress && <p className="text-sm text-gray-600 mt-2">📍 {order.deliveryAddress}</p>}
          {order.deliveryInstructions && <p className="text-sm text-gray-500 italic">{order.deliveryInstructions}</p>}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">Livraison</h2>
          {transport ? (
            <>
              <Link href={`/transport-requests/${transport.id}`} className="text-blue-600 hover:underline">
                Course {transport.vehicleCategory === 'courier' ? 'CheckAllPack' : 'CheckAll@t'} — {transport.status}
              </Link>
              {transport.driver && (
                <p className="text-sm text-gray-600 mt-1">
                  Livreur : {transport.driver.user?.firstName} {transport.driver.user?.lastName} · {transport.driver.user?.phone}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">
              {order.fulfillmentType === 'pickup' || order.fulfillmentType === 'seller_delivery'
                ? 'Remise par le vendeur, validée avec le code du client.'
                : 'La course sera créée quand le vendeur marquera la commande prête.'}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            {order.totalWeightKg != null && <>Poids : {order.totalWeightKg} kg · </>}
            {order.deliveryDistanceKm != null && <>Distance : {order.deliveryDistanceKm} km</>}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white rounded-lg shadow overflow-hidden md:col-span-2">
          <div className="px-6 py-4 border-b"><h2 className="text-lg font-semibold">Articles</h2></div>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item: any) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 flex items-center gap-3">
                    {item.product?.images?.[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.product.images[0]} alt="" className="w-10 h-10 rounded object-cover" />
                    )}
                    <div>
                      <div>{item.product?.name}</div>
                      {item.specialNotes && <div className="text-xs text-gray-500 italic">{item.specialNotes}</div>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">× {item.quantity}</td>
                  <td className="px-4 py-3 text-right"><Money value={item.totalPrice} currency={order.currency} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-2 text-sm">
          <h2 className="text-lg font-semibold mb-2">Répartition</h2>
          <div className="flex justify-between"><span>Sous-total articles</span><Money value={order.subtotal} currency={order.currency} /></div>
          <div className="flex justify-between"><span>Livraison</span><Money value={order.deliveryFee} currency={order.currency} /></div>
          <div className="flex justify-between font-semibold border-t pt-2"><span>Payé par le client</span><Money value={order.totalAmount} currency={order.currency} /></div>
          <div className="flex justify-between text-gray-600 pt-2"><span>Commission plateforme ({order.commissionRate} %)</span><Money value={order.commissionAmount} currency={order.currency} /></div>
          <div className="flex justify-between text-gray-600"><span>Net vendeur</span><Money value={order.sellerNetAmount} currency={order.currency} /></div>
          {driverShare > 0 && (
            <div className="flex justify-between text-gray-600"><span>Frais de livraison (livreur, avant commission)</span><Money value={driverShare} currency={order.currency} /></div>
          )}
          <div className="border-t pt-2 text-gray-600">
            Paiement : <strong>{order.payment?.escrowStatus ?? order.paymentStatus}</strong>
            {order.payment?.providerTransactionId && (
              <div className="text-xs font-mono text-gray-400 break-all">{order.payment.providerTransactionId}</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-3">Historique</h2>
        <ol className="space-y-2 text-sm">
          {TIMELINE.filter((step) => order[step.key]).map((step) => (
            <li key={step.key} className="flex gap-3">
              <span className="w-40 text-gray-500 tabular-nums">{formatDate(order[step.key])}</span>
              <span>{step.label}</span>
            </li>
          ))}
        </ol>
      </div>

      {!isClosed && (
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-400">
          <h2 className="text-lg font-semibold mb-2">Annuler la commande</h2>
          <p className="text-sm text-gray-600 mb-3">
            Le client est intégralement remboursé (ou son paiement libéré s&apos;il n&apos;était pas encore encaissé), le stock est remis
            et la course éventuelle est annulée. Le vendeur et le client sont notifiés.
          </p>
          <div className="flex gap-3 flex-wrap">
            <input
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Motif (obligatoire)"
              className="flex-1 min-w-[240px] px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={cancel}
              disabled={cancelling || !cancelReason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {cancelling ? 'Annulation...' : 'Annuler et rembourser'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
