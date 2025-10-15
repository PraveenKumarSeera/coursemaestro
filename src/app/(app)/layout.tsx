
'use client';

import AppHeader from '@/components/app-header';
import AppSidebar from '@/components/app-sidebar';
import type { User, Notification } from '@/lib/types';
import { usePathname } from 'next/navigation';
import { ReactFlowProvider } from 'reactflow';
import { useEffect, useState } from 'react';
import { getSession } from '@/lib/session';
import { getNotificationsForUser } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

function useUserSession() {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const { user } = await getSession();
      if (user) {
        const userNotifications = await getNotificationsForUser(user.id);
        setUser(user);
        setNotifications(userNotifications);
      }
      setLoading(false);
    }
    loadSession();
  }, []);

  return { user, notifications, loading };
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, notifications, loading } = useUserSession();
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
          <AppHeader user={user} notifications={notifications} />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </ReactFlowProvider>
  );
}
