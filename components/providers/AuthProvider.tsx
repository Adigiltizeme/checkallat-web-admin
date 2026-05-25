'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { isAuthenticated } from '@/lib/auth';
import { SidebarProvider } from '@/contexts/SidebarContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login' || pathname === '/test-login';
  const isPublicPage = pathname.startsWith('/track');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Vérifier l'authentification au chargement et quand pathname change
    const authenticated = isAuthenticated();

    if (!authenticated && !isLoginPage && !isPublicPage) {
      router.push('/login');
    } else {
      setIsChecking(false);
    }
  }, [pathname, isLoginPage, router]);

  if (isLoginPage || isPublicPage) {
    return <>{children}</>;
  }

  // Afficher un loader pendant la vérification
  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto p-3 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
