'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

const STATUS_CFG: Record<string, { label: string; className: string }> = {
  pending:      { label: 'En attente',    className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  under_review: { label: 'En cours',      className: 'bg-blue-100 text-blue-800 border-blue-200' },
  accepted:     { label: 'Acceptée',      className: 'bg-green-100 text-green-800 border-green-200' },
  refused:      { label: 'Refusée',       className: 'bg-red-100 text-red-800 border-red-200' },
};

export default function ServiceProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [refusalReason, setRefusalReason] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef<number>(0);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data: any = await apiClient.get(`/admin/service-proposals/${id}`);
      setProposal(data);
    } catch (e) { console.error(e); }
    finally { if (!silent) setLoading(false); }
  }, [id]);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // Polling — toutes les 5s, s'arrête quand la proposition est clôturée
  useEffect(() => {
    const interval = setInterval(async () => {
      if (proposal?.status === 'accepted' || proposal?.status === 'refused') return;
      await load(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [load, proposal?.status]);

  // Auto-scroll uniquement quand un NOUVEAU message arrive
  useEffect(() => {
    const count = proposal?.messages?.length ?? 0;
    if (count > prevMsgCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMsgCountRef.current = count;
  }, [proposal?.messages?.length]);

  const sendMessage = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      await apiClient.post(`/admin/service-proposals/${id}/message`, { message: message.trim() });
      setMessage('');
      load();
    } catch { /* silent */ } finally { setSending(false); }
  };

  const review = async (action: 'accept' | 'refuse' | 'under_review', extra?: Record<string, string>) => {
    setReviewing(true);
    try {
      await apiClient.post(`/admin/service-proposals/${id}/review`, { action, ...extra });
      setShowAcceptModal(false);
      setShowRefuseModal(false);
      load();
    } catch { /* silent */ } finally { setReviewing(false); }
  };

  if (loading) return <div className="text-center py-12">Chargement...</div>;
  if (!proposal) return <div className="text-center py-12 text-red-500">Proposition introuvable.</div>;

  const statusCfg = STATUS_CFG[proposal.status] ?? { label: proposal.status, className: 'bg-gray-100 text-gray-700 border-gray-200' };
  const whatsappPhone = proposal.user?.phone?.replace(/\D/g, '');
  const whatsappMsg = encodeURIComponent(`Bonjour ${proposal.user?.firstName}, concernant votre proposition de service "${proposal.serviceNameFr}" sur CheckAllAt…`);
  const whatsappUrl = whatsappPhone ? `https://wa.me/${whatsappPhone}?text=${whatsappMsg}` : null;
  const rdvUrl = 'https://digiltizeme-portfolio.vercel.app/rdv';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800 mb-2 flex items-center gap-1">
            ← Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{proposal.serviceNameFr}</h1>
          <p className="text-gray-500 text-sm">{proposal.serviceNameEn}{proposal.serviceNameAr ? ` · ${proposal.serviceNameAr}` : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${statusCfg.className}`}>
            {statusCfg.label}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — Proposal details */}
        <div className="lg:col-span-2 space-y-4">

          {/* User card */}
          <div className="bg-white rounded-lg shadow p-5 space-y-3">
            <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Proposant</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg">
                {proposal.user?.firstName?.[0]}{proposal.user?.lastName?.[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{proposal.user?.firstName} {proposal.user?.lastName}</p>
                <p className="text-sm text-gray-500">{proposal.user?.email ?? '—'}</p>
                <p className="text-sm text-gray-500">{proposal.user?.phone ?? '—'}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              )}
              <a
                href={rdvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                Prendre RDV
              </a>
            </div>
          </div>

          {/* Proposal content */}
          <div className="bg-white rounded-lg shadow p-5 space-y-4">
            <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Détails de la proposition</h2>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Description</p>
              <p className="text-gray-800 whitespace-pre-wrap">{proposal.description}</p>
            </div>
            {proposal.targetAudience && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Public cible</p>
                <p className="text-gray-800">{proposal.targetAudience}</p>
              </div>
            )}
            {proposal.pricingHint && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Fourchette de prix envisagée</p>
                <p className="text-gray-800">{proposal.pricingHint}</p>
              </div>
            )}
            {proposal.credentials && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Qualifications / expérience</p>
                <p className="text-gray-800 whitespace-pre-wrap">{proposal.credentials}</p>
              </div>
            )}
            <div className="text-xs text-gray-400">Soumis le {formatDateTime(proposal.createdAt)}</div>
          </div>

          {/* Q&A Thread */}
          <div className="bg-white rounded-lg shadow p-5 space-y-4">
            <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Échanges</h2>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {(proposal.messages ?? []).length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Aucun échange pour le moment</p>
              ) : (
                (proposal.messages ?? []).map((m: any) => (
                  <div key={m.id} className={`flex ${m.fromAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${m.fromAdmin ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'}`}>
                      <p className="whitespace-pre-wrap">{m.message}</p>
                      <p className={`text-[10px] mt-1 ${m.fromAdmin ? 'text-primary-foreground/70' : 'text-gray-400'}`}>{formatDateTime(m.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {proposal.status !== 'accepted' && proposal.status !== 'refused' && (
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Posez une question ou ajoutez un commentaire…"
                  className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  rows={2}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim() || sending}
                  className="self-end px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
                >
                  {sending ? '…' : 'Envoyer'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right — Actions */}
        <div className="space-y-4">
          {/* Decision */}
          {proposal.status !== 'accepted' && proposal.status !== 'refused' && (
            <div className="bg-white rounded-lg shadow p-5 space-y-3">
              <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Décision</h2>

              {proposal.status === 'pending' && (
                <button
                  onClick={() => review('under_review')}
                  disabled={reviewing}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
                >
                  Mettre en examen
                </button>
              )}

              <button
                onClick={() => setShowAcceptModal(true)}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                ✅ Accepter
              </button>

              <button
                onClick={() => setShowRefuseModal(true)}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                ❌ Refuser
              </button>
            </div>
          )}

          {/* Past decision */}
          {(proposal.status === 'accepted' || proposal.status === 'refused') && (
            <div className={`rounded-lg shadow p-5 border ${proposal.status === 'accepted' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className={`font-semibold text-sm ${proposal.status === 'accepted' ? 'text-green-700' : 'text-red-700'}`}>
                {proposal.status === 'accepted' ? '✅ Proposition acceptée' : '❌ Proposition refusée'}
              </p>
              {proposal.reviewedAt && <p className="text-xs text-gray-500 mt-1">Le {formatDateTime(proposal.reviewedAt)}</p>}
              {proposal.adminNote && <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{proposal.adminNote}</p>}
              {proposal.refusalReason && <p className="text-sm text-red-700 mt-2 whitespace-pre-wrap">{proposal.refusalReason}</p>}
              {proposal.createdCategorySlug && (
                <p className="text-xs text-green-700 mt-2 font-medium">Catégorie créée : <code>{proposal.createdCategorySlug}</code></p>
              )}
            </div>
          )}

          {/* Info */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-xs text-gray-600 space-y-1">
            <p><strong>ID :</strong> <code className="font-mono">{proposal.id}</code></p>
            <p><strong>Soumis :</strong> {formatDateTime(proposal.createdAt)}</p>
            <p><strong>Mis à jour :</strong> {formatDateTime(proposal.updatedAt)}</p>
            {proposal.reviewedByEmail && <p><strong>Examiné par :</strong> {proposal.reviewedByEmail}</p>}
          </div>
        </div>
      </div>

      {/* Accept modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-lg text-green-700">Accepter la proposition</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug de catégorie créée (optionnel)</label>
              <input
                value={categorySlug}
                onChange={e => setCategorySlug(e.target.value)}
                placeholder="ex: carpentry"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note pour l'utilisateur (optionnel)</label>
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="Message d'accompagnement envoyé par email…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-300"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAcceptModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
              <button
                onClick={() => review('accept', { adminNote, createdCategorySlug: categorySlug })}
                disabled={reviewing}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
              >
                {reviewing ? 'En cours…' : 'Confirmer l\'acceptation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refuse modal */}
      {showRefuseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-lg text-red-700">Refuser la proposition</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raison du refus *</label>
              <textarea
                value={refusalReason}
                onChange={e => setRefusalReason(e.target.value)}
                placeholder="Expliquez pourquoi la proposition n'est pas retenue…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note complémentaire (optionnel)</label>
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="Conseils ou encouragements…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
                rows={2}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowRefuseModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
              <button
                onClick={() => review('refuse', { refusalReason, adminNote })}
                disabled={reviewing || !refusalReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
              >
                {reviewing ? 'En cours…' : 'Confirmer le refus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
