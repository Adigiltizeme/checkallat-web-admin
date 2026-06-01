'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const STATUS_LABELS: Record<string, string> = {
  pending:   'En attente',
  active:    'Actif',
  suspended: 'Suspendu',
  rejected:  'Rejeté',
};

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  active:    'bg-green-100 text-green-800',
  suspended: 'bg-orange-100 text-orange-800',
  rejected:  'bg-red-100 text-red-800',
};

const BOOKING_STATUS_COLORS: Record<string, string> = {
  pending:     'bg-yellow-100 text-yellow-700',
  accepted:    'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-100 text-red-700',
};

export default function ProDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const [pro, setPro]             = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [reason, setReason]       = useState('');
  const [processing, setProcessing] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await apiClient.get(`/admin/pros/${params.id}`);
      setPro(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [params.id]);

  const handleValidate = async (approved: boolean) => {
    if (!approved && !reason.trim()) {
      alert('Veuillez fournir un motif de rejet');
      return;
    }
    setProcessing(true);
    try {
      await apiClient.put(`/admin/pros/${params.id}/validate`, {
        approved,
        reason: approved ? undefined : reason,
      });
      alert(approved ? 'Professionnel approuvé' : 'Professionnel rejeté');
      loadData();
    } catch (err: any) {
      alert('Erreur : ' + (err.response?.data?.message || 'Une erreur est survenue'));
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleAvailability = async () => {
    setProcessing(true);
    try {
      await apiClient.patch(`/admin/pros/${params.id}`, {
        isAvailable: !pro.isAvailable,
      });
      setPro((p: any) => ({ ...p, isAvailable: !p.isAvailable }));
    } catch (err: any) {
      alert('Erreur : ' + (err.response?.data?.message || 'Une erreur est survenue'));
    } finally {
      setProcessing(false);
    }
  };

  const handleSuspend = async () => {
    if (!confirm('Suspendre ce professionnel ?')) return;
    setProcessing(true);
    try {
      await apiClient.patch(`/admin/users/${pro.user?.id}/suspend`);
      loadData();
    } catch (err: any) {
      alert('Erreur : ' + (err.response?.data?.message || 'Une erreur est survenue'));
    } finally {
      setProcessing(false);
    }
  };

  const handleReactivate = async () => {
    if (!confirm('Réactiver ce professionnel ?')) return;
    setProcessing(true);
    try {
      await apiClient.patch(`/admin/users/${pro.user?.id}/reactivate`);
      loadData();
    } catch (err: any) {
      alert('Erreur : ' + (err.response?.data?.message || 'Une erreur est survenue'));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Chargement...</div>;
  if (!pro)    return <div className="text-center py-12 text-gray-500">Professionnel non trouvé</div>;

  const bookings: any[] = pro.bookings ?? [];
  const portfolioPhotos: string[] = pro.portfolioPhotos ?? [];

  return (
    <div className="space-y-6">

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightboxSrc(null)}
        >
          <img
            src={lightboxSrc}
            alt="Photo"
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold leading-none"
            onClick={() => setLightboxSrc(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <button
            onClick={() => router.push('/pros')}
            className="text-sm text-gray-500 hover:text-gray-700 mb-1 flex items-center gap-1"
          >
            ← Retour aux pros
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {pro.user?.firstName} {pro.user?.lastName}
          </h1>
          <p className="text-gray-500">
            {pro.companyName || 'Professionnel indépendant'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${STATUS_COLORS[pro.status] ?? 'bg-gray-100 text-gray-700'}`}>
            {STATUS_LABELS[pro.status] ?? pro.status}
          </span>
          {pro.status === 'active' && (
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${pro.isAvailable ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
              <span className={`w-2 h-2 rounded-full ${pro.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
              {pro.isAvailable ? 'Disponible' : 'Indisponible'}
            </span>
          )}
        </div>
      </div>

      {/* ── 3 colonnes ── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Informations */}
        <div className="bg-white rounded-lg shadow p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Informations</h2>
          <InfoRow label="Email"         value={pro.user?.email} />
          <InfoRow label="Téléphone"     value={pro.user?.phone} />
          <InfoRow
            label="Catégories"
            value={(pro.serviceCategories as string[] | null)?.join(', ') || '—'}
          />
          <InfoRow label="Zone d'intervention" value={`${pro.serviceAreaRadius ?? 0} km`} />
          <InfoRow label="Segment"       value={pro.segment ?? 'standard'} />
          <InfoRow
            label="Diplômé Studyltizeme"
            value={pro.isStudyltizemeGraduate ? '✅ Oui' : '❌ Non'}
          />
          <InfoRow
            label="Documents vérifiés"
            value={pro.documentsVerified ? '✅ Oui' : '❌ Non'}
          />
          <InfoRow label="Inscrit le"    value={formatDate(pro.createdAt)} />
        </div>

        {/* Statistiques */}
        <div className="bg-white rounded-lg shadow p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Statistiques</h2>
          <InfoRow label="Note moyenne"        value={pro.averageRating ? `${Number(pro.averageRating).toFixed(1)} / 5` : '—'} />
          <InfoRow label="Nombre d'avis"       value={String(pro.totalReviews ?? 0)} />
          <InfoRow label="Missions complétées" value={String(pro.totalCompletedBookings ?? 0)} />
          <InfoRow label="Taux d'acceptation"  value={`${pro.acceptanceRate ?? 0} %`} />
          <InfoRow label="Taux d'annulation"   value={`${pro.cancellationRate ?? 0} %`} />
          {pro.badReviewWarnings > 0 && (
            <InfoRow label="Avertissements qualité" value={String(pro.badReviewWarnings)} />
          )}
          {pro.requiresTraining && (
            <div className="mt-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700 font-medium">
              ⚠️ Formation obligatoire requise
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Actions</h2>

          {pro.status === 'active' && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Disponibilité</span>
              <button
                onClick={handleToggleAvailability}
                disabled={processing}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${pro.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${pro.isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          )}

          {pro.status === 'active' && (
            <button
              onClick={handleSuspend}
              disabled={processing}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 text-sm font-medium"
            >
              Suspendre le professionnel
            </button>
          )}

          {pro.status === 'suspended' && (
            <button
              onClick={handleReactivate}
              disabled={processing}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
            >
              Réactiver le professionnel
            </button>
          )}

          <button
            onClick={() => router.push('/pros')}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
          >
            ← Retour à la liste
          </button>
        </div>
      </div>

      {/* Vitrine */}
      {(portfolioPhotos.length > 0 || pro.bio) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Vitrine
            <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              Ajouté par le prestataire
            </span>
          </h2>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
            Toute transaction ou prise de contact en dehors de CheckAll@t est interdite.
          </p>
          {portfolioPhotos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              {portfolioPhotos.map((url: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setLightboxSrc(url)}
                  className="relative group overflow-hidden rounded-lg border border-gray-200 aspect-square bg-gray-100 hover:border-primary transition-colors"
                >
                  <img
                    src={url}
                    alt={`Photo activité ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
          {pro.bio && (
            <p className="text-gray-700 text-sm leading-relaxed">{pro.bio}</p>
          )}
        </div>
      )}

      {/* Candidature en attente */}
      {pro.status === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-amber-900 mb-1 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Candidature en attente de validation
          </h2>
          <p className="text-sm text-amber-700 mb-4">
            Vérifiez le profil et la bio du professionnel avant de valider son inscription.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motif de rejet (obligatoire si rejet)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Expliquer pourquoi la candidature est rejetée..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleValidate(true)}
              disabled={processing}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Approuver
            </button>
            <button
              onClick={() => handleValidate(false)}
              disabled={!reason.trim() || processing}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-medium flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Rejeter
            </button>
          </div>
        </div>
      )}

      {/* Candidature rejetée — ré-approbation possible */}
      {pro.status === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-1 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Candidature rejetée
          </h2>
          <p className="text-sm text-red-700 mb-4">
            Cette candidature a été refusée. Si le candidat a fourni des corrections, vous pouvez reconsidérer le dossier.
          </p>
          <button
            onClick={() => handleValidate(true)}
            disabled={processing}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Approuver quand même
          </button>
        </div>
      )}

      {/* Historique des réservations */}
      {bookings.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Dernières réservations
            <span className="ml-2 text-sm font-normal text-gray-400">({bookings.length})</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-600">{formatDate(b.createdAt)}</td>
                    <td className="px-4 py-2 text-gray-900">
                      {b.client?.firstName} {b.client?.lastName}
                    </td>
                    <td className="px-4 py-2 text-gray-600">{b.categorySlug ?? '—'}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${BOOKING_STATUS_COLORS[b.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-900">
                      {b.totalPrice ? `${Number(b.totalPrice).toFixed(2)} €` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-sm font-medium text-gray-500 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 text-right">{value || '—'}</span>
    </div>
  );
}
