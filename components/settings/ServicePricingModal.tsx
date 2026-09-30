'use client';

import { useState, useEffect } from 'react';
import { SUPPORTED_CURRENCIES } from '@/lib/constants';
import { formatCurrency } from '@/lib/currency';

interface ServicePricing {
  id: string;
  categorySlug: string;
  countryId: string;
  currency: string;
  basePrice: number;
  urgencyEnabled: boolean;
  urgencyMultiplier: number;
  pricingRules: Record<string, any>;
  isActive: boolean;
  notes?: string;
  /** "flat" (forfait) | "hourly" (déplacement + tarif horaire × durée) */
  pricingMode?: 'flat' | 'hourly';
  hourlyRate?: number | null;
  callOutFee?: number;
  minimumHours?: number;
}

/** Métiers conseillés à l'heure (le choix reste libre pour chaque métier et chaque pays) */
const HOURLY_BY_DEFAULT = ['plumbing', 'electricity', 'handyman', 'carpentry', 'cleaning'];

/** Règles JSON avancées : éditées en texte, appliquées seulement si le JSON est valide */
function AdvancedRules({ value, onChange }: { value: Record<string, any>; onChange: (v: Record<string, any>) => void }) {
  const [text, setText] = useState(() => JSON.stringify(value ?? {}, null, 2));
  const [error, setError] = useState<string | null>(null);
  return (
    <details className="rounded border border-gray-200 px-3 py-2">
      <summary className="cursor-pointer text-xs text-gray-600">Règles avancées (JSON, facultatif — m², unités…)</summary>
      <textarea
        rows={4}
        className="mt-2 w-full border rounded px-3 py-2 text-sm font-mono"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          try {
            const parsed = JSON.parse(e.target.value || '{}');
            if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
            setError(null);
            onChange(parsed);
          } catch {
            setError('JSON invalide : la modification n’est pas prise en compte.');
          }
        }}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </details>
  );
}

interface ServiceZone {
  id: string;
  name: string;
  country: string;
  flag?: string;
  currency: string;
  enabled: boolean;
}

