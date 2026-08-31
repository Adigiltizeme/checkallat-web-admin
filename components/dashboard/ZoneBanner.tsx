'use client';

import { useZone } from '@/contexts/ZoneContext';

export function ZoneBanner() {
  const { selectedZone, selectedZoneObj, zones, setSelectedZone } = useZone();

  if (selectedZoneObj) {
    return (
      <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg px-4 py-2.5 text-sm">
        <div className="flex items-center gap-2 text-primary font-medium">
          <span className="text-lg">{selectedZoneObj.flag ?? '📍'}</span>
          <span>
            Zone active : <strong>{selectedZoneObj.nameFr ?? selectedZoneObj.name ?? selectedZoneObj.id}</strong>
            {' '}— {selectedZoneObj.currency}
          </span>
        </div>
        <button
          onClick={() => setSelectedZone('')}
          className="text-xs text-primary/70 hover:text-primary underline underline-offset-2"
        >
          Toutes les zones
        </button>
      </div>
    );
  }

  if (zones.length === 0) {
    return (
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-700">
        <span>⚠️</span>
        <span>Aucune zone configurée — rendez-vous dans <strong>Paramètres</strong> pour définir vos zones de service.</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-500">
      <span>🌐</span>
      <span>Toutes les zones affichées — les montants peuvent être dans des devises différentes.</span>
      <div className="ml-auto flex items-center gap-1.5">
        {zones.map(z => (
          <button
            key={z.id}
            onClick={() => setSelectedZone(z.id)}
            className="px-2 py-0.5 rounded bg-white border border-gray-200 hover:border-primary hover:text-primary text-xs font-medium transition-colors"
            title={`${z.nameFr ?? z.id} — ${z.currency}`}
          >
            {z.flag ?? ''} {z.currency}
          </button>
        ))}
      </div>
    </div>
  );
}
