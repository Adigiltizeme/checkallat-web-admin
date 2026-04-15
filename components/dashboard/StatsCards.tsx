'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { Users, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface Stats {
  totalUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  averageRating: number;
  usersVariation: string;
  transactionsThisMonth: number;
  transactionsVariation: string;
  revenueVariation: string;
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { currency, formatCurrency } = useCurrency();

  useEffect(() => {
    apiClient.get<Stats>('/admin/stats')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return null;

  const cards = [
    {
      title: 'Utilisateurs actifs',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      description: stats.usersVariation,
    },
    {
      title: 'Transactions',
      value: stats.totalTransactions.toLocaleString(),
      icon: ShoppingCart,
      description: `${stats.transactionsThisMonth} ce mois (${stats.transactionsVariation})`,
    },
    {
      title: `Revenus (${currency})`,
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      description: stats.revenueVariation,
    },
    {
      title: 'Note moyenne',
      value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—',
      icon: TrendingUp,
      description: 'Sur toutes les catégories',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
