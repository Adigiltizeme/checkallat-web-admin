'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { StatusBadge, StatusConfig } from '@/components/shared/StatusBadge';
import { SectionCard } from '@/components/shared/SectionCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending:     { label: 'En attente',  color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  accepted:    { label: 'Acceptée',    color: 'bg-blue-100 text-blue-800',     icon: '✅' },
  en_route:    { label: 'Pro en route',color: 'bg-indigo-100 text-indigo-800', icon: '🚗' },
  arrived:     { label: 'Pro arrivé',  color: 'bg-purple-100 text-purple-800', icon: '📍' },
  in_progress: { label: 'En cours',    color: 'bg-orange-100 text-orange-800', icon: '🔧' },
  completed:   { label: 'Terminée',    color: 'bg-green-100 text-green-800',   icon: '✔️' },
  cancelled:   { label: 'Annulée',     color: 'bg-red-100 text-red-800',       icon: '❌' },
  rejected:    { label: 'Refusée',     color: 'bg-gray-100 text-gray-800',     icon: '🚫' },
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending:     ['accepted',    'cancelled'],
  accepted:    ['en_route',    'cancelled'],
  en_route:    ['arrived',     'cancelled'],
  arrived:     ['in_progress', 'cancelled'],
  in_progress: ['completed',   'cancelled'],
  completed:   [],
  cancelled:   [],
  rejected:    [],
};

const CATEGORY_DATA_LABELS: Record<string, string> = {
  problemType:   'Type de problème',
  surfaceType:   'Type de surface',
  taskType:      'Type de tâche',
  cleaningType:  'Type de nettoyage',
  serviceType:   'Type de service',
  urgency:       'Urgence',
  timeSlot:      'Créneau',
};

const URGENCY_LABELS: Record<string, string> = {
  normal: 'Normal',
  urgent: 'Urgent (+30%)',
};

const TIMESLOT_LABELS: Record<string, string> = {
  morning:   'Matin',
  afternoon: 'Après-midi',
  evening:   'Soir',
};

function renderCategoryValue(key: string, val: unknown): string {
  if (key === 'urgency' && typeof val === 'string') return URGENCY_LABELS[val] ?? val;
  if (key === 'timeSlot' && typeof val === 'string') return TIMESLOT_LABELS[val] ?? val;
  if (Array.isArray(val)) return val.join(', ');
  return String(val);
}

