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

  if (typeof window !== 'undefined') {
    // Tokens : cookie uniquement (localStorage vulnérable aux XSS)
    // SameSite=Strict protège contre le CSRF ; Secure force HTTPS en production
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `accessToken=${response.data.accessToken}; path=/; SameSite=Strict; max-age=900${secure}`;
    if (response.data.refreshToken) {
      document.cookie = `refreshToken=${response.data.refreshToken}; path=/; SameSite=Strict; max-age=604800${secure}`;
    }
    // Données de profil non-sensibles (nom, rôle) — pas de credential, localStorage OK
    localStorage.setItem('user', JSON.stringify(response.data.user));
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
    document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Strict';
    document.cookie = 'refreshToken=; path=/; max-age=0; SameSite=Strict';
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]+)/);
  return match ? match[1] : null;
}

export function getUser(): any | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
