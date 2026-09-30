'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { SingleFileUpload } from '@/components/FileUpload';
import { MdiIcon } from '@/components/shared/MdiIcon';
import { GradientPicker } from '@/components/settings/GradientPicker';
import { useZone } from '@/contexts/ZoneContext';

interface Sector {
  slug: string;
  nameFr: string;
  nameEn: string;
  nameAr: string;
  descriptionFr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: string;
  backgroundImage: string | null;
  gradientFrom: string | null;
  gradientTo: string | null;
  enabled: boolean;
  order: number;
  countries: string[];
  builtIn: boolean;
}

/** Transport et Services sont le cœur de la plateforme : toujours actifs */
const NON_DISABLEABLE = ['transport', 'services'];

/** Dégradés par défaut de l'application (identiques au mobile) */
const DEFAULT_GRADIENTS: Record<string, [string, string]> = {
  transport: ['#F8B400', '#E09E00'],
  checkallpack: ['#00B8A9', '#008F82'],
  services: ['#10B981', '#0D9E6E'],
  marketplace: ['#8B5CF6', '#7340DB'],
};
const FALLBACK_GRADIENT: [string, string] = ['#00B8A9', '#008F82'];

const SUGGESTED_ICONS = [
  'truck-fast', 'moped', 'hammer-wrench', 'shopping', 'store', 'food', 'silverware-fork-knife', 'car',
  'home-city', 'broom', 'hospital-box', 'school', 'dog', 'flower', 'party-popper', 'airplane',
  'washing-machine', 'package-variant', 'tools', 'account-group', 'briefcase', 'heart-pulse', 'apps', 'star',
];

const EMPTY: Sector = {
  slug: '', nameFr: '', nameEn: '', nameAr: '', descriptionFr: '', descriptionEn: '', descriptionAr: '',
  icon: 'apps', backgroundImage: null, gradientFrom: null, gradientTo: null, enabled: true, order: 0,
  countries: [], builtIn: false,
};

const slugify = (value: string) =>
  value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').replace(/^[^a-z]+/, '').slice(0, 30);

const gradientOf = (s: Pick<Sector, 'slug' | 'gradientFrom' | 'gradientTo'>): [string, string] => {
  const [from, to] = DEFAULT_GRADIENTS[s.slug] ?? FALLBACK_GRADIENT;
  return [s.gradientFrom || from, s.gradientTo || to];
};

/** Aperçu de la carte d'accueil de l'application */
function SectorPreview({ sector }: { sector: Sector }) {
  const [from, to] = gradientOf(sector);
  return (
    <div
      className="relative h-28 w-full overflow-hidden rounded-xl p-4 text-white"
      style={{ background: `linear-gradient(180deg, ${from}, ${to})` }}
    >
      {/* Même rendu que l'app : image, puis dégradé du secteur à 65 % par-dessus */}
      {sector.backgroundImage && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sector.backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 opacity-[0.65]" style={{ background: `linear-gradient(180deg, ${from}, ${to})` }} />
        </>
      )}
      <div className="relative flex h-full items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-lg font-bold drop-shadow">{sector.nameFr || 'Nom du secteur'}</p>
          <p className="line-clamp-2 text-xs opacity-90 drop-shadow">
            {sector.descriptionFr || (sector.builtIn ? 'Texte par défaut de l’application' : 'Bientôt disponible')}
          </p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/25">
          <MdiIcon name={sector.icon} size={26} tone="light" />
        </span>
      </div>
      {!sector.builtIn && (
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-gray-800">
          Bientôt disponible
        </span>
      )}
    </div>
  );
}

