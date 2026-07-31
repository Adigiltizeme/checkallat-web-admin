'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

const ROLES = ['admin', 'super_admin', 'support'] as const;
const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin', admin: 'Admin', support: 'Support',
};
const ALL_PERMISSIONS = [
  'manage_users', 'manage_pros', 'manage_drivers', 'manage_sellers',
  'manage_products', 'manage_transactions', 'manage_disputes', 'view_analytics',
];

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

export default function AdminDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [form, setForm] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data: any = await apiClient.get(`/admin/admins/${id}`);
      setAdmin(data);
      setForm({
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        permissions: data.permissions ?? [],
        isActive: data.isActive,
      });
    } catch (err: any) {
      alert('Erreur : ' + (err.response?.data?.message || err.message));
      router.push('/admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const togglePermission = (p: string) => {
    setForm((f: any) => ({
      ...f,
      permissions: f.permissions.includes(p)
        ? f.permissions.filter((x: string) => x !== p)
        : [...f.permissions, p],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.patch(`/admin/admins/${id}`, form);
      alert('Modifications enregistrées');
      load();
    } catch (err: any) {
      alert('Erreur : ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { alert('Le mot de passe doit contenir au moins 8 caractères'); return; }
    if (!confirm('Réinitialiser le mot de passe de cet admin ?')) return;
    setResetting(true);
    try {
      await apiClient.post(`/admin/admins/${id}/reset-password`, { newPassword });
      alert('Mot de passe réinitialisé avec succès');
      setNewPassword('');
    } catch (err: any) {
      alert('Erreur : ' + (err.response?.data?.message || err.message));
    } finally {
      setResetting(false);
    }
  };

  if (loading || !form) {
    return <div className="p-10 text-center text-gray-400">Chargement...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => router.push('/admins')}
          className="text-sm text-gray-500 hover:text-gray-800">← Retour</button>
        <h1 className="text-2xl font-bold text-gray-900">
          {admin.firstName} {admin.lastName}
        </h1>
      </div>

      {/* Infos */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Informations</h2>
        <InfoRow label="Email" value={admin.email} />
        <InfoRow label="Créé le" value={new Date(admin.createdAt).toLocaleString('fr-FR')} />
        <InfoRow label="Dernière connexion" value={admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString('fr-FR') : '—'} />
      </div>

      {/* Formulaire d'édition */}
      <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Modifier le compte</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Prénom</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" required
              value={form.firstName} onChange={e => setForm((f: any) => ({ ...f, firstName: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nom</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" required
              value={form.lastName} onChange={e => setForm((f: any) => ({ ...f, lastName: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Rôle</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.role} onChange={e => setForm((f: any) => ({ ...f, role: e.target.value }))}>
              {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 pt-5">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isActive}
                onChange={e => setForm((f: any) => ({ ...f, isActive: e.target.checked }))}
                className="rounded" />
              Compte actif
            </label>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Permissions</label>
          <div className="flex flex-wrap gap-3">
            {ALL_PERMISSIONS.map(p => (
              <label key={p} className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input type="checkbox" checked={form.permissions.includes(p)}
                  onChange={() => togglePermission(p)} className="rounded" />
                {p.replace('_', ' ')}
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="px-5 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50">
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>

      {/* Réinitialisation du mot de passe */}
      <form onSubmit={handleResetPassword} className="bg-white border border-orange-200 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-orange-700">Réinitialiser le mot de passe</h2>
        <p className="text-xs text-gray-500">Le nouveau mot de passe sera actif immédiatement.</p>
        <div className="flex gap-3">
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
            type="password"
            placeholder="Nouveau mot de passe (min. 8 caractères)"
            minLength={8}
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <button type="submit" disabled={resetting || newPassword.length < 8}
            className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50">
            {resetting ? 'Réinitialisation...' : 'Réinitialiser'}
          </button>
        </div>
      </form>
    </div>
  );
}
