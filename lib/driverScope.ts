/**
 * Séparation Transport (utilitaires) / CheckAllPack (deux-roues) dans le back-office.
 * Un même modèle Driver sert aux deux ; le secteur se déduit du type de véhicule.
 */
export type DriverScope = 'transport' | 'courier';

export const COURIER_VEHICLE_TYPES = ['motorbike', 'bicycle'];

export const isCourierVehicle = (vehicleType?: string | null) =>
  !!vehicleType && COURIER_VEHICLE_TYPES.includes(vehicleType);

export const driverScopeOf = (vehicleType?: string | null): DriverScope =>
  isCourierVehicle(vehicleType) ? 'courier' : 'transport';

export const DRIVER_SCOPE_CONFIG: Record<DriverScope, {
  listHref: string;
  requestsHref: string;
  description: string;
  person: string;
  addLabel: string;
  empty: string;
  requestsDescription: string;
  /** Catégorie TransportRequest.vehicleCategory */
  requestCategory: 'standard' | 'courier';
}> = {
  transport: {
    listHref: '/drivers',
    requestsHref: '/transport-requests',
    description: 'Validation et gestion des chauffeurs Transport & Déménagement (utilitaires)',
    person: 'Chauffeur',
    addLabel: 'Ajouter un chauffeur',
    empty: 'Aucun chauffeur trouvé',
    requestsDescription: 'Demandes Transport & Déménagement (camionnettes et camions)',
    requestCategory: 'standard',
  },
  courier: {
    listHref: '/drivers?sector=courier',
    requestsHref: '/transport-requests?sector=courier',
    description: 'Validation et gestion des livreurs deux-roues (moto, cyclomoteur, vélo)',
    person: 'Livreur',
    addLabel: 'Ajouter un livreur',
    empty: 'Aucun livreur trouvé',
    requestsDescription: 'Livraisons express deux-roues, y compris celles des commandes Marketplace',
    requestCategory: 'courier',
  },
};
