'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface ProFormProps {
  pro?: any; // Si fourni, mode édition. Sinon, mode création
  onSuccess: () => void;
  onCancel: () => void;
}

const CATEGORIES = [
  'plomberie',
  'plumbing',
  'chauffage',
  'heating',
  'électricité',
  'electrical',
  'menuiserie',
  'carpentry',
  'peinture',
  'painting',
  'jardinage',
  'gardening',
  'nettoyage',
  'cleaning',
  'déménagement',
  'moving',
  'rénovation',
  'renovation',
];

export function ProForm({ pro, onSuccess, onCancel }: ProFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    companyName: '',
    bio: '',
    serviceCategories: [] as string[],
    isStudent: false,
    segment: 'standard',
    status: 'pending',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pro) {
      setFormData({
        email: pro.user?.email || '',
        firstName: pro.user?.firstName || '',
        lastName: pro.user?.lastName || '',
        phone: pro.user?.phone || '',
        password: '', // Ne pas afficher le mot de passe existant
        companyName: pro.companyName || '',
        bio: pro.bio || '',
        serviceCategories: pro.serviceCategories || [],
        isStudent: pro.isStudyltizemeGraduate || false,
        segment: pro.segment || 'standard',
        status: pro.status || 'pending',
      });
    }
  }, [pro]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (pro) {
        // Mode édition
        await apiClient.patch(`/admin/pros/${pro.id}`, {
          companyName: formData.companyName,
          bio: formData.bio,
          serviceCategories: formData.serviceCategories,
          isStudyltizemeGraduate: formData.isStudent,
          segment: formData.segment,
          status: formData.status,
        });
        alert('Professionnel modifié avec succès');
      } else {
        // Mode création
        if (!formData.password) {
          alert('Le mot de passe est requis pour créer un nouveau professionnel');
          setLoading(false);
          return;
        }
        await apiClient.post('/admin/pros', formData);
        alert('Professionnel créé avec succès');
      }
      onSuccess();
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceCategories: prev.serviceCategories.includes(category)
        ? prev.serviceCategories.filter((c) => c !== category)
        : [...prev.serviceCategories, category],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            disabled={!!pro} // Email non modifiable en édition
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
          />
        </div>

        {/* Prénom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prénom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            disabled={!!pro}
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
          />
        </div>

        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            disabled={!!pro}
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
          />
        </div>

        {/* Téléphone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Téléphone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            disabled={!!pro}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* Mot de passe (uniquement en création) */}
      {!pro && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      {/* Nom de l'entreprise */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nom de l'entreprise <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bio / Description
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Catégories de service */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Catégories de service <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
          {CATEGORIES.map((category) => (
            <label key={category} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.serviceCategories.includes(category)}
                onChange={() => toggleCategory(category)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Segment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Segment
          </label>
          <select
            value={formData.segment}
            onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
          </select>
        </div>

        {/* Statut */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="pending">En attente</option>
            <option value="active">Actif</option>
            <option value="suspended">Suspendu</option>
            <option value="rejected">Rejeté</option>
          </select>
        </div>
      </div>

      {/* Étudiant */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isStudent"
          checked={formData.isStudent}
          onChange={(e) => setFormData({ ...formData, isStudent: e.target.checked })}
          className="rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="isStudent" className="ml-2 text-sm text-gray-700">
          Est un étudiant
        </label>
      </div>

      {/* Boutons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Enregistrement...' : pro ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
}
