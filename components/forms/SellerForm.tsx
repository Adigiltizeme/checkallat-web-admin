'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { SingleFileUpload } from '@/components/FileUpload';

interface SellerFormProps {
  seller?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const BUSINESS_TYPES = [
  { value: 'artisan', label: 'Artisan' },
  { value: 'individual', label: 'Individuel' },
  { value: 'small_business', label: 'Petite entreprise' },
  { value: 'company', label: 'Société' },
];

interface Domain {
  id: string;
  nameFr: string;
  parentId: string | null;
  isActive: boolean;
  requiresHealthCertificate: boolean;
}

export function SellerForm({ seller, onSuccess, onCancel }: SellerFormProps) {
  const [loading, setLoading] = useState(false);
  const [zoneRequiresHealthCert, setZoneRequiresHealthCert] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [zones, setZones] = useState<Array<{ countryCode: string; country: string }>>([]);

  useEffect(() => {
    apiClient.get<any>('/admin/settings').then((data) => {
      const list: any[] = Array.isArray(data?.serviceZones)
        ? data.serviceZones
        : JSON.parse(data?.serviceZones || '[]');
      setZoneRequiresHealthCert(list.some((z: any) => z.requireHealthCertificate && z.enabled));
      setZones(list.filter((z: any) => z.countryCode).map((z: any) => ({ countryCode: z.countryCode.toUpperCase(), country: z.country ?? z.name })));
    }).catch(() => {});
    apiClient.get<Domain[]>('/admin/marketplace/domains').then((data) => setDomains(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);
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
    domainIds: [] as string[],
    countryId: '',
    address: '',
    addressLat: 0,
    addressLng: 0,
    offersDelivery: false,
    deliveryRadius: 10,
    sellerDeliveryFee: 0,
    offersPickup: true,
    pickupInstructions: '',
    preparationTimeMin: 20,
    commissionRate: '' as number | '',
    hasBusinessLicense: false,
    licenseNumber: '',
    logo: '',
    bannerUrl: '',
    healthCertificate: '',
    status: 'pending',
  });

  const selectedDomains = domains.filter((d) => formData.domainIds.includes(d.id));
  const healthCertRequired = zoneRequiresHealthCert || selectedDomains.some((d) => d.requiresHealthCertificate);

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
        domainIds: (seller.domains ?? []).map((d: { id: string }) => d.id),
        countryId: seller.countryId || '',
        address: seller.address || '',
        addressLat: seller.addressLat || 0,
        addressLng: seller.addressLng || 0,
        offersDelivery: seller.offersDelivery || false,
        deliveryRadius: seller.deliveryRadius || 10,
        sellerDeliveryFee: seller.sellerDeliveryFee ?? 0,
        offersPickup: seller.offersPickup !== undefined ? seller.offersPickup : true,
        pickupInstructions: seller.pickupInstructions || '',
        preparationTimeMin: seller.preparationTimeMin ?? 20,
        commissionRate: seller.commissionRate ?? '',
        hasBusinessLicense: seller.hasBusinessLicense || false,
        licenseNumber: seller.licenseNumber || '',
        logo: seller.logo || '',
        bannerUrl: seller.bannerUrl || '',
        healthCertificate: seller.healthCertificate || '',
        status: seller.status || 'pending',
      });
    }
  }, [seller]);

  const handleDomainToggle = (domainId: string) => {
    setFormData({
      ...formData,
      domainIds: formData.domainIds.includes(domainId)
        ? formData.domainIds.filter((id) => id !== domainId)
        : [...formData.domainIds, domainId],
    });
  };

  const sellerPayload = () => ({
    businessName: formData.businessName,
    businessType: formData.businessType,
    description: formData.description,
    domainIds: formData.domainIds,
    countryId: formData.countryId || null,
    address: formData.address,
    addressLat: formData.addressLat,
    addressLng: formData.addressLng,
    offersDelivery: formData.offersDelivery,
    deliveryRadius: formData.deliveryRadius,
    sellerDeliveryFee: formData.offersDelivery ? formData.sellerDeliveryFee : null,
    offersPickup: formData.offersPickup,
    pickupInstructions: formData.pickupInstructions || null,
    preparationTimeMin: formData.preparationTimeMin,
    commissionRate: formData.commissionRate === '' ? null : formData.commissionRate,
    hasBusinessLicense: formData.hasBusinessLicense,
    licenseNumber: formData.licenseNumber,
    logo: formData.logo || null,
    bannerUrl: formData.bannerUrl || null,
    healthCertificate: formData.healthCertificate || null,
    status: formData.status,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.domainIds.length === 0) {
        alert('Sélectionnez au moins un domaine de vente');
        return;
      }
      if (healthCertRequired && !formData.healthCertificate) {
        alert('Le certificat sanitaire est obligatoire pour les domaines choisis');
        return;
      }
      if (seller) {
        await apiClient.patch(`/admin/sellers/${seller.id}`, sellerPayload());
      } else {
        if (!formData.password) {
          alert('Le mot de passe est requis');
          return;
        }
        await apiClient.post('/admin/sellers', {
          ...sellerPayload(),
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          password: formData.password,
        });
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
          <SingleFileUpload
            label="Logo de la boutique"
            value={formData.logo}
            onChange={(url) => setFormData({ ...formData, logo: url })}
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

      {/* Domaines de vente */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Domaines de vente autorisés *
        </label>
        {domains.length === 0 ? (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
            Aucun domaine de vente n&apos;existe encore. Créez-en depuis Marketplace → Domaines de vente.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
            {domains
              .filter((d) => d.isActive && !d.parentId)
              .map((domain) => (
                <label key={domain.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.domainIds.includes(domain.id)}
                    onChange={() => handleDomainToggle(domain.id)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {domain.nameFr}
                    {domain.requiresHealthCertificate && <span className="ml-1 text-xs text-amber-700">(certif. sanitaire)</span>}
                  </span>
                </label>
              ))}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">Le vendeur pourra classer ses produits dans ces domaines et leurs sous-domaines.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Pays</label>
          <select
            value={formData.countryId}
            onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            <option value="">—</option>
            {zones.map((z) => (
              <option key={z.countryCode} value={z.countryCode}>{z.country} ({z.countryCode})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Délai de préparation (min)</label>
          <input
            type="number"
            min={0}
            value={formData.preparationTimeMin}
            onChange={(e) => setFormData({ ...formData, preparationTimeMin: Number(e.target.value) || 0 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Commission spécifique (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={formData.commissionRate}
            onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value === '' ? '' : Number(e.target.value) })}
            placeholder="Vide = taux du domaine, sinon taux Marketplace de la plateforme"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>
        <div className="col-span-2">
          <SingleFileUpload
            label="Bannière de la boutique (optionnel)"
            value={formData.bannerUrl}
            onChange={(url) => setFormData({ ...formData, bannerUrl: url })}
          />
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
          <span className="ml-2 text-sm text-gray-700">Livre lui-même (en plus de CheckAll@t / CheckAllPack)</span>
        </label>

        {formData.offersDelivery && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Rayon de livraison (km)</label>
              <input
                type="number"
                value={formData.deliveryRadius}
                onChange={(e) => setFormData({ ...formData, deliveryRadius: e.target.value ? parseFloat(e.target.value) : 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Frais de livraison facturés au client</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={formData.sellerDeliveryFee}
                onChange={(e) => setFormData({ ...formData, sellerDeliveryFee: e.target.value ? parseFloat(e.target.value) : 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
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

        {formData.offersPickup && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Instructions de retrait</label>
            <input
              type="text"
              value={formData.pickupInstructions}
              onChange={(e) => setFormData({ ...formData, pickupInstructions: e.target.value })}
              placeholder="Ex : entrée côté cour, sonner au 2e"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        )}
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

      <SingleFileUpload
        label={`Certificat sanitaire / Hygiène${healthCertRequired ? '' : ' (optionnel — non requis dans toutes les zones)'}`}
        value={formData.healthCertificate}
        onChange={(url) => setFormData({ ...formData, healthCertificate: url })}
        required={healthCertRequired}
      />

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
