import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken, logout } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Prevent multiple concurrent refresh calls
let isRefreshing = false;
let refreshQueue: ((token: string) => void)[] = [];

function processQueue(token: string) {
  refreshQueue.forEach((resolve) => resolve(token));
  refreshQueue = [];
}

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

    // Response interceptor — silent token refresh on 401
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Only handle 401, don't retry twice, skip login page and refresh endpoint
        if (
          error.response?.status !== 401 ||
          originalRequest._retry ||
          originalRequest.url?.includes('/auth/refresh-token') ||
          (typeof window !== 'undefined' && window.location.pathname === '/login')
        ) {
          return Promise.reject(error);
        }

        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          logout(true);
          return Promise.reject(error);
        }

        // If a refresh is already in progress, queue this request
        if (isRefreshing) {
          return new Promise<string>((resolve) => {
            refreshQueue.push(resolve);
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.client(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const res = await axios.post(
            `${API_URL}/auth/refresh-token`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } },
          );
          const newToken: string = res.data.accessToken;
          setAccessToken(newToken);
          processQueue(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return this.client(originalRequest);
        } catch {
          refreshQueue = [];
          logout(true);
          return Promise.reject(error);
        } finally {
          isRefreshing = false;
        }
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
