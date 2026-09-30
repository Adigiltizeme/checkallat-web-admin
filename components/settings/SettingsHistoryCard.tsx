'use client';

import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { apiClient } from '@/lib/api';
import { diffValues, formatValue, labelFor } from '@/lib/settings-review';
import { SettingsSection, useSettingsSections } from './SettingsSection';

interface Change {
  id: string;
  adminEmail: string | null;
  area: 'settings' | 'transport_pricing' | 'service_pricing';
  key: string;
  label: string | null;
  oldValue: unknown;
  newValue: unknown;
  createdAt: string;
}

const AREA_LABELS: Record<Change['area'], string> = {
  settings: 'Paramètres',
  transport_pricing: 'Tarifs de transport',
  service_pricing: 'Tarifs des services',
};

/** Historique des modifications des paramètres : qui, quand, avant → après */
export function SettingsHistoryCard() {
  const { isOpen } = useSettingsSections();
  const open = isOpen('history');
  const [items, setItems] = useState<Change[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = useCallback((p: number) => {
    setLoading(true);
    apiClient
      .get('/admin/settings/history', { params: { page: p } })
      .then((res: any) => {
        setItems(res.items ?? []);
        setPages(res.pages || 1);
        setPage(res.page ?? p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Chargé seulement quand la section est ouverte
  useEffect(() => {
    if (open) load(1);
  }, [open, load]);

  const describe = (c: Change) => {
    if (c.area !== 'settings') {
      const action = c.oldValue == null ? 'Création' : c.newValue == null ? 'Suppression' : 'Modification';
      const leaves = c.oldValue != null && c.newValue != null
        ? diffValues(c.oldValue, c.newValue).filter((d) => !['updatedAt', 'createdAt'].includes(d.path))
        : [];
      return { title: `${AREA_LABELS[c.area]} — ${action}${c.label ? ` (${c.label})` : ''}`, leaves };
    }
    return { title: labelFor(c.key), leaves: diffValues(c.oldValue, c.newValue, c.key) };
  };

  return (
    <SettingsSection
      id="history"
      icon="🕘"
      title="Historique des modifications"
      description="Chaque changement de paramètres, de tarifs, de secteurs ou de documents légaux : qui, quand, ancienne et nouvelle valeur."
    >
      {loading && items.length === 0 ? (
        <p className="text-sm text-gray-500">Chargement…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">Aucune modification enregistrée pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {items.map((c) => {
            const { title, leaves } = describe(c);
            return (
              <div key={c.id} className="rounded-md border border-gray-200 p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(c.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })} · {c.adminEmail ?? 'système'}
                  </p>
                </div>
                {leaves.length > 0 && (
                  <ul className="mt-2 space-y-0.5 text-xs text-gray-700">
                    {leaves.slice(0, 12).map((l) => (
                      <li key={l.path} className="break-words">
                        {l.label} : <span className="text-gray-400 line-through">{formatValue(l.before)}</span> →{' '}
                        <span className="font-medium text-gray-900">{formatValue(l.after)}</span>
                      </li>
                    ))}
                    {leaves.length > 12 && <li className="text-gray-400">… et {leaves.length - 12} autre(s) champ(s)</li>}
                  </ul>
                )}
              </div>
            );
          })}
          {pages > 1 && (
            <div className="flex items-center justify-between pt-2 text-sm">
              <button
                onClick={() => load(page - 1)}
                disabled={page <= 1 || loading}
                className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40"
              >
                ← Plus récentes
              </button>
              <span className="text-gray-500">Page {page} / {pages}</span>
              <button
                onClick={() => load(page + 1)}
                disabled={page >= pages || loading}
                className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40"
              >
                Plus anciennes →
              </button>
            </div>
          )}
        </div>
      )}
    </SettingsSection>
  );
}
