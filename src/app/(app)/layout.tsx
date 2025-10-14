
'use client';

import AppHeader from '@/components/app-header';
import AppSidebar from '@/components/app-sidebar';
import type { User } from '@/lib/types';
import { usePathname, useRouter } from 'next/navigation';
import { ReactFlowProvider } from 'reactflow';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase';
import { findUserById } from '@/lib/data';

function useUserSession() {
  const { user: firebaseUser, isUserLoading, userError } = useUser();
  const [appUser, setAppUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (firebaseUser) {
        findUserById(firebaseUser.uid).then(userFromDb => {
            if (userFromDb && userFromDb.id !== '0') {
                setAppUser(userFromDb);
            } else {
                // User exists in Firebase Auth, but not in our DB.
                // This can happen, e.g. if DB entry failed during signup.
                // For now, treat as not logged in.
                router.push('/login');
            }
        });
      } else if (!userError) {
        router.push('/login');
      }
    }
  }, [firebaseUser, isUserLoading, userError, router]);

  return { user: appUser, loading: isUserLoading || (firebaseUser && !appUser) };
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUserSession();
  const pathname = usePathname();

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
