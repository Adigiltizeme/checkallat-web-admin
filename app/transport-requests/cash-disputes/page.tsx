'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';

type Tab = 'transport' | 'services';

export default function CashDisputesPage() {
  const [transportDisputes, setTransportDisputes] = useState<any[]>([]);
  const [bookingDisputes, setBookingDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('transport');
  const { formatCurrency } = useCurrency();

  const load = useCallback(() => {
    apiClient.get('/admin/cash-disputes')
      .then((data: any) => {
        setTransportDisputes(Array.isArray(data?.transport) ? data.transport : []);
        setBookingDisputes(Array.isArray(data?.booking) ? data.booking : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="text-center py-12">Chargement...</div>;

  const totalDisputes = transportDisputes.length + bookingDisputes.length;
  const transportAmount = transportDisputes.reduce((s: number, d: any) => s + (d.totalPrice || 0), 0);
  const bookingAmount = bookingDisputes.reduce((s: number, d: any) => s + (d.finalPrice || d.estimatedPrice || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Litiges Cash</h1>
        <p className="text-gray-600">Divergences de montant déclaré entre client et prestataire</p>
      </div>

      {/* Stats globales */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-red-50 rounded-lg shadow p-5 border border-red-200">
          <p className="text-sm font-medium text-red-700">Total litiges</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{totalDisputes}</p>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-5 border border-purple-200">
          <p className="text-sm font-medium text-purple-700">Transport</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{transportDisputes.length}</p>
          <p className="text-xs text-purple-500 mt-0.5">{formatCurrency(transportAmount)} en jeu</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-5 border border-green-200">
          <p className="text-sm font-medium text-green-700">Services</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{bookingDisputes.length}</p>
          <p className="text-xs text-green-500 mt-0.5">{formatCurrency(bookingAmount)} en jeu</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-5 border border-yellow-200">
          <p className="text-sm font-medium text-yellow-700">Action requise</p>
          <p className="text-xl font-bold text-yellow-600 mt-1">{totalDisputes > 0 ? '🚨 Urgent' : '✅ RAS'}</p>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          {([
            { key: 'transport', label: `🚚 Transport (${transportDisputes.length})` },
            { key: 'services',  label: `🔧 Services (${bookingDisputes.length})` },
          ] as { key: Tab; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
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

      {/* Onglet Transport */}
      {activeTab === 'transport' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['ID', 'Client', 'Chauffeur', 'Prix attendu', 'Déclaré client', 'Déclaré chauffeur', 'Écart', 'Date', 'Action'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transportDisputes.map((d: any) => {
                const clientAmt = d.cashAmountDeclaredByClient || 0;
                const driverAmt = d.cashAmountDeclaredByDriver || 0;
                const expected = d.totalPrice || 0;
                const diff = Math.abs(clientAmt - driverAmt);
                const pct = expected > 0 ? (diff / expected * 100) : 0;
                return (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">{d.id.slice(0, 8)}…</td>
                    <td className="px-6 py-4 text-sm">{d.client?.firstName} {d.client?.lastName}</td>
                    <td className="px-6 py-4 text-sm">{d.driver?.user?.firstName} {d.driver?.user?.lastName}</td>
                    <td className="px-6 py-4 text-sm font-semibold">{formatCurrency(expected)}</td>
                    <td className="px-6 py-4 text-sm text-blue-600 font-medium">{formatCurrency(clientAmt)}</td>
                    <td className="px-6 py-4 text-sm text-purple-600 font-medium">{formatCurrency(driverAmt)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        -{formatCurrency(diff)} ({pct.toFixed(1)}%)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(d.completedAt || d.updatedAt)}</td>
                    <td className="px-6 py-4">
                      <Link href={`/transport-requests/${d.id}`} className="text-primary text-sm hover:underline">Voir</Link>
                    </td>
                  </tr>
                );
              })}
              {transportDisputes.length === 0 && (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-gray-500">✅ Aucun litige transport</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Onglet Services */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['ID', 'Client', 'Prestataire', 'Prix attendu', 'Déclaré client', 'Déclaré pro', 'Écart', 'Adresse', 'Date', 'Action'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookingDisputes.map((d: any) => {
                const clientAmt = d.cashAmountDeclaredByClient || 0;
                const proAmt = d.cashAmountDeclaredByPro || 0;
                const expected = d.finalPrice || d.estimatedPrice || 0;
                const diff = Math.abs(clientAmt - proAmt);
                const pct = expected > 0 ? (diff / expected * 100) : 0;
                return (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">{d.id.slice(0, 8)}…</td>
                    <td className="px-6 py-4 text-sm">{d.client?.firstName} {d.client?.lastName}</td>
                    <td className="px-6 py-4 text-sm">{d.pro?.user?.firstName} {d.pro?.user?.lastName}</td>
                    <td className="px-6 py-4 text-sm font-semibold">{formatCurrency(expected)}</td>
                    <td className="px-6 py-4 text-sm text-blue-600 font-medium">{formatCurrency(clientAmt)}</td>
                    <td className="px-6 py-4 text-sm text-purple-600 font-medium">{formatCurrency(proAmt)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        -{formatCurrency(diff)} ({pct.toFixed(1)}%)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{d.address || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(d.updatedAt)}</td>
                    <td className="px-6 py-4">
                      <Link href={`/bookings/${d.id}`} className="text-primary text-sm hover:underline">Voir</Link>
                    </td>
                  </tr>
                );
              })}
              {bookingDisputes.length === 0 && (
                <tr><td colSpan={10} className="px-6 py-12 text-center text-gray-500">✅ Aucun litige services</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Récapitulatif par prestataires en litige */}
      {activeTab === 'transport' && transportDisputes.length > 0 && (
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="font-semibold text-gray-700 mb-3">Chauffeurs avec litiges</h3>
          <div className="space-y-2">
            {Object.entries(
              transportDisputes.reduce((acc: any, d: any) => {
                const id = d.driver?.id || 'unknown';
                const name = `${d.driver?.user?.firstName || ''} ${d.driver?.user?.lastName || ''}`.trim() || 'Inconnu';
                if (!acc[id]) acc[id] = { name, count: 0, warnings: d.driver?.cashFraudWarnings || 0 };
                acc[id].count++;
                return acc;
              }, {})
            ).map(([id, data]: [string, any]) => (
              <div key={id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">{data.name} <span className="text-sm text-gray-500">({data.count} litige{data.count > 1 ? 's' : ''})</span></span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded ${data.warnings >= 3 ? 'bg-red-100 text-red-800' : data.warnings >= 2 ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  ⚠️ {data.warnings} alerte{data.warnings > 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'services' && bookingDisputes.length > 0 && (
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="font-semibold text-gray-700 mb-3">Prestataires avec litiges</h3>
          <div className="space-y-2">
            {Object.entries(
              bookingDisputes.reduce((acc: any, d: any) => {
                const id = d.pro?.id || 'unknown';
                const name = `${d.pro?.user?.firstName || ''} ${d.pro?.user?.lastName || ''}`.trim() || 'Inconnu';
                if (!acc[id]) acc[id] = { name, count: 0 };
                acc[id].count++;
                return acc;
              }, {})
            ).map(([id, data]: [string, any]) => (
              <div key={id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">{data.name}</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-100 text-red-800">
                  {data.count} litige{data.count > 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">Comment gérer un litige :</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Cliquez "Voir" pour accéder au détail complet de la transaction</li>
          <li>Vérifiez les montants déclarés de chaque partie et les notes éventuelles</li>
          <li>Les écarts &gt; 1% du prix attendu déclenchent automatiquement le statut "disputed"</li>
          <li>Contactez les deux parties si nécessaire, puis résolvez manuellement</li>
        </ul>
      </div>
    </div>
  );
}
