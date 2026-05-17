'use client';

import { useState, useEffect } from 'react';

interface ServicePricing {
  id: string;
  categorySlug: string;
  serviceZoneId: string;
  currency: string;
  basePrice: number;
  urgencyMultiplier: number;
  pricingRules: Record<string, any>;
  isActive: boolean;
  notes?: string;
}

interface ServicePricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pricings: ServicePricing[];
  onSave: (updated: ServicePricing) => Promise<void>;
  onCreate: (data: Omit<ServicePricing, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const CATEGORY_LABELS: Record<string, string> = {
  plumbing: 'Plomberie',
  electricity: 'Électricité',
  painting: 'Peinture',
  handyman: 'Bricolage',
  cleaning: 'Nettoyage',
  carpentry: 'Menuiserie',
  air_condition: 'Climatisation',
};

export function ServicePricingModal({ isOpen, onClose, pricings, onSave, onCreate, onDelete }: ServicePricingModalProps) {
  const [items, setItems] = useState<ServicePricing[]>(pricings);
  const [selected, setSelected] = useState<ServicePricing | null>(pricings[0] ?? null);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newForm, setNewForm] = useState({ categorySlug: 'plumbing', serviceZoneId: 'cairo', currency: 'EGP', basePrice: 200, urgencyMultiplier: 1.3, isActive: true, notes: '' });

  useEffect(() => {
    setItems(pricings);
    setSelected(pricings.find(p => p.id === selected?.id) ?? pricings[0] ?? null);
  }, [pricings]);

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
      await onCreate({ ...newForm, pricingRules: {} });
      alert('Tarif créé !');
      setShowCreate(false);
    } catch (e: any) {
      alert('Erreur: ' + (e?.message ?? 'Erreur inconnue'));
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce tarif ?')) return;
    try {
      await onDelete(id);
      alert('Tarif supprimé');
    } catch { alert('Erreur lors de la suppression'); }
  };

  const updateSelected = (field: keyof ServicePricing, value: any) => {
    if (!selected) return;
    setSelected({ ...selected, [field]: value });
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
          {/* Sidebar — liste des tarifs */}
          <div className="w-56 border-r overflow-y-auto bg-gray-50">
            {items.map(p => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`w-full text-left px-4 py-3 border-b text-sm transition-colors ${selected?.id === p.id ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <div className="font-medium">{CATEGORY_LABELS[p.categorySlug] ?? p.categorySlug}</div>
                <div className="text-xs text-gray-400 uppercase">{p.serviceZoneId} · {p.currency}</div>
                <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded ${p.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {p.isActive ? 'Actif' : 'Inactif'}
                </span>
              </button>
            ))}
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="w-full px-4 py-3 text-sm text-primary font-medium hover:bg-primary/5 flex items-center gap-1"
            >
              <span className="text-lg leading-none">+</span> Nouveau tarif
            </button>
          </div>

          {/* Panel principal */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Formulaire de création */}
            {showCreate && (
              <div className="mb-6 p-4 border rounded-lg bg-blue-50">
                <h3 className="font-semibold text-gray-800 mb-3">Nouveau tarif</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Catégorie</label>
                    <select className="w-full border rounded px-3 py-2 text-sm" value={newForm.categorySlug} onChange={e => setNewForm(f => ({ ...f, categorySlug: e.target.value }))}>
                      {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Zone</label>
                    <input className="w-full border rounded px-3 py-2 text-sm" value={newForm.serviceZoneId} onChange={e => setNewForm(f => ({ ...f, serviceZoneId: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Devise</label>
                    <input className="w-full border rounded px-3 py-2 text-sm" value={newForm.currency} onChange={e => setNewForm(f => ({ ...f, currency: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Prix de base</label>
                    <input type="number" className="w-full border rounded px-3 py-2 text-sm" value={newForm.basePrice} onChange={e => setNewForm(f => ({ ...f, basePrice: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Multiplicateur urgence</label>
                    <input type="number" step="0.1" className="w-full border rounded px-3 py-2 text-sm" value={newForm.urgencyMultiplier} onChange={e => setNewForm(f => ({ ...f, urgencyMultiplier: Number(e.target.value) }))} />
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <input type="checkbox" id="newActive" checked={newForm.isActive} onChange={e => setNewForm(f => ({ ...f, isActive: e.target.checked }))} />
                    <label htmlFor="newActive" className="text-sm text-gray-700">Actif</label>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={handleCreate} disabled={saving} className="px-4 py-2 bg-primary text-white text-sm rounded hover:bg-primary-dark disabled:opacity-50">
                    {saving ? 'Création...' : 'Créer'}
                  </button>
                  <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300">
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {selected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{CATEGORY_LABELS[selected.categorySlug] ?? selected.categorySlug} — <span className="uppercase text-gray-500">{selected.serviceZoneId}</span></h3>
                  <button onClick={() => handleDelete(selected.id)} className="text-xs text-red-500 hover:underline">Supprimer</button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Prix de base" type="number" value={selected.basePrice} onChange={v => updateSelected('basePrice', Number(v))} />
                  <Field label="Devise" value={selected.currency} onChange={v => updateSelected('currency', v)} />
                  <Field label="Multiplicateur urgence" type="number" step="0.1" value={selected.urgencyMultiplier} onChange={v => updateSelected('urgencyMultiplier', Number(v))} />
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={selected.isActive}
                      onChange={e => updateSelected('isActive', e.target.checked)}
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">Actif</label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Règles tarifaires (JSON)</label>
                  <textarea
                    rows={4}
                    className="w-full border rounded px-3 py-2 text-sm font-mono"
                    value={JSON.stringify(selected.pricingRules, null, 2)}
                    onChange={e => {
                      try { updateSelected('pricingRules', JSON.parse(e.target.value)); } catch { /* ignore invalid JSON */ }
                    }}
                  />
                  <p className="text-xs text-gray-400 mt-1">Ex: {'{"minCallout": 150, "perHour": 100}'}</p>
                </div>

                <Field label="Notes internes" value={selected.notes ?? ''} onChange={v => updateSelected('notes', v)} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Sélectionnez un tarif à modifier
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm">
            Fermer
          </button>
          {selected && (
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 text-sm">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const Field = ({ label, value, onChange, type = 'text', step }: { label: string; value: any; onChange: (v: string) => void; type?: string; step?: string }) => (
  <div>
    <label className="block text-xs text-gray-500 mb-1">{label}</label>
    <input type={type} step={step} className="w-full border rounded px-3 py-2 text-sm" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);
