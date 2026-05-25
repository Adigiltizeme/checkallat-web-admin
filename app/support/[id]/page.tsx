'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCurrency } from '@/hooks/useCurrency';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: 'Ouvert', color: 'bg-red-100 text-red-800' },
  in_review: { label: 'En cours de traitement', color: 'bg-yellow-100 text-yellow-800' },
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

export default function SupportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { formatCurrency } = useCurrency();

  const [dispute, setDispute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    apiClient
      .get(`/admin/disputes/${params.id}`)
      .then((data: any) => {
        setDispute(data);
        setAdminNote(data.resolution || '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    setProcessing(true);
    try {
      await apiClient.put(`/admin/disputes/${params.id}/status`, {
        status: newStatus,
        adminNote: adminNote.trim() || undefined,
      });
      const updated = await apiClient.get(`/admin/disputes/${params.id}`);
      setDispute(updated);
      setNewStatus('');
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Erreur inconnue'));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="text-center py-12">Chargement...</div>;
  if (!dispute) return <div className="text-center py-12">Ticket non trouvé</div>;

  const statusCfg = STATUS_LABELS[dispute.status] || { label: dispute.status, color: 'bg-gray-100 text-gray-600' };
  const tr = dispute.transportRequest;
  const client = tr?.client;
  const driver = tr?.driver;

  const nextStatuses: Record<string, string[]> = {
    open: ['in_review', 'closed'],
    in_review: ['resolved', 'closed'],
    resolved: ['closed'],
    closed: [],
  };
  const availableTransitions = nextStatuses[dispute.status] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <button onClick={() => router.push('/support')} className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
            ← Retour aux tickets
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Ticket #{dispute.id.slice(0, 8)}
          </h1>
          <p className="text-gray-600 mt-1">
            {CATEGORY_LABELS[dispute.category] || dispute.category} · Ouvert le{' '}
            {dispute.createdAt ? format(new Date(dispute.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr }) : '—'}
          </p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusCfg.color}`}>
          {statusCfg.label}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Client */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">👤 Client</h2>
          {client ? (
            <>
              <p className="font-medium">{client.firstName} {client.lastName}</p>
              <p className="text-sm text-gray-500">{client.phone}</p>
            </>
          ) : <p className="text-gray-400 italic">Inconnu</p>}
        </div>

        {/* Transport */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">🚚 Transport lié</h2>
          {tr ? (
            <>
              <Link href={`/transport-requests/${tr.id}`} className="text-blue-600 hover:underline text-sm font-mono">
                {tr.id.slice(0, 8)}…
              </Link>
              <p className="text-sm text-gray-600 mt-1">{tr.pickupAddress} → {tr.deliveryAddress}</p>
              <p className="text-sm text-gray-500 mt-1">
                Statut transport : <span className="font-medium">{tr.status}</span>
              </p>
              {tr.totalPrice && (
                <p className="text-sm text-gray-500">Montant : {formatCurrency(tr.totalPrice)}</p>
              )}
              {driver && (
                <p className="text-sm text-gray-500 mt-1">
                  Chauffeur : {driver.user?.firstName} {driver.user?.lastName} — {driver.user?.phone}
                </p>
              )}
            </>
          ) : <p className="text-gray-400 italic">Non lié</p>}
        </div>
      </div>

      {/* Description */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">📝 Description du problème</h2>
        <div className="bg-gray-50 border-l-4 border-red-400 pl-4 py-3 rounded text-sm text-gray-800 whitespace-pre-wrap">
          {dispute.description}
        </div>
      </div>

      {/* Résolution existante */}
      {dispute.resolution && (
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-green-800 mb-3">✅ Résolution / Note admin</h2>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{dispute.resolution}</p>
          {dispute.resolvedAt && (
            <p className="text-xs text-gray-500 mt-2">
              {format(new Date(dispute.resolvedAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
            </p>
          )}
          {dispute.winner && (
            <p className="text-sm mt-2">
              Résolu en faveur de : <span className="font-semibold">{dispute.winner}</span>
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      {availableTransitions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">⚙️ Traitement du ticket</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Note admin (optionnelle)</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Décrivez les actions prises ou la décision..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mettre à jour le statut</label>
              <div className="flex gap-3 flex-wrap">
                {availableTransitions.map((status) => {
                  const cfg = STATUS_LABELS[status] || { label: status, color: '' };
                  return (
                    <button
                      key={status}
                      onClick={() => setNewStatus(status)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                        newStatus === status
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 text-gray-700 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              onClick={handleUpdateStatus}
              disabled={!newStatus || processing}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 text-sm font-medium"
            >
              {processing ? 'Enregistrement...' : 'Confirmer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
