'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

interface Review {
  id: string;
  rating: number;
  punctualityRating: number;
  qualityRating: number;
  cleanlinessRating: number;
  courtesyRating: number;
  comment: string;
  proResponse?: string;
  createdAt: string;
  client: { firstName: string; lastName: string; profilePicture?: string };
  driver: { user: { firstName: string; lastName: string }; id: string; vehiclePlate: string };
  transportRequest?: { id: string };
}

interface DriverWithBadReviews {
  id: string;
  status: string;
  averageRating: number;
  totalBadReviews: number;
  badReviewWarnings: number;
  lastBadReviewWarningAt: string | null;
  requiresTraining: boolean;
  trainingCompletedAt: string | null;
  qualityPlanActive: boolean;
  qualityPlanStartedAt: string | null;
  onTimeRate: number;
  totalTransports: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  user: { id: string; firstName: string; lastName: string; phone: string; email: string | null };
}

const RISK_CONFIG = {
  low:      { label: 'Faible',   color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' },
  medium:   { label: 'Modéré',   color: 'bg-orange-100 text-orange-800', icon: '🔶' },
  high:     { label: 'Élevé',    color: 'bg-red-100 text-red-800',       icon: '🔴' },
  critical: { label: 'Critique', color: 'bg-red-200 text-red-900',       icon: '🚫' },
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif', suspended: 'Suspendu', banned: 'Banni',
  pending: 'En attente', rejected: 'Rejeté',
};

type Tab = 'reviews' | 'bad-reviews';

export default function ReviewsManagementPage() {
  const [activeTab, setActiveTab] = useState<Tab>('reviews');

  // ── Onglet Avis ────────────────────────────────────────────
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [filterRating, setFilterRating] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');
  const [responding, setResponding] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  // ── Onglet Mauvaises Notations ────────────────────────────
  const [badDrivers, setBadDrivers] = useState<DriverWithBadReviews[]>([]);
  const [loadingBad, setLoadingBad] = useState(false);
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [expandedDriver, setExpandedDriver] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { loadReviews(); }, [filterRating]);

  useEffect(() => {
    if (activeTab === 'bad-reviews' && badDrivers.length === 0) {
      loadBadDrivers();
    }
  }, [activeTab]);

  // ── Chargement des avis ────────────────────────────────────
  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      const params: any = { page: 1, limit: 50 };
      if (filterRating !== 'all') params.minRating = parseInt(filterRating);
      const data = await apiClient.get('/reviews/admin/all', { params }) as { reviews: Review[] };
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Erreur avis:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  // ── Chargement des chauffeurs avec mauvaises notes ─────────
  const loadBadDrivers = async () => {
    try {
      setLoadingBad(true);
      const data = await apiClient.get('/reviews/admin/bad-reviews') as DriverWithBadReviews[];
      setBadDrivers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur mauvaises notations:', error);
    } finally {
      setLoadingBad(false);
    }
  };

  // ── Actions sur avis ───────────────────────────────────────
  const handleRespond = async () => {
    if (!selectedReview || !responseText.trim()) return;
    setResponding(true);
    try {
      await apiClient.put(`/reviews/${selectedReview.id}/response`, { response: responseText.trim() });
      alert('✅ Réponse publiée avec succès');
      setSelectedReview(null);
      setResponseText('');
      loadReviews();
    } catch (error: any) {
      alert('❌ Erreur: ' + (error?.response?.data?.message || 'Impossible de publier la réponse'));
    } finally {
      setResponding(false);
    }
  };

  const toggleReviewExpansion = (reviewId: string) => {
    setExpandedReviews(prev => {
      const s = new Set(prev);
      s.has(reviewId) ? s.delete(reviewId) : s.add(reviewId);
      return s;
    });
  };

  // ── Actions sur mauvaises notations ───────────────────────
  const handleAction = async (
    driverId: string,
    action: 'warn' | 'require-training' | 'training-completed' | 'resolve',
  ) => {
    setActionLoading(`${driverId}-${action}`);
    try {
      if (action === 'training-completed') {
        await apiClient.patch(`/reviews/admin/driver/${driverId}/training-completed`);
      } else {
        await apiClient.post(`/reviews/admin/driver/${driverId}/${action}`, {});
      }
      alert('✅ Action effectuée avec succès');
      loadBadDrivers();
    } catch (error: any) {
      alert('❌ Erreur: ' + (error?.response?.data?.message || 'Action impossible'));
    } finally {
      setActionLoading(null);
    }
  };

  // ── Calculs statistiques ───────────────────────────────────
  const averageRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0';
  const badStats = {
    total: badDrivers.length,
    critical: badDrivers.filter(d => d.riskLevel === 'critical').length,
    high: badDrivers.filter(d => d.riskLevel === 'high').length,
    requiresTraining: badDrivers.filter(d => d.requiresTraining && !d.trainingCompletedAt).length,
  };
  const filteredBad = filterRisk === 'all' ? badDrivers : badDrivers.filter(d => d.riskLevel === filterRisk);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">⭐ Gestion des Avis</h1>
        <p className="text-gray-600">Consultez, répondez aux avis et gérez les mauvaises notations</p>
      </div>

      {/* Onglets */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
            activeTab === 'reviews'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          ⭐ Tous les avis
          <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">{reviews.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('bad-reviews')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
            activeTab === 'bad-reviews'
              ? 'border-red-500 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          🔴 Mauvaises notations
          {badStats.total > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
              {badStats.total}
            </span>
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ONGLET 1 : TOUS LES AVIS                              */}
      {/* ═══════════════════════════════════════════════════════ */}
      {activeTab === 'reviews' && (
        <>
          {/* Statistiques */}
          <div className="grid gap-6 md:grid-cols-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total des avis</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{reviews.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Note moyenne</h3>
              <p className="text-3xl font-bold text-yellow-500 mt-2">⭐ {averageRating}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Sans réponse</h3>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {reviews.filter(r => !r.proResponse).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Avis positifs</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {reviews.filter(r => r.rating >= 4).length}
              </p>
            </div>
          </div>

          {/* Filtre */}
          <div className="flex gap-4">
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Toutes les notes</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 étoiles uniquement)</option>
              <option value="4">⭐⭐⭐⭐ (4 étoiles et +)</option>
              <option value="3">⭐⭐⭐ (3 étoiles et +)</option>
              <option value="2">⭐⭐ (2 étoiles et +)</option>
              <option value="1">⭐ (1 étoile et +)</option>
            </select>
          </div>

          {/* Liste des avis */}
          {loadingReviews ? (
            <div className="text-center py-12">Chargement...</div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className={`bg-white rounded-lg shadow p-6 ${review.rating <= 2 ? 'border-l-4 border-red-400' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">
                          {'⭐'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </span>
                        <span className={`text-lg font-bold ${review.rating <= 2 ? 'text-red-600' : 'text-gray-900'}`}>
                          {review.rating}/5
                        </span>
                        {review.rating <= 2 && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                            Mauvaise notation
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Par <span className="font-medium">{review.client.firstName} {review.client.lastName}</span>
                        {' • '}{formatDateTime(review.createdAt)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Chauffeur: <span className="font-medium">{review.driver.user.firstName} {review.driver.user.lastName}</span>
                        {review.transportRequest && <> {' • '}Transport #{review.transportRequest.id.slice(0, 8)}</>}
                      </p>
                    </div>
                    {!review.proResponse && (
                      <button
                        onClick={() => { setSelectedReview(review); setResponseText(''); }}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
                      >
                        Répondre
                      </button>
                    )}
                  </div>

                  {/* Critères détaillés et commentaires — collapsible */}
                  <div className="mb-4">
                    <div
                      className="flex justify-between items-center p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition"
                      onClick={() => toggleReviewExpansion(review.id)}
                    >
                      <p className="text-sm font-medium text-gray-700">📊 Critères détaillés et commentaires</p>
                      <span className="text-xl text-gray-600">{expandedReviews.has(review.id) ? '−' : '+'}</span>
                    </div>
                    {expandedReviews.has(review.id) && (
                      <div className="mt-2 p-4 bg-gray-50 rounded border-t border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {[
                            { label: 'Ponctualité', value: review.punctualityRating },
                            { label: 'Qualité service', value: review.qualityRating },
                            { label: 'Propreté', value: review.cleanlinessRating },
                            { label: 'Courtoisie', value: review.courtesyRating },
                          ].map(({ label, value }) => (
                            <div key={label}>
                              <p className="text-xs text-gray-500 mb-1">{label}</p>
                              <p className={`font-medium ${value <= 2 ? 'text-red-600' : ''}`}>
                                {'⭐'.repeat(value || 0)}
                                {value <= 2 && <span className="ml-1 text-xs">⚠️</span>}
                              </p>
                            </div>
                          ))}
                        </div>
                        {review.comment && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">💬 Commentaire:</p>
                            <p className="text-gray-900 bg-blue-50 p-3 rounded border border-blue-200">
                              "{review.comment}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Réponse existante */}
                  {review.proResponse && (
                    <div className="border-l-4 border-primary pl-4 bg-green-50 p-3 rounded">
                      <p className="text-sm font-medium text-gray-700 mb-1">✅ Réponse de l'administration:</p>
                      <p className="text-gray-900">{review.proResponse}</p>
                    </div>
                  )}
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
                  <p className="text-lg">📭 Aucun avis trouvé</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ONGLET 2 : MAUVAISES NOTATIONS                        */}
      {/* ═══════════════════════════════════════════════════════ */}
      {activeTab === 'bad-reviews' && (
        <>
          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <p className="text-sm text-gray-500">Total concernés</p>
              <p className="text-2xl font-bold text-gray-900">{badStats.total}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg shadow text-center">
              <p className="text-sm text-red-600">Critiques</p>
              <p className="text-2xl font-bold text-red-700">{badStats.critical}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg shadow text-center">
              <p className="text-sm text-orange-600">Niveau élevé</p>
              <p className="text-2xl font-bold text-orange-700">{badStats.high}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg shadow text-center">
              <p className="text-sm text-blue-600">Formation requise</p>
              <p className="text-2xl font-bold text-blue-700">{badStats.requiresTraining}</p>
            </div>
          </div>

          {/* Référence des seuils */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-800 mb-2">📋 Seuils de détection automatique :</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-700">
              {[
                { level: '⚠️ Niveau 1 — Avertissement', rule: '≥ 3 avis ≤ 2★ sur 10 derniers' },
                { level: '📚 Niveau 2 — Formation', rule: '≥ 4 avis ≤ 2★ sur 10 derniers' },
                { level: '⛔ Niveau 3 — Suspension 15j', rule: '≥ 5 mauvais/20 ou moy. < 3★/10' },
                { level: '🚫 Niveau 4 — Suspension 30j', rule: '≥ 7 mauvais/30 ou moy. < 2.5★/20' },
              ].map(({ level, rule }) => (
                <div key={level} className="bg-white rounded p-2">
                  <p className="font-medium">{level}</p>
                  <p>{rule}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Filtres par niveau de risque */}
          <div className="flex gap-3 flex-wrap">
            {(['all', 'low', 'medium', 'high', 'critical'] as const).map(level => (
              <button
                key={level}
                onClick={() => setFilterRisk(level)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  filterRisk === level
                    ? 'bg-primary text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-primary'
                }`}
              >
                {level === 'all'
                  ? `Tous (${badDrivers.length})`
                  : `${RISK_CONFIG[level].icon} ${RISK_CONFIG[level].label} (${badDrivers.filter(d => d.riskLevel === level).length})`
                }
              </button>
            ))}
          </div>

          {/* Liste des chauffeurs */}
          {loadingBad ? (
            <div className="text-center py-12">Chargement...</div>
          ) : filteredBad.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-gray-500 font-medium">Aucun chauffeur avec des problèmes de notation</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBad.map(driver => {
                const risk = RISK_CONFIG[driver.riskLevel];
                const isExpanded = expandedDriver === driver.id;
                return (
                  <div key={driver.id} className="bg-white rounded-lg shadow overflow-hidden">
                    {/* En-tête — cliquable */}
                    <div
                      className="p-5 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition"
                      onClick={() => setExpandedDriver(isExpanded ? null : driver.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600">
                          {driver.user.firstName[0]}{driver.user.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {driver.user.firstName} {driver.user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{driver.user.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap justify-end">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Moy. globale</p>
                          <p className={`font-bold ${driver.averageRating < 3 ? 'text-red-600' : 'text-orange-500'}`}>
                            {driver.averageRating.toFixed(1)}/5
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Mauvais avis</p>
                          <p className="font-bold text-red-600">{driver.totalBadReviews}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          driver.status === 'suspended' ? 'bg-red-100 text-red-800' :
                          driver.status === 'active' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {STATUS_LABELS[driver.status] || driver.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${risk.color}`}>
                          {risk.icon} {risk.label}
                        </span>
                        {driver.requiresTraining && !driver.trainingCompletedAt && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">📚 Formation</span>
                        )}
                        <span className="text-gray-400">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {/* Détails expandable */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 p-5 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded">
                          <div>
                            <p className="text-xs text-gray-500">Avertissements</p>
                            <p className="font-bold text-orange-600">{driver.badReviewWarnings}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Taux ponctualité</p>
                            <p className="font-bold">{driver.onTimeRate.toFixed(0)}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Total transports</p>
                            <p className="font-bold">{driver.totalTransports}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Dernier avertissement</p>
                            <p className="font-bold text-sm">
                              {driver.lastBadReviewWarningAt
                                ? new Date(driver.lastBadReviewWarningAt).toLocaleDateString('fr-FR')
                                : '—'}
                            </p>
                          </div>
                        </div>

                        {driver.requiresTraining && (
                          <div className="p-3 bg-blue-50 rounded border border-blue-200">
                            <p className="text-sm font-medium text-blue-800">
                              📚 Formation obligatoire assignée
                              {driver.qualityPlanStartedAt && (
                                <span className="font-normal ml-2">
                                  le {new Date(driver.qualityPlanStartedAt).toLocaleDateString('fr-FR')}
                                </span>
                              )}
                            </p>
                            {driver.trainingCompletedAt && (
                              <p className="text-sm text-green-700 mt-1">
                                ✅ Complétée le {new Date(driver.trainingCompletedAt).toLocaleDateString('fr-FR')}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                          <button
                            onClick={() => handleAction(driver.id, 'warn')}
                            disabled={!!actionLoading}
                            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm disabled:opacity-50 transition"
                          >
                            {actionLoading === `${driver.id}-warn` ? '...' : '⚠️ Avertir'}
                          </button>
                          {!driver.requiresTraining && (
                            <button
                              onClick={() => handleAction(driver.id, 'require-training')}
                              disabled={!!actionLoading}
                              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm disabled:opacity-50 transition"
                            >
                              {actionLoading === `${driver.id}-require-training` ? '...' : '📚 Imposer formation'}
                            </button>
                          )}
                          {driver.requiresTraining && !driver.trainingCompletedAt && (
                            <button
                              onClick={() => handleAction(driver.id, 'training-completed')}
                              disabled={!!actionLoading}
                              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm disabled:opacity-50 transition"
                            >
                              {actionLoading === `${driver.id}-training-completed` ? '...' : '✅ Formation complétée'}
                            </button>
                          )}
                          <button
                            onClick={() => handleAction(driver.id, 'resolve')}
                            disabled={!!actionLoading}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm disabled:opacity-50 transition"
                          >
                            {actionLoading === `${driver.id}-resolve` ? '...' : '🔓 Résoudre'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal de réponse à un avis */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">💬 Répondre à l'avis</h2>
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600 mb-1">
                Client: <strong>{selectedReview.client.firstName} {selectedReview.client.lastName}</strong>
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Chauffeur: <strong>{selectedReview.driver.user.firstName} {selectedReview.driver.user.lastName}</strong>
              </p>
              <p className="font-medium mb-2">Note: {'⭐'.repeat(selectedReview.rating)} {selectedReview.rating}/5</p>
              {selectedReview.comment && (
                <p className="text-gray-900 italic bg-white p-2 rounded">"{selectedReview.comment}"</p>
              )}
            </div>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Rédigez votre réponse ici..."
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="mt-4 flex gap-3 justify-end">
              <button
                onClick={() => setSelectedReview(null)}
                disabled={responding}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleRespond}
                disabled={responding || !responseText.trim()}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
              >
                {responding ? 'Publication...' : 'Publier la réponse'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
