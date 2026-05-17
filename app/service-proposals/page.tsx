'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

type Status = 'all' | 'pending' | 'under_review' | 'accepted' | 'refused';

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending:      { label: 'En attente',    className: 'bg-yellow-100 text-yellow-800' },
  under_review: { label: 'En cours',      className: 'bg-blue-100 text-blue-800' },
  accepted:     { label: 'Acceptée',      className: 'bg-green-100 text-green-800' },
  refused:      { label: 'Refusée',       className: 'bg-red-100 text-red-800' },
};

export default function ServiceProposalsPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [byStatus, setByStatus] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Status>('all');

  const load = useCallback((status: Status) => {
    setLoading(true);
    const params = status !== 'all' ? `?status=${status}` : '';
    apiClient.get(`/admin/service-proposals${params}`)
      .then((data: any) => {
        setProposals(Array.isArray(data?.proposals) ? data.proposals : []);
        setByStatus(data?.byStatus ?? {});
        setTotal(data?.total ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(activeTab); }, [load, activeTab]);

  const tabs: { key: Status; label: string }[] = [
    { key: 'all',          label: `Toutes (${total})` },
    { key: 'pending',      label: `En attente (${byStatus.pending ?? 0})` },
    { key: 'under_review', label: `En cours (${byStatus.under_review ?? 0})` },
    { key: 'accepted',     label: `Acceptées (${byStatus.accepted ?? 0})` },
    { key: 'refused',      label: `Refusées (${byStatus.refused ?? 0})` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Propositions de services</h1>
        <p className="text-gray-600">Services proposés par les utilisateurs de la plateforme</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-yellow-50 rounded-lg shadow p-5 border border-yellow-200">
          <p className="text-sm font-medium text-yellow-700">En attente</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{byStatus.pending ?? 0}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-5 border border-blue-200">
          <p className="text-sm font-medium text-blue-700">En cours d'examen</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{byStatus.under_review ?? 0}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-5 border border-green-200">
          <p className="text-sm font-medium text-green-700">Acceptées</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{byStatus.accepted ?? 0}</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-5 border border-red-200">
          <p className="text-sm font-medium text-red-700">Refusées</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{byStatus.refused ?? 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 overflow-x-auto">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`py-3 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-gray-500">Chargement...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Service proposé', 'Utilisateur', 'Contact', 'Statut', 'Messages', 'Date', 'Action'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {proposals.map((p: any) => {
                const s = STATUS_LABELS[p.status] ?? { label: p.status, className: 'bg-gray-100 text-gray-700' };
                const unread = (p.messages ?? []).filter((m: any) => !m.fromAdmin).length;
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{p.serviceNameFr}</p>
                      <p className="text-xs text-gray-400">{p.serviceNameEn}</p>
                    </td>
                    <td className="px-6 py-4 text-sm">{p.user?.firstName} {p.user?.lastName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <p>{p.user?.email ?? '—'}</p>
                      <p>{p.user?.phone ?? ''}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${s.className}`}>{s.label}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      {(p.messages ?? []).length > 0 ? (
                        <span className="inline-flex items-center gap-1">
                          {(p.messages ?? []).length}
                          {unread > 0 && <span className="inline-flex items-center justify-center w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full">{unread}</span>}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(p.createdAt)}</td>
                    <td className="px-6 py-4">
                      <Link href={`/service-proposals/${p.id}`} className="text-primary text-sm font-medium hover:underline">
                        Examiner →
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {proposals.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    ✅ Aucune proposition {activeTab !== 'all' ? `avec ce statut` : ''}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
