'use client';

import { useState, useEffect } from 'react';
import { SUPPORTED_CURRENCIES } from '@/lib/constants';
import { apiClient } from '@/lib/api';
import { useSettings } from '@/contexts/SettingsContext';
import { CommissionRatesModal } from '@/components/settings/CommissionRatesModal';
import { CategoriesModal } from '@/components/settings/CategoriesModal';
import { ServiceZonesModal } from '@/components/settings/ServiceZonesModal';
import { TransportPricingModal } from '@/components/settings/TransportPricingModal';

export default function SettingsPage() {
  const { settings: globalSettings, refreshSettings } = useSettings();
  const [settings, setSettings] = useState({
    minBookingAmount: 50,
    maxBookingAmount: 10000,
    currency: 'EGP',
    supportEmail: 'support@checkallat.com',
    supportPhone: '+20 123 456 7890',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshingRates, setRefreshingRates] = useState(false);
  const [lastRateUpdate, setLastRateUpdate] = useState<string | null>(null);

  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isZonesModalOpen, setIsZonesModalOpen] = useState(false);
  const [isTransportPricingModalOpen, setIsTransportPricingModalOpen] = useState(false);
  const [transportPricings, setTransportPricings] = useState<any[]>([]);

  useEffect(() => {
    loadSettings();
    loadTransportPricings();
  }, []);

  useEffect(() => {
    if (globalSettings) {
      setSettings(globalSettings);
    }
  }, [globalSettings]);

  const loadSettings = async () => {
    try {
      const data = await apiClient.get('/admin/settings');
      setSettings(data as typeof settings);
      if ((data as any).updatedAt) {
        setLastRateUpdate((data as any).updatedAt);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransportPricings = async () => {
    try {
      const data = await apiClient.get('/admin/transport-pricing');
      setTransportPricings(data as any[]);
    } catch (error) {
      console.error('Error loading transport pricings:', error);
    }
  };

  const handleRefreshRates = async () => {
    setRefreshingRates(true);
    try {
      const response = await apiClient.post('/admin/settings/exchange-rates/refresh', {});
      await refreshSettings();
      await loadSettings();
      alert('Taux de change mis à jour avec succès !');
    } catch (error: any) {
      alert('Erreur lors de la mise à jour des taux: ' + (error.response?.data?.message || 'Erreur inconnue'));
    } finally {
      setRefreshingRates(false);
    }
  };

  const handleSaveCommissionRates = async (rates: any) => {
    await apiClient.put('/admin/settings', { commissionRates: rates });
    await refreshSettings();
    await loadSettings();
    alert('Taux de commission mis à jour !');
  };

  const handleSaveCategories = async (categories: any) => {
    await apiClient.put('/admin/settings', { serviceCategories: categories });
    await refreshSettings();
    await loadSettings();
    alert('Catégories mises à jour !');
  };

  const handleSaveZones = async (zones: any) => {
    await apiClient.put('/admin/settings', { serviceZones: zones });
    await refreshSettings();
    await loadSettings();
    alert('Zones de service mises à jour !');
  };

  const handleSaveTransportPricing = async (pricings: any[]) => {
    try {
      for (const pricing of pricings) {
        await apiClient.put(`/admin/transport-pricing/${pricing.id}`, pricing);
      }
      await loadTransportPricings();
      alert('Tarifs de transport mis à jour !');
    } catch (error) {
      console.error('Error saving transport pricing:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put('/admin/settings', settings);
      await refreshSettings(); // Recharger les settings globaux
      alert('Paramètres sauvegardés avec succès ! La devise sera appliquée dans tout le système.');
    } catch (error: any) {
      alert('Erreur lors de la sauvegarde: ' + (error.response?.data?.message || 'Erreur inconnue'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600">
          Configuration de la plateforme CheckAll@t
        </p>
      </div>

      <div className="grid gap-6">
        {/* Paramètres financiers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Paramètres Financiers</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant minimum de réservation
              </label>
              <input
                type="number"
                value={settings.minBookingAmount}
                onChange={(e) => setSettings({ ...settings, minBookingAmount: Number(e.target.value) })}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant maximum de réservation
              </label>
              <input
                type="number"
                value={settings.maxBookingAmount}
                onChange={(e) => setSettings({ ...settings, maxBookingAmount: Number(e.target.value) })}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Devise par défaut (Marché actuel)
              </label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {Object.values(SUPPORTED_CURRENCIES).map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name} ({currency.market})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Devise utilisée pour ce marché géographique
              </p>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Taux de change en temps réel
                </label>
                <button
                  onClick={handleRefreshRates}
                  disabled={refreshingRates}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className={`h-4 w-4 ${refreshingRates ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {refreshingRates ? 'Mise à jour...' : 'Mettre à jour les taux'}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Les taux de change sont récupérés en temps réel depuis une API externe pour garantir des conversions précises.
              </p>
              {lastRateUpdate && (
                <p className="text-xs text-gray-400 mt-1">
                  Dernière mise à jour: {new Date(lastRateUpdate).toLocaleString('fr-FR')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Taux de commission */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Taux de Commission par Catégorie</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Taux de commission prélevés sur chaque transaction selon la catégorie et le segment
            </p>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Standard
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Premium
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(globalSettings as any)?.commissionRates && typeof (globalSettings as any).commissionRates === 'object' ? (
                    Object.entries((globalSettings as any).commissionRates).map(([category, rates]: [string, any]) => (
                      <tr key={category}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                          {category === 'marketplace' ? 'Marketplace' :
                           category === 'moving_transport' ? 'Déménagement & Transport' :
                           category === 'plumbing' ? 'Plomberie' :
                           category === 'electricity' ? 'Électricité' :
                           category === 'painting' ? 'Peinture' :
                           category === 'handyman' ? 'Bricolage' :
                           category === 'cleaning' ? 'Nettoyage' :
                           category.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {rates.standard}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {rates.premium}%
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                        Chargement...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setIsCommissionModalOpen(true)}
              className="mt-4 px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Modifier les taux
            </button>
          </div>
        </div>

        {/* Paramètres de support */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Support Client</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de support
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone de support
              </label>
              <input
                type="tel"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Catégories et zones */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Catégories et Zones</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Catégories de services</h3>
              <div className="mb-2">
                {(globalSettings as any)?.serviceCategories && Array.isArray((globalSettings as any).serviceCategories) ? (
                  <div className="flex flex-wrap gap-2">
                    {(globalSettings as any).serviceCategories
                      .filter((cat: any) => cat.enabled)
                      .map((cat: any) => (
                        <span
                          key={cat.id}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          <span>
                            {cat.icon === 'truck' && '🚚'}
                            {cat.icon === 'wrench' && '🔧'}
                            {cat.icon === 'zap' && '⚡'}
                            {cat.icon === 'paint-brush' && '🎨'}
                            {cat.icon === 'tool' && '🔨'}
                            {cat.icon === 'sparkles' && '✨'}
                            {cat.icon === 'shopping-bag' && '🛍️'}
                          </span>
                          <span>{cat.name}</span>
                        </span>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Chargement...</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-2">
                {(globalSettings as any)?.serviceCategories?.length || 0} catégorie(s) configurée(s)
              </p>
              <button
                onClick={() => setIsCategoriesModalOpen(true)}
                className="mt-2 px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Gérer les catégories
              </button>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Zones de service</h3>
              <p className="text-sm text-gray-600 mb-2">
                Zones géographiques couvertes par la plateforme
              </p>
              <div className="mb-2">
                {(globalSettings as any)?.serviceZones && Array.isArray((globalSettings as any).serviceZones) ? (
                  <div className="flex flex-wrap gap-2">
                    {(globalSettings as any).serviceZones
                      .filter((zone: any) => zone.enabled)
                      .map((zone: any) => {
                        const countryFlags: Record<string, string> = {
                          EG: '🇪🇬', FR: '🇫🇷', SN: '🇸🇳', ML: '🇲🇱',
                        };
                        return (
                          <span
                            key={zone.id}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                          >
                            <span>{countryFlags[zone.countryCode] || '🌍'}</span>
                            <span>{zone.name}, {zone.country}</span>
                          </span>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Chargement...</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-2">
                {Array.isArray((globalSettings as any)?.serviceZones) ? (globalSettings as any).serviceZones.filter((z: any) => z.enabled).length : 0} zone(s) active(s)
              </p>
              <button
                onClick={() => setIsZonesModalOpen(true)}
                className="mt-2 px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Gérer les zones
              </button>
            </div>
          </div>
        </div>

        {/* Badge Studyltizeme */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Badge Studyltizeme</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Programme de certification exclusif pour les professionnels
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Avantages diplômés Studyltizeme:</strong>
                  </p>
                  <ul className="text-xs text-blue-600 mt-2 list-disc list-inside">
                    <li>+10 points dans l'algorithme de matching</li>
                    <li>Commission réduite: 8% (vs 10-12% standard)</li>
                    <li>Badge visuel distinctif dans l'app</li>
                    <li>Accès formations continues gratuites</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut du programme
                </label>
                <select className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>En développement</option>
                  <option>Actif</option>
                  <option>Désactivé</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Transport Pricing */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tarifs de Transport</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Grilles tarifaires pour le service de déménagement et transport par zone géographique
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Devise
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fourgon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Petit camion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grand camion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transportPricings.length > 0 ? (
                    transportPricings.map((pricing) => (
                      <tr key={pricing.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 uppercase">
                          {pricing.serviceZoneId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {pricing.currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {pricing.baseFareVan} {pricing.currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {pricing.baseFareSmallTruck} {pricing.currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {pricing.basefareLargeTruck} {pricing.currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${
                            pricing.isActive
                              ? 'text-green-600 bg-green-100'
                              : 'text-gray-600 bg-gray-100'
                          }`}>
                            {pricing.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucun tarif configuré
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setIsTransportPricingModalOpen(true)}
              className="mt-4 px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Modifier les tarifs
            </button>
          </div>
        </div>

        {/* Expansion géographique */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Expansion Géographique</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Zones géographiques configurées dans le système
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {(globalSettings as any)?.serviceZones && Array.isArray((globalSettings as any).serviceZones) ? (
                (globalSettings as any).serviceZones.map((zone: any) => {
                  const countryFlags: Record<string, string> = {
                    EG: '🇪🇬', FR: '🇫🇷', SN: '🇸🇳', ML: '🇲🇱',
                    DZ: '🇩🇿', SA: '🇸🇦', AE: '🇦🇪',
                  };

                  return (
                    <div
                      key={zone.id}
                      className={`border rounded-lg p-4 ${!zone.enabled ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{countryFlags[zone.countryCode] || '🌍'}</span>
                        <div>
                          <h3 className="font-semibold">{zone.country}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${
                            zone.enabled
                              ? 'text-green-600 bg-green-100'
                              : 'text-gray-600 bg-gray-100'
                          }`}>
                            {zone.enabled ? 'Actif' : 'Désactivé'}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{zone.name}</p>
                      <p className="text-xs text-gray-500">
                        Devise: {zone.currency || 'EGP'}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  Chargement des zones...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
          <button
            onClick={loadSettings}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Annuler
          </button>
        </div>
      </div>

      {/* Modals */}
      {(globalSettings as any)?.commissionRates && (
        <CommissionRatesModal
          isOpen={isCommissionModalOpen}
          onClose={() => setIsCommissionModalOpen(false)}
          rates={(globalSettings as any).commissionRates}
          onSave={handleSaveCommissionRates}
        />
      )}

      {(globalSettings as any)?.serviceCategories && (
        <CategoriesModal
          isOpen={isCategoriesModalOpen}
          onClose={() => setIsCategoriesModalOpen(false)}
          categories={(globalSettings as any).serviceCategories}
          onSave={handleSaveCategories}
        />
      )}

      {(globalSettings as any)?.serviceZones && (
        <ServiceZonesModal
          isOpen={isZonesModalOpen}
          onClose={() => setIsZonesModalOpen(false)}
          zones={(globalSettings as any).serviceZones}
          onSave={handleSaveZones}
        />
      )}

      {transportPricings.length > 0 && (
        <TransportPricingModal
          isOpen={isTransportPricingModalOpen}
          onClose={() => setIsTransportPricingModalOpen(false)}
          pricings={transportPricings}
          onSave={handleSaveTransportPricing}
        />
      )}
    </div>
  );
}
