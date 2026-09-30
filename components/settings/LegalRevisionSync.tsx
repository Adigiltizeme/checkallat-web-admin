'use client';

import { useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { LEGAL_DOCUMENTS } from '@/lib/legal-documents';

const SESSION_KEY = `legal-revision-synced:${LEGAL_DOCUMENTS.revision}`;

/**
 * Signale une fois par session la révision des documents légaux déployée avec le web-admin.
 * Le serveur publie alors une nouvelle version (mode automatique) ou la met en attente (mode manuel).
 */
export function LegalRevisionSync() {
  useEffect(() => {
    let stopped = false;
    const trySync = async () => {
      try {
        if (window.sessionStorage.getItem(SESSION_KEY)) return true;
      } catch {
        /* stockage indisponible : on synchronise quand même */
      }
      if (!isAuthenticated()) return false;
      try {
        await apiClient.post('/admin/settings/legal-terms/sync', {
          revision: LEGAL_DOCUMENTS.revision,
          requiresReacceptance: LEGAL_DOCUMENTS.requiresReacceptance,
          summary: LEGAL_DOCUMENTS.summary,
        });
        try {
          window.sessionStorage.setItem(SESSION_KEY, '1');
        } catch {
          /* rien */
        }
        return true;
      } catch {
        return false;
      }
    };
    // Réessaie tant que l'admin n'est pas connecté (page de connexion)
    let interval: ReturnType<typeof setInterval> | undefined;
    trySync().then((done) => {
      if (done || stopped) return;
      interval = setInterval(async () => {
        if (await trySync() && interval) clearInterval(interval);
      }, 60_000);
    });
    return () => {
      stopped = true;
      if (interval) clearInterval(interval);
    };
  }, []);
  return null;
}
