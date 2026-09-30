'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, LogOut, Menu, X } from 'lucide-react';
import { getUser, logout } from '@/lib/auth';
import { useSidebar } from '@/contexts/SidebarContext';
import { usePendingSummary } from '@/contexts/PendingSummaryContext';

interface BellItem {
  key: string;
  href: string;
  label: string;
  count: number;
  application?: boolean;
}

export function Header() {
  const { toggle } = useSidebar();
  const [user, setUser] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const { summary } = usePendingSummary();

  useEffect(() => {
    setUser(getUser());
  }, []);

  // Éléments à traiter : les candidatures d'abord, séparées du reste
  const apps = summary?.applications;
  const applicationItems: BellItem[] = [
    { key: 'drivers', href: '/applications', label: 'Chauffeurs', count: apps?.drivers ?? 0, application: true },
    { key: 'couriers', href: '/applications', label: 'Livreurs CheckAllPack', count: apps?.couriers ?? 0, application: true },
    { key: 'pros', href: '/applications', label: 'Prestataires', count: apps?.pros ?? 0, application: true },
    { key: 'sellers', href: '/applications', label: 'Vendeurs', count: apps?.sellers ?? 0, application: true },
  ].filter((i) => i.count > 0);
  const otherItems: BellItem[] = [
    { key: 'disputes', href: '/disputes', label: 'Litiges ouverts', count: summary?.openDisputes ?? 0 },
    { key: 'transfers', href: '/payouts', label: 'Virements à exécuter', count: summary?.transfersToExecute ?? 0 },
    { key: 'blocked', href: '/payouts', label: 'Gains bloqués par un litige', count: summary?.blockedPayouts ?? 0 },
    { key: 'accounts', href: '/payouts', label: 'Comptes de versement à vérifier', count: summary?.unverifiedPayoutAccounts ?? 0 },
  ].filter((i) => i.count > 0);
  const unreadCount =
    (apps?.total ?? 0) + (summary?.openDisputes ?? 0) + (summary?.transfersToExecute ?? 0) + (summary?.unverifiedPayoutAccounts ?? 0);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3 flex-1">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggle}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        {/* Logo — mobile only (desktop: shown in sidebar) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.png" alt="CheckAll@t" width={28} height={28} className="md:hidden rounded flex-shrink-0" />
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
          Bienvenue, {user?.firstName || 'Admin'}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="sr-only">Éléments à traiter</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown notifications */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">À traiter</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {applicationItems.length === 0 && otherItems.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">Rien à traiter pour le moment</div>
                ) : (
                  <>
                    {applicationItems.length > 0 && (
                      <div className="border-b border-gray-100 bg-rose-50/60 p-3">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rose-700">
                          Candidatures à examiner · {apps?.total}
                        </p>
                        {applicationItems.map((item) => (
                          <Link
                            key={item.key}
                            href={item.href}
                            onClick={() => setShowNotifications(false)}
                            className="flex items-center justify-between rounded px-2 py-1.5 text-sm text-gray-800 hover:bg-rose-100"
                          >
                            {item.label}
                            <span className="rounded-full bg-rose-500 px-2 text-xs font-bold text-white">{item.count}</span>
                          </Link>
                        ))}
                        {apps?.oldestSubmittedAt && (
                          <p className="mt-1 px-2 text-xs text-gray-500">
                            Plus ancienne : {new Date(apps.oldestSubmittedAt).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    )}
                    {otherItems.length > 0 && (
                      <div className="p-3">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Autres éléments</p>
                        {otherItems.map((item) => (
                          <Link
                            key={item.key}
                            href={item.href}
                            onClick={() => setShowNotifications(false)}
                            className="flex items-center justify-between rounded px-2 py-1.5 text-sm text-gray-800 hover:bg-gray-100"
                          >
                            {item.label}
                            <span className="rounded-full bg-yellow-400 px-2 text-xs font-bold text-yellow-900">{item.count}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
            {user?.firstName?.charAt(0) || 'A'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500">Administrateur</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => logout()}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Déconnexion"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
