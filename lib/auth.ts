import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface LoginCredentials {
  identifier: string;
  password: string;
}

interface AuthResponse {
  user: any;
  accessToken: string;
  refreshToken?: string;
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  // Créer une instance axios dédiée au login (sans intercepteurs)
  const loginAxios = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Pour l'admin, on utilise /admin/login et on envoie "email" au lieu de "identifier"
  const response = await loginAxios.post('/admin/login', {
    email: credentials.identifier,
    password: credentials.password,
  });

  // Store tokens
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', response.data.accessToken);
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(response.data.user));
    // Cookie pour le middleware Next.js (protection server-side)
    document.cookie = `accessToken=${response.data.accessToken}; path=/; SameSite=Strict`;
  }

  return response.data;
}

export function logout(autoLogout: boolean = false) {
  // Ne demander confirmation que si c'est un logout manuel
  if (!autoLogout) {
    const confirmLogout = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
    if (!confirmLogout) return;
  }

  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // Supprimer le cookie de session
    document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Strict';
    window.location.href = '/login';
  }
}

export function getAccessToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
}

export function getUser(): any | null {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
