'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { apiClient } from '@/lib/api';
import { MdiIcon } from '@/components/shared/MdiIcon';

// ── Icônes MCI fréquentes pour le picker ──────────────────────────────────────
const COMMON_ICONS = [
  { name: 'water-pump',      label: 'Plomberie' },
  { name: 'flash',           label: 'Électricité' },
  { name: 'format-paint',    label: 'Peinture' },
  { name: 'hammer',          label: 'Bricolage' },
  { name: 'broom',           label: 'Ménage' },
  { name: 'saw-blade',       label: 'Menuiserie' },
  { name: 'air-conditioner', label: 'Climatisation' },
  { name: 'shopping',        label: 'Marketplace' },
  { name: 'truck-fast',      label: 'Transport' },
  { name: 'moped',           label: 'Livraison' },
  { name: 'briefcase',       label: 'Business' },
  { name: 'home-city',       label: 'Immobilier' },
  { name: 'wrench',          label: 'Maintenance' },
  { name: 'scissors-cutting',label: 'Coiffure' },
  { name: 'flower',          label: 'Jardinage' },
  { name: 'dog',             label: 'Animaux' },
];

// ── Upload d'image ─────────────────────────────────────────────────────────────
async function uploadImageFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await apiClient.uploadFile<{ url: string }>('/upload/image', fd);
  return res.url;
}

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

