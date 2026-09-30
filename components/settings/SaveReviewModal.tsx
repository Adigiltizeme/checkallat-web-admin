'use client';

import { SettingChange, formatValue } from '@/lib/settings-review';

interface Props {
  changes: SettingChange[];
  errors: string[];
  warnings: string[];
  saving: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** Récapitulatif avant enregistrement : erreurs bloquantes, avertissements et changements (sensibles en tête) */
export function SaveReviewModal({ changes, errors, warnings, saving, onConfirm, onClose }: Props) {
  const ordered = [...changes].sort((a, b) => Number(b.sensitive) - Number(a.sensitive));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl">
        <div className="border-b border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-900">
            {errors.length ? 'Corrigez ces réglages avant d’enregistrer' : 'Vérifiez vos modifications'}
          </h2>
        </div>
        <div className="space-y-4 overflow-y-auto p-5">
          {errors.length > 0 && (
            <ul className="space-y-1 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {errors.map((e) => <li key={e}>⛔ {e}</li>)}
            </ul>
          )}
          {warnings.length > 0 && (
            <ul className="space-y-1 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              {warnings.map((w) => <li key={w}>⚠️ {w}</li>)}
            </ul>
          )}
          {ordered.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="py-2 pr-3">Réglage</th>
                    <th className="py-2 pr-3">Avant</th>
                    <th className="py-2">Après</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ordered.map((c) => (
                    <tr key={c.path} className={c.sensitive ? 'bg-orange-50/60' : ''}>
                      <td className="py-2 pr-3 text-gray-800">
                        {c.sensitive && <span className="mr-1 rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold text-orange-800">SENSIBLE</span>}
                        {c.label}
                      </td>
                      <td className="max-w-[160px] break-words py-2 pr-3 text-gray-500 line-through">{formatValue(c.before)}</td>
                      <td className="max-w-[160px] break-words py-2 font-medium text-gray-900">{formatValue(c.after)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-200 p-4">
          <button onClick={onClose} className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            {errors.length ? 'Corriger' : 'Annuler'}
          </button>
          {errors.length === 0 && (
            <button
              onClick={onConfirm}
              disabled={saving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {saving ? 'Enregistrement…' : 'Confirmer et enregistrer'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
