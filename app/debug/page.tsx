'use client';

import { useEffect, useState } from 'react';
import { getAccessToken, getUser, isAuthenticated } from '@/lib/auth';

export default function DebugPage() {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    const debugInfo = {
      isAuthenticated: isAuthenticated(),
      accessToken: getAccessToken(),
      user: getUser(),
      localStorage: typeof window !== 'undefined' ? {
        accessToken: localStorage.getItem('accessToken'),
        user: localStorage.getItem('user'),
      } : null,
    };

    setInfo(debugInfo);
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Debug Auth</h1>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">État d'authentification</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(info, null, 2)}
          </pre>
        </div>

        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <h3 className="font-bold text-blue-900">Instructions</h3>
          <ol className="mt-2 space-y-1 text-sm list-decimal list-inside">
            <li>Si `isAuthenticated` est `false`, le token n'est pas présent</li>
            <li>Si `accessToken` est `null`, le localStorage est vide</li>
            <li>Vérifiez que `user` contient les bonnes données</li>
          </ol>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Aller vers /login
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="ml-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Aller vers /dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
