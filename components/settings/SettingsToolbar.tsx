'use client';

import { ReactNode, useMemo, useState } from 'react';
import { useSettingsSections } from './SettingsSection';

/** Sommaire de la page Paramètres : id de section, titre, groupe et mots-clés de recherche */
const CATALOG: { id: string; title: string; group: string; keywords: string }[] = [
  { id: 'finances', title: 'Paramètres financiers', group: 'Finances', keywords: 'devise taux de change minimum maximum réservation' },
  { id: 'commissions', title: 'Taux de commission', group: 'Finances', keywords: 'commission catégorie premium standard' },
  { id: 'payouts', title: 'Versements', group: 'Finances', keywords: 'versement virement garantie périodicité automatique cash compensation suspension minimum' },
  { id: 'transport-pricing', title: 'Tarifs de transport', group: 'Tarifs', keywords: 'prix transport déménagement zone km' },
  { id: 'service-pricing', title: 'Tarification des services', group: 'Tarifs', keywords: 'prix service horaire m² déplacement métier' },
  { id: 'extras', title: 'Suppléments', group: 'Tarifs', keywords: 'extras supplément approbation seuil' },
  { id: 'lifecycle', title: 'Délais et annulations', group: 'Fonctionnement', keywords: 'délai annulation frais priorité admin attribution expiration clôture automatique rappel abus' },
  { id: 'courier', title: 'CheckAllPack', group: 'Fonctionnement', keywords: 'moto vélo 2 roues livraison express poids distance' },
  { id: 'marketplace', title: 'Marketplace', group: 'Fonctionnement', keywords: 'commande vendeur réclamation minimum' },
  { id: 'sectors', title: 'Secteurs', group: 'Plateforme', keywords: 'secteur accueil carte couleur image' },
  { id: 'categories', title: 'Catégories et zones', group: 'Plateforme', keywords: 'catégorie zone pays' },
  { id: 'expansion', title: 'Expansion géographique', group: 'Plateforme', keywords: 'pays zone marché' },
  { id: 'support', title: 'Support client', group: 'Plateforme', keywords: 'email téléphone contact' },
  { id: 'badge', title: 'Badge Studyltizeme', group: 'Plateforme', keywords: 'certification badge' },
  { id: 'legal', title: 'Documents légaux', group: 'Plateforme', keywords: 'cgu confidentialité version acceptation' },
  { id: 'history', title: 'Historique', group: 'Plateforme', keywords: 'historique journal modification audit qui quand' },
];

const normalize = (v: string) => v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function SettingsToolbar() {
  const { setAll, setOpen, dirty } = useSettingsSections();
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return CATALOG;
    return CATALOG.filter((s) => normalize(`${s.title} ${s.group} ${s.keywords}`).includes(q));
  }, [query]);

  const goTo = (id: string) => {
    setOpen(id, true);
    history.replaceState(null, '', `#${id}`);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  return (
    <div className="mb-6 space-y-3 rounded-lg bg-white p-4 shadow">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && matches[0]) goTo(matches[0].id); }}
          placeholder="Rechercher un réglage (ex. garantie, annulation, devise…)"
          className="min-w-[240px] flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="button"
          onClick={() => setAll(CATALOG.map((s) => s.id), true)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Tout déplier
        </button>
        <button
          type="button"
          onClick={() => setAll(CATALOG.map((s) => s.id), false)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Tout replier
        </button>
      </div>
      <nav aria-label="Sections des paramètres" className="flex flex-wrap gap-2">
        {matches.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => goTo(s.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              dirty.has(s.id)
                ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {s.title}
            {dirty.has(s.id) && ' •'}
          </button>
        ))}
        {matches.length === 0 && <span className="text-sm text-gray-500">Aucun réglage ne correspond.</span>}
      </nav>
    </div>
  );
}

export function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</h2>
      {children}
    </div>
  );
}
