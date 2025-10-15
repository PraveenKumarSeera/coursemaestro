
'use client';

import AppHeader from '@/components/app-header';
import AppSidebar from '@/components/app-sidebar';
import type { User, Notification } from '@/lib/types';
import { usePathname } from 'next/navigation';
import { ReactFlowProvider } from 'reactflow';
import { useEffect, useState, useRef } from 'react';
import { getSession } from '@/lib/session';
import { getNotificationsForUser } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import FloatingAIAssistant from '@/components/ai/floating-ai-assistant';

function useUserSession() {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const previousUnreadCount = useRef(0);

  const playNotificationSound = () => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!context) return;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(1000, context.currentTime);
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.5);
    } catch (e) {
      console.error("Failed to play notification sound", e);
    }
  };

  useEffect(() => {
    const fetchNotifications = async (currentUser: User) => {
      const userNotifications = await getNotificationsForUser(currentUser.id);
      setNotifications(userNotifications);

      const currentUnreadCount = userNotifications.filter(n => !n.isRead).length;
      if (currentUnreadCount > previousUnreadCount.current) {
        playNotificationSound();
      }
      previousUnreadCount.current = currentUnreadCount;
    };
    
    async function loadSession() {
      const { user } = await getSession();
      if (user) {
        setUser(user);
        setLoading(false);
        await fetchNotifications(user); // Initial fetch

        const intervalId = setInterval(() => fetchNotifications(user), 15000); // Poll every 15 seconds
        return () => clearInterval(intervalId);
      } else {
         setLoading(false);
      }
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
        {user.role === 'student' && <FloatingAIAssistant />}
      </div>
    </ReactFlowProvider>
  );
}
