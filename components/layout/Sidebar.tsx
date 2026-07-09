'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';
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
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: 'pendingDrivers' | 'pendingPros' | 'pendingProposals' | 'pendingBookings';
};

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
      { href: '/payouts',                          label: 'Versements presta.',   icon: DollarSign },
    ],
  },
  {
    title: 'Transport',
    sectorIcon: '🚚',
    color: '#F59E0B',
    items: [
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
    ],
  },
  {
    title: 'Marketplace',
    sectorIcon: '🛒',
    color: '#8B5CF6',
    items: [
      { href: '/sellers',  label: 'Vendeurs', icon: Store },
      { href: '/products', label: 'Produits', icon: ShoppingCart },
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
      { href: '/disputes',  label: 'Litiges',          icon: AlertCircle },
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
      { href: '/settings', label: 'Paramètres', icon: Settings },
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

function SidebarContent({
  collapsed,
  pendingDrivers,
  pendingPros,
  pendingProposals,
  pendingBookings,
}: {
  collapsed: boolean;
  pendingDrivers: number;
  pendingPros: number;
  pendingProposals: number;
  pendingBookings: number;
}) {
  const pathname = usePathname();
  const { toggle, closeMobile } = useSidebar();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  const getBadge = (item: NavItem): number => {
    if (item.badgeKey === 'pendingDrivers') return pendingDrivers;
    if (item.badgeKey === 'pendingPros') return pendingPros;
    if (item.badgeKey === 'pendingProposals') return pendingProposals;
    if (item.badgeKey === 'pendingBookings') return pendingBookings;
    return 0;
  };

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
                        <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-yellow-400 text-[9px] font-bold text-yellow-900">
                          {badge > 9 ? '9+' : badge}
                        </span>
                      )}
                    </div>
                    {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                    {!collapsed && badge > 0 && (
                      <span className="ml-auto flex-shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-yellow-400 text-yellow-900 text-xs font-bold">
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
        <div className="p-4 border-t border-gray-800 flex-shrink-0">
          <p className="text-xs text-gray-500 text-center">© 2026 CheckAll@t</p>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const { collapsed, mobileOpen, closeMobile } = useSidebar();
  const [pendingDrivers, setPendingDrivers] = useState(0);
  const [pendingPros, setPendingPros] = useState(0);
  const [pendingProposals, setPendingProposals] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const prevDriversRef = useRef<number | null>(null);
  const prevProsRef = useRef<number | null>(null);
  const prevProposalsRef = useRef<number | null>(null);
  const prevBookingsRef = useRef<number | null>(null);

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

    const fetchPending = async () => {
      try {
        const [driversData, prosData, proposalsData, bookingsData]: [any, any, any, any] = await Promise.all([
          apiClient.get('/admin/drivers', { params: { status: 'pending' } }),
          apiClient.get('/admin/pros', { params: { status: 'pending' } }),
          apiClient.get('/admin/service-proposals/stats'),
          apiClient.get('/admin/bookings/stats'),
        ]);

        const driverList = driversData?.drivers ?? driversData ?? [];
        const driverCount: number = Array.isArray(driverList) ? driverList.length : 0;
        if (prevDriversRef.current !== null && driverCount > prevDriversRef.current) {
          const diff = driverCount - prevDriversRef.current;
          notify('CheckAllAt — Chauffeur', diff === 1 ? '1 candidature chauffeur en attente.' : `${diff} candidatures chauffeur en attente.`, 'driver-application');
        }
        prevDriversRef.current = driverCount;
        setPendingDrivers(driverCount);

        const proList = prosData?.pros ?? prosData ?? [];
        const proCount: number = Array.isArray(proList) ? proList.length : 0;
        if (prevProsRef.current !== null && proCount > prevProsRef.current) {
          const diff = proCount - prevProsRef.current;
          notify('CheckAllAt — Prestataire', diff === 1 ? '1 candidature prestataire en attente.' : `${diff} candidatures prestataires en attente.`, 'pro-application');
        }
        prevProsRef.current = proCount;
        setPendingPros(proCount);

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
      } catch { /* silent */ }
    };

    fetchPending();
    const interval = setInterval(fetchPending, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="hidden md:flex h-screen flex-shrink-0">
        <SidebarContent collapsed={collapsed} pendingDrivers={pendingDrivers} pendingPros={pendingPros} pendingProposals={pendingProposals} pendingBookings={pendingBookings} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={closeMobile} />
      )}

      <div className={cn('fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-300', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>
        <SidebarContent collapsed={false} pendingDrivers={pendingDrivers} pendingPros={pendingPros} pendingProposals={pendingProposals} pendingBookings={pendingBookings} />
      </div>
    </>
  );
}
