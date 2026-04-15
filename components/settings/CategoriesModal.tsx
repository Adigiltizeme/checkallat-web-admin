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

export function CategoriesModal({ isOpen, onClose, categories, onSave }: CategoriesModalProps) {
  const [editedCategories, setEditedCategories] = useState<Category[]>(
    Array.isArray(categories) ? categories : []
  );
  const [saving, setSaving] = useState(false);

  // Mettre à jour editedCategories quand categories change
  useEffect(() => {
    if (Array.isArray(categories)) {
      setEditedCategories(categories);
    }
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
    setEditedCategories(
      editedCategories.map((cat) =>
        cat.id === id ? { ...cat, enabled: !cat.enabled } : cat
      )
    );
  };

  const updateCategory = (id: string, field: keyof Category, value: string) => {
    setEditedCategories(
      editedCategories.map((cat) =>
        cat.id === id ? { ...cat, [field]: value } : cat
      )
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gérer les Catégories de Services">
      <div className="space-y-6">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <p className="text-sm text-blue-700">
            Activez ou désactivez les catégories de services disponibles sur la plateforme.
          </p>
        </div>

        <div className="space-y-4">
          {editedCategories.map((category) => (
            <div
              key={category.id}
              className={`border rounded-lg p-4 ${
                category.enabled ? 'bg-white' : 'bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {category.icon === 'truck' && '🚚'}
                    {category.icon === 'wrench' && '🔧'}
                    {category.icon === 'zap' && '⚡'}
                    {category.icon === 'paint-brush' && '🎨'}
                    {category.icon === 'tool' && '🔨'}
                    {category.icon === 'sparkles' && '✨'}
                    {category.icon === 'shopping-bag' && '🛍️'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.nameAr}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    category.enabled
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {category.enabled ? 'Activée' : 'Désactivée'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nom (Français)
                  </label>
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nom (Arabe)
                  </label>
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
