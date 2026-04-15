'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';

interface UseApiOptions<T> {
  immediate?: boolean;
  initialData?: T;
}

export function useApi<T = any>(
  url: string,
  options: UseApiOptions<T> = {}
) {
  const { immediate = true, initialData } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (params?: any) => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiClient.get<T>(url, params);
        setData(result);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [url]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  const refetch = () => execute();

  return {
    data,
    loading,
    error,
    execute,
    refetch,
  };
}

export function useApiMutation<T = any, D = any>(url: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (data: D, method: 'post' | 'put' | 'delete' = 'post') => {
    setLoading(true);
    setError(null);

    try {
      let result: T;

      if (method === 'post') {
        result = await apiClient.post<T>(url, data);
      } else if (method === 'put') {
        result = await apiClient.put<T>(url, data);
      } else {
        result = await apiClient.delete<T>(url);
      }

      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate,
    loading,
    error,
  };
}
