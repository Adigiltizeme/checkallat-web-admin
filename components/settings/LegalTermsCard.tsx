'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { LEGAL_DOCUMENTS, legalRevisionLabel } from '@/lib/legal-documents';
import { SettingsSection } from './SettingsSection';

type Summary = { fr?: string; en?: string; ar?: string } | null;

interface LegalTermsStats {
  legalTermsVersion: string | null;
  totalUsers: number;
  acceptedUsers: number;
  mode: 'manual' | 'automatic';
  documentsRevision: string | null;
  pendingRevision: string | null;
  pendingSummary: Summary;
  currentSummary: Summary;
}

/**
 * Version en vigueur des CGU / politique de confidentialité.
 * Publier une nouvelle version oblige chaque utilisateur à les ré-accepter dans l'application,
 * manuellement ou automatiquement quand une révision des pages l'exige (lib/legal-documents.ts).
 */
export function LegalTermsCard() {
  const [stats, setStats] = useState<LegalTermsStats | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [savingMode, setSavingMode] = useState(false);

  const load = () => {
    apiClient
      .get<LegalTermsStats>('/admin/settings/legal-terms')
      .then(setStats)
      .catch(console.error);
  };

  useEffect(() => {
    load();
  }, []);

  const publish = async (summary: Summary) => {
    const ok = confirm(
      'Publier une nouvelle version des CGU et de la politique de confidentialité ?\n\n' +
      "Tous les utilisateurs devront les accepter à nouveau à leur prochaine ouverture de l'application. " +
      'À réserver aux changements importants (nouvelles données collectées, nouvelles obligations, nouveaux frais).',
    );
    if (!ok) return;
    setPublishing(true);
    try {
      const result = await apiClient.post<{ legalTermsVersion: string; usersToReaccept: number }>(
        '/admin/settings/legal-terms/bump',
        { summary: summary ?? undefined },
      );
      alert(`Version ${result.legalTermsVersion} publiée. ${result.usersToReaccept} utilisateur(s) devront ré-accepter.`);
      load();
    } catch (error: any) {
      alert('Erreur : ' + (error.response?.data?.message || 'publication impossible'));
    } finally {
      setPublishing(false);
    }
  };

  const setMode = async (mode: 'manual' | 'automatic') => {
    if (mode === 'automatic' && stats?.pendingRevision) {
      alert("Une révision attend déjà d'être publiée : publiez-la ci-dessous. Le mode automatique s'appliquera aux prochaines révisions.");
    }
    setSavingMode(true);
    try {
      setStats(await apiClient.put<LegalTermsStats>('/admin/settings/legal-terms/mode', { mode }));
    } catch (error: any) {
      alert('Erreur : ' + (error.response?.data?.message || 'enregistrement impossible'));
    } finally {
      setSavingMode(false);
    }
  };

  const pct = stats && stats.totalUsers > 0 ? Math.round((stats.acceptedUsers / stats.totalUsers) * 100) : 0;

  return (
    <SettingsSection
      id="legal"
      saveMode="instant"
      icon="📜"
      title="Documents légaux"
      description={<>L&apos;acceptation des <Link href="/terms" target="_blank" className="text-primary hover:underline">CGU</Link> et de la{' '} <Link href="/privacy" target="_blank" className="text-primary hover:underline">politique de confidentialité</Link>{' '} est obligatoire à l&apos;inscription ; la date et la version acceptées sont enregistrées pour chaque utilisateur.</>}
    >
      {/* Révision en attente de publication (mode manuel) */}
      {stats?.pendingRevision && (
        <div className="mb-4 rounded-md border border-orange-300 bg-orange-50 p-4">
          <p className="font-semibold text-orange-900">
            📝 Documents modifiés le {new Date(`${stats.pendingRevision}T12:00:00`).toLocaleDateString('fr-FR')} — ré-acceptation à publier
          </p>
          {stats.pendingSummary?.fr && <p className="mt-1 text-sm text-orange-800">Ce qui change : {stats.pendingSummary.fr}</p>}
          <button
            type="button"
            onClick={() => publish(stats.pendingSummary)}
            disabled={publishing}
            className="mt-3 rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {publishing ? 'Publication…' : 'Publier maintenant'}
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3 mb-4">
        <div className="rounded-md border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Version en vigueur</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{stats?.legalTermsVersion ?? '—'}</p>
        </div>
        <div className="rounded-md border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Utilisateurs l&apos;ayant acceptée</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">
            {stats ? `${stats.acceptedUsers} / ${stats.totalUsers}` : '—'}
            {stats && <span className="ml-2 text-sm font-medium text-gray-500">({pct} %)</span>}
          </p>
        </div>
        <div className="rounded-md border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pages légales déployées</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{legalRevisionLabel()}</p>
          <p className="text-xs text-gray-500">
            {LEGAL_DOCUMENTS.requiresReacceptance ? 'Révision exigeant une ré-acceptation' : 'Correction mineure'}
          </p>
        </div>
      </div>

      {/* Mode de ré-acceptation */}
      <div className="mb-4 space-y-2">
        <p className="text-sm font-semibold text-gray-800">Ré-acceptation par les utilisateurs</p>
        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="radio"
            name="legal-mode"
            checked={stats?.mode !== 'automatic'}
            disabled={savingMode || !stats}
            onChange={() => setMode('manual')}
            className="mt-0.5 accent-primary"
          />
          <span><strong>Manuelle</strong> — une révision importante des pages est signalée ici ; vous décidez quand la publier.</span>
        </label>
        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="radio"
            name="legal-mode"
            checked={stats?.mode === 'automatic'}
            disabled={savingMode || !stats}
            onChange={() => setMode('automatic')}
            className="mt-0.5 accent-primary"
          />
          <span>
            <strong>Automatique</strong> — dès qu&apos;une révision marquée « ré-acceptation requise » est déployée, une nouvelle
            version est publiée et les utilisateurs doivent l&apos;accepter à leur prochaine ouverture de l&apos;application.
          </span>
        </label>
      </div>

      {stats?.currentSummary?.fr && (
        <p className="mb-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
          <span className="font-medium">Résumé montré aux utilisateurs :</span> {stats.currentSummary.fr}
        </p>
      )}

      <button
        type="button"
        onClick={() => publish(LEGAL_DOCUMENTS.summary)}
        disabled={publishing}
        className="px-4 py-2 rounded-md border border-orange-300 text-orange-700 hover:bg-orange-50 text-sm font-medium disabled:opacity-50"
      >
        {publishing ? 'Publication…' : 'Publier une nouvelle version maintenant (ré-acceptation requise)'}
      </button>
      <p className="text-xs text-gray-500 mt-2">
        Les pages, leur date et le résumé des changements se mettent à jour dans <code>web-admin/lib/legal-documents.ts</code>.
        Une correction mineure (<code>requiresReacceptance: false</code>) ne déclenche jamais de ré-acceptation.
      </p>
    </SettingsSection>
  );
}
