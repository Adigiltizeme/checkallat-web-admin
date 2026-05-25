'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: 'Ouvert', color: 'bg-red-100 text-red-800' },
  in_review: { label: 'En cours', color: 'bg-yellow-100 text-yellow-800' },
  resolved: { label: 'Résolu', color: 'bg-green-100 text-green-800' },
  closed: { label: 'Fermé', color: 'bg-gray-100 text-gray-600' },
};

const CATEGORY_LABELS: Record<string, string> = {
  quality: 'Qualité',
  payment: 'Paiement',
  cancellation: 'Annulation',
  damage: 'Dommages',
  fraud: 'Fraude',
  other: 'Autre',
};

const SECTOR_TABS = [
  { key: 'all',         label: 'Tous',          type: undefined },
  { key: 'transport',   label: '🚚 Transport',  type: 'transport' },
  { key: 'services',    label: '🔧 Services',   type: 'booking' },
  { key: 'marketplace', label: '🛒 Marketplace', type: 'marketplace' },
];

export default function SupportPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sectorTab, setSectorTab] = useState('all');

  const load = () => {
    const sectorType = SECTOR_TABS.find(t => t.key === sectorTab)?.type;
    const params: any = {};
    if (sectorType) params.type = sectorType;
    if (statusFilter !== 'all') params.status = statusFilter;
    apiClient
      .get('/admin/disputes', { params })
      .then((data: any) => setDisputes(Array.isArray(data) ? data : (data.disputes || [])))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [statusFilter, sectorTab]);

  const filtered = categoryFilter === 'all'
    ? disputes
    : disputes.filter((d) => d.category === categoryFilter);

  const openCount = disputes.filter((d) => d.status === 'open').length;
  const inReviewCount = disputes.filter((d) => d.status === 'in_review').length;

  if (loading) return <div className="text-center py-12">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Aide & Support</h1>
        <p className="text-gray-600">Gestion des litiges ouverts par les clients</p>
      </div>

      {/* Sector tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1">
        {SECTOR_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setSectorTab(tab.key); setLoading(true); }}
            className={[
              'px-4 py-2 rounded-t-lg text-sm font-medium transition-colors border-b-2',
              sectorTab === tab.key
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{disputes.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Ouverts</p>
          <p className="text-2xl font-bold text-red-600">{openCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">En cours</p>
          <p className="text-2xl font-bold text-yellow-600">{inReviewCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Résolus</p>
          <p className="text-2xl font-bold text-green-600">{disputes.filter((d) => d.status === 'resolved').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Tous les statuts</option>
          <option value="open">Ouverts</option>
          <option value="in_review">En cours</option>
          <option value="resolved">Résolus</option>
          <option value="closed">Fermés</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Toutes catégories</option>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {sectorTab === 'services' ? 'Réservation' : sectorTab === 'transport' ? 'Transport' : sectorTab === 'marketplace' ? 'Commande' : 'Référence'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ouvert le</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((dispute: any) => {
              const statusCfg = STATUS_LABELS[dispute.status] || { label: dispute.status, color: 'bg-gray-100 text-gray-600' };
              const client = dispute.transportRequest?.client ?? dispute.booking?.client ?? dispute.marketplaceOrder?.user;
              const refId = dispute.bookingId ?? dispute.transportRequestId ?? dispute.marketplaceOrderId;
              const refHref = dispute.bookingId
                ? `/bookings/${dispute.bookingId}`
                : dispute.marketplaceOrderId
                  ? `/products?order=${dispute.marketplaceOrderId}`
                  : `/transport-requests/${dispute.transportRequestId}`;
              return (
                <tr key={dispute.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">
                      {client ? `${client.firstName} ${client.lastName}` : '—'}
                    </p>
                    {client?.phone && <p className="text-xs text-gray-500">{client.phone}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                      {CATEGORY_LABELS[dispute.category] || dispute.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {refId ? (
                      <Link href={refHref} className="text-blue-600 hover:underline font-mono text-xs">
                        {refId.slice(0, 8)}…
                      </Link>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {dispute.createdAt ? format(new Date(dispute.createdAt), 'dd/MM/yy HH:mm', { locale: fr }) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/support/${dispute.id}`}
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      {dispute.status === 'open' ? 'Prendre en charge' : 'Voir'}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">Aucun ticket trouvé</div>
        )}
      </div>
    </div>
  );
}
