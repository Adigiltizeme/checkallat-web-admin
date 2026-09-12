'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/currency';

interface TransportPricing {
  id: string;
  countryId: string;
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

interface ServiceZone {
  id: string;
  name: string;
  country: string;
  flag?: string;
  currency: string;
  enabled: boolean;
}

interface TransportPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pricings: TransportPricing[];
  zones?: ServiceZone[];
  onSave: (pricings: TransportPricing[]) => Promise<void>;
}

const isUnconfigured = (p: TransportPricing) =>
  p.baseFareVan === 0 && p.baseFareSmallTruck === 0 && p.basefareLargeTruck === 0;

export function TransportPricingModal({ isOpen, onClose, pricings, zones = [], onSave }: TransportPricingModalProps) {
  const validPricings = pricings.filter((p) => p.countryId != null);
  const [editedPricings, setEditedPricings] = useState<TransportPricing[]>(validPricings);
  const [saving, setSaving] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>(validPricings[0]?.countryId || '');

  useEffect(() => {
    const valid = pricings.filter((p) => p.countryId != null);
    setEditedPricings(valid);
    if (valid.length > 0 && !selectedZone) {
      setSelectedZone(valid[0].countryId);
    }
  }, [pricings, selectedZone]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editedPricings);
      onClose();
    } catch {
      alert('Erreur lors de la sauvegarde des tarifs');
    } finally {
      setSaving(false);
    }
  };

  const updatePricing = (zoneId: string, field: keyof TransportPricing, value: any) => {
    setEditedPricings((prev) =>
      prev.map((p) => (p.countryId === zoneId ? { ...p, [field]: value } : p)),
    );
  };

  const currentPricing = editedPricings.find((p) => p.countryId === selectedZone);

  const getZoneLabel = (zoneId: string | null | undefined) => {
    if (!zoneId) return '—';
    const zone = zones.find((z) => z.id === zoneId);
    if (zone) return `${zone.flag ?? '🌍'} ${zone.name}, ${zone.country}`;
    return zoneId.toUpperCase();
  };

  const getZoneCurrency = (zoneId: string) => {
    const pricing = editedPricings.find((p) => p.countryId === zoneId);
    return pricing?.currency ?? '?';
  };

  if (!currentPricing) return null;

  const unconfigured = isUnconfigured(currentPricing);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Tarifs de Transport</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Zone selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
            <div className="flex gap-3 items-start">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {editedPricings.map((p) => (
                  <option key={p.countryId} value={p.countryId}>
                    {getZoneLabel(p.countryId)} — {getZoneCurrency(p.countryId)}
                    {isUnconfigured(p) ? ' ⚠️ Non configuré' : ''}
                    {!p.isActive ? ' (inactif)' : ''}
                  </option>
                ))}
              </select>
              <span className={`px-3 py-2 rounded text-xs font-semibold ${
                currentPricing.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {currentPricing.isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>

            {unconfigured && (
              <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
                ⚠️ Cette zone n'est pas encore configurée (tous les tarifs sont à 0). Renseignez les tarifs ci-dessous puis activez la zone.
              </div>
            )}
          </div>

          {/* Devise de la zone */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm">
            <span className="font-medium text-gray-600">Devise :</span>
            <span className="font-bold">{currentPricing.currency}</span>
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-sm text-gray-700 font-medium">Activer ce tarif</label>
              <input
                type="checkbox"
                checked={currentPricing.isActive}
                onChange={(e) => updatePricing(selectedZone, 'isActive', e.target.checked)}
                className="accent-green-600 w-4 h-4"
              />
            </div>
          </div>

          {/* Base Fares */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Tarifs de base par véhicule</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NumField
                label={`Fourgon (Van)`}
                value={currentPricing.baseFareVan}
                suffix={currentPricing.currency}
                onChange={(v) => updatePricing(selectedZone, 'baseFareVan', v)}
              />
              <NumField
                label="Petit camion"
                value={currentPricing.baseFareSmallTruck}
                suffix={currentPricing.currency}
                onChange={(v) => updatePricing(selectedZone, 'baseFareSmallTruck', v)}
              />
              <NumField
                label="Grand camion"
                value={currentPricing.basefareLargeTruck}
                suffix={currentPricing.currency}
                onChange={(v) => updatePricing(selectedZone, 'basefareLargeTruck', v)}
              />
            </div>
            {currentPricing.baseFareVan > 0 && (
              <p className="mt-2 text-xs text-gray-400">
                Ex: Fourgon = {formatCurrency(currentPricing.baseFareVan, currentPricing.currency)},
                Petit camion = {formatCurrency(currentPricing.baseFareSmallTruck, currentPricing.currency)},
                Grand camion = {formatCurrency(currentPricing.basefareLargeTruck, currentPricing.currency)}
              </p>
            )}
          </div>

          {/* Volume thresholds */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Seuils de volume (m³)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumField
                label="Volume max fourgon"
                value={currentPricing.vanVolumeMax}
                suffix="m³"
                onChange={(v) => updatePricing(selectedZone, 'vanVolumeMax', v)}
              />
              <NumField
                label="Volume max petit camion"
                value={currentPricing.smallTruckVolumeMax}
                suffix="m³"
                onChange={(v) => updatePricing(selectedZone, 'smallTruckVolumeMax', v)}
              />
            </div>
          </div>

          {/* Distance pricing tiers */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Tarification distance (dégressive)</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <NumField
                  label={`Palier 1 : 0–${currentPricing.distanceTier1Max} km`}
                  value={currentPricing.distanceTier1Rate}
                  suffix={`${currentPricing.currency}/km`}
                  onChange={(v) => updatePricing(selectedZone, 'distanceTier1Rate', v)}
                />
                <NumField
                  label="Max palier 1 (km)"
                  value={currentPricing.distanceTier1Max}
                  suffix="km"
                  onChange={(v) => updatePricing(selectedZone, 'distanceTier1Max', v)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <NumField
                  label={`Palier 2 : ${currentPricing.distanceTier1Max}–${currentPricing.distanceTier2Max} km`}
                  value={currentPricing.distanceTier2Rate}
                  suffix={`${currentPricing.currency}/km`}
                  onChange={(v) => updatePricing(selectedZone, 'distanceTier2Rate', v)}
                />
                <NumField
                  label="Max palier 2 (km)"
                  value={currentPricing.distanceTier2Max}
                  suffix="km"
                  onChange={(v) => updatePricing(selectedZone, 'distanceTier2Max', v)}
                />
              </div>
              <NumField
                label={`Palier 3 : ${currentPricing.distanceTier2Max}+ km`}
                value={currentPricing.distanceTier3Rate}
                suffix={`${currentPricing.currency}/km`}
                onChange={(v) => updatePricing(selectedZone, 'distanceTier3Rate', v)}
              />
            </div>
          </div>

          {/* Additional rates */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Tarifs additionnels</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumField
                label="Étage (sans ascenseur)"
                value={currentPricing.floorRatePerLevel}
                suffix={`${currentPricing.currency}/niveau`}
                onChange={(v) => updatePricing(selectedZone, 'floorRatePerLevel', v)}
              />
              <NumField
                label="Aide supplémentaire"
                value={currentPricing.helperRatePerPerson}
                suffix={`${currentPricing.currency}/personne`}
                onChange={(v) => updatePricing(selectedZone, 'helperRatePerPerson', v)}
              />
            </div>
          </div>

          {/* Services spéciaux */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Services spéciaux</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NumField label="Démontage" value={currentPricing.disassemblyRate} suffix={currentPricing.currency} onChange={(v) => updatePricing(selectedZone, 'disassemblyRate', v)} />
              <NumField label="Remontage" value={currentPricing.reassemblyRate} suffix={currentPricing.currency} onChange={(v) => updatePricing(selectedZone, 'reassemblyRate', v)} />
              <NumField label="Emballage" value={currentPricing.packingRate} suffix={currentPricing.currency} onChange={(v) => updatePricing(selectedZone, 'packingRate', v)} />
            </div>
          </div>

          {/* Notes */}
          <div className="border rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes internes</label>
            <textarea
              value={currentPricing.notes || ''}
              onChange={(e) => updatePricing(selectedZone, 'notes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Notes sur cette grille tarifaire..."
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

const NumField = ({
  label, value, suffix, onChange,
}: {
  label: string; value: number; suffix?: string; onChange: (v: number) => void;
}) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        step="any"
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {suffix && <span className="text-xs text-gray-500 whitespace-nowrap">{suffix}</span>}
    </div>
  </div>
);
