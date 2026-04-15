'use client';

import { useState } from 'react';
import { Modal } from '../ui/Modal';

interface CommissionRates {
  [category: string]: {
    standard: number;
    premium: number;
  };
}

interface CommissionRatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rates: CommissionRates;
  onSave: (rates: CommissionRates) => Promise<void>;
}

export function CommissionRatesModal({ isOpen, onClose, rates, onSave }: CommissionRatesModalProps) {
  const [editedRates, setEditedRates] = useState<CommissionRates>(rates);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editedRates);
      onClose();
    } catch (error) {
      console.error('Error saving rates:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const updateRate = (category: string, segment: 'standard' | 'premium', value: number) => {
    setEditedRates({
      ...editedRates,
      [category]: {
        ...editedRates[category],
        [segment]: value,
      },
    });
  };

  const categoryLabels: Record<string, string> = {
    marketplace: 'Marketplace',
    moving_transport: 'Déménagement & Transport',
    plumbing: 'Plomberie',
    electricity: 'Électricité',
    painting: 'Peinture',
    handyman: 'Bricolage',
    cleaning: 'Nettoyage',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier les Taux de Commission">
      <div className="space-y-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Attention :</strong> Les modifications s'appliqueront à toutes les nouvelles transactions.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Standard (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Premium (%)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(editedRates).map(([category, rates]) => (
                <tr key={category}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {categoryLabels[category] || category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={rates.standard}
                      onChange={(e) => updateRate(category, 'standard', parseFloat(e.target.value))}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={rates.premium}
                      onChange={(e) => updateRate(category, 'premium', parseFloat(e.target.value))}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
