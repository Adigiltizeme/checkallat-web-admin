'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { useZone } from '@/contexts/ZoneContext';

const ROLES = ['admin', 'super_admin', 'support'] as const;
const ALL_PERMISSIONS = [
  'manage_users', 'manage_pros', 'manage_drivers', 'manage_sellers',
  'manage_products', 'manage_transactions', 'manage_disputes', 'view_analytics',
];

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  support: 'Support',
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  support: 'bg-gray-100 text-gray-700',
};

const emptyForm = {
  email: '', password: '', firstName: '', lastName: '',
  role: 'admin', permissions: [] as string[],
};

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const { selectedZone } = useZone();

  const load = () => {
    setLoading(true);
    apiClient.get('/admin/admins')
      .then((data: any) => setAdmins(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [selectedZone]);

  const togglePermission = (p: string) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(p)
        ? f.permissions.filter(x => x !== p)
        : [...f.permissions, p],
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('/admin/admins', form);
      alert('Admin créé avec succès');
      setForm({ ...emptyForm });
      setShowForm(false);
      load();
    } catch (err: any) {
      alert('Erreur : ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    if (!confirm(`${current ? 'Désactiver' : 'Réactiver'} cet admin ?`)) return;
    try {
      await apiClient.patch(`/admin/admins/${id}`, { isActive: !current });
      load();
    } catch (err: any) {
      alert('Erreur : ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer définitivement l'admin ${name} ?`)) return;
    try {
      await apiClient.delete(`/admin/admins/${id}`);
      alert('Admin supprimé');
      load();
    } catch (err: any) {
      alert('Erreur : ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des admins</h1>
          <p className="text-sm text-gray-500 mt-1">Super admin uniquement</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          {showForm ? 'Annuler' : '+ Nouvel admin'}
        </button>
      </div>

      {/* Formulaire de création */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Créer un admin</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Prénom</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" required
                value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nom</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" required
                value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" type="email" required
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Mot de passe (min. 8 car.)</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" type="password" required minLength={8}
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Rôle</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Permissions</label>
            <div className="flex flex-wrap gap-2">
              {ALL_PERMISSIONS.map(p => (
                <label key={p} className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input type="checkbox" checked={form.permissions.includes(p)}
                    onChange={() => togglePermission(p)} className="rounded" />
                  {p.replace('_', ' ')}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50">
              {saving ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Chargement...</div>
        ) : admins.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Aucun admin trouvé</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nom</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Rôle</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Dernière connexion</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {a.firstName} {a.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{a.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[a.role] ?? 'bg-gray-100 text-gray-700'}`}>
                      {ROLE_LABELS[a.role] ?? a.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${a.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {a.isActive ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString('fr-FR') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admins/${a.id}`}
                        className="text-xs px-3 py-1.5 border rounded-lg hover:bg-gray-50 text-gray-700">
                        Modifier
                      </Link>
                      <button onClick={() => handleToggleActive(a.id, a.isActive)}
                        className={`text-xs px-3 py-1.5 border rounded-lg ${a.isActive ? 'text-orange-600 hover:bg-orange-50 border-orange-200' : 'text-green-600 hover:bg-green-50 border-green-200'}`}>
                        {a.isActive ? 'Désactiver' : 'Réactiver'}
                      </button>
                      <button onClick={() => handleDelete(a.id, `${a.firstName} ${a.lastName}`)}
                        className="text-xs px-3 py-1.5 border border-red-200 rounded-lg text-red-600 hover:bg-red-50">
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
