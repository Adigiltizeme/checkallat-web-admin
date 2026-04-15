'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface DriverFormProps {
  driver?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const VEHICLE_TYPES = [
  { value: 'van', label: 'Camionnette' },
  { value: 'small_truck', label: 'Petit camion' },
  { value: 'large_truck', label: 'Grand camion' },
];

export function DriverForm({ driver, onSuccess, onCancel }: DriverFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // User info
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    // Driver info
    vehicleType: 'van',
    vehicleCapacity: 10,
    vehiclePlate: '',
    hasHelpers: false,
    maxHelpers: 0,
    hasTrolleys: false,
    hasStraps: false,
    hasBlankets: false,
    hasToolkit: false,
    hasPackingMaterial: false,
    serviceRadius: 20,
    status: 'pending',
  });

  useEffect(() => {
    if (driver) {
      setFormData({
        email: driver.user?.email || '',
        firstName: driver.user?.firstName || '',
        lastName: driver.user?.lastName || '',
        phone: driver.user?.phone || '',
        password: '',
        vehicleType: driver.vehicleType || 'van',
        vehicleCapacity: driver.vehicleCapacity || 10,
        vehiclePlate: driver.vehiclePlate || '',
        hasHelpers: driver.hasHelpers || false,
        maxHelpers: driver.maxHelpers || 0,
        hasTrolleys: driver.hasTrolleys || false,
        hasStraps: driver.hasStraps || false,
        hasBlankets: driver.hasBlankets || false,
        hasToolkit: driver.hasToolkit || false,
        hasPackingMaterial: driver.hasPackingMaterial || false,
        serviceRadius: driver.serviceRadius || 20,
        status: driver.status || 'pending',
      });
    }
  }, [driver]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (driver) {
        // Mode édition
        await apiClient.patch(`/admin/drivers/${driver.id}`, {
          vehicleType: formData.vehicleType,
          vehicleCapacity: formData.vehicleCapacity,
          vehiclePlate: formData.vehiclePlate,
          hasHelpers: formData.hasHelpers,
          maxHelpers: formData.maxHelpers,
          hasTrolleys: formData.hasTrolleys,
          hasStraps: formData.hasStraps,
          hasBlankets: formData.hasBlankets,
          hasToolkit: formData.hasToolkit,
          hasPackingMaterial: formData.hasPackingMaterial,
          serviceRadius: formData.serviceRadius,
          status: formData.status,
        });
      } else {
        // Mode création
        if (!formData.password) {
          alert('Le mot de passe est requis');
          return;
        }
        await apiClient.post('/admin/drivers', formData);
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
      {!driver && (
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
            disabled={!!driver}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary disabled:bg-gray-100"
            required={!driver}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Téléphone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={!!driver}
            placeholder="+213555123456"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary disabled:bg-gray-100"
            required={!driver}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Prénom</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            disabled={!!driver}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary disabled:bg-gray-100"
            required={!driver}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nom</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            disabled={!!driver}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary disabled:bg-gray-100"
            required={!driver}
          />
        </div>

        {!driver && (
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

      {/* Vehicle Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Type de véhicule</label>
          <select
            value={formData.vehicleType}
            onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          >
            {VEHICLE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Capacité (m³)</label>
          <input
            type="number"
            step="0.1"
            value={formData.vehicleCapacity}
            onChange={(e) => setFormData({ ...formData, vehicleCapacity: e.target.value ? parseFloat(e.target.value) : 0 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Plaque d'immatriculation</label>
          <input
            type="text"
            value={formData.vehiclePlate}
            onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
            placeholder="ABC-123-45"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Rayon de service (km)</label>
          <input
            type="number"
            value={formData.serviceRadius}
            onChange={(e) => setFormData({ ...formData, serviceRadius: e.target.value ? parseFloat(e.target.value) : 0 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>
      </div>

      {/* Helpers */}
      <div className="space-y-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.hasHelpers}
            onChange={(e) => setFormData({ ...formData, hasHelpers: e.target.checked })}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="ml-2 text-sm text-gray-700">Dispose d'aides</span>
        </label>

        {formData.hasHelpers && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre max d'aides</label>
            <input
              type="number"
              value={formData.maxHelpers}
              onChange={(e) => setFormData({ ...formData, maxHelpers: e.target.value ? parseInt(e.target.value) : 0 })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        )}
      </div>

      {/* Equipment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Équipements disponibles</label>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.hasTrolleys}
              onChange={(e) => setFormData({ ...formData, hasTrolleys: e.target.checked })}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm text-gray-700">Chariots</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.hasStraps}
              onChange={(e) => setFormData({ ...formData, hasStraps: e.target.checked })}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm text-gray-700">Sangles</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.hasBlankets}
              onChange={(e) => setFormData({ ...formData, hasBlankets: e.target.checked })}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm text-gray-700">Couvertures</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.hasToolkit}
              onChange={(e) => setFormData({ ...formData, hasToolkit: e.target.checked })}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm text-gray-700">Boîte à outils</span>
          </label>

          <label className="flex items-center col-span-2">
            <input
              type="checkbox"
              checked={formData.hasPackingMaterial}
              onChange={(e) => setFormData({ ...formData, hasPackingMaterial: e.target.checked })}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm text-gray-700">Matériel d'emballage</span>
          </label>
        </div>
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
          {loading ? 'Enregistrement...' : driver ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
}
