'use client';

import { useState } from 'react';
import { login } from '@/lib/auth';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    identifier: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(credentials);

      // Attendre un petit moment pour que le localStorage soit bien synchronisé
      await new Promise(resolve => setTimeout(resolve, 100));

      // Forcer un rechargement complet au lieu d'un client-side routing
      window.location.href = '/';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="CheckAll@t" style={{ display: 'block', margin: '0 auto', width: '192px', height: 'auto' }} />
          <h2 className="mt-4 text-center text-2xl font-bold text-gray-900">
            Administration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connectez-vous pour accéder au panel admin
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                Email ou Téléphone
              </label>
              <input
                id="identifier"
                name="identifier"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                value={credentials.identifier}
                onChange={(e) =>
                  setCredentials(prev => ({ ...prev, identifier: e.target.value ?? '' }))
                }
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials(prev => ({ ...prev, password: e.target.value ?? '' }))
                }
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
