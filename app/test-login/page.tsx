'use client';

import { useState } from 'react';
import axios from 'axios';

export default function TestLoginPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const testLogin = async () => {
    try {
      setError(null);
      setResult(null);

      const API_URL = 'http://localhost:4000/api/v1';

      console.log('🔍 Testing login...');
      console.log('API_URL:', API_URL);
      console.log('Endpoint:', `${API_URL}/admin/login`);

      const loginAxios = axios.create({
        baseURL: API_URL,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await loginAxios.post('/admin/login', {
        email: 'admin@checkallat.com',
        password: 'Admin@123',
      });

      console.log('✅ Success:', response.data);
      setResult(response.data);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError({
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Test Login API</h1>

        <button
          onClick={testLogin}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Login
        </button>

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h2 className="font-bold text-green-800">✅ Success</h2>
            <pre className="mt-2 text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <h2 className="font-bold text-red-800">❌ Error</h2>
            <pre className="mt-2 text-sm overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}

        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <h2 className="font-bold text-blue-800">Instructions</h2>
          <ol className="mt-2 space-y-1 text-sm list-decimal list-inside">
            <li>Ouvrez la console (F12)</li>
            <li>Cliquez sur "Test Login"</li>
            <li>Vérifiez les logs dans la console</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
