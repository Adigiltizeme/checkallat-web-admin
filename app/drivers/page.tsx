'use client';

import { Suspense } from 'react';
import { DriversList } from '@/components/drivers/DriversList';

export default function DriversPage() {
  // Suspense requis par useSearchParams (onglet de secteur dans l'URL)
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500">Chargement...</div>}>
      <DriversList />
    </Suspense>
  );
}