export default function BookingDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const bookingId = params.id as string;

  const [booking,  setBooking]  = useState<any>(null);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(false);

  const [showStatusModal,      setShowStatusModal]      = useState(false);
  const [selectedStatus,       setSelectedStatus]       = useState('');
  const [cancellationReason,   setCancellationReason]   = useState('');

  const [showCancelModal,      setShowCancelModal]      = useState(false);
  const [cancelReason,         setCancelReason]         = useState('');

  const [isTimelineExpanded,   setIsTimelineExpanded]   = useState(false);

  const [showResolveCashModal, setShowResolveCashModal] = useState(false);
  const [resolveAmount,        setResolveAmount]        = useState('');
  const [resolvingCash,        setResolvingCash]        = useState(false);

  const [showAssignModal,      setShowAssignModal]      = useState(false);
  const [proIdToAssign,        setProIdToAssign]        = useState('');
  const [assigning,            setAssigning]            = useState(false);
  const [proSearchQuery,       setProSearchQuery]       = useState('');
  const [proSearchResults,     setProSearchResults]     = useState<any[]>([]);
  const [proSearchLoading,     setProSearchLoading]     = useState(false);

  const loadBooking = () =>
    apiClient
      .get(`/admin/bookings/${bookingId}`)
      .then((data: any) => { setBooking(data); setLoading(false); })
      .catch((err: any) => { console.error(err); setLoading(false); });

  useEffect(() => {
    loadBooking();
    const interval = setInterval(loadBooking, 5_000);
    return () => clearInterval(interval);
  }, [bookingId]);

  const searchPros = async (query: string) => {
    setProSearchQuery(query);
    if (!query.trim()) { setProSearchResults([]); return; }
    setProSearchLoading(true);
    try {
      const categorySlug = booking?.category?.slug ?? '';
      const qs = new URLSearchParams({ status: 'active', search: query });
      if (categorySlug) qs.set('category', categorySlug);
      const result: any = await apiClient.get(`/admin/pros?${qs.toString()}`);
      setProSearchResults(Array.isArray(result) ? result : result?.pros ?? []);
    } catch { setProSearchResults([]); }
    finally { setProSearchLoading(false); }
  };

  const handleAssignPro = async () => {
    if (!proIdToAssign.trim()) return;
    const p = proSearchResults.find(x => x.id === proIdToAssign);
    const name = p ? `${p.user?.firstName ?? ''} ${p.user?.lastName ?? ''}`.trim() : proIdToAssign;
    if (!confirm(`Assigner "${name}" à cette réservation ?`)) return;
    setAssigning(true);
    try {
      await apiClient.put(`/admin/bookings/${bookingId}/assign-pro`, { proId: proIdToAssign.trim() });
      setShowAssignModal(false); setProIdToAssign(''); setProSearchQuery(''); setProSearchResults([]);
      loadBooking();
    } catch (err: any) { alert('Erreur: ' + (err.response?.data?.message || 'Erreur inconnue')); }
    finally { setAssigning(false); }
  };

  const handleStatusChange = async () => {
    if (!selectedStatus) return;
    if (!confirm(`Changer le statut vers "${STATUS_CONFIG[selectedStatus]?.label}" ?`)) return;
    setUpdating(true);
    try {
      await apiClient.put(`/admin/bookings/${bookingId}/status`, {
        status: selectedStatus,
        ...(selectedStatus === 'cancelled' && cancellationReason ? { cancellationReason } : {}),
      });
      setShowStatusModal(false); setSelectedStatus(''); setCancellationReason('');
      loadBooking();
    } catch (err: any) { alert('Erreur: ' + (err.response?.data?.message || 'Erreur inconnue')); }
    finally { setUpdating(false); }
  };

  const handleResolveCash = async () => {
    const amount = parseFloat(resolveAmount);
    if (isNaN(amount) || amount <= 0) { alert('Montant invalide'); return; }
    setResolvingCash(true);
    try {
      await apiClient.put(`/admin/bookings/${bookingId}/resolve-cash`, { confirmedAmount: amount });
      setShowResolveCashModal(false); setResolveAmount('');
      loadBooking();
    } catch (err: any) { alert('Erreur: ' + (err.response?.data?.message || 'Erreur inconnue')); }
    finally { setResolvingCash(false); }
  };

  const handleAdminCancel = async () => {
    if (!cancelReason.trim()) { alert('Veuillez indiquer un motif d\'annulation'); return; }
    setUpdating(true);
    try {
      await apiClient.put(`/admin/bookings/${bookingId}/status`, {
        status: 'cancelled',
        cancellationReason: cancelReason.trim(),
      });
      setShowCancelModal(false); setCancelReason('');
      loadBooking();
    } catch (err: any) { alert('Erreur: ' + (err.response?.data?.message || 'Erreur inconnue')); }
    finally { setUpdating(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8">
        <div className="bg-red-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-red-800">Réservation introuvable</h2>
          <button onClick={() => router.push('/bookings')} className="mt-4 px-4 py-2 bg-red-600 text-white rounded">
            Retour
          </button>
        </div>
      </div>
    );
  }

  const statusCfg   = STATUS_CONFIG[booking.status] ?? { label: booking.status, color: 'bg-gray-100 text-gray-800', icon: '?' };
  const clientName  = `${booking.client?.firstName ?? ''} ${booking.client?.lastName ?? ''}`.trim() || '—';
  const proUser     = booking.pro?.user;
  const proName     = proUser ? `${proUser.firstName} ${proUser.lastName}` : booking.pro?.companyName ?? '—';
  const serviceName = booking.category?.nameFr ?? booking.serviceOffering?.category?.nameFr ?? booking.category?.slug ?? '—';
  const nextStatuses = VALID_TRANSITIONS[booking.status] ?? [];
  const canCancel   = !['completed', 'cancelled', 'rejected'].includes(booking.status);

  // Timeline steps
  const STATUS_ORDER = ['pending', 'accepted', 'en_route', 'arrived', 'in_progress', 'completed'];
  const currentStatusIndex = STATUS_ORDER.indexOf(booking.status);

  const timeline = [
    { label: 'Créée',           icon: '📋', time: booking.createdAt   },
    { label: 'Acceptée',        icon: '✅', time: null                 },
    { label: 'Pro en route',    icon: '🚗', time: booking.enRouteAt   },
    { label: 'Pro arrivé',      icon: '📍', time: booking.arrivedAt   },
    { label: 'Travail démarré', icon: '🔧', time: booking.startedAt   },
    { label: 'Terminée',        icon: '✔️', time: booking.completedAt },
  ];

  const currentIndex = currentStatusIndex >= 0 ? currentStatusIndex : -1;

  // Category data entries (exclude photos stored separately)
  const categoryEntries: [string, unknown][] = booking.categoryData
    ? Object.entries(booking.categoryData).filter(([k]) => k !== 'photos')
    : [];

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <button onClick={() => router.push('/bookings')} className="text-primary hover:underline mb-2 block text-sm">
            ← Retour aux réservations
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Réservation #{booking.id.slice(-8).toUpperCase()}</h1>
          <p className="text-gray-500 text-sm">
            Créée le {format(new Date(booking.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
            {booking.isRecurring && (
              <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">
                🔁 Récurrente ({booking.recurringFrequency})
              </span>
            )}
          </p>
        </div>
        <div className={`px-5 py-3 rounded-lg ${statusCfg.color} flex items-center gap-2`}>
          <span className="text-2xl">{statusCfg.icon}</span>
          <span className="font-bold">{statusCfg.label}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white p-5 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Actions admin</h2>
        <div className="flex flex-wrap gap-3">
          {booking.status === 'pending' && (
            <button onClick={() => setShowAssignModal(true)} disabled={updating}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium">
              👤 Assigner un pro
            </button>
          )}
          {nextStatuses.filter(s => s !== 'cancelled').length > 0 && (
            <button onClick={() => setShowStatusModal(true)} disabled={updating}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 text-sm font-medium">
              Modifier le statut
            </button>
          )}
          {canCancel && (
            <button onClick={() => setShowCancelModal(true)} disabled={updating}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-medium">
              ✕ Annuler la réservation
            </button>
          )}
          {booking.paymentMethod === 'cash' &&
           ['in_progress', 'completed'].includes(booking.status) &&
           booking.cashPaymentStatus !== 'confirmed' && (
            <button
              onClick={() => {
                setResolveAmount(String(booking.cashAmountDeclaredByPro ?? booking.cashAmountDeclaredByClient ?? ''));
                setShowResolveCashModal(true);
              }}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 text-sm font-medium"
            >
              💵 Valider le paiement cash
            </button>
          )}
          <Link href={`/pros/${booking.proId}`}
            className={`px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium ${!booking.proId ? 'pointer-events-none opacity-40' : ''}`}>
            Voir le profil pro →
          </Link>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
        >
          <h2 className="text-xl font-semibold">📍 Suivi de la réservation</h2>
          <button className="text-2xl text-gray-600 hover:text-primary">
            {isTimelineExpanded ? '−' : '+'}
          </button>
        </div>

        {isTimelineExpanded && (
          <div className="mt-6 space-y-4">
            {timeline.map((step, i) => {
              const isPast    = i < currentIndex;
              const isCurrent = i === currentIndex;
              return (
                <div key={i} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
                    isPast || isCurrent ? 'bg-primary text-white' : 'bg-gray-200'
                  }`}>
                    {step.icon}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={`font-semibold ${isCurrent ? 'text-primary' : isPast ? 'text-gray-700' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    {step.time && (
                      <p className="text-sm text-gray-500">
                        {format(new Date(step.time), 'dd/MM à HH:mm', { locale: fr })}
                      </p>
                    )}
                    {isCurrent && booking.status !== 'completed' && (
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
        )}
      </div>

      {/* Client + Pro */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">👤 Client</h2>
          <p className="font-medium text-gray-900">{clientName}</p>
          {booking.client?.email && <p className="text-sm text-gray-600">{booking.client.email}</p>}
          {booking.client?.phone && <p className="text-sm text-gray-600">{booking.client.phone}</p>}
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">🛠 Professionnel</h2>
          {booking.pro ? (
            <>
              <p className="font-medium text-gray-900">{proName}</p>
              {booking.pro.companyName && proUser && (
                <p className="text-sm text-gray-500 italic">{booking.pro.companyName}</p>
              )}
              {proUser?.email && <p className="text-sm text-gray-600">{proUser.email}</p>}
              {proUser?.phone && <p className="text-sm text-gray-600">{proUser.phone}</p>}
            </>
          ) : (
            <p className="text-gray-400 italic text-sm">Aucun pro assigné</p>
          )}
        </div>
      </div>

      {/* Service + Planning */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg shadow space-y-2 text-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">📋 Service</h2>
          <div className="flex justify-between">
            <span className="text-gray-600">Catégorie</span>
            <span className="font-medium text-gray-900">{serviceName}</span>
          </div>
          {booking.serviceOffering?.description && (
            <div className="flex justify-between">
              <span className="text-gray-600">Description offre</span>
              <span className="text-gray-700 text-right max-w-xs">{booking.serviceOffering.description}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Type</span>
            <span className="font-medium text-gray-900">
              {booking.bookingType === 'scheduled' ? '📅 Planifiée' : '⚡ Immédiate'}
            </span>
          </div>
          {booking.scheduledAt && (
            <div className="flex justify-between">
              <span className="text-gray-600">Date prévue</span>
              <span className="font-medium text-gray-900">
                {format(new Date(booking.scheduledAt), 'dd MMM yyyy', { locale: fr })}
              </span>
            </div>
          )}
          {booking.timeSlot && (
            <div className="flex justify-between">
              <span className="text-gray-600">Créneau</span>
              <span className="font-medium text-gray-900 capitalize">
                {TIMESLOT_LABELS[booking.timeSlot] ?? booking.timeSlot}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Assignation</span>
            <span className="font-medium text-gray-900 capitalize">
              {booking.assignmentType === 'auto' ? '🤖 Automatique' : '👆 Manuelle'}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow space-y-2 text-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">💰 Paiement</h2>
          <div className="flex justify-between">
            <span className="text-gray-600">Méthode</span>
            <span className={`font-semibold ${booking.paymentMethod === 'cash' ? 'text-orange-700' : 'text-green-700'}`}>
              {booking.paymentMethod === 'cash' ? '💵 Espèces' : '💳 In-app'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Statut paiement</span>
            <span className="font-medium text-gray-900 capitalize">{booking.paymentStatus}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Prix estimé</span>
            <span className="font-medium text-gray-900">{booking.estimatedPrice ? `${booking.estimatedPrice} EGP` : '—'}</span>
          </div>
          {booking.finalPrice != null && (
            <div className="flex justify-between">
              <span className="text-gray-600">Prix final</span>
              <span className="font-bold text-green-700">{booking.finalPrice} EGP</span>
            </div>
          )}
          {/* Escrow details */}
          {booking.payment && (
            <div className="mt-3 pt-3 border-t space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Commission</span>
                <span className="text-gray-700">{booking.payment.commissionAmount} EGP ({booking.payment.commissionRate}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Net pro</span>
                <span className="font-semibold text-green-700">{booking.payment.proNetAmount} EGP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Escrow</span>
                <span className="font-medium text-gray-800 capitalize">{booking.payment.escrowStatus}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Adresse + Description */}
      <div className="bg-white p-5 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">📍 Mission</h2>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Adresse d'intervention</p>
          <p className="text-gray-800">{booking.address || '—'}</p>
        </div>
        {booking.clientDescription && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Description client</p>
            <p className="text-gray-800 text-sm leading-relaxed">{booking.clientDescription}</p>
          </div>
        )}
      </div>

      {/* Données catégorie dynamiques */}
      {categoryEntries.length > 0 && (
        <div className="bg-white p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">🔎 Détails de la demande</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categoryEntries.map(([key, val]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  {CATEGORY_DATA_LABELS[key] ?? key}
                </p>
                <p className="font-medium text-gray-900 text-sm">{renderCategoryValue(key, val)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos client */}
      {booking.clientPhotos?.length > 0 && (
        <div className="bg-white p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">📷 Photos du client</h2>
          <div className="flex flex-wrap gap-3">
            {booking.clientPhotos.map((url: string, i: number) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                className="block w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 hover:ring-2 hover:ring-primary transition-all flex-shrink-0">
                <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Avis */}
      {booking.review && (
        <div className="bg-white p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">⭐ Avis client</h2>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-500">
              {'★'.repeat(booking.review.rating)}{'☆'.repeat(5 - booking.review.rating)}
            </span>
            <span className="font-medium text-gray-900">{booking.review.rating}/5</span>
          </div>
          {booking.review.comment && (
            <p className="text-gray-700 text-sm italic">"{booking.review.comment}"</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Par {booking.review.client?.firstName ?? '?'} — {format(new Date(booking.review.createdAt), 'dd MMM yyyy', { locale: fr })}
          </p>
        </div>
      )}

      {/* Confirmations de fin — visible dès in_progress */}
      {['in_progress', 'completed'].includes(booking.status) && (
        <div className="bg-white p-5 rounded-lg shadow space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">✅ Confirmations de fin</h2>
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <span className="text-xl">{booking.clientConfirmedCompletion ? '✅' : '⏳'}</span>
              <div>
                <p className="text-sm font-medium text-gray-800">Client</p>
                <p className="text-xs text-gray-500">
                  {booking.clientConfirmedCompletion ? 'Confirmé' : 'En attente'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{booking.proConfirmedCompletion ? '✅' : '⏳'}</span>
              <div>
                <p className="text-sm font-medium text-gray-800">Professionnel</p>
                <p className="text-xs text-gray-500">
                  {booking.proConfirmedCompletion ? 'Confirmé' : 'En attente'}
                </p>
              </div>
            </div>
          </div>

          {/* Cash anti-fraude */}
          {booking.paymentMethod === 'cash' && (
            <div className={`mt-3 pt-4 border-t space-y-2 ${
              booking.cashPaymentStatus === 'disputed' ? 'border-red-200' : 'border-gray-100'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-700">💵 Validation paiement cash</span>
                {booking.cashPaymentStatus === 'confirmed' && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">✓ Confirmé</span>
                )}
                {booking.cashPaymentStatus === 'disputed' && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded-full">⚠️ Litige</span>
                )}
                {(!booking.cashPaymentStatus || booking.cashPaymentStatus === 'pending') && (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">En attente</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600 font-medium mb-1">💳 Déclaré par le client</p>
                  <p className="text-lg font-bold text-blue-800">
                    {booking.cashAmountDeclaredByClient != null
                      ? `${booking.cashAmountDeclaredByClient} EGP`
                      : <span className="text-gray-400 text-sm font-normal">—</span>}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xs text-orange-600 font-medium mb-1">🔧 Déclaré par le pro</p>
                  <p className="text-lg font-bold text-orange-800">
                    {booking.cashAmountDeclaredByPro != null
                      ? `${booking.cashAmountDeclaredByPro} EGP`
                      : <span className="text-gray-400 text-sm font-normal">—</span>}
                  </p>
                </div>
              </div>
              {booking.cashPaymentStatus === 'disputed' &&
                booking.cashAmountDeclaredByClient != null &&
                booking.cashAmountDeclaredByPro != null && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <span className="text-red-500 text-lg mt-0.5">⚠️</span>
                  <div>
                    <p className="text-sm font-semibold text-red-800">Divergence détectée</p>
                    <p className="text-xs text-red-600">
                      Écart de {Math.abs(booking.cashAmountDeclaredByClient - booking.cashAmountDeclaredByPro).toFixed(2)} EGP
                      entre les déclarations. Un litige a été ouvert automatiquement.
                    </p>
                  </div>
                </div>
              )}
              {booking.cashCommissionAmount != null && (
                <div className="grid grid-cols-3 gap-2 text-xs mt-1">
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-500">Commission ({booking.cashCommissionRate}%)</p>
                    <p className="font-semibold text-gray-800">{booking.cashCommissionAmount} EGP</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-500">Net pro</p>
                    <p className="font-semibold text-green-700">{booking.cashNetAmount} EGP</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Annulation info */}
      {booking.status === 'cancelled' && (booking.cancelledBy || booking.cancellationReason) && (
        <div className="bg-red-50 border border-red-200 p-5 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-3">❌ Informations d'annulation</h2>
          {booking.cancelledBy && (
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-red-700 font-medium">Annulée par :</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                booking.cancelledBy === 'client' ? 'bg-blue-100 text-blue-800' :
                booking.cancelledBy === 'pro'    ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {booking.cancelledBy === 'client' ? '👤 Client' :
                 booking.cancelledBy === 'pro'    ? '🛠 Pro' : `⚙️ Admin`}
              </span>
            </div>
          )}
          {booking.cancellationReason && (
            <div>
              <p className="text-sm text-red-700 font-medium mb-1">Motif :</p>
              <div className="bg-white border-l-4 border-red-400 pl-3 py-2 rounded text-sm text-gray-800">
                {booking.cancellationReason}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════ MODALS ══════════════════════════ */}

      {/* Modal résolution paiement cash */}
      {showResolveCashModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h3 className="text-xl font-bold text-gray-900">💵 Valider le paiement cash</h3>
            <p className="text-sm text-gray-600">
              Définissez le montant réellement perçu pour clôturer la validation. Cette action est irréversible.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm space-y-1">
              {booking.cashAmountDeclaredByClient != null && (
                <p>💳 Déclaré par le client : <strong>{booking.cashAmountDeclaredByClient} EGP</strong></p>
              )}
              {booking.cashAmountDeclaredByPro != null && (
                <p>🔧 Déclaré par le pro : <strong>{booking.cashAmountDeclaredByPro} EGP</strong></p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant confirmé (EGP) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={resolveAmount}
                onChange={e => setResolveAmount(e.target.value)}
                min="0"
                step="0.01"
                placeholder="Ex : 400"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleResolveCash}
                disabled={resolvingCash || !resolveAmount}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 text-sm font-medium"
              >
                {resolvingCash ? 'Validation...' : '✓ Confirmer le montant'}
              </button>
              <button
                onClick={() => { setShowResolveCashModal(false); setResolveAmount(''); }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal annulation admin */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Annuler la réservation</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motif d'annulation <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Ex : Aucun pro disponible, fraude détectée..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={handleAdminCancel} disabled={updating || !cancelReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-medium">
                {updating ? 'Annulation...' : "Confirmer l'annulation"}
              </button>
              <button onClick={() => { setShowCancelModal(false); setCancelReason(''); }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">
                Retour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal changement de statut */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Changer le statut</h3>
            <div className="space-y-2 mb-4">
              {nextStatuses.filter(s => s !== 'cancelled').map(s => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <button key={s} onClick={() => setSelectedStatus(s)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                      selectedStatus === s ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <span>{cfg?.icon}</span>
                    <span>{cfg?.label ?? s}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setShowStatusModal(false); setSelectedStatus(''); setCancellationReason(''); }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                Annuler
              </button>
              <button onClick={handleStatusChange} disabled={!selectedStatus || updating}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 text-sm font-medium flex items-center gap-2">
                {updating && <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal assignation pro */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Assigner un professionnel</h3>
            <p className="text-sm text-gray-500 mb-4">
              Catégorie : <span className="font-medium text-gray-700">{serviceName}</span>
            </p>

            <div className="relative mb-2">
              <input type="text" placeholder="Rechercher par nom…" value={proSearchQuery}
                onChange={e => searchPros(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              {proSearchLoading && (
                <span className="absolute right-3 top-2.5 inline-block w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {proSearchResults.length > 0 && (
              <div className="max-h-52 overflow-y-auto border border-gray-200 rounded-md mb-4 divide-y divide-gray-100">
                {proSearchResults.map((p: any) => {
                  const name = `${p.user?.firstName ?? ''} ${p.user?.lastName ?? ''}`.trim();
                  const isSelected = proIdToAssign === p.id;
                  return (
                    <button key={p.id} onClick={() => setProIdToAssign(p.id)}
                      className={`w-full text-left px-3 py-2.5 hover:bg-indigo-50 transition-colors text-sm ${isSelected ? 'bg-indigo-50 border-l-2 border-indigo-500' : ''}`}>
                      <p className="font-medium text-gray-900">{name || '—'}</p>
                      <p className="text-xs text-gray-500">
                        {(p.serviceCategories as string[] | null)?.join(', ') ?? '—'}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
            {proSearchQuery && !proSearchLoading && proSearchResults.length === 0 && (
              <p className="text-sm text-gray-400 mb-4 text-center">Aucun pro trouvé.</p>
            )}

            {proIdToAssign && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-md text-sm">
                <span className="text-indigo-700 font-medium">Pro sélectionné :</span>
                <span className="text-indigo-900">
                  {(() => {
                    const p = proSearchResults.find(x => x.id === proIdToAssign);
                    return p ? `${p.user?.firstName ?? ''} ${p.user?.lastName ?? ''}`.trim() : proIdToAssign.slice(0, 8) + '…';
                  })()}
                </span>
                <button onClick={() => setProIdToAssign('')} className="ml-auto text-indigo-400 hover:text-indigo-600 text-xs">✕</button>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button onClick={() => { setShowAssignModal(false); setProIdToAssign(''); setProSearchQuery(''); setProSearchResults([]); }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                Annuler
              </button>
              <button onClick={handleAssignPro} disabled={!proIdToAssign.trim() || assigning}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2">
                {assigning && <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Assigner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
