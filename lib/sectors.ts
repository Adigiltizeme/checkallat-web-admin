/**
 * Secteurs d'activité de la plateforme CheckAll@t
 * Source de vérité pour l'organisation de l'admin par secteur.
 */

export const ACTIVITY_SECTORS = [
  {
    key: 'transport' as const,
    label: 'Transport',
    shortLabel: 'Transport',
    icon: '🚚',
    colorClass: 'bg-blue-100 text-blue-800 border-blue-200',
    activeBg: 'bg-blue-600',
    hoverClass: 'hover:border-blue-400 hover:text-blue-700',
  },
  {
    key: 'services' as const,
    label: 'Services à domicile',
    shortLabel: 'Services',
    icon: '🔧',
    colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    activeBg: 'bg-emerald-600',
    hoverClass: 'hover:border-emerald-400 hover:text-emerald-700',
  },
  {
    key: 'marketplace' as const,
    label: 'Marketplace',
    shortLabel: 'Marketplace',
    icon: '🛒',
    colorClass: 'bg-purple-100 text-purple-800 border-purple-200',
    activeBg: 'bg-purple-600',
    hoverClass: 'hover:border-purple-400 hover:text-purple-700',
  },
] as const;

export type SectorKey = typeof ACTIVITY_SECTORS[number]['key'];

/** Mapping route → secteur (préfixes) */
const SECTOR_ROUTES: [string, SectorKey][] = [
  ['/transport-requests', 'transport'],
  ['/drivers',            'transport'],
  ['/bookings',           'services'],
  ['/pros',               'services'],
  ['/sellers',            'marketplace'],
  ['/products',           'marketplace'],
  ['/transactions',       'marketplace'],
];

export function getSectorFromPath(pathname: string): SectorKey | null {
  for (const [prefix, sector] of SECTOR_ROUTES) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) return sector;
  }
  return null;
}

export function getSector(key: SectorKey) {
  return ACTIVITY_SECTORS.find(s => s.key === key)!;
}
