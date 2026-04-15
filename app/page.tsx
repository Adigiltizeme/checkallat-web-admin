import { Suspense } from 'react';
import Link from 'next/link';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { TransactionsTable } from '@/components/dashboard/TransactionsTable';

function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return <div className="h-80 bg-gray-200 rounded animate-pulse" />;
}

function ActivitySkeleton() {
  return <div className="h-80 bg-gray-200 rounded animate-pulse" />;
}

function TableSkeleton() {
  return <div className="h-96 bg-gray-200 rounded animate-pulse" />;
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Vue d'ensemble de la plateforme CheckAll@t
        </p>
      </div>

      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Revenus (30 derniers jours)
          </h2>
          <Suspense fallback={<ChartSkeleton />}>
            <RevenueChart />
          </Suspense>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Activité récente
          </h2>
          <Suspense fallback={<ActivitySkeleton />}>
            <RecentActivity />
          </Suspense>
        </div>
      </div>

      {/* Quick Links - Nouvelles fonctionnalités */}
      <div className="grid gap-6 md:grid-cols-3">
        <Link href="/reviews" className="block">
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">⭐ Gestion des Avis</h3>
              <span className="bg-white bg-opacity-30 rounded-full px-3 py-1 text-sm">Nouveau</span>
            </div>
            <p className="text-sm text-white/90 mb-3">
              Consultez et répondez aux avis des clients sur les chauffeurs
            </p>
            <div className="flex items-center text-sm font-medium">
              <span>Accéder →</span>
            </div>
          </div>
        </Link>

        <Link href="/transport-requests/payment-stats" className="block">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">💳 Stats Paiements</h3>
              <span className="bg-white bg-opacity-30 rounded-full px-3 py-1 text-sm">Nouveau</span>
            </div>
            <p className="text-sm text-white/90 mb-3">
              Dashboard complet Cash vs In-App avec classement chauffeurs
            </p>
            <div className="flex items-center text-sm font-medium">
              <span>Accéder →</span>
            </div>
          </div>
        </Link>

        <Link href="/transport-requests/cash-disputes" className="block">
          <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">🚨 Litiges Cash</h3>
              <span className="bg-white bg-opacity-30 rounded-full px-3 py-1 text-sm">Nouveau</span>
            </div>
            <p className="text-sm text-white/90 mb-3">
              Gérez les divergences de paiement cash entre clients et chauffeurs
            </p>
            <div className="flex items-center text-sm font-medium">
              <span>Accéder →</span>
            </div>
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Transactions récentes
        </h2>
        <Suspense fallback={<TableSkeleton />}>
          <TransactionsTable />
        </Suspense>
      </div>
    </div>
  );
}
