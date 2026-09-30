'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import { SUPPORTED_CURRENCIES } from '@/lib/constants';
import { formatCurrency } from '@/lib/currency';
import { apiClient } from '@/lib/api';
import { useSettings } from '@/contexts/SettingsContext';
import { useZone } from '@/contexts/ZoneContext';
import { CommissionRatesModal } from '@/components/settings/CommissionRatesModal';
import { ServiceCategoriesManager } from '@/components/settings/ServiceCategoriesManager';
import { ServiceZonesModal } from '@/components/settings/ServiceZonesModal';
import { TransportPricingModal } from '@/components/settings/TransportPricingModal';
import { ServicePricingModal } from '@/components/settings/ServicePricingModal';
import { LegalTermsCard } from '@/components/settings/LegalTermsCard';
import { LifecycleSettingsCard } from '@/components/settings/LifecycleSettingsCard';
import { PayoutSettingsCard } from '@/components/settings/PayoutSettingsCard';
import { SettingsSection, SettingsSectionsProvider } from '@/components/settings/SettingsSection';
import { SettingsGroup, SettingsToolbar } from '@/components/settings/SettingsToolbar';
import { SettingsHistoryCard } from '@/components/settings/SettingsHistoryCard';
import { SaveReviewModal } from '@/components/settings/SaveReviewModal';
import { computeChanges, diffValues, formatValue, SettingChange, validateSettings } from '@/lib/settings-review';
import Link from 'next/link';
import { MdiIcon } from '@/components/shared/MdiIcon';

const CATEGORY_LABELS: Record<string, string> = {
  moving_transport: 'Déménagement & Transport',
  plumbing: 'Plomberie',
  electricity: 'Électricité',
  painting: 'Peinture',
  handyman: 'Bricolage',
  cleaning: 'Nettoyage',
  carpentry: 'Menuiserie',
  air_condition: 'Climatisation',
  marketplace: 'Marketplace',
};

/** Réglages enregistrés par le bouton « Enregistrer », par section (les modales enregistrent elles-mêmes) */
const SECTION_KEYS: Record<string, string[]> = {
  finances: ['minBookingAmount', 'maxBookingAmount', 'currency', 'baseCurrency', 'exchangeRates'],
  support: ['supportEmail', 'supportPhone'],
  lifecycle: ['lifecycleSettings', 'cancellationFeeEnabled', 'cancellationFeeRatePct'],
  payouts: ['payoutSettings'],
  courier: ['courierSettings'],
  marketplace: ['marketplaceSettings'],
  extras: ['extraApprovalMode', 'extraAutoApprovalThreshold'],
};

const computeDisplayRates = (
  storedRates: Record<string, number>,
  base: string,
): Record<string, number> => {
  const baseRate = storedRates[base] ?? 1;
  if (!baseRate) return storedRates;
  return Object.fromEntries(
    Object.entries(storedRates).map(([code, rate]) => [code, rate / baseRate]),
  );
};

