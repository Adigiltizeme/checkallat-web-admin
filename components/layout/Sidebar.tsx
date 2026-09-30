'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';
import { useZone } from '@/contexts/ZoneContext';
import { apiClient } from '@/lib/api';
import {
  LayoutDashboard,
  UserCheck,
  Truck,
  Store,
  ShoppingCart,
  CreditCard,
  AlertCircle,
  Settings,
  Package,
  DollarSign,
  Star,
  MapPin,
  Headphones,
  ChevronLeft,
  CalendarCheck,
  Briefcase,
  Lightbulb,
  MessageSquare,
  Tags,
  ShieldCheck,
  LayoutGrid,
  UserPlus,
  BarChart3,
} from 'lucide-react';
import { usePendingSummary } from '@/contexts/PendingSummaryContext';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: BadgeKey;
};

type BadgeKey =
  | 'applications' | 'pendingDrivers' | 'pendingPros' | 'pendingSellers'
  | 'pendingProposals' | 'pendingBookings' | 'pendingExtras' | 'openDisputes' | 'transfersToExecute';

type Badges = Record<BadgeKey, number>;

/** Candidatures : badge rose, distinct des autres éléments à traiter (jaune) */
const APPLICATION_BADGES: BadgeKey[] = ['applications', 'pendingDrivers', 'pendingPros', 'pendingSellers'];

type NavSection = {
  title: string;
  sectorIcon?: string;
  color?: string; // hex accent color for section header + inactive icons
  items: NavItem[];
};

const MENU_SECTIONS: NavSection[] = [
  {
    title: 'Général',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/usage', label: "Statistiques d'usage", icon: BarChart3 },
    ],
  },
  {
    title: 'À traiter',
    color: '#F43F5E',
    items: [
      { href: '/applications', label: 'Candidatures', icon: UserPlus, badgeKey: 'applications' },
    ],
  },
  {
    title: 'Suivi',
    color: '#06B6D4',
    items: [
      { href: '/transport-requests/live-map', label: 'Carte Live', icon: MapPin },
    ],
  },
  {
    title: 'Finances',
    color: '#3B82F6',
    items: [
      { href: '/transport-requests/payment-stats', label: 'Stats Paiements',      icon: DollarSign },
      { href: '/transport-requests/cash-disputes', label: 'Litiges Cash',         icon: AlertCircle },
      { href: '/transactions',                     label: 'Transactions & Comm.', icon: CreditCard },
      { href: '/payouts',                          label: 'Versements presta.',   icon: DollarSign, badgeKey: 'transfersToExecute' },
    ],
  },
  {
    title: 'Transport',
    sectorIcon: '🚚',
    color: '#F59E0B',
    items: [
      // Onglets Transport / CheckAllPack dans chaque page ; badge = candidatures des deux secteurs
      { href: '/drivers',            label: 'Chauffeurs', icon: Truck,   badgeKey: 'pendingDrivers' },
      { href: '/transport-requests', label: 'Demandes',   icon: Package },
    ],
  },
  {
    title: 'Services',
    sectorIcon: '🔧',
    color: '#10B981',
    items: [
      { href: '/pros',               label: 'Prestataires',  icon: Briefcase,    badgeKey: 'pendingPros' },
      { href: '/bookings',           label: 'Réservations',  icon: CalendarCheck, badgeKey: 'pendingBookings' },
      { href: '/service-proposals',  label: 'Propositions',  icon: Lightbulb,    badgeKey: 'pendingProposals' },
      { href: '/extras-review',      label: 'Suppléments',   icon: Tags,         badgeKey: 'pendingExtras' },
    ],
  },
  {
    title: 'Marketplace',
    sectorIcon: '🛒',
    color: '#8B5CF6',
    items: [
      { href: '/marketplace/orders',  label: 'Commandes',         icon: Package },
      { href: '/sellers',             label: 'Vendeurs',          icon: Store, badgeKey: 'pendingSellers' },
      { href: '/products',            label: 'Produits',          icon: ShoppingCart },
      { href: '/marketplace/domains', label: 'Domaines de vente', icon: Tags },
    ],
  },
  {
    title: 'Utilisateurs',
    items: [
      { href: '/clients', label: 'Users', icon: UserCheck },
    ],
  },
  {
    title: 'Satisfaction',
    color: '#EAB308',
    items: [
      { href: '/reviews',   label: 'Avis',             icon: Star },
      { href: '/disputes',  label: 'Litiges',          icon: AlertCircle, badgeKey: 'openDisputes' },
    ],
  },
  {
    title: 'Surveillance',
    color: '#EF4444',
    items: [
      { href: '/conversations', label: 'Messages & Appels', icon: MessageSquare },
    ],
  },
  {
    title: 'Support',
    items: [
      { href: '/support', label: 'Aide & Support', icon: Headphones },
    ],
  },
  {
    title: 'Système',
    items: [
      { href: '/admins',   label: 'Admins',      icon: ShieldCheck },
      { href: '/sectors',  label: 'Secteurs',    icon: LayoutGrid },
      { href: '/settings', label: 'Paramètres',  icon: Settings },
    ],
  },
];

