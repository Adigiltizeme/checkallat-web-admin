'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';

interface Transaction {
  id: string;
  amount: number;
  paymentMethod: string;
  type: string;
  status: string;
  date: string;
}

const TYPE_LABELS: Record<string, string> = {
  transport: 'Transport',
  booking: 'Réservation',
  order: 'Commande',
};

const METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  in_app: 'In-App',
  cash_on_delivery: 'Cash livraison',
  cash_on_pickup: 'Cash retrait',
};

export function TransactionsTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    apiClient.get<Transaction[]>('/admin/recent-transactions')
      .then(setTransactions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paiement</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                Aucune transaction récente
              </td>
            </tr>
          ) : (
            transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                  {tx.id.slice(0, 8)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {TYPE_LABELS[tx.type] ?? tx.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(tx.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${
                    tx.paymentMethod === 'cash' || tx.paymentMethod.startsWith('cash')
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {METHOD_LABELS[tx.paymentMethod] ?? tx.paymentMethod}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(tx.date)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
