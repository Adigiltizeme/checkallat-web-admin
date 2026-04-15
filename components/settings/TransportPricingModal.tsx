'use client';

import { useState, useEffect } from 'react';

interface TransportPricing {
  id: string;
  serviceZoneId: string;
  currency: string;
  isActive: boolean;
  baseFareVan: number;
  baseFareSmallTruck: number;
  basefareLargeTruck: number;
  distanceTier1Max: number;
  distanceTier1Rate: number;
  distanceTier2Max: number;
  distanceTier2Rate: number;
  distanceTier3Rate: number;
  floorRatePerLevel: number;
  helperRatePerPerson: number;
  disassemblyRate: number;
  reassemblyRate: number;
  packingRate: number;
  vanVolumeMax: number;
  smallTruckVolumeMax: number;
  notes?: string;
}

interface TransportPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pricings: TransportPricing[];
  onSave: (pricings: TransportPricing[]) => Promise<void>;
}

export function TransportPricingModal({ isOpen, onClose, pricings, onSave }: TransportPricingModalProps) {
  const [editedPricings, setEditedPricings] = useState<TransportPricing[]>(pricings);
  const [saving, setSaving] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>(pricings[0]?.serviceZoneId || '');

  useEffect(() => {
    setEditedPricings(pricings);
    if (pricings.length > 0 && !selectedZone) {
      setSelectedZone(pricings[0].serviceZoneId);
    }
  }, [pricings, selectedZone]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editedPricings);
      onClose();
    } catch (error) {
      console.error('Error saving transport pricing:', error);
      alert('Erreur lors de la sauvegarde des tarifs');
    } finally {
      setSaving(false);
    }
  };

  const updatePricing = (zoneId: string, field: keyof TransportPricing, value: any) => {
    setEditedPricings(prev =>
      prev.map(p =>
        p.serviceZoneId === zoneId
          ? { ...p, [field]: value }
          : p
      )
    );
  };

  const currentPricing = editedPricings.find(p => p.serviceZoneId === selectedZone);

  if (!currentPricing) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Tarifs de Transport</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Zone selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zone de service
            </label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {editedPricings.map((p) => (
                <option key={p.serviceZoneId} value={p.serviceZoneId}>
                  {p.serviceZoneId.toUpperCase()} ({p.currency})
                </option>
              ))}
            </select>
          </div>

          {/* Base Fares */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Tarifs de base par véhicule</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fourgon (Van)
                </label>
                <input
                  type="number"
                  value={currentPricing.baseFareVan}
                  onChange={(e) => updatePricing(selectedZone, 'baseFareVan', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Petit camion
                </label>
                <input
                  type="number"
                  value={currentPricing.baseFareSmallTruck}
                  onChange={(e) => updatePricing(selectedZone, 'baseFareSmallTruck', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grand camion
                </label>
                <input
                  type="number"
                  value={currentPricing.basefareLargeTruck}
                  onChange={(e) => updatePricing(selectedZone, 'basefareLargeTruck', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Volume thresholds */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Seuils de volume (m³)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume max pour fourgon
                </label>
                <input
                  type="number"
                  value={currentPricing.vanVolumeMax}
                  onChange={(e) => updatePricing(selectedZone, 'vanVolumeMax', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume max pour petit camion
                </label>
                <input
                  type="number"
                  value={currentPricing.smallTruckVolumeMax}
                  onChange={(e) => updatePricing(selectedZone, 'smallTruckVolumeMax', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Distance pricing tiers */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Tarification distance (dégressive)</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Palier 1: 0-{currentPricing.distanceTier1Max} km
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={currentPricing.distanceTier1Rate}
                      onChange={(e) => updatePricing(selectedZone, 'distanceTier1Rate', Number(e.target.value))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm text-gray-500">{currentPricing.currency}/km</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max (km)
                  </label>
                  <input
                    type="number"
                    value={currentPricing.distanceTier1Max}
                    onChange={(e) => updatePricing(selectedZone, 'distanceTier1Max', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Palier 2: {currentPricing.distanceTier1Max}-{currentPricing.distanceTier2Max} km
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={currentPricing.distanceTier2Rate}
                      onChange={(e) => updatePricing(selectedZone, 'distanceTier2Rate', Number(e.target.value))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm text-gray-500">{currentPricing.currency}/km</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max (km)
                  </label>
                  <input
                    type="number"
                    value={currentPricing.distanceTier2Max}
                    onChange={(e) => updatePricing(selectedZone, 'distanceTier2Max', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Palier 3: {currentPricing.distanceTier2Max}+ km
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={currentPricing.distanceTier3Rate}
                    onChange={(e) => updatePricing(selectedZone, 'distanceTier3Rate', Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-gray-500">{currentPricing.currency}/km</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional rates */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Tarifs additionnels</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Étage (sans ascenseur)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={currentPricing.floorRatePerLevel}
                    onChange={(e) => updatePricing(selectedZone, 'floorRatePerLevel', Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-gray-500">{currentPricing.currency}/niveau</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aide supplémentaire
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={currentPricing.helperRatePerPerson}
                    onChange={(e) => updatePricing(selectedZone, 'helperRatePerPerson', Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-gray-500">{currentPricing.currency}/personne</span>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Services spéciaux</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Démontage
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={currentPricing.disassemblyRate}
                    onChange={(e) => updatePricing(selectedZone, 'disassemblyRate', Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-gray-500">{currentPricing.currency}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remontage
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={currentPricing.reassemblyRate}
                    onChange={(e) => updatePricing(selectedZone, 'reassemblyRate', Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-gray-500">{currentPricing.currency}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emballage
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={currentPricing.packingRate}
                    onChange={(e) => updatePricing(selectedZone, 'packingRate', Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-gray-500">{currentPricing.currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status and notes */}
          <div className="border rounded-lg p-4">
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentPricing.isActive}
                    onChange={(e) => updatePricing(selectedZone, 'isActive', e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Tarif actif</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={currentPricing.notes || ''}
                  onChange={(e) => updatePricing(selectedZone, 'notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Notes internes sur cette grille tarifaire..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
