'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCurrency } from '@/hooks/useCurrency';

const TransportDetailMap = dynamic(
  () => import('@/components/transport/TransportDetailMap'),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border border-gray-200">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
    </div>
  )},
);

// Status configuration matching the new implementation
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  accepted: { label: 'Accepté', color: 'bg-blue-100 text-blue-800', icon: '✅' },
  heading_to_pickup: { label: 'En route vers retrait', color: 'bg-indigo-100 text-indigo-800', icon: '🚚' },
  arrived_at_pickup: { label: 'Arrivé au retrait', color: 'bg-purple-100 text-purple-800', icon: '📍' },
  loading: { label: 'Chargement', color: 'bg-orange-100 text-orange-800', icon: '📦' },
  in_transit: { label: 'En transit', color: 'bg-cyan-100 text-cyan-800', icon: '🚛' },
  arrived_at_delivery: { label: 'Arrivé livraison', color: 'bg-violet-100 text-violet-800', icon: '🏠' },
  unloading: { label: 'Déchargement', color: 'bg-pink-100 text-pink-800', icon: '📤' },
  completed: { label: 'Terminé', color: 'bg-green-100 text-green-800', icon: '✔️' },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800', icon: '❌' },
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['accepted', 'cancelled'],
  accepted: ['heading_to_pickup', 'cancelled'],
  heading_to_pickup: ['arrived_at_pickup', 'cancelled'],
  arrived_at_pickup: ['loading', 'cancelled'],
  loading: ['in_transit', 'cancelled'],
  in_transit: ['arrived_at_delivery', 'cancelled'],
  arrived_at_delivery: ['unloading', 'cancelled'],
  unloading: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export default function TransportRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;
  const { formatCurrency } = useCurrency();

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);

  // Annulation admin
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelRefundPct, setCancelRefundPct] = useState(100);

  // Remboursement post-litige
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundPct, setRefundPct] = useState(100);
  const [refundNote, setRefundNote] = useState('');

  // Driver assignment
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');

  // Countdown timer for pending requests (2 min driver-accept window)
  const DRIVER_ACCEPT_TIMEOUT_SEC = 30; // doit correspondre à DRIVER_ACCEPT_TIMEOUT_MS / 1000 côté backend
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!request || request.status !== 'pending') {
      setSecondsLeft(null);
      return;
    }
    const elapsed = Math.floor((Date.now() - new Date(request.createdAt).getTime()) / 1000);
    const remaining = DRIVER_ACCEPT_TIMEOUT_SEC - elapsed;
    setSecondsLeft(remaining > 0 ? remaining : 0);

    const tick = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null || prev <= 1) { clearInterval(tick); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [request?.id, request?.status, request?.createdAt]);

  useEffect(() => {
    loadRequest();

    // Auto-refresh toutes les 5 secondes pour suivre les changements en temps réel
    const interval = setInterval(() => {
      loadRequest();
    }, 5000);

    return () => clearInterval(interval);
  }, [requestId]);

  const loadRequest = async () => {
    try {
      const data = await apiClient.get(`/admin/transport-requests/${requestId}`);
      setRequest(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Changer vers "${STATUS_CONFIG[newStatus]?.label}" ?`)) return;

    setUpdating(true);
    try {
      await apiClient.patch(`/admin/transport-requests/${requestId}/status`, { status: newStatus });
      await loadRequest();
      setShowStatusModal(false);
      alert('Statut mis à jour');
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Erreur inconnue'));
    } finally {
      setUpdating(false);
    }
  };

  const handleAdminCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Veuillez indiquer une raison d\'annulation');
      return;
    }
    setUpdating(true);
    try {
      const result: any = await apiClient.delete(`/admin/transport-requests/${requestId}`, {
        data: { reason: cancelReason, refundPercentage: cancelRefundPct },
      });
      await loadRequest();
      setShowCancelModal(false);
      const msg = result?.paymentRefunded
        ? `Transport annulé. Remboursement de ${cancelRefundPct}% en cours.`
        : 'Transport annulé.';
      alert(msg);
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Erreur inconnue'));
    } finally {
      setUpdating(false);
    }
  };

  const handleRefundDispute = async () => {
    if (!refundNote.trim()) {
      alert('Veuillez indiquer une note pour le remboursement');
      return;
    }
    setUpdating(true);
    try {
      await apiClient.post(`/admin/transport-requests/${requestId}/refund`, {
        refundPercentage: refundPct,
        adminNote: refundNote,
      });
      await loadRequest();
      setShowRefundModal(false);
      alert(`Remboursement de ${refundPct}% traité avec succès.`);
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Erreur inconnue'));
    } finally {
      setUpdating(false);
    }
  };

  const openDriverModal = async () => {
    setShowDriverModal(true);
    setSelectedDriverId('');
    setDriversLoading(true);
    try {
      const data: any = await apiClient.get('/admin/drivers', { params: { status: 'active' } });
      setDrivers(Array.isArray(data) ? data : (data.drivers || []));
    } catch (error) {
      console.error(error);
      setDrivers([]);
    } finally {
      setDriversLoading(false);
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedDriverId) {
      alert('Veuillez sélectionner un chauffeur');
      return;
    }
    setUpdating(true);
    try {
      await apiClient.put(`/admin/transport-requests/${requestId}/assign-driver`, { driverId: selectedDriverId });
      await loadRequest();
      setShowDriverModal(false);
      alert('Chauffeur assigné avec succès');
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Aucun chauffeur disponible'));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-8">
        <div className="bg-red-50 p-6 rounded">
          <h2 className="text-xl font-bold text-red-800">Demande introuvable</h2>
          <button onClick={() => router.push('/transport-requests')} className="mt-4 px-4 py-2 bg-red-600 text-white rounded">
            Retour
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
  const transitions = VALID_TRANSITIONS[request.status] || [];

  const timeline = [
    { status: 'accepted', label: 'Accepté', time: request.driverAcceptedAt },
    { status: 'heading_to_pickup', label: 'En route retrait' },
    { status: 'arrived_at_pickup', label: 'Arrivé retrait', time: request.arrivedAtPickupAt },
    { status: 'loading', label: 'Chargement', time: request.loadingStartedAt },
    { status: 'in_transit', label: 'Transit', time: request.departedPickupAt },
    { status: 'arrived_at_delivery', label: 'Arrivé livraison', time: request.arrivedAtDeliveryAt },
    { status: 'unloading', label: 'Déchargement', time: request.unloadingStartedAt },
    { status: 'completed', label: 'Terminé', time: request.completedAt },
  ];

  const currentIndex = timeline.findIndex(t => t.status === request.status);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <button onClick={() => router.push('/transport-requests')} className="text-primary hover:underline mb-2">
            ← Retour
          </button>
          <h1 className="text-3xl font-bold">Demande #{request.id.slice(0, 8)}</h1>
          <p className="text-gray-600">Créée le {format(new Date(request.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
        </div>

        <div className={`px-6 py-3 rounded-lg ${statusConfig.color} flex items-center gap-2`}>
          <span className="text-2xl">{statusConfig.icon}</span>
          <span className="font-bold">{statusConfig.label}</span>
        </div>
      </div>

      {/* Countdown banner — pending requests only */}
      {request.status === 'pending' && secondsLeft !== null && (
        <div className={`p-4 rounded-lg border flex items-center gap-4 ${
          secondsLeft === 0
            ? 'bg-red-50 border-red-300'
            : secondsLeft < 30
            ? 'bg-orange-50 border-orange-300'
            : 'bg-yellow-50 border-yellow-300'
        }`}>
          <div className={`text-4xl font-mono font-bold w-20 text-center ${
            secondsLeft === 0 ? 'text-red-700' : secondsLeft < 30 ? 'text-orange-700' : 'text-yellow-700'
          }`}>
            {String(Math.floor((secondsLeft ?? 0) / 60)).padStart(2, '0')}:{String((secondsLeft ?? 0) % 60).padStart(2, '0')}
          </div>
          <div className="flex-1">
            {secondsLeft === 0 ? (
              <>
                <p className="font-bold text-red-800">⏰ Fenêtre d'acceptation expirée</p>
                <p className="text-sm text-red-700">Le système a tenté une auto-assignation. Vérifiez si un chauffeur a été assigné ou assignez-en un manuellement.</p>
              </>
            ) : (
              <>
                <p className="font-bold text-yellow-800">
                  {request.isImmediate ? '⚡ Demande immédiate' : '📅 Demande planifiée'} — en attente d'acceptation chauffeur
                </p>
                <p className="text-sm text-yellow-700">
                  Les chauffeurs éligibles ont été notifiés. Auto-assignation dans {secondsLeft}s si aucun n'accepte.
                  Vous pouvez également assigner manuellement ci-dessous.
                </p>
              </>
            )}
          </div>
          <div className={`w-2 self-stretch rounded-full ${
            secondsLeft === 0 ? 'bg-red-400' : secondsLeft < 30 ? 'bg-orange-400' : 'bg-yellow-400'
          }`} />
        </div>
      )}

      {/* Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          {request.status === 'pending' && (
            <button onClick={openDriverModal} disabled={updating} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
              Assigner chauffeur
            </button>
          )}
          {transitions.length > 0 && (
            <button onClick={() => setShowStatusModal(true)} disabled={updating} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              Changer statut
            </button>
          )}
          {request.status !== 'cancelled' && request.status !== 'completed' && (
            <button onClick={() => setShowCancelModal(true)} disabled={updating} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">
              Annuler (avec remboursement)
            </button>
          )}
          {request.paymentMethod === 'in_app' && request.payment &&
           (request.payment.escrowStatus === 'held' || request.payment.escrowStatus === 'captured') && (
            <button
              onClick={async () => {
                if (!confirm('Libérer les fonds au chauffeur ?')) return;
                setUpdating(true);
                try {
                  await apiClient.post(`/payments/${request.payment.id}/release`, {});
                  await loadRequest();
                  alert('Fonds libérés au chauffeur.');
                } catch (error: any) {
                  alert('Erreur: ' + (error.response?.data?.message || 'Erreur inconnue'));
                } finally { setUpdating(false); }
              }}
              disabled={updating}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              ✅ Libérer au chauffeur
            </button>
          )}
          {request.paymentMethod === 'in_app' && request.payment && request.status === 'completed' && (
            <button onClick={() => setShowRefundModal(true)} disabled={updating} className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50">
              Rembourser (post-litige)
            </button>
          )}
        </div>
      </div>

      {/* Escrow / Paiement in-app */}
      {request.paymentMethod === 'in_app' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">💳 Paiement in-app (Escrow)</h2>
          {request.payment ? (() => {
            const escrowLabels: Record<string, { label: string; color: string }> = {
              pending:  { label: '⏳ En attente',              color: 'bg-yellow-100 text-yellow-800' },
              captured: { label: '💳 Capturé — en séquestre',  color: 'bg-blue-100 text-blue-800' },
              held:     { label: '🔒 Bloqué en séquestre',     color: 'bg-indigo-100 text-indigo-800' },
              released: { label: '✅ Libéré au chauffeur',     color: 'bg-green-100 text-green-800' },
              refunded: { label: '↩️ Remboursé',               color: 'bg-red-100 text-red-800' },
            };
            const escrow = escrowLabels[request.payment.escrowStatus] ?? escrowLabels.pending;
            return (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${escrow.color}`}>{escrow.label}</span>
                  <span className="text-gray-500 text-sm">ID Stripe : {request.payment.providerTransactionId ?? '—'}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-xs text-gray-500 mb-1">Montant total</p>
                    <p className="font-bold">{formatCurrency(request.payment.amount)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-xs text-gray-500 mb-1">Commission ({request.payment.commissionRate}%)</p>
                    <p className="font-bold">{formatCurrency(request.payment.commissionAmount)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-xs text-gray-500 mb-1">Net chauffeur</p>
                    <p className="font-bold text-green-700">{formatCurrency(request.payment.proNetAmount)}</p>
                  </div>
                </div>
                {request.payment.transferStatus === 'transferred' && request.payment.transferredAt && (
                  <p className="text-sm text-green-700">✅ Transféré au chauffeur le {format(new Date(request.payment.transferredAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
                )}
              </div>
            );
          })() : (
            <div className="p-4 bg-yellow-50 border border-yellow-300 rounded">
              <p className="text-yellow-800 font-semibold">⚠️ Aucun paiement enregistré</p>
              <p className="text-sm text-yellow-700 mt-1">Le client a sélectionné le paiement in-app mais n'a pas encore finalisé la transaction.</p>
            </div>
          )}
        </div>
      )}

      {/* Timeline + Carte */}
      {request.status !== 'pending' && request.status !== 'cancelled' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
          >
            <h2 className="text-xl font-semibold">📍 Suivi en temps réel</h2>
            <button className="text-2xl text-gray-600 hover:text-primary">
              {isTimelineExpanded ? '−' : '+'}
            </button>
          </div>

          {isTimelineExpanded && (
            <div className="grid md:grid-cols-5 gap-6 mt-6">
              {/* Timeline — 2/5 */}
              <div className="md:col-span-2 space-y-4">
                {timeline.map((step, i) => {
                  const isPast = i < currentIndex;
                  const isCurrent = i === currentIndex;
                  const cfg = STATUS_CONFIG[step.status];
                  return (
                    <div key={step.status} className="flex gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${isPast || isCurrent ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className={`font-semibold ${isCurrent ? 'text-primary' : isPast ? 'text-gray-700' : 'text-gray-400'}`}>
                          {step.label}
                        </p>
                        {step.time && (
                          <p className="text-sm text-gray-500">
                            {format(new Date(step.time), 'dd/MM à HH:mm')}
                          </p>
                        )}
                        {isCurrent && request.status !== 'completed' && (
                          <span className="text-sm text-primary font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            En cours
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Carte — 3/5 */}
              <div className="md:col-span-3 h-80 md:h-auto min-h-[420px]">
                <TransportDetailMap
                  requestId={request.id}
                  pickupLat={request.pickupLat}
                  pickupLng={request.pickupLng}
                  pickupAddress={request.pickupAddress}
                  deliveryLat={request.deliveryLat}
                  deliveryLng={request.deliveryLng}
                  deliveryAddress={request.deliveryAddress}
                  status={request.status}
                  driverId={request.driverId}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Client & Driver */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">👤 Client</h2>
          <p><strong>Nom:</strong> {request.client?.firstName} {request.client?.lastName}</p>
          <p><strong>Téléphone:</strong> {request.client?.phone}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">🚚 Chauffeur</h2>
          {request.driver ? (
            <>
              <p><strong>Nom:</strong> {request.driver.user?.firstName} {request.driver.user?.lastName}</p>
              <p><strong>Téléphone:</strong> {request.driver.user?.phone}</p>
              <p><strong>Véhicule:</strong> {request.driver.vehicleType}</p>
              <p><strong>Plaque:</strong> {request.driver.vehiclePlate}</p>
            </>
          ) : (
            <p className="text-gray-500 italic">Non assigné</p>
          )}
        </div>
      </div>

      {/* Addresses */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📍 Retrait</h2>
          <p>{request.pickupAddress}</p>
          <p className="text-sm text-gray-600 mt-2">Étage: {request.pickupFloor || 'RDC'} • Ascenseur: {request.hasElevator ? 'Oui' : 'Non'}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">🏠 Livraison</h2>
          <p>{request.deliveryAddress}</p>
          <p className="text-sm text-gray-600 mt-2">Étage: {request.deliveryFloor || 'RDC'} • Ascenseur: {request.hasElevatorDelivery ? 'Oui' : 'Non'}</p>
        </div>
      </div>

      {/* Details & Price */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📦 Détails</h2>
          <p className="mb-4">{request.itemDescription}</p>
          <p><strong>Distance:</strong> {request.distance?.toFixed(1)} km</p>
          <p><strong>Volume:</strong> {request.estimatedVolume} m³</p>
          <p><strong>Poids estimé:</strong> {request.estimatedWeight} kg</p>

          {/* Types d'objets */}
          {request.objectTypes && request.objectTypes.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold mb-2">Types d'objets :</p>
              <div className="flex flex-wrap gap-2">
                {request.objectTypes.map((type: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Services additionnels */}
          {(request.needsHelpers || request.needsDisassembly || request.needsReassembly || request.needsPackaging) && (
            <div className="mt-4">
              <p className="font-semibold mb-2">Services additionnels :</p>
              <div className="space-y-1">
                {request.needsHelpers && <p className="text-sm">👥 {request.helpersCount} aide(s) supplémentaire(s)</p>}
                {request.needsDisassembly && <p className="text-sm">🔧 Démontage requis</p>}
                {request.needsReassembly && <p className="text-sm">🔨 Remontage requis</p>}
                {request.needsPackaging && <p className="text-sm">📦 Emballage requis</p>}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">💰 Prix</h2>
          <div className="space-y-1">
            <div className="flex justify-between"><span>Base:</span><span>{formatCurrency(request.baseFare)}</span></div>
            <div className="flex justify-between"><span>Distance:</span><span>{formatCurrency(request.distanceFare)}</span></div>
            {request.floorFare > 0 && <div className="flex justify-between"><span>Étages:</span><span>{formatCurrency(request.floorFare)}</span></div>}
            {request.helpersFare > 0 && <div className="flex justify-between"><span>Aides:</span><span>{formatCurrency(request.helpersFare)}</span></div>}
            {request.servicesFare > 0 && <div className="flex justify-between"><span>Services:</span><span>{formatCurrency(request.servicesFare)}</span></div>}
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>TOTAL:</span>
              <span className="text-primary">{formatCurrency(request.totalPrice)}</span>
            </div>
          </div>

          {/* Mode de paiement */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">Mode de paiement :</p>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${request.paymentMethod === 'cash' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
              {request.paymentMethod === 'cash' ? '💵 Espèces' : '💳 Carte'}
            </span>
          </div>

          {/* Statut confirmations */}
          {request.status === 'completed' && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Confirmations de fin :</p>
              <div className="space-y-1">
                <p className="text-sm flex items-center gap-2">
                  {request.clientConfirmedCompletion ? '✅' : '⏳'} Client
                </p>
                <p className="text-sm flex items-center gap-2">
                  {request.driverConfirmedCompletion ? '✅' : '⏳'} Chauffeur
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Validation paiement cash */}
      {request.paymentMethod === 'cash' && request.clientConfirmedCompletion && request.driverConfirmedCompletion && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">💰 Validation Paiement Cash</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600 mb-1">Montant attendu</p>
              <p className="text-xl font-bold">{formatCurrency(request.totalPrice)}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded">
              <p className="text-sm text-blue-700 mb-1">💬 Déclaré par client</p>
              <p className="text-xl font-bold text-blue-800">
                {request.cashAmountDeclaredByClient ? formatCurrency(request.cashAmountDeclaredByClient) : '⏳ En attente'}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded">
              <p className="text-sm text-green-700 mb-1">🚚 Déclaré par chauffeur</p>
              <p className="text-xl font-bold text-green-800">
                {request.cashAmountDeclaredByDriver ? formatCurrency(request.cashAmountDeclaredByDriver) : '⏳ En attente'}
              </p>
            </div>
          </div>

          {request.cashPaymentStatus && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Statut :</p>
              <span className={`px-3 py-2 rounded-full text-sm font-bold ${
                request.cashPaymentStatus === 'confirmed' ? 'bg-green-100 text-green-800' :
                request.cashPaymentStatus === 'disputed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {request.cashPaymentStatus === 'confirmed' && '✅ Concordance confirmée'}
                {request.cashPaymentStatus === 'disputed' && '⚠️ Divergence détectée - Litige'}
                {request.cashPaymentStatus === 'pending' && '⏳ En attente de validation'}
              </span>
            </div>
          )}

          {request.cashPaymentNotes && (
            <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
              <p className="text-sm font-semibold text-yellow-800 mb-1">📝 Notes :</p>
              <p className="text-sm text-gray-800">{request.cashPaymentNotes}</p>
            </div>
          )}
        </div>
      )}

      {/* Notes de confirmation */}
      {(request.clientCompletionNotes || request.driverCompletionNotes) && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📝 Notes de confirmation</h2>
          <div className="space-y-4">
            {request.clientCompletionNotes && (
              <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded">
                <p className="text-sm font-semibold text-blue-700 mb-1">💬 Client :</p>
                <p className="text-gray-800">{request.clientCompletionNotes}</p>
              </div>
            )}
            {request.driverCompletionNotes && (
              <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded">
                <p className="text-sm font-semibold text-green-700 mb-1">🚚 Chauffeur :</p>
                <p className="text-gray-800">{request.driverCompletionNotes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Photos de preuve */}
      {((request.photosBeforeLoading && request.photosBeforeLoading.length > 0) ||
        (request.photosAfterDelivery && request.photosAfterDelivery.length > 0)) && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📷 Photos de preuve</h2>
          <div className="space-y-6">
            {request.photosBeforeLoading && request.photosBeforeLoading.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-3">
                  📦 Avant chargement ({request.photosBeforeLoading.length} photo{request.photosBeforeLoading.length > 1 ? 's' : ''})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {request.photosBeforeLoading.map((url: string, i: number) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="block aspect-square rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition-opacity">
                      <img src={url} alt={`Avant chargement ${i + 1}`}
                        className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            {request.photosAfterDelivery && request.photosAfterDelivery.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-3">
                  🏁 Après livraison ({request.photosAfterDelivery.length} photo{request.photosAfterDelivery.length > 1 ? 's' : ''})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {request.photosAfterDelivery.map((url: string, i: number) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="block aspect-square rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition-opacity">
                      <img src={url} alt={`Après livraison ${i + 1}`}
                        className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Driver Assignment Modal */}
      {showDriverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Sélectionner un chauffeur</h3>

            {driversLoading ? (
              <div className="py-8 text-center text-gray-500">Chargement des chauffeurs...</div>
            ) : drivers.length === 0 ? (
              <div className="py-8 text-center text-gray-500">Aucun chauffeur actif disponible</div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto mb-4">
                {drivers.map((driver: any) => (
                  <label
                    key={driver.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedDriverId === driver.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="driver"
                      value={driver.id}
                      checked={selectedDriverId === driver.id}
                      onChange={() => setSelectedDriverId(driver.id)}
                      className="accent-green-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {driver.user?.firstName} {driver.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {driver.vehicleType} · {driver.vehiclePlate} · {driver.user?.phone}
                      </p>
                    </div>
                    {driver.averageRating && (
                      <span className="text-sm text-yellow-600 font-semibold">⭐ {driver.averageRating.toFixed(1)}</span>
                    )}
                  </label>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAssignDriver}
                disabled={updating || !selectedDriverId}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {updating ? 'Assignation...' : 'Confirmer'}
              </button>
              <button
                onClick={() => setShowDriverModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal annulation admin */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
            <h3 className="text-xl font-bold">Annuler la demande</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raison de l'annulation *</label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                rows={3}
                className="w-full border rounded p-2 text-sm"
                placeholder="Ex : Aucun chauffeur disponible, fraude détectée..."
              />
            </div>
            {request.paymentMethod === 'in_app' && request.payment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remboursement : <span className="text-primary font-bold">{cancelRefundPct}%</span>
                </label>
                <input
                  type="range" min={0} max={100} step={5}
                  value={cancelRefundPct}
                  onChange={e => setCancelRefundPct(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0% (aucun remboursement)</span>
                  <span>100% (remboursement total)</span>
                </div>
                {cancelRefundPct > 0 && (
                  <p className="text-sm text-blue-700 mt-2 font-medium">
                    → {formatCurrency(request.payment.amount * cancelRefundPct / 100)} remboursés au client
                  </p>
                )}
              </div>
            )}
            {request.paymentMethod !== 'in_app' && (
              <p className="text-sm text-gray-500 italic">Paiement cash — aucun remboursement Stripe possible.</p>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={handleAdminCancel} disabled={updating} className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">
                {updating ? 'Annulation...' : 'Confirmer l\'annulation'}
              </button>
              <button onClick={() => setShowCancelModal(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                Retour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal remboursement post-litige */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
            <h3 className="text-xl font-bold">Remboursement post-litige</h3>
            <p className="text-sm text-gray-600">Montant total : <span className="font-bold">{formatCurrency(request.payment?.amount ?? 0)}</span></p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taux de remboursement : <span className="text-primary font-bold">{refundPct}%</span>
              </label>
              <input
                type="range" min={0} max={100} step={5}
                value={refundPct}
                onChange={e => setRefundPct(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <p className="text-sm text-blue-700 mt-2 font-medium">
                → {formatCurrency((request.payment?.amount ?? 0) * refundPct / 100)} remboursés au client
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note admin *</label>
              <textarea
                value={refundNote}
                onChange={e => setRefundNote(e.target.value)}
                rows={3}
                className="w-full border rounded p-2 text-sm"
                placeholder="Ex : Litige résolu en faveur du client, service non rendu..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleRefundDispute} disabled={updating} className="flex-1 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50">
                {updating ? 'Traitement...' : 'Valider le remboursement'}
              </button>
              <button onClick={() => setShowRefundModal(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Changer le statut</h3>
            <div className="space-y-2 mb-6">
              {transitions.map(status => {
                const cfg = STATUS_CONFIG[status];
                return (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={updating}
                    className={`w-full p-3 rounded text-left ${cfg.color} hover:shadow disabled:opacity-50`}
                  >
                    <span className="mr-2">{cfg.icon}</span>
                    <span className="font-semibold">{cfg.label}</span>
                  </button>
                );
              })}
            </div>
            <button onClick={() => setShowStatusModal(false)} className="w-full px-4 py-2 bg-gray-200 rounded">
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
