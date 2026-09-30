'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { useZone } from '@/contexts/ZoneContext';

/** Éléments demandant une action de l'admin (badges de la barre latérale et cloche) */
export interface PendingSummary {
  applications: {
    drivers: number;
    couriers: number;
    pros: number;
    sellers: number;
    total: number;
    oldestSubmittedAt: string | null;
  };
  openDisputes: number;
  transfersToExecute: number;
  blockedPayouts: number;
  /** Comptes de versement par défaut non vérifiés */
  unverifiedPayoutAccounts: number;
}

interface ContextValue {
  summary: PendingSummary | null;
  refresh: () => void;
}

const PendingSummaryContext = createContext<ContextValue>({ summary: null, refresh: () => {} });

const APPLICATION_LABELS: Record<'drivers' | 'couriers' | 'pros' | 'sellers', [string, string]> = {
  drivers: ['candidature chauffeur', 'candidatures chauffeur'],
  couriers: ['candidature livreur CheckAllPack', 'candidatures livreur CheckAllPack'],
  pros: ['candidature prestataire', 'candidatures prestataire'],
  sellers: ['candidature vendeur', 'candidatures vendeur'],
};

export function PendingSummaryProvider({ children }: { children: ReactNode }) {
  const { selectedZone } = useZone();
  const [summary, setSummary] = useState<PendingSummary | null>(null);
  const previous = useRef<PendingSummary | null>(null);

  const load = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      const data = (await apiClient.get('/admin/pending-summary', {
        params: selectedZone ? { zone: selectedZone } : {},
      })) as PendingSummary;

      // Notification du navigateur pour chaque nouvelle candidature
      const prev = previous.current;
      if (prev && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        (Object.keys(APPLICATION_LABELS) as (keyof typeof APPLICATION_LABELS)[]).forEach((key) => {
          const diff = data.applications[key] - prev.applications[key];
          if (diff > 0) {
            const [one, many] = APPLICATION_LABELS[key];
            new Notification('CheckAll@t — Nouvelle candidature', {
              body: diff === 1 ? `1 ${one} à examiner.` : `${diff} ${many} à examiner.`,
              icon: '/icon.png',
              tag: `application-${key}`,
            });
          }
        });
      }
      previous.current = data;
      setSummary(data);
    } catch {
      /* compteurs indisponibles : on garde la dernière valeur */
    }
  }, [selectedZone]);

  useEffect(() => {
    // Changement de pays : pas de fausse notification
    previous.current = null;
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  return <PendingSummaryContext.Provider value={{ summary, refresh: load }}>{children}</PendingSummaryContext.Provider>;
}

export const usePendingSummary = () => useContext(PendingSummaryContext);