// All registered hrefs, used to avoid false-positive active state on prefix matches
const ALL_ITEM_HREFS = MENU_SECTIONS.flatMap(s => s.items.map(i => i.href));

function isNavItemActive(pathname: string | null, itemHref: string): boolean {
  if (!pathname) return false;
  if (pathname === itemHref) return true;
  if (itemHref === '/') return false;
  if (!pathname.startsWith(itemHref + '/')) return false;
  // Don't mark active if a more-specific registered route also matches (e.g. /transport-requests/live-map)
  return !ALL_ITEM_HREFS.some(h => h !== itemHref && h.startsWith(itemHref + '/') && pathname.startsWith(h));
}

function SidebarContent({ collapsed, badges }: { collapsed: boolean; badges: Badges }) {
  const pathname = usePathname();
  const { toggle, closeMobile } = useSidebar();
  const { zones, selectedZone, selectedZoneObj, setSelectedZone } = useZone();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  const getBadge = (item: NavItem): number => (item.badgeKey ? badges[item.badgeKey] ?? 0 : 0);

  return (
    <div
      className={cn(
        'bg-gray-900 text-white flex flex-col h-full transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo + toggle */}
      <div className={cn('flex items-center h-16 border-b border-gray-800 flex-shrink-0', collapsed ? 'justify-center px-0' : 'justify-between px-4')}>
        {collapsed ? (
          <button onClick={() => { toggle(); closeMobile(); }} title="Déployer" className="p-1 rounded-lg hover:bg-gray-800 transition-colors">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="CheckAll@t" width={34} height={34} className="rounded-lg" />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.png" alt="CheckAll@t" width={34} height={34} className="flex-shrink-0 rounded-lg" />
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-primary leading-tight">CheckAll@t</h1>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => { toggle(); closeMobile(); }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors flex-shrink-0"
              title="Réduire"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Zone selector */}
      <div className={cn('border-b border-gray-800 flex-shrink-0', collapsed ? 'p-2' : 'px-3 py-2.5')}>
        {!collapsed ? (
          <>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Zone</p>
            <select
              value={selectedZone}
              onChange={e => setSelectedZone(e.target.value)}
              className="w-full bg-gray-800 text-white text-xs rounded px-2 py-1.5 border border-gray-700 focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="">🌐 Toutes les zones</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>
                  {z.flag ?? ''} {z.nameFr ?? z.name ?? z.id} ({z.currency})
                </option>
              ))}
            </select>
            {selectedZoneObj && (
              <p className="text-[10px] text-primary mt-1 text-center font-medium">
                {selectedZoneObj.nameFr ?? selectedZoneObj.id} — {selectedZoneObj.currency}
              </p>
            )}
          </>
        ) : (
          <button
            className="w-full flex justify-center items-center text-xl py-0.5"
            title={selectedZoneObj ? `Zone : ${selectedZoneObj.nameFr ?? selectedZoneObj.id} (${selectedZoneObj.currency})` : 'Toutes les zones'}
            onClick={() => {
              if (!selectedZone && zones.length > 0) setSelectedZone(zones[0].id);
              else setSelectedZone('');
            }}
          >
            {selectedZoneObj?.flag ?? '🌐'}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-4 overflow-y-auto overflow-x-hidden">
        {MENU_SECTIONS.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <h3
                className="px-4 mb-1 text-xs font-semibold uppercase tracking-wider flex items-center gap-1"
                style={{ color: section.color ?? '#6B7280' }}
              >
                {section.sectorIcon && <span className="text-sm">{section.sectorIcon}</span>}
                {section.title}
              </h3>
            )}
            {collapsed && (
              <div
                className="mx-3 mb-1 border-t"
                style={{ borderColor: section.color ? section.color + '40' : '#1F2937' }}
              />
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = isNavItemActive(pathname, item.href);
                const isHovered = hoveredHref === item.href;
                const badge = getBadge(item);
                const isApplication = !!item.badgeKey && APPLICATION_BADGES.includes(item.badgeKey);
                const badgeTitle = isApplication ? `${badge} candidature(s) en attente` : `${badge} élément(s) à traiter`;
                const iconColor = isActive || isHovered ? 'white' : (section.color ?? '#9CA3AF');

                const sectionColor = section.color ?? '#00B8A9';
                const activeBg = isActive ? sectionColor : undefined;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobile}
                    title={collapsed ? item.label : undefined}
                    onMouseEnter={() => setHoveredHref(item.href)}
                    onMouseLeave={() => setHoveredHref(null)}
                    style={activeBg ? { backgroundColor: activeBg } : undefined}
                    className={cn(
                      'flex items-center gap-3 py-2.5 rounded-lg transition-colors text-sm',
                      collapsed ? 'justify-center px-0 mx-2' : 'px-4 mx-1',
                      isActive
                        ? 'text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      <span style={{ color: iconColor }}>
                        <Icon className="h-4 w-4" />
                      </span>
                      {badge > 0 && collapsed && (
                        <span
                          title={badgeTitle}
                          className={cn(
                            'absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold',
                            isApplication ? 'bg-rose-500 text-white' : 'bg-yellow-400 text-yellow-900',
                          )}
                        >
                          {badge > 9 ? '9+' : badge}
                        </span>
                      )}
                    </div>
                    {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                    {!collapsed && badge > 0 && (
                      <span
                        title={badgeTitle}
                        className={cn(
                          'ml-auto flex-shrink-0 inline-flex items-center justify-center gap-0.5 min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold',
                          isApplication ? 'bg-rose-500 text-white' : 'bg-yellow-400 text-yellow-900',
                        )}
                      >
                        {isApplication && <UserPlus className="h-3 w-3" />}
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="px-4 py-2 border-t border-gray-800 flex-shrink-0">
          <p className="text-xs text-gray-500 text-center">© 2026 CheckAll@t</p>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const { collapsed, mobileOpen, closeMobile } = useSidebar();
  const { selectedZone } = useZone();
  const { summary } = usePendingSummary();
  const [pendingProposals, setPendingProposals] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [pendingExtras, setPendingExtras] = useState(0);
  const prevProposalsRef = useRef<number | null>(null);
  const prevBookingsRef = useRef<number | null>(null);
  const prevExtrasRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const notify = (title: string, body: string, tag: string) => {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/icon.png', tag });
      }
    };

    // Changement de pays : les compteurs repartent de zéro (pas de fausse notification)
    prevProposalsRef.current = null;
    prevExtrasRef.current = null;
    prevBookingsRef.current = null;
    const zoneParams = selectedZone ? { zone: selectedZone } : {};

    const fetchPending = async () => {
      try {
        // Candidatures : compteurs et notifications gérés par PendingSummaryContext
        const [proposalsData, bookingsData]: [any, any] = await Promise.all([
          apiClient.get('/admin/service-proposals/stats', { params: zoneParams }),
          apiClient.get('/admin/bookings/stats', { params: zoneParams }),
        ]);

        const proposalBadge: number = proposalsData?.sidebarBadge ?? proposalsData?.pending ?? 0;
        if (prevProposalsRef.current !== null && proposalBadge > prevProposalsRef.current) {
          const diff = proposalBadge - prevProposalsRef.current;
          notify('CheckAllAt — Proposition', diff === 1 ? '1 nouvelle proposition de service.' : `${diff} nouvelles propositions de service.`, 'service-proposal');
        }
        prevProposalsRef.current = proposalBadge;
        setPendingProposals(proposalBadge);

        const bookingCount: number = bookingsData?.pending ?? 0;
        if (prevBookingsRef.current !== null && bookingCount > prevBookingsRef.current) {
          const diff = bookingCount - prevBookingsRef.current;
          notify('CheckAllAt — Réservation', diff === 1 ? '1 nouvelle réservation en attente.' : `${diff} nouvelles réservations en attente.`, 'booking-pending');
        }
        prevBookingsRef.current = bookingCount;
        setPendingBookings(bookingCount);

        try {
          const extrasData = await apiClient.get('/services/offerings/extras/pending/count', { params: zoneParams }) as { count: number };
          const extrasCount: number = extrasData?.count ?? 0;
          if (prevExtrasRef.current !== null && extrasCount > prevExtrasRef.current) {
            notify('CheckAllAt — Suppléments', `${extrasCount} supplément(s) en attente d'approbation.`, 'extras-pending');
          }
          prevExtrasRef.current = extrasCount;
          setPendingExtras(extrasCount);
        } catch { /* endpoint optionnel */ }
      } catch { /* silent */ }
    };

    fetchPending();
    const interval = setInterval(fetchPending, 30_000);
    return () => clearInterval(interval);
  }, [selectedZone]);

  const apps = summary?.applications;
  const badges: Badges = {
    applications: apps?.total ?? 0,
    pendingDrivers: (apps?.drivers ?? 0) + (apps?.couriers ?? 0),
    pendingPros: apps?.pros ?? 0,
    pendingSellers: apps?.sellers ?? 0,
    pendingProposals,
    pendingBookings,
    pendingExtras,
    openDisputes: summary?.openDisputes ?? 0,
    // Virements à exécuter + comptes de versement à vérifier
    transfersToExecute: (summary?.transfersToExecute ?? 0) + (summary?.unverifiedPayoutAccounts ?? 0),
  };

  return (
    <>
      <div className="hidden md:flex h-screen flex-shrink-0">
        <SidebarContent collapsed={collapsed} badges={badges} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={closeMobile} />
      )}

      <div className={cn('fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-300', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>
        <SidebarContent collapsed={false} badges={badges} />
      </div>
    </>
  );
}
