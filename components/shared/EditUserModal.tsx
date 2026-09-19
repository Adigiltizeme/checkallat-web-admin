'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';

export type UserFields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredLanguage: string;
};

const LANG_OPTIONS = [
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'Arabe' },
  { value: 'en', label: 'Anglais' },
];

export function UserFormFields({ data, onChange }: { data: UserFields; onChange: (d: UserFields) => void }) {
  const set = (k: keyof UserFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...data, [k]: e.target.value });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prénom <span className="text-red-500">*</span></label>
          <input type="text" required value={data.firstName} onChange={set('firstName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
          <input type="text" required value={data.lastName} onChange={set('lastName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
          <input type="email" required value={data.email} onChange={set('email')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone <span className="text-red-500">*</span></label>
          <input type="tel" required placeholder="+213555123456" value={data.phone} onChange={set('phone')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Langue préférée</label>
        <select value={data.preferredLanguage} onChange={set('preferredLanguage')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
          {LANG_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}

export function EditUserModal({ user, onSuccess, onCancel }: { user: any; onSuccess: () => void; onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserFields>({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    preferredLanguage: user.preferredLanguage || 'fr',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.patch(`/admin/users/${user.id}`, formData);
      alert('Informations mises à jour');
      onSuccess();
    } catch (err: any) {
      alert('Erreur: ' + (err.response?.data?.message || 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Modifier l'utilisateur</h2>
          <p className="text-sm text-gray-500 mb-4">{user.email}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <UserFormFields data={formData} onChange={setFormData} />
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button type="button" onClick={onCancel} disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Annuler</button>
              <button type="submit" disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50">
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
