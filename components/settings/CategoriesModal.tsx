'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';

interface Category {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  enabled: boolean;
}

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSave: (categories: Category[]) => Promise<void>;
}

const ICON_OPTIONS = [
  { value: 'wrench',       label: '🔧 Plomberie' },
  { value: 'zap',          label: '⚡ Électricité' },
  { value: 'paint-brush',  label: '🎨 Peinture' },
  { value: 'tool',         label: '🔨 Bricolage' },
  { value: 'broom',        label: '🧹 Ménage / Nettoyage' },
  { value: 'saw',          label: '🪚 Menuiserie / Charpenterie' },
  { value: 'snowflake',    label: '❄️ Climatisation' },
  { value: 'shopping-bag', label: '🛍️ Marketplace' },
  { value: 'truck',        label: '🚚 Transport' },
];

// Mapping slug → emoji (couvre seed-platform-settings slugs + slugs mobile)
const ICON_EMOJI: Record<string, string> = {
  // Slugs platform settings
  truck: '🚚', wrench: '🔧', zap: '⚡', 'paint-brush': '🎨',
  tool: '🔨', sparkles: '🧹', 'shopping-bag': '🛍️',
  // Slugs mobile (MaterialCommunityIcons)
  'pipe-wrench': '🔧', 'hammer-wrench': '🔧', hammer: '🔨', tools: '🔨',
  'format-paint': '🎨', palette: '🎨',
  broom: '🧹',
  saw: '🪚', 'saw-blade': '🪚', 'toolbox-outline': '🪚',
  snowflake: '❄️', 'air-conditioner': '❄️',
};

function renderCategoryIcon(icon: string): string {
  if (!icon) return '📦';
  // Si c'est déjà un emoji (caractère non-ASCII court), l'afficher directement
  if ([...icon].length <= 3 && /\P{ASCII}/u.test(icon)) return icon;
  return ICON_EMOJI[icon] ?? '📦';
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 32) || 'new_category';
}

export function CategoriesModal({ isOpen, onClose, categories, onSave }: CategoriesModalProps) {
  const [editedCategories, setEditedCategories] = useState<Category[]>(
    Array.isArray(categories) ? categories : []
  );
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', nameAr: '', icon: 'wrench' });

  useEffect(() => {
    if (Array.isArray(categories)) setEditedCategories(categories);
  }, [categories]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editedCategories);
      onClose();
    } catch (error) {
      console.error('Error saving categories:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (id: string) => {
    setEditedCategories(editedCategories.map((cat) =>
      cat.id === id ? { ...cat, enabled: !cat.enabled } : cat
    ));
  };

  const updateCategory = (id: string, field: keyof Category, value: string) => {
    setEditedCategories(editedCategories.map((cat) =>
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
  };

  const deleteCategory = (id: string) => {
    if (!confirm('Supprimer cette catégorie ? Les tarifs associés seront désactivés.')) return;
    setEditedCategories(editedCategories.filter((cat) => cat.id !== id));
  };

  const handleAddCategory = () => {
    if (!addForm.name.trim()) { alert('Le nom est obligatoire'); return; }
    const id = slugify(addForm.name);
    if (editedCategories.some((c) => c.id === id)) {
      alert(`L'identifiant "${id}" existe déjà. Choisissez un nom différent.`); return;
    }
    setEditedCategories([...editedCategories, { id, name: addForm.name.trim(), nameAr: addForm.nameAr.trim(), icon: addForm.icon, enabled: true }]);
    setAddForm({ name: '', nameAr: '', icon: 'wrench' });
    setShowAddForm(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gérer les Catégories">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Ces catégories s'appliquent à <strong>toute la plateforme</strong> (secteur Services).
          </p>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary-dark flex items-center gap-1"
          >
            <span className="text-base leading-none">+</span> Ajouter
          </button>
        </div>

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-3">
            <h4 className="text-sm font-semibold text-blue-800">Nouvelle catégorie</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nom (Français) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="ex: Menuiserie"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {addForm.name && (
                  <p className="text-xs text-gray-400 mt-0.5">ID : {slugify(addForm.name)}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nom (Arabe)</label>
                <input
                  type="text"
                  value={addForm.nameAr}
                  onChange={(e) => setAddForm((f) => ({ ...f, nameAr: e.target.value }))}
                  placeholder="النجارة"
                  dir="rtl"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Icône</label>
                <select
                  value={addForm.icon}
                  onChange={(e) => setAddForm((f) => ({ ...f, icon: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddCategory}
                className="px-4 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Créer
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Liste des catégories */}
        <div className="space-y-3">
          {editedCategories.map((category) => (
            <div
              key={category.id}
              className={`border rounded-lg p-4 ${category.enabled ? 'bg-white' : 'bg-gray-50 opacity-60'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{renderCategoryIcon(category.icon)}</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{category.name || <span className="text-gray-400 italic">Sans nom</span>}</p>
                    <p className="text-xs text-gray-400">{category.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Toggle switch */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    title={category.enabled ? 'Désactiver' : 'Activer'}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      category.enabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        category.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  {/* Supprimer */}
                  <button
                    onClick={() => deleteCategory(category.id)}
                    title="Supprimer la catégorie"
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nom (Français)</label>
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nom (Arabe)</label>
                  <input
                    type="text"
                    value={category.nameAr}
                    onChange={(e) => updateCategory(category.id, 'nameAr', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    dir="rtl"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {editedCategories.length === 0 && !showAddForm && (
          <p className="text-sm text-gray-400 text-center py-4">Aucune catégorie configurée</p>
        )}

        <div className="flex gap-4 justify-end pt-2 border-t">
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
            {saving ? 'Enregistrement...' : 'Sauvegarder toutes les catégories'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
