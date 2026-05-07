'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';
import { apiClient } from '@/lib/api';
import {
  LayoutDashboard,
  Users,
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
  ChevronRight,
} from 'lucide-react';

const MENU_SECTIONS = [
  {
    title: 'Général',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Utilisateurs',
    items: [
      { href: '/clients', label: 'Clients', icon: UserCheck },
      { href: '/pros', label: 'Pros', icon: Users },
      { href: '/drivers', label: 'Chauffeurs', icon: Truck },
      { href: '/sellers', label: 'Vendeurs', icon: Store },
    ],
  },
  {
    title: 'Transport',
    items: [
      { href: '/transport-requests', label: 'Demandes', icon: Package },
      { href: '/transport-requests/live-map', label: 'Carte Live', icon: MapPin },
      { href: '/transport-requests/payment-stats', label: 'Stats Paiements', icon: DollarSign },
      { href: '/transport-requests/cash-disputes', label: 'Litiges Cash', icon: AlertCircle },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { href: '/products', label: 'Produits', icon: ShoppingCart },
      { href: '/transactions', label: 'Transactions & Commissions', icon: CreditCard },
    ],
  },
  {
    title: 'Satisfaction',
    items: [
      { href: '/reviews', label: 'Avis', icon: Star },
      { href: '/disputes', label: 'Litiges Services', icon: AlertCircle },
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

function SidebarContent({ collapsed, pendingDrivers }: { collapsed: boolean; pendingDrivers: number }) {
  const pathname = usePathname();
  const { toggle, closeMobile } = useSidebar();

  return (
    <div
      className={cn(
        'bg-gray-900 text-white flex flex-col h-full transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo + toggle button */}
      <div className={cn('flex items-center h-16 border-b border-gray-800 flex-shrink-0', collapsed ? 'justify-center px-0' : 'justify-between px-4')}>
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold text-primary leading-tight">CheckAll@t</h1>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        )}
        <button
          onClick={() => { toggle(); closeMobile(); }}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors flex-shrink-0"
          title={collapsed ? 'Déployer' : 'Réduire'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-4 overflow-y-auto overflow-x-hidden">
        {MENU_SECTIONS.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <h3 className="px-4 mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            {collapsed && <div className="mx-3 mb-1 border-t border-gray-800" />}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                const badge = item.href === '/drivers' && pendingDrivers > 0 ? pendingDrivers : 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobile}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-3 py-2.5 rounded-lg transition-colors text-sm',
                      collapsed ? 'justify-center px-0 mx-2' : 'px-4 mx-1',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      <Icon className="h-4 w-4" />
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
  const prevPendingRef = useRef<number | null>(null);

  // Demande la permission de notifications navigateur au montage
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const fetchPending = () => {
      apiClient
        .get('/admin/drivers', { params: { status: 'pending' } })
        .then((data: any) => {
          const list = data.drivers || data;
          const count: number = Array.isArray(list) ? list.length : 0;

          // Notifie si de nouvelles candidatures arrivent (pas au premier chargement)
          if (
            prevPendingRef.current !== null &&
            count > prevPendingRef.current &&
            typeof window !== 'undefined' &&
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            const diff = count - prevPendingRef.current;
            new Notification('CheckAllAt — Nouvelle candidature', {
              body: diff === 1
                ? '1 nouvelle candidature chauffeur est en attente de validation.'
                : `${diff} nouvelles candidatures chauffeur sont en attente de validation.`,
              icon: '/favicon.ico',
              tag: 'driver-application',
            });
          }

          prevPendingRef.current = count;
          setPendingDrivers(count);
        })
        .catch(() => {});
    };
    fetchPending();
    const interval = setInterval(fetchPending, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-screen flex-shrink-0">
        <SidebarContent collapsed={collapsed} pendingDrivers={pendingDrivers} />
      </div>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Mobile sidebar (slide in) */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <SidebarContent collapsed={false} pendingDrivers={pendingDrivers} />
      </div>
    </>
  );
}
