import axios, { AxiosInstance } from 'axios';
import { getAccessToken, logout } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor (add token + CSRF header)
    this.client.interceptors.request.use(
      (config) => {
        const token = getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // Protection CSRF : les requêtes cross-site ne peuvent pas envoyer
        // de headers personnalisés — ce header suffit à bloquer les attaques CSRF.
        const isMutation = ['post', 'put', 'patch', 'delete'].includes(
          (config.method ?? '').toLowerCase(),
        );
        if (isMutation) {
          config.headers['X-Admin-Request'] = '1';
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor (handle 401)
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Ne pas déconnecter si on est déjà sur la page de login
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            logout(true); // autoLogout = true (pas de confirmation)
          }
        }
        return Promise.reject(error);
      },
    );
  }

  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
