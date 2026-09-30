'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Sections repliables de la page Paramètres.
 * L'état ouvert / replié est mémorisé par navigateur ; un lien #id ouvre et fait défiler jusqu'à la section.
 */

const STORAGE_KEY = 'settings.openSections';

interface SectionsContextValue {
  isOpen: (id: string) => boolean;
  setOpen: (id: string, open: boolean) => void;
  setAll: (ids: string[], open: boolean) => void;
  /** Sections dont un réglage a été modifié et pas encore enregistré */
  dirty: Set<string>;
}

const SectionsContext = createContext<SectionsContextValue | null>(null);

function readStored(): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function SettingsSectionsProvider({ children, dirty }: { children: ReactNode; dirty: Set<string> }) {
  const [open, setOpenMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const stored = readStored();
    // Lien direct : /settings#payouts ouvre la section concernée
    const hash = window.location.hash.slice(1);
    setOpenMap(hash ? { ...stored, [hash]: true } : stored);
    if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  }, []);

  const persist = (next: Record<string, boolean>) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* stockage indisponible : l'état reste valable pour la session */
    }
    return next;
  };

  const setOpen = useCallback((id: string, value: boolean) => setOpenMap((prev) => persist({ ...prev, [id]: value })), []);
  const setAll = useCallback(
    (ids: string[], value: boolean) => setOpenMap((prev) => persist({ ...prev, ...Object.fromEntries(ids.map((id) => [id, value])) })),
    [],
  );
  const isOpen = useCallback((id: string) => !!open[id], [open]);

  const value = useMemo(() => ({ isOpen, setOpen, setAll, dirty }), [isOpen, setOpen, setAll, dirty]);
  return <SectionsContext.Provider value={value}>{children}</SectionsContext.Provider>;
}

export function useSettingsSections() {
  const ctx = useContext(SectionsContext);
  if (!ctx) throw new Error('useSettingsSections doit être utilisé dans SettingsSectionsProvider');
  return ctx;
}

interface SectionProps {
  id: string;
  title: string;
  icon?: string;
  description?: ReactNode;
  /** Élément affiché à droite de l'en-tête (ex. bouton « Gérer ») — ne replie pas la section */
  action?: ReactNode;
  /** instant : enregistré dès la validation (fenêtre, bouton) ; bar : avec la barre « Enregistrer » en bas de page */
  saveMode?: 'instant' | 'bar';
  children: ReactNode;
}

export function SettingsSection({ id, title, icon, description, action, saveMode, children }: SectionProps) {
  const { isOpen, setOpen, dirty } = useSettingsSections();
  const open = isOpen(id);
  const modified = dirty.has(id);

  return (
    <section id={id} className="scroll-mt-24 rounded-lg bg-white shadow">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => setOpen(id, !open)}
            aria-expanded={open}
            aria-controls={`${id}-content`}
            className="flex flex-1 items-center gap-3 rounded-md text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span
              aria-hidden
              className={`inline-block text-gray-400 transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-90' : ''}`}
            >
              ▶
            </span>
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-xl font-semibold text-gray-900">
                {icon && <span className="mr-2">{icon}</span>}
                {title}
              </span>
              {saveMode && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    saveMode === 'instant' ? 'bg-sky-50 text-sky-700' : 'bg-gray-100 text-gray-600'
                  }`}
                  title={saveMode === 'instant'
                    ? 'Les changements de cette section sont enregistrés dès que vous les validez'
                    : 'Les changements de cette section sont enregistrés avec la barre « Enregistrer » en bas de page'}
                >
                  {saveMode === 'instant' ? 'Enregistrement immédiat' : 'Enregistré avec la barre du bas'}
                </span>
              )}
              {modified && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Modifié · non enregistré</span>
              )}
            </span>
          </button>
          {action && <div className="shrink-0">{action}</div>}
        </div>
        {/* Hors du bouton : la description peut contenir des liens */}
        {description && <div className="mt-1 pl-7 text-sm text-gray-600">{description}</div>}
      </div>
      {open && (
        <div id={`${id}-content`} className="border-t border-gray-100 p-6 pt-5">
          {children}
        </div>
      )}
    </section>
  );
}
