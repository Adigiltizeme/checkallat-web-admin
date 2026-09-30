'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DriverScope } from '@/lib/driverScope';

const SECTOR_TABS: { key: DriverScope; label: string; icon: string }[] = [
  { key: 'transport', label: 'Transport & Déménagement', icon: '🚚' },
  { key: 'courier', label: 'CheckAllPack', icon: '📦' },
];

/**
 * Secteur actif lu dans l'URL (?sector=courier) : conservé au rechargement,
 * au retour depuis une fiche et partageable par lien.
 * Les pages qui l'utilisent doivent être enveloppées dans <Suspense> (useSearchParams).
 */
export function useSectorTab(): [DriverScope, (scope: DriverScope) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const scope: DriverScope = searchParams.get('sector') === 'courier' ? 'courier' : 'transport';

  const setScope = (next: DriverScope) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'courier') params.set('sector', 'courier');
    else params.delete('sector');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return [scope, setScope];
}

interface Props {
  active: DriverScope;
  onChange: (scope: DriverScope) => void;
  /** Pastille par onglet (ex. éléments en attente) — masquée si 0 */
  counts?: Partial<Record<DriverScope, number>>;
  /** Libellé de la pastille, pour l'infobulle */
  countLabel?: string;
}

/** Onglets Transport / CheckAllPack partagés par les pages chauffeurs, demandes, litiges… */
export function SectorTabs({ active, onChange, counts, countLabel = 'en attente' }: Props) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex gap-6" aria-label="Secteur">
        {SECTOR_TABS.map((tab) => {
          const isActive = tab.key === active;
          const count = counts?.[tab.key] ?? 0;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {count > 0 && (
                <span
                  title={`${count} ${countLabel}`}
                  className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-yellow-400 px-1.5 text-xs font-bold text-yellow-900"
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