interface ServicePricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pricings: ServicePricing[];
  zones?: ServiceZone[];
  defaultZoneId?: string;
  onSave: (updated: ServicePricing) => Promise<void>;
  onCreate: (data: Omit<ServicePricing, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

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

const DEFAULT_PRICING_RULES: Record<string, Record<string, any>> = {
  plumbing:    { perHour: 0, callOutFee: 0, minimumHours: 1 },
  electricity: { perHour: 0, callOutFee: 0, minimumHours: 1 },
  painting:    { pricePerSqMeter: 0, ceilingMultiplier: 1.3 },
  cleaning:    { pricePerSqMeter: 0, deepMultiplier: 1.5, weeklyDiscount: 0.1 },
  handyman:    { perHour: 0, minimumHours: 1 },
  carpentry:   { perHour: 0, materialMarkup: 1.2 },
  air_condition: { perUnit: 0, installFee: 0 },
};

export function ServicePricingModal({ isOpen, onClose, pricings, zones = [], defaultZoneId, onSave, onCreate, onDelete }: ServicePricingModalProps) {
  const initialZoneId = defaultZoneId ?? zones[0]?.id ?? 'cairo';
  const initialCurrency = zones.find((z) => z.id === initialZoneId)?.currency ?? zones[0]?.currency ?? '';

  const [items, setItems] = useState<ServicePricing[]>(pricings);
  const [selected, setSelected] = useState<ServicePricing | null>(pricings[0] ?? null);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(!!defaultZoneId);
  const [newForm, setNewForm] = useState({
    categorySlug: 'plumbing',
    countryId: initialZoneId,
    currency: initialCurrency,
    basePrice: 200,
    urgencyEnabled: true,
    urgencyMultiplier: 1.3,
    isActive: true,
    notes: '',
  });

  useEffect(() => {
    setItems(pricings);
    setSelected(pricings.find((p) => p.id === selected?.id) ?? pricings[0] ?? null);
  }, [pricings]);

  useEffect(() => {
    if (defaultZoneId) {
      const zone = zones.find((z) => z.id === defaultZoneId);
      setNewForm((f) => ({ ...f, countryId: defaultZoneId, currency: zone?.currency ?? f.currency }));
      setShowCreate(true);
    }
  }, [defaultZoneId, zones]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await onSave(selected);
      alert('Tarif mis à jour !');
      onClose();
    } catch { alert('Erreur lors de la sauvegarde'); } finally { setSaving(false); }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const pricingRules = DEFAULT_PRICING_RULES[newForm.categorySlug] ?? {};
      await onCreate({ ...newForm, pricingRules });
      alert('Tarif créé !');
      setShowCreate(false);
    } catch (e: any) {
      alert('Erreur: ' + (e?.message ?? 'Erreur inconnue'));
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce tarif ?')) return;
    try { await onDelete(id); }
    catch { alert('Erreur lors de la suppression'); }
  };

  const updateSelected = (field: keyof ServicePricing, value: any) => {
    if (!selected) return;
    setSelected({ ...selected, [field]: value });
  };

  const handleZoneChange = (zoneId: string) => {
    const zone = zones.find((z) => z.id === zoneId);
    setNewForm((f) => ({
      ...f,
      countryId: zoneId,
      currency: zone?.currency ?? f.currency,
    }));
  };

  const getZoneLabel = (zoneId: string) => {
    const zone = zones.find((z) => z.id === zoneId);
    return zone ? `${zone.flag ?? '🌍'} ${zone.name}` : zoneId;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Tarifs Prestations de Services</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar — groupée par zone */}
          <div className="w-60 border-r overflow-y-auto bg-gray-50 flex-shrink-0">
            {Object.entries(
              items.reduce((acc: Record<string, ServicePricing[]>, p) => {
                (acc[p.countryId] = acc[p.countryId] || []).push(p);
                return acc;
              }, {})
            ).map(([zoneId, group]) => {
              const zone = zones.find((z) => z.id === zoneId);
              return (
                <div key={zoneId}>
                  {/* Header zone */}
                  <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-100 border-b border-gray-200 sticky top-0 flex items-center gap-1.5">
                    <span>{zone?.flag ?? '🌍'}</span>
                    <span className="truncate">{zone?.name ?? zoneId}</span>
                    <span className="ml-auto text-gray-400 normal-case font-normal">{zone?.currency ?? ''}</span>
                  </div>
                  {/* Tarifs par catégorie */}
                  {group.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setSelected(p); setShowCreate(false); }}
                      className={`w-full text-left px-4 py-2.5 border-b text-sm transition-colors ${
                        selected?.id === p.id && !showCreate
                          ? 'bg-primary/10 border-l-2 border-l-primary'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`text-xs font-medium truncate ${selected?.id === p.id && !showCreate ? 'text-primary' : 'text-gray-700'}`}>
                        {CATEGORY_LABELS[p.categorySlug] ?? p.categorySlug}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {p.isActive ? 'Actif' : 'Inactif'}
                        </span>
                        <span className="text-xs text-gray-500">{formatCurrency(p.basePrice, p.currency)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
            <button
              onClick={() => { setShowCreate(true); setSelected(null); }}
              className="w-full px-4 py-3 text-sm text-primary font-medium hover:bg-primary/5 flex items-center gap-1"
            >
              <span className="text-lg leading-none">+</span> Nouveau tarif
            </button>
          </div>

          {/* Panel principal */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Formulaire de création */}
            {showCreate && (
              <div className="p-4 border rounded-lg bg-blue-50 space-y-4">
                <h3 className="font-semibold text-gray-800">Nouveau tarif de prestation</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Catégorie <span className="text-red-500">*</span></label>
                    <select
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={newForm.categorySlug}
                      onChange={(e) => setNewForm((f) => ({ ...f, categorySlug: e.target.value }))}
                    >
                      {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Zone <span className="text-red-500">*</span></label>
                    {zones.length > 0 ? (
                      <select
                        className="w-full border rounded px-3 py-2 text-sm"
                        value={newForm.countryId}
                        onChange={(e) => handleZoneChange(e.target.value)}
                      >
                        {zones.map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.flag ?? '🌍'} {z.name}, {z.country} — {z.currency}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="ex: cairo"
                        value={newForm.countryId}
                        onChange={(e) => setNewForm((f) => ({ ...f, countryId: e.target.value }))}
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Devise</label>
                    <select
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={newForm.currency}
                      onChange={(e) => setNewForm((f) => ({ ...f, currency: e.target.value }))}
                    >
                      {Object.keys(SUPPORTED_CURRENCIES).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Prix de base</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        className="flex-1 border rounded px-3 py-2 text-sm"
                        value={newForm.basePrice}
                        onChange={(e) => setNewForm((f) => ({ ...f, basePrice: Number(e.target.value) }))}
                      />
                      <span className="text-xs text-gray-500">{newForm.currency}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        id="newUrgencyEnabled"
                        checked={newForm.urgencyEnabled}
                        onChange={(e) => setNewForm((f) => ({ ...f, urgencyEnabled: e.target.checked }))}
                      />
                      <label htmlFor="newUrgencyEnabled" className="text-xs text-gray-600">Majoration immédiat activée</label>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      disabled={!newForm.urgencyEnabled}
                      className={`w-full border rounded px-3 py-2 text-sm ${!newForm.urgencyEnabled ? 'opacity-40 cursor-not-allowed bg-gray-100' : ''}`}
                      value={newForm.urgencyMultiplier}
                      onChange={(e) => setNewForm((f) => ({ ...f, urgencyMultiplier: Number(e.target.value) }))}
                    />
                    <p className="text-xs text-gray-400 mt-0.5">
                      {newForm.urgencyEnabled
                        ? `×${newForm.urgencyMultiplier} sur commandes immédiates`
                        : 'Désactivé — même prix que planifié'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="newActive"
                      checked={newForm.isActive}
                      onChange={(e) => setNewForm((f) => ({ ...f, isActive: e.target.checked }))}
                    />
                    <label htmlFor="newActive" className="text-sm text-gray-700">Actif dès la création</label>
                  </div>
                </div>

                {DEFAULT_PRICING_RULES[newForm.categorySlug] && (
                  <p className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    Les règles tarifaires par défaut pour "{CATEGORY_LABELS[newForm.categorySlug]}" seront appliquées automatiquement.
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleCreate}
                    disabled={saving}
                    className="px-4 py-2 bg-primary text-white text-sm rounded hover:bg-primary-dark disabled:opacity-50"
                  >
                    {saving ? 'Création...' : 'Créer le tarif'}
                  </button>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Formulaire d'édition */}
            {selected && !showCreate && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-800">
                    {CATEGORY_LABELS[selected.categorySlug] ?? selected.categorySlug}
                    {' — '}
                    <span className="text-gray-500">{getZoneLabel(selected.countryId)}</span>
                  </h3>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Supprimer
                  </button>
                </div>

                {/* Mode de tarification */}
                <div className="rounded-lg border border-gray-200 p-3 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-600 mr-1">Tarification :</span>
                    {(['flat', 'hourly'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => updateSelected('pricingMode', mode)}
                        className={`px-3 py-1.5 text-sm rounded-md border ${
                          (selected.pricingMode ?? 'flat') === mode
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {mode === 'flat' ? 'Forfait' : 'À l’heure'}
                      </button>
                    ))}
                    {HOURLY_BY_DEFAULT.includes(selected.categorySlug) && (selected.pricingMode ?? 'flat') === 'flat' && (
                      <span className="text-xs text-amber-600">Métier généralement facturé à l’heure</span>
                    )}
                  </div>

                  {(selected.pricingMode ?? 'flat') === 'hourly' ? (
                    <>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Tarif horaire</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              className="flex-1 border rounded px-3 py-2 text-sm"
                              value={selected.hourlyRate ?? ''}
                              onChange={(e) => updateSelected('hourlyRate', e.target.value === '' ? null : Number(e.target.value))}
                            />
                            <span className="text-xs text-gray-500">{selected.currency}/h</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Frais de déplacement</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              className="flex-1 border rounded px-3 py-2 text-sm"
                              value={selected.callOutFee ?? 0}
                              onChange={(e) => updateSelected('callOutFee', Number(e.target.value))}
                            />
                            <span className="text-xs text-gray-500">{selected.currency}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Minimum facturé</label>
                          <select
                            className="w-full border rounded px-3 py-2 text-sm"
                            value={selected.minimumHours ?? 1}
                            onChange={(e) => updateSelected('minimumHours', Number(e.target.value))}
                          >
                            {[0.5, 1, 1.5, 2, 3, 4].map((h) => (
                              <option key={h} value={h}>{h === 0.5 ? '30 min' : `${h} h`}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {!(Number(selected.hourlyRate) > 0) ? (
                        <p className="text-xs text-red-600">Indiquez un tarif horaire : sans lui, le métier reste facturé au forfait.</p>
                      ) : (
                        <p className="text-xs text-gray-500">
                          Exemple affiché au client pour 2 h :{' '}
                          <strong>
                            {formatCurrency(selected.callOutFee ?? 0, selected.currency)} + {formatCurrency(Number(selected.hourlyRate), selected.currency)}/h × 2 h ={' '}
                            {formatCurrency((selected.callOutFee ?? 0) + Number(selected.hourlyRate) * Math.max(2, selected.minimumHours ?? 1), selected.currency)}
                          </strong>
                          . Temps réel facturé par tranches de 15 min, au moins {selected.minimumHours ?? 1} h, jamais au-delà de la durée choisie sans l’accord du client.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-gray-500">Le client paie le prix de base ci-dessous, quel que soit le temps passé.</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      {(selected.pricingMode ?? 'flat') === 'hourly' ? 'Prix de base (utilisé si le tarif horaire est retiré)' : 'Prix de base (forfait)'}
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        className="flex-1 border rounded px-3 py-2 text-sm"
                        value={selected.basePrice}
                        onChange={(e) => updateSelected('basePrice', Number(e.target.value))}
                      />
                      <span className="text-xs text-gray-500">{selected.currency}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatCurrency(selected.basePrice, selected.currency)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Devise</label>
                    <select
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={selected.currency}
                      onChange={(e) => updateSelected('currency', e.target.value)}
                    >
                      {Object.keys(SUPPORTED_CURRENCIES).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        id="urgencyEnabled"
                        checked={selected.urgencyEnabled ?? true}
                        onChange={(e) => updateSelected('urgencyEnabled', e.target.checked)}
                      />
                      <label htmlFor="urgencyEnabled" className="text-xs text-gray-600">Majoration immédiat activée</label>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      disabled={!(selected.urgencyEnabled ?? true)}
                      className={`w-full border rounded px-3 py-2 text-sm ${!(selected.urgencyEnabled ?? true) ? 'opacity-40 cursor-not-allowed bg-gray-100' : ''}`}
                      value={selected.urgencyMultiplier}
                      onChange={(e) => updateSelected('urgencyMultiplier', Number(e.target.value))}
                    />
                    <p className="text-xs text-gray-400 mt-0.5">
                      {(selected.urgencyEnabled ?? true)
                        ? `Prix immédiat : ${formatCurrency(selected.basePrice * selected.urgencyMultiplier, selected.currency)}`
                        : 'Désactivé — même prix que planifié'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={selected.isActive}
                      onChange={(e) => updateSelected('isActive', e.target.checked)}
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">Tarif actif</label>
                  </div>
                </div>

                <div>
                  <AdvancedRules
                    key={selected.id}
                    value={selected.pricingRules}
                    onChange={(v) => updateSelected('pricingRules', v)}
                  />
                  {DEFAULT_PRICING_RULES[selected.categorySlug] && (
                    <p className="text-xs text-gray-400 mt-1">
                      Exemple pour {CATEGORY_LABELS[selected.categorySlug]} :{' '}
                      {JSON.stringify(DEFAULT_PRICING_RULES[selected.categorySlug])}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Notes internes</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={selected.notes ?? ''}
                    onChange={(e) => updateSelected('notes', e.target.value)}
                  />
                </div>
              </div>
            )}

            {!selected && !showCreate && (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Sélectionnez un tarif à modifier ou créez-en un nouveau
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm">
            Fermer
          </button>
          {selected && !showCreate && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 text-sm"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
