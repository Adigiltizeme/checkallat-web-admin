'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, logout as authLogout } from '@/lib/auth';

export function useAuth() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsAuth(authenticated);

      if (!authenticated && typeof window !== 'undefined' && window.location.pathname !== '/login') {
        router.push('/login');
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const logout = () => {
    authLogout();
    setIsAuth(false);
    router.push('/login');
  };

  return {
    isAuthenticated: isAuth,
    loading,
    logout,
  };
}
