'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useZone } from '@/contexts/ZoneContext';
import { FULFILLMENT_LABELS, ORDER_STATUS } from '@/lib/marketplace';

export default function MarketplaceOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [fulfillmentType, setFulfillmentType] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const { selectedZone } = useZone();

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    const load = () => {
      const params: Record<string, string> = { status, fulfillmentType };
      if (search) params.search = search;
      if (selectedZone) params.zone = selectedZone;
      apiClient
        .get<any[]>('/admin/marketplace/orders', { params })
        .then((data) => setOrders(Array.isArray(data) ? data : []))
        .catch(console.error)
        .finally(() => setLoading(false));
    };
    load();
    const interval = setInterval(load, 10_000);
    return () => clearInterval(interval);
  }, [status, fulfillmentType, search, selectedZone]);

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Commandes Marketplace</h1>
        <p className="text-gray-600">
          Suivi des commandes, de leur livraison et des remboursements.
          {pendingCount > 0 && <span className="ml-2 text-yellow-700 font-medium">{pendingCount} en attente du vendeur</span>}
        </p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="N° de commande, boutique, client, téléphone..."
          className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-md"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md">
          <option value="all">Tous statuts</option>
          {Object.entries(ORDER_STATUS).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select value={fulfillmentType} onChange={(e) => setFulfillmentType(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md">
          <option value="all">Tous modes de remise</option>
          {Object.entries(FULFILLMENT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Aucune commande</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commande</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Boutique</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remise</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commission</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/marketplace/orders/${o.id}`} className="text-blue-600 hover:underline font-mono">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </Link>
                    <div className="text-xs text-gray-400">{o._count?.items ?? 0} article(s)</div>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/sellers/${o.seller?.id}`} className="hover:underline">{o.seller?.businessName}</Link>
                  </td>
                  <td className="px-4 py-3">
                    {o.client?.firstName} {o.client?.lastName}
                    <div className="text-xs text-gray-400">{o.client?.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    {FULFILLMENT_LABELS[o.fulfillmentType] ?? o.fulfillmentType}
                    {o.transportRequest && (
                      <div className="text-xs text-gray-400">Course : {o.transportRequest.status}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ORDER_STATUS[o.status]?.color ?? 'bg-gray-100'}`}>
                      {ORDER_STATUS[o.status]?.label ?? o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{o.totalAmount} {o.currency}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{o.commissionAmount}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
