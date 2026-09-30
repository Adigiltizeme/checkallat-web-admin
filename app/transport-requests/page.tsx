'use client';

import { Suspense } from 'react';
import { TransportRequestsList } from '@/components/transport/TransportRequestsList';

export default function TransportRequestsPage() {
  // Suspense requis par useSearchParams (onglet de secteur dans l'URL)
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500">Chargement...</div>}>
      <TransportRequestsList />
    </Suspense>
  );
}
