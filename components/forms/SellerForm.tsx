'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface SellerFormProps {
  seller?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const BUSINESS_TYPES = [
  { value: 'artisan', label: 'Artisan' },
  { value: 'individual', label: 'Individuel' },
  { value: 'small_business', label: 'Petite entreprise' },
];

const CATEGORIES = [
  'food', 'alimentation',
  'crafts', 'artisanat',
  'furniture', 'meubles',
  'clothing', 'vêtements',
  'electronics', 'électronique',
  'home', 'maison',
  'beauty', 'beauté',
  'sports', 'sport',
  'books', 'livres',
  'toys', 'jouets',
];

export function SellerForm({ seller, onSuccess, onCancel }: SellerFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // User info
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    // Seller info
    businessName: '',
    businessType: 'artisan',
    description: '',
    categories: [] as string[],
    address: '',
    addressLat: 0,
    addressLng: 0,
    offersDelivery: false,
    deliveryRadius: 10,
    offersPickup: true,
    hasBusinessLicense: false,
    licenseNumber: '',
    status: 'pending',
  });

  useEffect(() => {
    if (seller) {
      setFormData({
        email: seller.user?.email || '',
        firstName: seller.user?.firstName || '',
        lastName: seller.user?.lastName || '',
        phone: seller.user?.phone || '',
        password: '',
        businessName: seller.businessName || '',
        businessType: seller.businessType || 'artisan',
        description: seller.description || '',
        categories: seller.categories || [],
        address: seller.address || '',
        addressLat: seller.addressLat || 0,
        addressLng: seller.addressLng || 0,
        offersDelivery: seller.offersDelivery || false,
        deliveryRadius: seller.deliveryRadius || 10,
        offersPickup: seller.offersPickup !== undefined ? seller.offersPickup : true,
        hasBusinessLicense: seller.hasBusinessLicense || false,
        licenseNumber: seller.licenseNumber || '',
        status: seller.status || 'pending',
      });
    }
  }, [seller]);

  const handleCategoryToggle = (category: string) => {
    setFormData({
      ...formData,
      categories: formData.categories.includes(category)
        ? formData.categories.filter((c) => c !== category)
        : [...formData.categories, category],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (seller) {
        // Mode édition
        await apiClient.patch(`/admin/sellers/${seller.id}`, {
          businessName: formData.businessName,
          businessType: formData.businessType,
          description: formData.description,
          categories: formData.categories,
          address: formData.address,
          addressLat: formData.addressLat,
          addressLng: formData.addressLng,
          offersDelivery: formData.offersDelivery,
          deliveryRadius: formData.deliveryRadius,
          offersPickup: formData.offersPickup,
          hasBusinessLicense: formData.hasBusinessLicense,
          licenseNumber: formData.licenseNumber,
          status: formData.status,
        });
      } else {
        // Mode création
        if (!formData.password) {
          alert('Le mot de passe est requis');
          return;
        }
        if (formData.categories.length === 0) {
          alert('Veuillez sélectionner au moins une catégorie');
          return;
        }
        await apiClient.post('/admin/sellers', formData);
      }
      onSuccess();
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!seller && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <p className="text-sm text-blue-700">
            Informations utilisateur (non modifiables après création)
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* User Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={!!seller}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary disabled:bg-gray-100"
            required={!seller}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Téléphone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={!!seller}
            placeholder="+213555123456"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary disabled:bg-gray-100"
            required={!seller}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Prénom</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            disabled={!!seller}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary disabled:bg-gray-100"
            required={!seller}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nom</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            disabled={!!seller}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary disabled:bg-gray-100"
            required={!seller}
          />
        </div>

        {!seller && (
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>
        )}
      </div>

      <hr />

      {/* Business Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom de l'entreprise</label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type d'entreprise</label>
          <select
            value={formData.businessType}
            onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          >
            {BUSINESS_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Adresse</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Latitude</label>
          <input
            type="number"
            step="0.000001"
            value={formData.addressLat}
            onChange={(e) => setFormData({ ...formData, addressLat: e.target.value ? parseFloat(e.target.value) : 0 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Longitude</label>
          <input
            type="number"
            step="0.000001"
            value={formData.addressLng}
            onChange={(e) => setFormData({ ...formData, addressLng: e.target.value ? parseFloat(e.target.value) : 0 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Catégories de produits *
        </label>
        <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
          {CATEGORIES.map((category) => (
            <label key={category} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.categories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Delivery Options */}
      <div className="space-y-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.offersDelivery}
            onChange={(e) => setFormData({ ...formData, offersDelivery: e.target.checked })}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="ml-2 text-sm text-gray-700">Offre la livraison</span>
        </label>

        {formData.offersDelivery && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Rayon de livraison (km)</label>
            <input
              type="number"
              value={formData.deliveryRadius}
              onChange={(e) => setFormData({ ...formData, deliveryRadius: e.target.value ? parseFloat(e.target.value) : 0 })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        )}

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.offersPickup}
            onChange={(e) => setFormData({ ...formData, offersPickup: e.target.checked })}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="ml-2 text-sm text-gray-700">Retrait sur place</span>
        </label>
      </div>

      {/* License */}
      <div className="space-y-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.hasBusinessLicense}
            onChange={(e) => setFormData({ ...formData, hasBusinessLicense: e.target.checked })}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="ml-2 text-sm text-gray-700">Possède une licence commerciale</span>
        </label>

        {formData.hasBusinessLicense && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Numéro de licence</label>
            <input
              type="text"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Statut</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        >
          <option value="pending">En attente</option>
          <option value="active">Actif</option>
          <option value="suspended">Suspendu</option>
          <option value="rejected">Rejeté</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : seller ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
}