function ImageUploadField({ label, value, onChange }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Fichier non valide (image requise)'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Image trop volumineuse (max 10 Mo)'); return; }
    setError('');
    setUploading(true);
    try {
      const url = await uploadImageFile(file);
      onChange(url);
    } catch {
      setError('Erreur upload — réessayez');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <div
        className={`relative rounded-lg border-2 border-dashed transition-colors ${dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 bg-gray-50'}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <div className="flex items-center gap-3 p-2">
          {/* Prévisualisation */}
          {value ? (
            <div className="relative flex-shrink-0">
              <img
                src={value}
                alt="preview"
                className="w-16 h-12 object-cover rounded border border-gray-200"
                onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
              />
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center leading-none hover:bg-red-600"
                title="Supprimer l'image"
              >×</button>
            </div>
          ) : (
            <div className="w-16 h-12 rounded border border-gray-200 bg-white flex items-center justify-center text-gray-300 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Champ URL manuel */}
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://... ou glissez une image"
              className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
            />
            {/* Bouton parcourir */}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin w-3 h-3 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Upload...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Parcourir / Glisser
                </>
              )}
            </button>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
    </div>
  );
}

// ── Champ icône avec preview MDI + picker ─────────────────────────────────────
interface IconPickerFieldProps {
  value: string;
  onChange: (icon: string) => void;
}

function IconPickerField({ value, onChange }: IconPickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">Icone (MaterialCommunityIcons)</label>
      <div className="flex items-center gap-2">
        {/* Prévisualisation live */}
        <div className="w-9 h-9 flex items-center justify-center rounded border border-gray-200 bg-white flex-shrink-0">
          <MdiIcon name={value} size={22} />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ex: pipe-wrench"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="px-2 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-xs text-gray-600 whitespace-nowrap"
        >
          {showPicker ? '▲ Fermer' : '▼ Icônes'}
        </button>
      </div>
      {showPicker && (
        <div className="mt-2 p-2 border border-gray-200 rounded-lg bg-white grid grid-cols-8 gap-1">
          {COMMON_ICONS.map((ic) => (
            <button
              key={ic.name}
              type="button"
              title={`${ic.label} (${ic.name})`}
              onClick={() => { onChange(ic.name); setShowPicker(false); }}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-indigo-50 transition-colors ${value === ic.name ? 'bg-indigo-100 ring-1 ring-indigo-400' : ''}`}
            >
              <MdiIcon name={ic.name} size={20} />
              <span className="text-[9px] text-gray-500 leading-tight text-center truncate w-full">{ic.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ServiceCategory {
  id: string;
  slug: string;
  nameEn: string;
  nameFr: string;
  nameAr: string;
  icon: string;
  imageUrl?: string;
  imageBanner?: string;
  color?: string | null;
  sortOrder?: number;
  isActive: boolean;
}

/** Couleurs proposées pour la vignette de la catégorie dans l'application */
const CATEGORY_COLORS = [
  '#3498DB', '#1ABC9C', '#27AE60', '#00BCD4', '#F1C40F', '#FF9500',
  '#E74C3C', '#E91E63', '#9B59B6', '#6366F1', '#A0522D', '#607D8B',
];

interface ServiceCategoriesManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMPTY_FORM = {
  nameEn: '',
  nameFr: '',
  nameAr: '',
  slug: '',
  icon: '',
  imageUrl: '',
  imageBanner: '',
  color: '',
  sortOrder: '',
  isActive: true,
};

type CategoryForm = typeof EMPTY_FORM;

function slugifyFr(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64) || 'nouvelle-categorie';
}

interface InlineCategoryFormProps {
  form: CategoryForm;
  setForm: (f: CategoryForm) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitting: boolean;
  submitLabel: string;
  title: string;
  formId: string;
}

function InlineCategoryForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  submitting,
  submitLabel,
  title,
  formId,
}: InlineCategoryFormProps) {
  return (
    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-3">
      <h4 className="text-sm font-semibold text-blue-800">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Nom FR <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.nameFr}
            onChange={(e) => setForm({ ...form, nameFr: e.target.value })}
            placeholder="ex: Plomberie"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Nom EN <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.nameEn}
            onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
            placeholder="ex: Plumbing"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Nom AR</label>
          <input
            type="text"
            value={form.nameAr}
            onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
            placeholder="ex: السباكة"
            dir="rtl"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Slug</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="plomberie"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-gray-400 mt-0.5">Identifiant unique kebab-case</p>
        </div>
        <div className="md:col-span-1">
          <IconPickerField value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Couleur dans l&apos;application</label>
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                onClick={() => setForm({ ...form, color: c })}
                className={`h-6 w-6 rounded-full border-2 ${form.color.toUpperCase() === c ? 'border-gray-900' : 'border-white'} shadow`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={/^#[0-9A-Fa-f]{6}$/.test(form.color) ? form.color : '#3498DB'}
              onChange={(e) => setForm({ ...form, color: e.target.value.toUpperCase() })}
              className="h-7 w-9 cursor-pointer rounded border border-gray-300 bg-white"
              title="Autre couleur"
            />
            {form.color && (
              <button type="button" onClick={() => setForm({ ...form, color: '' })} className="text-xs text-gray-500 underline">
                Automatique
              </button>
            )}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Ordre d&apos;affichage</label>
          <input
            type="number"
            min={0}
            step={10}
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            placeholder="ex: 10"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-gray-400 mt-0.5">Plus petit = affiché en premier dans l&apos;application</p>
        </div>
        <div className="flex items-center gap-2 pt-5">
          <input
            type="checkbox"
            id={`isActive-${formId}`}
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="w-4 h-4 accent-primary"
          />
          <label htmlFor={`isActive-${formId}`} className="text-xs font-medium text-gray-700">
            Actif
          </label>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ImageUploadField
          label="Image (optionnel)"
          value={form.imageUrl}
          onChange={(url) => setForm({ ...form, imageUrl: url })}
        />
        <ImageUploadField
          label="Bannière (optionnel)"
          value={form.imageBanner}
          onChange={(url) => setForm({ ...form, imageBanner: url })}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="px-4 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
        >
          {submitting ? 'En cours...' : submitLabel}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

export function ServiceCategoriesManager({ isOpen, onClose }: ServiceCategoriesManagerProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateFormRaw] = useState<CategoryForm>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CategoryForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const setCreateForm = (f: CategoryForm) => {
    const prevFr = createForm.nameFr;
    const autoSlug = f.nameFr !== prevFr ? slugifyFr(f.nameFr) : f.slug;
    setCreateFormRaw({ ...f, slug: autoSlug });
  };

  // Pays où chaque catégorie est proposée dans l'application (tarif actif)
  const [availability, setAvailability] = useState<Record<string, string[]>>({});

  const loadCategories = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [data, pricings] = await Promise.all([
        apiClient.get<ServiceCategory[]>('/services/categories', { params: { activeOnly: false } }),
        apiClient.get<any[]>('/admin/service-pricing').catch(() => [] as any[]),
      ]);
      setCategories(Array.isArray(data) ? data : []);
      const map: Record<string, string[]> = {};
      for (const pr of Array.isArray(pricings) ? pricings : []) {
        if (pr?.isActive && pr.categorySlug && pr.countryId) (map[pr.categorySlug] ??= []).push(pr.countryId);
      }
      setAvailability(map);
    } catch {
      setFetchError('Erreur lors du chargement des categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      setShowCreateForm(false);
      setEditingId(null);
      setCreateFormRaw(EMPTY_FORM);
    }
  }, [isOpen]);

  const handleCreate = async () => {
    if (!createForm.nameFr.trim()) { alert('Le nom francais est obligatoire'); return; }
    if (!createForm.nameEn.trim()) { alert('Le nom anglais est obligatoire'); return; }
    if (!createForm.slug.trim()) { alert('Le slug est obligatoire'); return; }
    setCreating(true);
    try {
      await apiClient.post('/services/categories', {
        nameEn: createForm.nameEn.trim(),
        nameFr: createForm.nameFr.trim(),
        nameAr: createForm.nameAr.trim(),
        slug: createForm.slug.trim(),
        icon: createForm.icon.trim(),
        imageUrl: createForm.imageUrl.trim() || undefined,
        imageBanner: createForm.imageBanner.trim() || undefined,
        color: createForm.color || undefined,
        sortOrder: createForm.sortOrder === '' ? undefined : Math.max(0, Math.round(Number(createForm.sortOrder) || 0)),
        isActive: createForm.isActive,
      });
      setCreateFormRaw(EMPTY_FORM);
      setShowCreateForm(false);
      await loadCategories();
    } catch (err: any) {
      alert('Erreur : ' + (err.response?.data?.message ?? err.message ?? 'Erreur inconnue'));
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (cat: ServiceCategory) => {
    setEditingId(cat.id);
    setEditForm({
      nameEn: cat.nameEn,
      nameFr: cat.nameFr,
      nameAr: cat.nameAr,
      slug: cat.slug,
      icon: cat.icon,
      imageUrl: cat.imageUrl ?? '',
      imageBanner: cat.imageBanner ?? '',
      color: cat.color ?? '',
      sortOrder: cat.sortOrder != null ? String(cat.sortOrder) : '',
      isActive: cat.isActive,
    });
    setShowCreateForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    if (!editForm.nameFr.trim()) { alert('Le nom francais est obligatoire'); return; }
    if (!editForm.nameEn.trim()) { alert('Le nom anglais est obligatoire'); return; }
    setSaving(true);
    try {
      await apiClient.put(`/services/categories/${editingId}`, {
        nameEn: editForm.nameEn.trim(),
        nameFr: editForm.nameFr.trim(),
        nameAr: editForm.nameAr.trim(),
        slug: editForm.slug.trim(),
        icon: editForm.icon.trim(),
        imageUrl: editForm.imageUrl.trim() || undefined,
        imageBanner: editForm.imageBanner.trim() || undefined,
        color: editForm.color || undefined,
        sortOrder: editForm.sortOrder === '' ? undefined : Math.max(0, Math.round(Number(editForm.sortOrder) || 0)),
        isActive: editForm.isActive,
      });
      setEditingId(null);
      setEditForm(EMPTY_FORM);
      await loadCategories();
    } catch (err: any) {
      alert('Erreur : ' + (err.response?.data?.message ?? err.message ?? 'Erreur inconnue'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: ServiceCategory) => {
    if (!confirm(`Supprimer la categorie "${cat.nameFr}" ? Cette action est irreversible.`)) return;
    try {
      await apiClient.delete(`/services/categories/${cat.id}`);
      if (editingId === cat.id) cancelEdit();
      await loadCategories();
    } catch (err: any) {
      alert(
        'Impossible de supprimer : ' +
          (err.response?.data?.message ?? err.message ?? 'Erreur inconnue'),
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerer les categories de services" size="xl">
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Categories de services stockees en base de donnees.
          </p>
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              if (editingId) cancelEdit();
            }}
            className="px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary-dark flex items-center gap-1"
          >
            <span className="text-base leading-none">+</span> Nouvelle categorie
          </button>
        </div>

        {showCreateForm && (
          <InlineCategoryForm
            form={createForm}
            setForm={setCreateForm}
            onSubmit={handleCreate}
            onCancel={() => { setShowCreateForm(false); setCreateFormRaw(EMPTY_FORM); }}
            submitting={creating}
            submitLabel="Creer"
            title="Nouvelle categorie"
            formId="create"
          />
        )}

        {loading && <p className="text-sm text-gray-500 text-center py-4">Chargement...</p>}
        {fetchError && <p className="text-sm text-red-500 text-center py-4">{fetchError}</p>}

        {!loading && !fetchError && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Ordre', 'Icone', 'Nom FR', 'Nom EN', 'Nom AR', 'Slug', 'Actif', 'Proposée dans', 'Images', 'Actions'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-6 text-center text-gray-400 italic">
                      Aucune categorie en base de donnees
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr
                      key={cat.id}
                      className={`hover:bg-gray-50 ${!cat.isActive ? 'opacity-50' : ''} ${editingId === cat.id ? 'bg-indigo-50' : ''}`}
                    >
                      <td className="px-4 py-3 text-xs text-gray-500 tabular-nums">{cat.sortOrder ?? 0}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-7 h-7 flex items-center justify-center rounded"
                            style={{ backgroundColor: cat.color ? `${cat.color}26` : '#F3F4F6', color: cat.color ?? undefined }}
                            title={cat.color ?? 'Couleur automatique'}
                          >
                            <MdiIcon name={cat.icon} size={18} />
                          </div>
                          <span className="text-xs text-gray-400 font-mono hidden xl:block">{cat.icon}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {cat.nameFr}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{cat.nameEn}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap" dir="rtl">
                        {cat.nameAr}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                        {cat.slug}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            cat.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {cat.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs">
                        {(availability[cat.slug] ?? []).length > 0 ? (
                          <span className="text-gray-700">{availability[cat.slug].sort().join(', ')}</span>
                        ) : (
                          <span className="text-amber-700" title="Aucun tarif actif : la catégorie n'apparaît dans aucun pays de l'application">
                            ⚠ Aucun pays (sans tarif actif)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {cat.imageUrl ? (
                            <a href={cat.imageUrl} target="_blank" rel="noreferrer" title="Image">
                              <img src={cat.imageUrl} alt="img" className="w-10 h-7 object-cover rounded border border-gray-200 hover:opacity-80" />
                            </a>
                          ) : <span className="w-10 h-7 rounded border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300 text-xs">img</span>}
                          {cat.imageBanner ? (
                            <a href={cat.imageBanner} target="_blank" rel="noreferrer" title="Bannière">
                              <img src={cat.imageBanner} alt="banner" className="w-14 h-7 object-cover rounded border border-gray-200 hover:opacity-80" />
                            </a>
                          ) : <span className="w-14 h-7 rounded border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300 text-xs">bann.</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => startEdit(cat)}
                            className="text-indigo-600 hover:text-indigo-900 text-xs font-medium"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(cat)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {editingId && (
          <div className="border-t pt-4">
            <InlineCategoryForm
              form={editForm}
              setForm={setEditForm}
              onSubmit={handleSaveEdit}
              onCancel={cancelEdit}
              submitting={saving}
              submitLabel="Sauvegarder"
              title={`Modifier : ${categories.find((c) => c.id === editingId)?.nameFr ?? ''}`}
              formId="edit"
            />
          </div>
        )}

        <div className="flex justify-end pt-2 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}