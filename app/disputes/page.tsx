'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

const SECTOR_TABS = [
  { key: 'all',       label: 'Tous',        type: undefined },
  { key: 'transport', label: '🚚 Transport', type: 'transport' },
  { key: 'services',  label: '🔧 Services',  type: 'booking' },
];

export default function DisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sectorTab, setSectorTab] = useState('all');

  useEffect(() => {
    setLoading(true);
    const params: any = {};
    if (filter !== 'all') params.status = filter;
    const sectorType = SECTOR_TABS.find(t => t.key === sectorTab)?.type;
    if (sectorType) params.type = sectorType;
    apiClient.get('/admin/disputes', { params })
      .then((data: any) => setDisputes(data.disputes || data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter, sectorTab]);

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  const pendingCount = disputes.filter((d: any) => d.status === 'pending').length;
  const resolvedCount = disputes.filter((d: any) => d.status === 'resolved').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Litiges</h1>
        <p className="text-gray-600">Résolution des litiges entre clients et professionnels</p>
      </div>

      {/* Sector tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-1">
        {SECTOR_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setSectorTab(tab.key)}
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

      {/* Statistiques */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{disputes.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">En attente</h3>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Résolus</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">{resolvedCount}</p>
        </div>
      </div>

      {/* Filtres */}
      <div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Tous les litiges</option>
          <option value="pending">En attente</option>
          <option value="resolved">Résolus</option>
        </select>
      </div>

      {/* Table des litiges */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Demandeur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Créé le
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {disputes.map((dispute: any) => (
              <tr key={dispute.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-mono text-gray-500">
                  {dispute.id.slice(0, 8)}...
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {dispute.type || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {dispute.requestedBy?.firstName} {dispute.requestedBy?.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      dispute.status === 'resolved'
                        ? 'bg-green-100 text-green-800'
                        : dispute.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {dispute.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDateTime(dispute.createdAt || new Date())}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    href={`/disputes/${dispute.id}`}
                    className="text-primary hover:text-primary-dark"
                  >
                    {dispute.status === 'pending' ? 'Gérer' : 'Voir'}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {disputes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun litige trouvé
          </div>
        )}
      </div>
    </div>
  );
}