export default function SettingsPage() {
  const { settings: globalSettings, refreshSettings } = useSettings();
  const { zones: countryZones } = useZone();
  const [settings, setSettings] = useState<Record<string, any>>({});
  // Dernière version enregistrée : sert à détecter les modifications non enregistrées
  const [saved, setSaved] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshingRates, setRefreshingRates] = useState(false);
  const [lastRateUpdate, setLastRateUpdate] = useState<string | null>(null);
  const [previewBase, setPreviewBase] = useState<string | null>(null);

  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isZonesModalOpen, setIsZonesModalOpen] = useState(false);
  const [isTransportPricingModalOpen, setIsTransportPricingModalOpen] = useState(false);
  const [transportPricings, setTransportPricings] = useState<any[]>([]);

  const [isServicePricingModalOpen, setIsServicePricingModalOpen] = useState(false);
  const [servicePricingDefaultZone, setServicePricingDefaultZone] = useState<string | undefined>(undefined);
  const [servicePricings, setServicePricings] = useState<any[]>([]);
  // Catégories de services réelles (table ServiceCategory, gérée dans « Gérer les catégories »)
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const loadServiceCategories = () =>
    apiClient
      .get('/services/categories', { params: { activeOnly: false } })
      .then((data: any) => setServiceCategories(Array.isArray(data) ? data : []))
      .catch(() => setServiceCategories([]));

  // Synchroniser le state local depuis SettingsContext (source unique)
  useEffect(() => {
    if (globalSettings) {
      setSettings((prev) => ({ ...prev, ...globalSettings }));
      setSaved((prev) => ({ ...prev, ...globalSettings }));
      setLoading(false);
    }
  }, [globalSettings]);

  useEffect(() => {
    loadSettings();        // pour les champs full (updatedAt, etc.)
    loadTransportPricings();
    loadServicePricings();
    loadServiceCategories();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await apiClient.get('/admin/settings') as Record<string, any>;
      setSettings(data);
      setSaved(data);
      if (data.updatedAt) {
        setLastRateUpdate(data.updatedAt);
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
    const changes = diffValues(settings.commissionRates, rates, 'commissionRates');
    if (changes.length === 0) return;
    const recap = changes.map((c) => `• ${c.label} : ${formatValue(c.before)} → ${formatValue(c.after)}`).join('\n');
    if (!confirm(`Modifier les taux de commission ?\n\n${recap}\n\nLes nouveaux taux s'appliquent aux prochaines transactions.`)) {
      throw new Error('Modification annulée');
    }
    await apiClient.put('/admin/settings', { commissionRates: rates });
    await refreshSettings();
    await loadSettings();
    alert('Taux de commission mis à jour !');
  };

  const handleSaveZones = async (zones: any) => {
    await apiClient.put('/admin/settings', { serviceZones: zones });
    await refreshSettings();
    await loadSettings();
    await loadTransportPricings();
    await loadServicePricings();
    alert('Zones de la plateforme mises à jour !');
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

  const loadServicePricings = async () => {
    try {
      const data = await apiClient.get('/admin/service-pricing');
      setServicePricings(data as any[]);
    } catch (error) {
      console.error('Error loading service pricings:', error);
    }
  };

  const handleSaveServicePricing = async (pricing: any) => {
    await apiClient.put(`/admin/service-pricing/${pricing.id}`, pricing);
    await loadServicePricings();
  };

  const handleCreateServicePricing = async (data: any) => {
    await apiClient.post('/admin/service-pricing', data);
    await loadServicePricings();
  };

  const handleDeleteServicePricing = async (id: string) => {
    if (!confirm('Supprimer ce tarif de prestation ?')) return;
    await apiClient.delete(`/admin/service-pricing/${id}`);
    await loadServicePricings();
  };

  const handleDeleteTransportPricing = async (id: string) => {
    if (!confirm('Supprimer ce tarif de transport ? Cette action est irréversible.')) return;
    try {
      await apiClient.delete(`/admin/transport-pricing/${id}`);
      await loadTransportPricings();
    } catch {
      alert('Erreur lors de la suppression');
    }
  };

  const handleDeleteRate = (code: string) => {
    const updated = { ...(settings.exchangeRates as Record<string, number>) };
    delete updated[code];
    setSettings({ ...settings, exchangeRates: updated });
  };

  const [review, setReview] = useState<{ changes: SettingChange[]; errors: string[]; warnings: string[] } | null>(null);

  const handleSave = () => {
    const changes = computeChanges(saved, settings, Object.values(SECTION_KEYS).flat());
    const { errors, warnings } = validateSettings(settings);
    if (errors.length || warnings.length || changes.some((c) => c.sensitive)) {
      setReview({ changes, errors, warnings });
      return;
    }
    doSave();
  };

  const doSave = async () => {
    setSaving(true);
    try {
      await apiClient.put('/admin/settings', settings);
      await loadSettings(); // valeurs normalisées par le serveur
      await refreshSettings(); // Recharger les settings globaux
      setReview(null);
      alert('Paramètres sauvegardés avec succès ! La devise sera appliquée dans tout le système.');
    } catch (error: any) {
      alert('Erreur lors de la sauvegarde: ' + (error.response?.data?.message || 'Erreur inconnue'));
    } finally {
      setSaving(false);
    }
  };

  const dirtySections = useMemo(() => {
    const out = new Set<string>();
    for (const [section, keys] of Object.entries(SECTION_KEYS)) {
      if (keys.some((k) => JSON.stringify(settings[k] ?? null) !== JSON.stringify(saved[k] ?? null))) out.add(section);
    }
    return out;
  }, [settings, saved]);

  // Avertir avant de quitter la page avec des modifications non enregistrées
  useEffect(() => {
    if (dirtySections.size === 0) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirtySections]);

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

      <SettingsSectionsProvider dirty={dirtySections}>
        <SettingsToolbar />
        <div className="grid gap-8">
          <SettingsGroup title="Finances">
            <SettingsSection
              id="finances"
              saveMode="bar"
              icon="💰"
              title="Paramètres Financiers"
              description={<>Montants min. / max. de réservation, devise de référence et taux de change.</>}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant minimum de réservation
                  </label>
                  <input
                    type="number"
                    value={settings.minBookingAmount ?? ''}
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
                    value={settings.maxBookingAmount ?? ''}
                    onChange={(e) => setSettings({ ...settings, maxBookingAmount: Number(e.target.value) })}
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Devise de référence (base des taux de change)
                  </label>
                  <select
                    value={settings.baseCurrency ?? settings.currency ?? ''}
                    onChange={(e) => {
                      setSettings({ ...settings, currency: e.target.value, baseCurrency: e.target.value });
                      setPreviewBase(e.target.value);
                    }}
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {Object.values(SUPPORTED_CURRENCIES).map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name} ({currency.market})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Devise de base pour les taux de change. Chaque zone géographique conserve sa propre devise.
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
                      Dernière mise à jour : {new Date(lastRateUpdate).toLocaleString('fr-FR')}
                    </p>
                  )}
                  {settings.exchangeRates && typeof settings.exchangeRates === 'object' && Object.keys(settings.exchangeRates).length > 0 && (() => {
                    const effectiveBase = previewBase || settings.baseCurrency || settings.currency || '';
                    const displayRates = computeDisplayRates(settings.exchangeRates as Record<string, number>, effectiveBase);
                    return (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          Taux actuels (base {effectiveBase} = 1)
                          {previewBase && previewBase !== (settings.baseCurrency ?? settings.currency ?? '') && (
                            <span className="ml-2 text-blue-500 italic">— aperçu avant enregistrement</span>
                          )}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {Object.entries(displayRates).map(([code, rate]) => {
                            const curr = SUPPORTED_CURRENCIES[code as keyof typeof SUPPORTED_CURRENCIES];
                            return (
                              <div key={code} className="group flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-3 py-2 hover:border-gray-300">
                                <div className="flex items-baseline gap-1 min-w-0">
                                  <span className="text-xs font-semibold text-gray-700 shrink-0">{curr?.symbol ?? code}</span>
                                  <span className="text-xs text-gray-400 shrink-0">{code}</span>
                                  {curr?.name && <span className="text-xs text-gray-300 truncate hidden sm:inline">— {curr.name}</span>}
                                </div>
                                <div className="flex items-center gap-1 ml-2 shrink-0">
                                  <span className="text-xs text-gray-500 tabular-nums">{Number(rate).toFixed(4)}</span>
                                  <button
                                    onClick={() => handleDeleteRate(code)}
                                    title={`Supprimer ${code}`}
                                    className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 text-sm leading-none ml-1 transition-opacity"
                                  >×</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Survolez une devise pour la supprimer. Cliquez sur "Enregistrer" pour valider.</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </SettingsSection>

            <SettingsSection
              id="commissions"
              saveMode="instant"
              icon="📊"
              title="Taux de Commission par Catégorie"
              description={<>Taux de commission prélevés sur chaque transaction selon la catégorie et le segment</>}
            >
              <div className="space-y-4">

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
            </SettingsSection>

            <PayoutSettingsCard settings={settings} setSettings={setSettings} />
          </SettingsGroup>

          <SettingsGroup title="Tarifs">
            <SettingsSection
              id="transport-pricing"
              saveMode="instant"
              icon="🚚"
              title="Tarifs de Transport"
              description={<>Grilles tarifaires pour le service de déménagement et transport par zone géographique</>}
            >
              <div className="space-y-4">
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
                          Dist. palier 1
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Etage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aide
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transportPricings.length > 0 ? (
                        transportPricings.map((pricing) => {
                          const zone = countryZones.find((z) => z.id === pricing.countryId);
                          return (
                            <tr key={pricing.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {zone ? `${zone.flag ?? '🌍'} ${zone.nameFr}` : (
                                  <span className="text-amber-600" title="Pays non trouvé dans la table Country">
                                    ⚠️ {pricing.countryId ?? '—'}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {pricing.currency}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {formatCurrency(pricing.baseFareVan, pricing.currency)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {formatCurrency(pricing.baseFareSmallTruck, pricing.currency)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {formatCurrency(pricing.basefareLargeTruck, pricing.currency)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {pricing.distanceTier1Rate > 0
                                  ? `${formatCurrency(pricing.distanceTier1Rate, pricing.currency)}/km (0–${pricing.distanceTier1Max} km)`
                                  : <span className="text-gray-400">—</span>}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {pricing.floorRatePerLevel > 0
                                  ? `${formatCurrency(pricing.floorRatePerLevel, pricing.currency)}/niv.`
                                  : <span className="text-gray-400">—</span>}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {pricing.helperRatePerPerson > 0
                                  ? `${formatCurrency(pricing.helperRatePerPerson, pricing.currency)}/pers.`
                                  : <span className="text-gray-400">—</span>}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded ${pricing.isActive
                                    ? 'text-green-600 bg-green-100'
                                    : 'text-gray-600 bg-gray-100'
                                  }`}>
                                  {pricing.isActive ? 'Actif' : 'Inactif'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button
                                  onClick={() => handleDeleteTransportPricing(pricing.id)}
                                  className="text-xs text-red-400 hover:text-red-600 hover:underline"
                                >
                                  Supprimer
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-500">
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
            </SettingsSection>

            <SettingsSection
              id="service-pricing"
              saveMode="instant"
              icon="🔧"
              title="Tarification — Prestations de Services"
              description={<>Tarifs par zone géographique. Les "Paramètres" sont les règles de calcul propres à chaque métier (tarif horaire, prix au m², frais de déplacement…) utilisées par l'application mobile.</>}
            >
              <div className="overflow-x-auto">
                {(() => {
                  const allZones = countryZones;
                  const byZone = servicePricings.reduce((acc: Record<string, any[]>, p: any) => {
                    (acc[p.countryId] = acc[p.countryId] || []).push(p);
                    return acc;
                  }, {});
                  if (allZones.length === 0 && servicePricings.length === 0) {
                    return <p className="text-sm text-gray-500 py-4">Aucun tarif configuré</p>;
                  }
                  const renderPricingRow = (p: any) => {
                    const rules = p.pricingRules && typeof p.pricingRules === 'object' ? p.pricingRules : {};
                    const ruleKeys = Object.keys(rules);
                    return (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">
                          {CATEGORY_LABELS[p.categorySlug as string] ?? p.categorySlug}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                          {formatCurrency(p.basePrice, p.currency)}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm">
                          {p.urgencyEnabled
                            ? <span className="text-orange-600 font-medium">{p.urgencyMultiplier}×</span>
                            : <span className="text-gray-400">Désactivée</span>}
                        </td>
                        <td className="px-6 py-3 text-sm">
                          {ruleKeys.length > 0 ? (
                            <span className="text-gray-600 text-xs">
                              {ruleKeys.map(k => `${k}: ${rules[k]}`).join(' · ')}
                            </span>
                          ) : (
                            <span className="text-amber-500 text-xs">⚠ A configurer</span>
                          )}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${p.isActive ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'}`}>
                            {p.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleDeleteServicePricing(p.id)}
                            className="text-xs text-red-400 hover:text-red-600 hover:underline"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    );
                  };
                  return (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Catégorie', 'Prix de base', 'Urgence ×', 'Paramètres de calcul', 'Statut', ''].map(h => (
                            <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {allZones.map((zone) => {
                          const zonePricings = byZone[zone.id] ?? [];
                          return (
                            <Fragment key={zone.id}>
                              <tr className="bg-blue-50 border-t border-b border-blue-100">
                                <td colSpan={6} className="px-6 py-2">
                                  <span className="font-semibold text-sm text-blue-800">
                                    {`${zone.flag ?? '🌍'} ${zone.nameFr} (${zone.currency})`}
                                  </span>
                                </td>
                              </tr>
                              {zonePricings.length > 0 ? zonePricings.map(renderPricingRow) : (
                                <tr>
                                  <td colSpan={5} className="px-6 py-3 text-sm text-gray-400 italic">
                                    Aucun tarif configuré pour ce pays
                                  </td>
                                  <td className="px-6 py-3 text-right">
                                    <button
                                      onClick={() => { setServicePricingDefaultZone(zone.id); setIsServicePricingModalOpen(true); }}
                                      className="text-xs text-primary hover:underline font-medium"
                                      title={`Ajouter un tarif pour ${zone.nameFr}`}
                                    >
                                      + Ajouter
                                    </button>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
                        {Object.entries(byZone)
                          .filter(([zoneId]) => !allZones.find((z) => z.id === zoneId))
                          .map(([zoneId, zonePricings]) => (
                            <Fragment key={zoneId}>
                              <tr className="bg-amber-50 border-t border-b border-amber-100">
                                <td colSpan={6} className="px-6 py-2">
                                  <span className="font-semibold text-sm text-amber-700">
                                    ⚠️ Zone supprimée : {zoneId}
                                  </span>
                                </td>
                              </tr>
                              {(zonePricings as any[]).map(renderPricingRow)}
                            </Fragment>
                          ))
                        }
                      </tbody>
                    </table>
                  );
                })()}
              </div>
              <button
                onClick={() => { setServicePricingDefaultZone(undefined); setIsServicePricingModalOpen(true); }}
                className="mt-4 px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Gérer les tarifs
              </button>
            </SettingsSection>

            <SettingsSection
              id="extras"
              saveMode="bar"
              icon="➕"
              title="Approbation des Suppléments (Extras)"
              description={<>Contrôle la validation des suppléments ajoutés par les prestataires à leurs tarifs.</>}
            >
              <div className="space-y-5">
                {/* Mode */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mode d'approbation</label>
                  <div className="flex flex-col gap-3">
                    <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${(settings.extraApprovalMode ?? 'threshold') === 'threshold'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <input
                        type="radio"
                        name="extraApprovalMode"
                        value="threshold"
                        checked={(settings.extraApprovalMode ?? 'threshold') === 'threshold'}
                        onChange={() => setSettings({ ...settings, extraApprovalMode: 'threshold' })}
                        className="mt-0.5 accent-emerald-600"
                      />
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">🎯 Seuil automatique <span className="text-xs font-normal text-gray-500">(recommandé)</span></p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Les suppléments dont le prix est ≤ au seuil sont approuvés automatiquement. Les autres passent en révision manuelle.
                        </p>
                      </div>
                    </label>
                    <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${settings.extraApprovalMode === 'manual'
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <input
                        type="radio"
                        name="extraApprovalMode"
                        value="manual"
                        checked={settings.extraApprovalMode === 'manual'}
                        onChange={() => setSettings({ ...settings, extraApprovalMode: 'manual' })}
                        className="mt-0.5 accent-amber-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">🔍 Révision manuelle totale</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Tous les suppléments, quel que soit leur montant, doivent être approuvés manuellement par un admin.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Seuil — visible uniquement en mode threshold */}
                {(settings.extraApprovalMode ?? 'threshold') === 'threshold' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Seuil d'auto-approbation
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={settings.extraAutoApprovalThreshold ?? 50}
                        onChange={(e) => setSettings({ ...settings, extraAutoApprovalThreshold: Number(e.target.value) })}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
                      />
                      <span className="text-sm text-gray-500">{settings.currency ?? ''}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Les suppléments ≤ {settings.extraAutoApprovalThreshold ?? 50} {settings.currency ?? ''} sont approuvés automatiquement.
                      Au-delà, ils sont soumis à révision manuelle.
                    </p>
                  </div>
                )}
              </div>
            </SettingsSection>
          </SettingsGroup>

          <SettingsGroup title="Fonctionnement">
            <LifecycleSettingsCard settings={settings} setSettings={setSettings} />

            <SettingsSection
              id="courier"
              saveMode="bar"
              icon="🛵"
              title="CheckAllPack — Livraison 2 roues"
              description={<>Limites appliquées à la commande client, au matching et à la liste des courses visibles par chaque livreur. Un livreur ne voit que les livraisons compatibles avec son véhicule.</>}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {([
                  { key: 'motorbikeMaxWeightKg', label: 'Moto — poids max', unit: 'kg', fallback: 30, step: 1 },
                  { key: 'motorbikeMaxDistanceKm', label: 'Moto — distance max', unit: 'km', fallback: 50, step: 1 },
                  { key: 'bicycleMaxWeightKg', label: 'Vélo — poids max', unit: 'kg', fallback: 15, step: 1 },
                  { key: 'bicycleMaxDistanceKm', label: 'Vélo — distance max', unit: 'km', fallback: 15, step: 1 },
                  { key: 'baseFareMultiplier', label: 'Coefficient sur le forfait de base (vs camionnette)', unit: '×', fallback: 0.6, step: 0.05 },
                  { key: 'expressSurchargePct', label: 'Supplément livraison express', unit: '%', fallback: 25, step: 1 },
                  { key: 'bicycleMaxSpeedKmh', label: 'Vélo — vitesse suspecte au-delà de', unit: 'km/h', fallback: 35, step: 1 },
                ] as const).map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        step={field.step}
                        value={settings.courierSettings?.[field.key] ?? field.fallback}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            courierSettings: { ...(settings.courierSettings ?? {}), [field.key]: Number(e.target.value) },
                          })
                        }
                        className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-gray-500 text-sm">{field.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Le client est limité à la valeur la plus haute des deux véhicules. Le supplément express s&apos;applique au forfait de base et à la distance.
                Un livreur à vélo dont la vitesse moyenne dépasse le seuil pendant une course est averti ; au bout de 3 occurrences, les admins reçoivent une alerte e-mail.
              </p>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays où le permis est obligatoire pour un cyclomoteur (≤ 50 cm³ / électrique ≤ 4 kW)
                </label>
                <input
                  type="text"
                  value={(settings.courierSettings?.mopedLicenseRequiredCountries ?? ['FR']).join(', ')}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      courierSettings: {
                        ...(settings.courierSettings ?? {}),
                        mopedLicenseRequiredCountries: e.target.value
                          .split(',')
                          .map((c) => c.trim().toUpperCase())
                          .filter(Boolean),
                      },
                    })
                  }
                  placeholder="FR, MA"
                  className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Codes pays ISO séparés par des virgules. Ailleurs, le permis est facultatif pour un cyclomoteur ; la plaque reste toujours obligatoire pour un deux-roues motorisé.
                </p>
              </div>
            </SettingsSection>

            <SettingsSection
              id="marketplace"
              saveMode="bar"
              icon="🛍️"
              title="Marketplace"
              description={<>Règles appliquées aux commandes. La commission est déduite du vendeur : taux du vendeur, sinon du domaine de vente, sinon le taux « marketplace » des commissions ci-dessus.</>}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {([
                  { key: 'minOrderAmount', label: 'Montant minimum de commande', unit: 'devise locale', fallback: 0, help: '0 = aucun minimum' },
                  { key: 'sellerConfirmTimeoutMin', label: 'Délai de confirmation du vendeur', unit: 'min', fallback: 15, help: 'Au-delà, la commande est annulée et le client n\'est pas débité' },
                  { key: 'autoCompleteHours', label: 'Clôture automatique après livraison', unit: 'h', fallback: 24, help: 'Si le client ne confirme pas la réception, les fonds sont libérés après ce délai' },
                  { key: 'claimWindowHours', label: 'Délai de réclamation client', unit: 'h', fallback: 48, help: 'Après la livraison, le client peut signaler un problème pendant ce délai ; la réclamation suspend la clôture et le versement au vendeur' },
                  { key: 'completionReminderHoursBefore', label: 'Rappel au client avant la clôture', unit: 'h avant', fallback: 6, help: 'Le client est prévenu dès la livraison, puis relancé ce délai avant la clôture automatique (jamais moins d’1 h avant)' },
                ] as const).map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={settings.marketplaceSettings?.[field.key] ?? field.fallback}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            marketplaceSettings: { ...(settings.marketplaceSettings ?? {}), [field.key]: Number(e.target.value) },
                          })
                        }
                        className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-gray-500 text-sm">{field.unit}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{field.help}</p>
                  </div>
                ))}
              </div>
            </SettingsSection>
          </SettingsGroup>

          <SettingsGroup title="Plateforme">
            <SettingsSection
              id="sectors"
              saveMode="instant"
              icon="🧩"
              title="Secteurs de la Plateforme"
              description={<>Noms, sous-titres, icônes, images, couleurs, pays et ordre des cartes d&apos;accueil de l&apos;application ; création de nouveaux secteurs (affichés « Bientôt disponible »).</>}
            >
              <div className="space-y-4">
                <Link
                  href="/sectors"
                  className="mt-2 inline-block px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Gérer les secteurs
                </Link>
              </div>
            </SettingsSection>

            <SettingsSection
              id="categories"
              saveMode="instant"
              icon="🗂️"
              title="Catégories et Zones"
              description={<>Catégories de services proposées et zones géographiques actives.</>}
            >
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Catégories de services</h3>
                  {/* Catégories réelles (celles affichées dans l'application) et pays où elles sont proposées */}
                  <div className="mb-2 flex flex-wrap gap-2">
                    {serviceCategories.length === 0 && <p className="text-sm text-gray-600">Chargement…</p>}
                    {serviceCategories.map((cat: any) => {
                      const countries = servicePricings
                        .filter((pr: any) => pr.isActive && pr.categorySlug === cat.slug && pr.countryId)
                        .map((pr: any) => pr.countryId)
                        .sort();
                      return (
                        <span
                          key={cat.id}
                          title={countries.length ? `Proposée dans : ${countries.join(', ')}` : 'Sans tarif actif : invisible dans l’application'}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ${
                            !cat.isActive ? 'bg-gray-100 text-gray-400 line-through'
                              : countries.length ? 'bg-blue-100 text-blue-800' : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          <MdiIcon name={cat.icon} size={14} />
                          {cat.nameFr}
                          <span className="text-xs opacity-70">{countries.length ? countries.join(' · ') : '⚠ aucun pays'}</span>
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    {serviceCategories.filter((c: any) => c.isActive).length} catégorie(s) active(s). Une catégorie apparaît dans
                    l&apos;application d&apos;un pays seulement si elle a un tarif actif pour ce pays (section « Tarification des services »).
                  </p>
                  <button
                    onClick={() => setIsCategoriesModalOpen(true)}
                    className="mt-2 px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark"
                  >
                    Gérer les catégories
                  </button>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Zones de la plateforme</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Zones géographiques couvertes par la plateforme
                  </p>
                  <div className="mb-2">
                    {(globalSettings as any)?.serviceZones && Array.isArray((globalSettings as any).serviceZones) ? (
                      <div className="flex flex-wrap gap-2">
                        {(globalSettings as any).serviceZones
                          .filter((zone: any) => zone.enabled)
                          .map((zone: any) => (
                            <span
                              key={zone.id}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                            >
                              <span>{zone.flag || '🌍'}</span>
                              <span>{zone.name}, {zone.country}</span>
                            </span>
                          ))}
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
            </SettingsSection>

            <SettingsSection
              id="expansion"
              saveMode="instant"
              icon="🌍"
              title="Expansion Géographique"
              description={<>Zones géographiques configurées dans le système</>}
            >
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {(globalSettings as any)?.serviceZones && Array.isArray((globalSettings as any).serviceZones) ? (
                    (globalSettings as any).serviceZones.map((zone: any) => (
                      <div
                        key={zone.id}
                        className={`border rounded-lg p-4 ${!zone.enabled ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{zone.flag || '🌍'}</span>
                          <div>
                            <h3 className="font-semibold">{zone.country}</h3>
                            <span className={`text-xs px-2 py-1 rounded ${zone.enabled
                                ? 'text-green-600 bg-green-100'
                                : 'text-gray-600 bg-gray-100'
                              }`}>
                              {zone.enabled ? 'Actif' : 'Désactivé'}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{zone.name}</p>
                        <p className="text-xs text-gray-500">
                          Devise: {zone.currency || '—'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      Chargement des zones...
                    </div>
                  )}
                </div>
              </div>
            </SettingsSection>

            <SettingsSection
              id="support"
              saveMode="bar"
              icon="🎧"
              title="Support Client"
              description={<>E-mail et téléphone affichés aux utilisateurs pour contacter le support.</>}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de support
                  </label>
                  <input
                    type="email"
                    value={settings.supportEmail ?? ''}
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
                    value={settings.supportPhone ?? ''}
                    onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </SettingsSection>

            <SettingsSection
              id="badge"
              icon="🏅"
              title="Badge Studyltizeme"
              description={<>Programme de certification exclusif pour les professionnels</>}
            >
              <div className="space-y-4">
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
            </SettingsSection>

            <LegalTermsCard />

            <SettingsHistoryCard />
          </SettingsGroup>
        </div>
      </SettingsSectionsProvider>

      {/* Barre d'enregistrement — toujours visible */}
      <div className="sticky bottom-4 z-20 rounded-lg border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || dirtySections.size === 0}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
          <button
            onClick={loadSettings}
            disabled={saving || dirtySections.size === 0}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Annuler les modifications
          </button>
          <span className="text-sm text-gray-500">
            {dirtySections.size === 0
              ? 'Aucune modification en attente'
              : `${dirtySections.size} section(s) modifiée(s), non enregistrée(s)`}
          </span>
        </div>
      </div>

      {review && (
        <SaveReviewModal
          changes={review.changes}
          errors={review.errors}
          warnings={review.warnings}
          saving={saving}
          onConfirm={doSave}
          onClose={() => setReview(null)}
        />
      )}

      {/* Modals */}
      {(globalSettings as any)?.commissionRates && (
        <CommissionRatesModal
          isOpen={isCommissionModalOpen}
          onClose={() => setIsCommissionModalOpen(false)}
          rates={(globalSettings as any).commissionRates}
          onSave={handleSaveCommissionRates}
        />
      )}

      <ServiceCategoriesManager
        isOpen={isCategoriesModalOpen}
        onClose={() => {
          setIsCategoriesModalOpen(false);
          loadServiceCategories();
        }}
      />

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
          zones={countryZones.map((c) => ({ id: c.id, name: c.nameFr, country: c.id, flag: c.flag, currency: c.currency, enabled: c.isEnabled }))}
          onSave={handleSaveTransportPricing}
        />
      )}

      <ServicePricingModal
        isOpen={isServicePricingModalOpen}
        onClose={() => { setIsServicePricingModalOpen(false); setServicePricingDefaultZone(undefined); }}
        pricings={servicePricings}
        zones={countryZones.map((c) => ({ id: c.id, name: c.nameFr, country: c.id, flag: c.flag, currency: c.currency, enabled: c.isEnabled }))}
        defaultZoneId={servicePricingDefaultZone}
        onSave={handleSaveServicePricing}
        onCreate={handleCreateServicePricing}
        onDelete={handleDeleteServicePricing}
      />
    </div>
  );
}
