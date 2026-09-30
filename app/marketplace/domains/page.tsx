'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { SingleFileUpload } from '@/components/FileUpload';
import { MdiIcon } from '@/components/shared/MdiIcon';

interface Domain {
  id: string;
  slug: string;
  nameFr: string;
  nameEn: string;
  nameAr: string;
  descriptionFr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  icon: string | null;
  imageUrl: string | null;
  order: number;
  isActive: boolean;
  parentId: string | null;
  commissionRate: number | null;
  requiresHealthCertificate: boolean;
  requiresColdChain: boolean;
  _count: { products: number; sellers: number; children: number };
}

type FormState = {
  slug: string;
  nameFr: string;
  nameEn: string;
  nameAr: string;
  descriptionFr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  parentId: string;
  commissionRate: number | '';
  requiresHealthCertificate: boolean;
  requiresColdChain: boolean;
};

const EMPTY_FORM: FormState = {
  slug: '',
  nameFr: '',
  nameEn: '',
  nameAr: '',
  descriptionFr: '',
  descriptionEn: '',
  descriptionAr: '',
  icon: 'shopping',
  imageUrl: '',
  order: 0,
  isActive: true,
  parentId: '',
  commissionRate: '',
  requiresHealthCertificate: false,
  requiresColdChain: false,
};

const SUGGESTED_ICONS = [
  'food-apple', 'bread-slice', 'fish', 'cupcake', 'palette', 'hanger', 'tshirt-crew', 'shoe-heel',
  'sofa', 'lamp', 'cellphone', 'laptop', 'lipstick', 'flower', 'book-open-variant', 'toy-brick',
  'basketball', 'paw', 'baby-carriage', 'watch', 'diamond-stone', 'leaf', 'coffee', 'shopping',
];

const slugify = (value: string) =>
  value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

