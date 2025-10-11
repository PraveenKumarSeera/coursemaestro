'use client';

import AppHeader from '@/components/app-header';
import AppSidebar from '@/components/app-sidebar';
import type { User } from '@/lib/types';
import { usePathname, useRouter } from 'next/navigation';
import { ReactFlowProvider } from 'reactflow';
import { useEffect, useState } from 'react';
import { getSession } from '@/lib/session';
import { Skeleton } from '@/components/ui/skeleton';

// This is a temporary client-side wrapper to fetch session,
// a proper solution might involve a session provider or middleware.
function useUserSession() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchSession() {
      const { user: sessionUser } = await getSession();
      if (!sessionUser) {
        router.push('/login');
      } else {
        setUser(sessionUser);
      }
      setLoading(false);
    }
    fetchSession();
  }, [router]);

  return { user, loading };
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUserSession();
  const pathname = usePathname();

  // Special case for certificate page, which has a different layout
  if (pathname.includes('/certificates/')) {
    return <>{children}</>;
  }

  if (loading || !user) {
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-card md:block p-4 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
                    <Skeleton className="h-8 w-full" />
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
                     <Skeleton className="h-48 w-full" />
                     <Skeleton className="h-96 w-full" />
                </main>
            </div>
        </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <AppSidebar user={user} />
        <div className="flex flex-col">
          <AppHeader user={user} />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </ReactFlowProvider>
  );
}