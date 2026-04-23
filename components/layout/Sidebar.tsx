'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
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
    title: 'Système',
    items: [
      { href: '/settings', label: 'Paramètres', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">CheckAll@t</h1>
        <p className="text-sm text-gray-400">Admin Panel</p>
      </div>

      <nav className="flex-1 px-4 space-y-4 overflow-y-auto">
        {MENU_SECTIONS.map((section) => (
          <div key={section.title}>
            <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">
          © 2026 CheckAll@t
        </p>
      </div>
    </div>
  );
}