export default function SectorsPage() {
  const { zones } = useZone();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<Sector>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);

  const load = useCallback(() => {
    apiClient
      .get<Sector[]>('/admin/settings/sectors')
      .then((data) => setSectors(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  /** Enregistre la liste complète (le serveur valide et renumérote l'ordre) */
  const persist = async (next: Sector[]) => {
    setSaving(true);
    try {
      const saved = await apiClient.put<Sector[]>('/admin/settings/sectors', {
        sectors: next.map((s, i) => ({ ...s, order: i + 1 })),
      });
      setSectors(Array.isArray(saved) ? saved : next);
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.message;
      alert('Erreur : ' + (Array.isArray(msg) ? msg.join('\n') : msg || 'Erreur inconnue'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= sectors.length) return;
    const next = [...sectors];
    [next[index], next[target]] = [next[target], next[index]];
    persist(next);
  };

  const toggle = (sector: Sector) => {
    if (NON_DISABLEABLE.includes(sector.slug)) return;
    persist(sectors.map((s) => (s.slug === sector.slug ? { ...s, enabled: !s.enabled } : s)));
  };

  const remove = (sector: Sector) => {
    if (sector.builtIn) return;
    if (!confirm(`Supprimer le secteur « ${sector.nameFr} » ? Il disparaîtra de l'application.`)) return;
    persist(sectors.filter((s) => s.slug !== sector.slug));
  };

  const openCreate = () => {
    setEditingSlug(null);
    setForm({ ...EMPTY, order: sectors.length + 1 });
    setSlugTouched(false);
    setModalOpen(true);
  };

  const openEdit = (sector: Sector) => {
    setEditingSlug(sector.slug);
    setForm({ ...sector });
    setSlugTouched(true);
    setModalOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlug && sectors.some((s) => s.slug === form.slug)) {
      alert(`L'identifiant « ${form.slug} » est déjà utilisé.`);
      return;
    }
    const next = editingSlug
      ? sectors.map((s) => (s.slug === editingSlug ? { ...form, slug: editingSlug } : s))
      : [...sectors, form];
    if (await persist(next)) setModalOpen(false);
  };

  const toggleCountry = (id: string) =>
    setForm((f) => ({
      ...f,
      countries: f.countries.includes(id) ? f.countries.filter((c) => c !== id) : [...f.countries, id],
    }));

  const countryLabel = (id: string) => {
    const z = zones.find((c) => c.id === id);
    return z ? `${z.flag ?? ''} ${z.nameFr}`.trim() : id;
  };

  if (loading) return <div className="py-12 text-center text-gray-500">Chargement...</div>;

  const [gFrom, gTo] = gradientOf(form);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Secteurs de la plateforme</h1>
          <p className="max-w-3xl text-gray-600">
            Cartes affichées sur l&apos;accueil de l&apos;application, dans cet ordre. Un secteur créé ici apparaît comme
            « Bientôt disponible » tant que son parcours n&apos;existe pas dans l&apos;application.
          </p>
        </div>
        <button onClick={openCreate} className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-dark">
          + Nouveau secteur
        </button>
      </div>

      <div className="space-y-3">
        {sectors.map((sector, index) => {
          const locked = NON_DISABLEABLE.includes(sector.slug);
          return (
            <div
              key={sector.slug}
              className={`flex flex-col gap-4 rounded-lg bg-white p-4 shadow md:flex-row md:items-center ${sector.enabled ? '' : 'opacity-60'}`}
            >
              <div className="flex flex-row gap-1 md:flex-col">
                <button
                  onClick={() => move(index, -1)}
                  disabled={index === 0 || saving}
                  className="rounded border px-2 py-0.5 text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                  aria-label="Monter"
                >▲</button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === sectors.length - 1 || saving}
                  className="rounded border px-2 py-0.5 text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                  aria-label="Descendre"
                >▼</button>
              </div>

              <div className="w-full md:w-72 md:shrink-0">
                <SectorPreview sector={sector} />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-gray-900">{sector.nameFr}</span>
                  <span className="font-mono text-xs text-gray-400">{sector.slug}</span>
                  {sector.builtIn ? (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">Intégré à l&apos;app</span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Bientôt disponible</span>
                  )}
                  {locked && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">Toujours actif</span>}
                </div>
                <p className="text-xs text-gray-500">
                  {sector.nameEn} · <span dir="rtl">{sector.nameAr}</span>
                </p>
                <p className="text-xs text-gray-500">
                  {sector.countries.length === 0
                    ? 'Proposé dans tous les pays'
                    : `Proposé en : ${sector.countries.map(countryLabel).join(', ')}`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <button
                  onClick={() => toggle(sector)}
                  disabled={locked || saving}
                  className={`rounded-full px-3 py-1 font-medium ${sector.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'} disabled:cursor-not-allowed`}
                  title={locked ? 'Secteur principal : toujours actif' : sector.enabled ? 'Désactiver' : 'Activer'}
                >
                  {sector.enabled ? 'Actif' : 'Inactif'}
                </button>
                <button onClick={() => openEdit(sector)} className="text-indigo-600 hover:text-indigo-900">Modifier</button>
                {!sector.builtIn && (
                  <button onClick={() => remove(sector)} disabled={saving} className="text-red-600 hover:text-red-800">
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSlug ? `Modifier — ${form.nameFr}` : 'Nouveau secteur'}
        size="xl"
      >
        <form onSubmit={submit} className="space-y-5">
          <SectorPreview sector={form} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {([
              ['nameFr', 'Nom (FR) *', 'ltr'],
              ['nameEn', 'Nom (EN)', 'ltr'],
              ['nameAr', 'Nom (AR)', 'rtl'],
            ] as const).map(([key, label, dir]) => (
              <div key={key}>
                <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
                <input
                  dir={dir}
                  value={form[key]}
                  maxLength={60}
                  required={key === 'nameFr'}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm((f) => ({
                      ...f,
                      [key]: value,
                      ...(key === 'nameFr' && !editingSlug && !slugTouched ? { slug: slugify(value) } : {}),
                    }));
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Identifiant (slug) *</label>
            <input
              value={form.slug}
              disabled={!!editingSlug}
              required
              pattern="[a-z][a-z0-9_]{1,29}"
              title="Lettres minuscules, chiffres et _ ; commence par une lettre"
              onChange={(e) => { setSlugTouched(true); setForm({ ...form, slug: slugify(e.target.value) }); }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 md:w-80"
            />
            <p className="mt-1 text-xs text-gray-500">Non modifiable après création (utilisé par l&apos;application).</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {([
              ['descriptionFr', 'Sous-titre (FR)', 'ltr'],
              ['descriptionEn', 'Sous-titre (EN)', 'ltr'],
              ['descriptionAr', 'Sous-titre (AR)', 'rtl'],
            ] as const).map(([key, label, dir]) => (
              <div key={key}>
                <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
                <textarea
                  dir={dir}
                  rows={2}
                  maxLength={160}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={form.builtIn ? 'Vide = texte par défaut de l’app' : ''}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Icône (MaterialCommunityIcons)</label>
            <div className="mb-2 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded border"><MdiIcon name={form.icon} size={26} /></span>
              <input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value.trim().toLowerCase() })}
                className="w-64 rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_ICONS.map((icon) => (
                <button
                  type="button"
                  key={icon}
                  title={icon}
                  onClick={() => setForm({ ...form, icon })}
                  className={`flex h-9 w-9 items-center justify-center rounded border ${form.icon === icon ? 'border-primary bg-primary/10' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <MdiIcon name={icon} size={20} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Couleur de la carte</label>
            <GradientPicker
              value={[gFrom, gTo]}
              isDefault={!form.gradientFrom && !form.gradientTo}
              onChange={(g) => setForm({ ...form, gradientFrom: g ? g[0] : null, gradientTo: g ? g[1] : null })}
            />
          </div>

          <div className="md:w-1/2">
            <SingleFileUpload
              label="Image de fond (optionnelle, recouverte de la couleur de la carte à 65 %)"
              value={form.backgroundImage ?? ''}
              onChange={(url) => setForm({ ...form, backgroundImage: url || null })}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Pays où le secteur est proposé</label>
            <div className="flex flex-wrap gap-2">
              {zones.map((z) => {
                const on = form.countries.includes(z.id);
                return (
                  <button
                    type="button"
                    key={z.id}
                    onClick={() => toggleCountry(z.id)}
                    className={`rounded-full border px-3 py-1 text-sm ${on ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {z.flag} {z.nameFr}
                  </button>
                );
              })}
            </div>
            <p className="mt-1 text-xs text-gray-500">Aucun pays sélectionné = proposé partout.</p>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.enabled}
              disabled={NON_DISABLEABLE.includes(form.slug)}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            Secteur actif (visible dans l&apos;application)
          </label>

          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-dark disabled:opacity-50">
              {saving ? 'Enregistrement…' : editingSlug ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
