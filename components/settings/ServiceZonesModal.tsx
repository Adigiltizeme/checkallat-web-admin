'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { SUPPORTED_CURRENCIES } from '@/lib/constants';

interface ServiceZone {
  id: string;
  name: string;
  nameAr: string;
  country: string;
  countryCode: string;
  currency?: string;
  enabled: boolean;
}

interface ServiceZonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  zones: ServiceZone[];
  onSave: (zones: ServiceZone[]) => Promise<void>;
}

// Liste des pays disponibles avec leurs devises
const COUNTRIES = [
  { code: 'EG', name: 'Egypt', nameFr: 'Égypte', nameAr: 'مصر', currency: 'EGP', flag: '🇪🇬' },
  { code: 'FR', name: 'France', nameFr: 'France', nameAr: 'فرنسا', currency: 'EUR', flag: '🇫🇷' },
  { code: 'SN', name: 'Senegal', nameFr: 'Sénégal', nameAr: 'السنغال', currency: 'XOF', flag: '🇸🇳' },
  { code: 'ML', name: 'Mali', nameFr: 'Mali', nameAr: 'مالي', currency: 'XOF', flag: '🇲🇱' },
  { code: 'DZ', name: 'Algeria', nameFr: 'Algérie', nameAr: 'الجزائر', currency: 'DZD', flag: '🇩🇿' },
  { code: 'SA', name: 'Saudi Arabia', nameFr: 'Arabie Saoudite', nameAr: 'السعودية', currency: 'SAR', flag: '🇸🇦' },
  { code: 'AE', name: 'UAE', nameFr: 'Émirats Arabes Unis', nameAr: 'الإمارات', currency: 'AED', flag: '🇦🇪' },
];

export function ServiceZonesModal({ isOpen, onClose, zones, onSave }: ServiceZonesModalProps) {
  const [editedZones, setEditedZones] = useState<ServiceZone[]>(
    Array.isArray(zones) ? zones : []
  );
  const [saving, setSaving] = useState(false);

  // Mettre à jour editedZones quand zones change
  useEffect(() => {
    if (Array.isArray(zones)) {
      setEditedZones(zones);
    }
  }, [zones]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editedZones);
      onClose();
    } catch (error) {
      console.error('Error saving zones:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const toggleZone = (id: string) => {
    setEditedZones(
      editedZones.map((zone) =>
        zone.id === id ? { ...zone, enabled: !zone.enabled } : zone
      )
    );
  };

  const updateZone = (id: string, field: keyof ServiceZone, value: any) => {
    setEditedZones(
      editedZones.map((zone) =>
        zone.id === id ? { ...zone, [field]: value } : zone
      )
    );
  };

  const handleCountryChange = (zoneId: string, countryCode: string) => {
    const country = COUNTRIES.find((c) => c.code === countryCode);
    if (country) {
      setEditedZones(
        editedZones.map((zone) =>
          zone.id === zoneId
            ? {
                ...zone,
                countryCode: country.code,
                country: country.nameFr,
                currency: country.currency,
              }
            : zone
        )
      );
    }
  };

  const getCountryFlag = (countryCode: string) => {
    const country = COUNTRIES.find((c) => c.code === countryCode);
    return country?.flag || '🌍';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gérer les Zones de Service">
      <div className="space-y-6">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <p className="text-sm text-blue-700">
            Sélectionnez les pays et villes où la plateforme sera disponible. La devise est automatiquement définie selon le pays.
          </p>
        </div>

        <div className="space-y-4">
          {editedZones.map((zone) => (
            <div
              key={zone.id}
              className={`border rounded-lg p-4 ${
                zone.enabled ? 'bg-white' : 'bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{getCountryFlag(zone.countryCode)}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {zone.name}, {zone.country}
                    </h3>
                    <p className="text-sm text-gray-500">{zone.nameAr}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleZone(zone.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    zone.enabled
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {zone.enabled ? 'Activée' : 'Désactivée'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Pays
                  </label>
                  <select
                    value={zone.countryCode}
                    onChange={(e) => handleCountryChange(zone.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.nameFr}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Devise
                  </label>
                  <select
                    value={zone.currency || 'EGP'}
                    onChange={(e) => updateZone(zone.id, 'currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.code} - {curr.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Ville (Français)
                  </label>
                  <input
                    type="text"
                    value={zone.name}
                    onChange={(e) => updateZone(zone.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Le Caire"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Ville (Arabe)
                  </label>
                  <input
                    type="text"
                    value={zone.nameAr}
                    onChange={(e) => updateZone(zone.id, 'nameAr', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    dir="rtl"
                    placeholder="القاهرة"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-end">
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
    </Modal>
  );
}