export default function MarketplaceDomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Domain | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    apiClient
      .get<Domain[]>('/admin/marketplace/domains')
      .then((data) => setDomains(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const tree = useMemo(() => {
    const roots = domains.filter((d) => !d.parentId).sort((a, b) => a.order - b.order);
    return roots.map((root) => ({
      root,
      children: domains.filter((d) => d.parentId === root.id).sort((a, b) => a.order - b.order),
    }));
  }, [domains]);

  const openCreate = (parentId = '') => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, parentId, order: domains.filter((d) => (d.parentId ?? '') === parentId).length });
    setSlugTouched(false);
    setIsModalOpen(true);
  };

  const openEdit = (domain: Domain) => {
    setEditing(domain);
    setForm({
      slug: domain.slug,
      nameFr: domain.nameFr,
      nameEn: domain.nameEn,
      nameAr: domain.nameAr,
      descriptionFr: domain.descriptionFr ?? '',
      descriptionEn: domain.descriptionEn ?? '',
      descriptionAr: domain.descriptionAr ?? '',
      icon: domain.icon ?? '',
      imageUrl: domain.imageUrl ?? '',
      order: domain.order,
      isActive: domain.isActive,
      parentId: domain.parentId ?? '',
      commissionRate: domain.commissionRate ?? '',
      requiresHealthCertificate: domain.requiresHealthCertificate,
      requiresColdChain: domain.requiresColdChain,
    });
    setSlugTouched(true);
    setIsModalOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      slug: form.slug,
      nameFr: form.nameFr,
      nameEn: form.nameEn,
      nameAr: form.nameAr,
      descriptionFr: form.descriptionFr || undefined,
      descriptionEn: form.descriptionEn || undefined,
      descriptionAr: form.descriptionAr || undefined,
      icon: form.icon || undefined,
      imageUrl: form.imageUrl || undefined,
      order: form.order,
      isActive: form.isActive,
      parentId: form.parentId || null,
      commissionRate: form.commissionRate === '' ? null : form.commissionRate,
      requiresHealthCertificate: form.requiresHealthCertificate,
      requiresColdChain: form.requiresColdChain,
    };
    try {
      if (editing) await apiClient.patch(`/admin/marketplace/domains/${editing.id}`, payload);
      else await apiClient.post('/admin/marketplace/domains', payload);
      setIsModalOpen(false);
      load();
    } catch (error: any) {
      const msg = error.response?.data?.message;
      alert('Erreur : ' + (Array.isArray(msg) ? msg.join('\n') : msg || 'Erreur inconnue'));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (domain: Domain) => {
    try {
      await apiClient.patch(`/admin/marketplace/domains/${domain.id}`, { isActive: !domain.isActive });
      load();
    } catch (error: any) {
      alert('Erreur : ' + (error.response?.data?.message || 'Erreur inconnue'));
    }
  };

  const remove = async (domain: Domain) => {
    if (!confirm(`Supprimer le domaine « ${domain.nameFr} » ?`)) return;
    try {
      await apiClient.delete(`/admin/marketplace/domains/${domain.id}`);
      load();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur inconnue');
    }
  };

  const renderRow = (domain: Domain, isChild: boolean) => (
    <tr key={domain.id} className={domain.isActive ? '' : 'opacity-50'}>
      <td className="px-4 py-3">
        <div className={`flex items-center gap-3 ${isChild ? 'pl-8' : ''}`}>
          {isChild && <span className="text-gray-300">└</span>}
          {domain.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={domain.imageUrl} alt="" className="w-8 h-8 rounded object-cover" />
          ) : (
            <MdiIcon name={domain.icon ?? ''} size={24} />
          )}
          <div>
            <div className="font-medium text-gray-900">{domain.nameFr}</div>
            <div className="text-xs text-gray-500">
              {domain.nameEn} · <span dir="rtl">{domain.nameAr}</span> · <span className="font-mono">{domain.slug}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm tabular-nums">{domain.commissionRate != null ? `${domain.commissionRate} %` : '—'}</td>
      <td className="px-4 py-3 text-sm">
        <div className="flex flex-wrap gap-1">
          {domain.requiresHealthCertificate && <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800">Certificat sanitaire</span>}
          {domain.requiresColdChain && <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-800">Chaîne du froid</span>}
        </div>
      </td>
      <td className="px-4 py-3 text-sm tabular-nums">{domain._count.sellers} / {domain._count.products}</td>
      <td className="px-4 py-3 text-sm">
        <button onClick={() => toggleActive(domain)} className={domain.isActive ? 'text-green-700' : 'text-gray-500'}>
          {domain.isActive ? 'Actif' : 'Inactif'}
        </button>
      </td>
      <td className="px-4 py-3 text-sm whitespace-nowrap">
        <div className="flex gap-3">
          {!isChild && (
            <button onClick={() => openCreate(domain.id)} className="text-purple-700 hover:underline">
              + Sous-domaine
            </button>
          )}
          <button onClick={() => openEdit(domain)} className="text-indigo-600 hover:underline">Modifier</button>
          <button onClick={() => remove(domain)} className="text-red-600 hover:underline">Supprimer</button>
        </div>
      </td>
    </tr>
  );

  const rootOptions = domains.filter((d) => !d.parentId && d.id !== editing?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Domaines de vente</h1>
          <p className="text-gray-600">
            Catégories de la Marketplace (2 niveaux). Chaque vendeur ne publie que dans les domaines qui lui sont attribués.
          </p>
        </div>
        <button onClick={() => openCreate()} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
          + Nouveau domaine
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : tree.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Aucun domaine. Créez par exemple « Alimentation », « Artisanat », « Mode »…
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domaine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exigences</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendeurs / Produits</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tree.flatMap(({ root, children }) => [renderRow(root, false), ...children.map((c) => renderRow(c, true))])}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? `Modifier « ${editing.nameFr} »` : form.parentId ? 'Nouveau sous-domaine' : 'Nouveau domaine'}
        size="xl"
      >
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom (FR) *</label>
              <input
                required
                value={form.nameFr}
                onChange={(e) =>
                  setForm({ ...form, nameFr: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom (EN) *</label>
              <input required value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom (AR) *</label>
              <input required dir="rtl" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Identifiant (slug) *</label>
              <input
                required
                value={form.slug}
                onChange={(e) => { setSlugTouched(true); setForm({ ...form, slug: e.target.value }); }}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Domaine parent</label>
              <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2">
                <option value="">— Domaine principal —</option>
                {rootOptions.map((d) => (
                  <option key={d.id} value={d.id}>{d.nameFr}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ordre d&apos;affichage</label>
              <input type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Icône (MaterialCommunityIcons)</label>
            <div className="flex items-center gap-3 mt-1">
              <MdiIcon name={form.icon} size={28} />
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value.trim() })}
                className="block w-60 rounded-md border border-gray-300 px-3 py-2 font-mono text-sm" />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {SUGGESTED_ICONS.map((icon) => (
                <button
                  type="button"
                  key={icon}
                  title={icon}
                  onClick={() => setForm({ ...form, icon })}
                  className={`p-1.5 rounded border ${form.icon === icon ? 'border-primary bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <MdiIcon name={icon} size={20} />
                </button>
              ))}
            </div>
          </div>

          <SingleFileUpload label="Image (optionnelle, prioritaire sur l'icône)" value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <textarea placeholder="Description (FR)" rows={2} value={form.descriptionFr}
              onChange={(e) => setForm({ ...form, descriptionFr: e.target.value })} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
            <textarea placeholder="Description (EN)" rows={2} value={form.descriptionEn}
              onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
            <textarea placeholder="الوصف (AR)" dir="rtl" rows={2} value={form.descriptionAr}
              onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-sm font-medium text-gray-700">Commission propre au domaine (%)</label>
              <input type="number" min={0} max={100} step={0.5} value={form.commissionRate}
                onChange={(e) => setForm({ ...form, commissionRate: e.target.value === '' ? '' : Number(e.target.value) })}
                placeholder="Vide = taux Marketplace de la plateforme"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
            </div>
            <div className="space-y-2 pt-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.requiresHealthCertificate}
                  onChange={(e) => setForm({ ...form, requiresHealthCertificate: e.target.checked })} />
                Exiger un certificat sanitaire des vendeurs
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.requiresColdChain}
                  onChange={(e) => setForm({ ...form, requiresColdChain: e.target.checked })} />
                Produits frais : livraison CheckAllPack en chaîne du froid
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Domaine actif (visible dans l&apos;app)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700">
              Annuler
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50">
              {saving ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
