'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

export interface Country {
  id: string;
  name: string;
  nameFr: string;
  nameAr?: string;
  nameEn?: string;
  currency: string;
  flag?: string;
  mapboxLanguage: string;
  isEnabled: boolean;
}

interface ZoneContextType {
  zones: Country[];
  selectedZone: string;
  selectedZoneObj: Country | null;
  setSelectedZone: (zone: string) => void;
}

const ZoneContext = createContext<ZoneContextType>({
  zones: [],
  selectedZone: '',
  selectedZoneObj: null,
  setSelectedZone: () => {},
});

const STORAGE_KEY = 'checkallat_selected_zone';

export function ZoneProvider({ children }: { children: ReactNode }) {
  const [selectedZone, setSelectedZoneState] = useState<string>('');
  const [zones, setZones] = useState<Country[]>([]);

  // Restaurer la zone depuis localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) ?? '';
      setSelectedZoneState(stored);
      apiClient.setZone(stored);
    } catch {}
  }, []);

  // Charger les pays depuis la table Country via /admin/countries
  useEffect(() => {
    if (!isAuthenticated()) return;
    apiClient
      .get<Country[]>('/admin/countries')
      .then((data: Country[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setZones(data);
          // Invalider toute zone stockée dont l'ID ne fait pas partie des pays ISO chargés
          // (migration : anciens IDs 'cairo'/'dakar'/'fr' → nouveaux IDs 'EG'/'SN'/'FR')
          setSelectedZoneState(prev => {
            if (prev && !data.find(c => c.id === prev)) {
              apiClient.setZone('');
              try { localStorage.removeItem(STORAGE_KEY); } catch {}
              return '';
            }
            return prev;
          });
        }
      })
      .catch((err) => console.error('[ZoneContext] fetch /admin/countries échoué:', err));
  }, []);

  const setSelectedZone = (zone: string) => {
    setSelectedZoneState(zone);
    apiClient.setZone(zone);
    try { localStorage.setItem(STORAGE_KEY, zone); } catch {}
  };

  const selectedZoneObj = zones.find(z => z.id === selectedZone) ?? null;

  return (
    <ZoneContext.Provider value={{ zones, selectedZone, selectedZoneObj, setSelectedZone }}>
      {children}
    </ZoneContext.Provider>
  );
}

export function useZone() {
  return useContext(ZoneContext);
}
