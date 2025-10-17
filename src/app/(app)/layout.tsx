'use client';

import AppHeader from '@/components/app-header';
import AppSidebar from '@/components/app-sidebar';
import type { User, Notification } from '@/lib/types';
import { usePathname } from 'next/navigation';
import { ReactFlowProvider } from 'reactflow';
import { useEffect, useState, useRef, useCallback } from 'react';
import { getSession } from '@/lib/session';
import { getNotificationsForUser } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import FloatingAIAssistant from '@/components/ai/floating-ai-assistant';
import { useToast } from '@/hooks/use-toast';
import { useStudentActivityBroadcaster } from '@/hooks/use-live-student-activity';
import LiveQuizTaker from '@/components/live-progress/live-quiz-taker';
import { LiveQuizProvider } from '@/hooks/use-live-quiz.tsx';

const NOTIFICATION_STORAGE_KEY = 'coursepilot-notifications-update';
const IDLE_TIMEOUT = 2 * 60 * 1000; // 2 minutes

function useUserSession() {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const previousUnreadCount = useRef(0);
  const { broadcastActivity } = useStudentActivityBroadcaster();
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  const playNotificationSound = useCallback(() => {
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
  }, []);

  // Effect to load the user session once on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const { user: sessionUser } = await getSession();
        setUser(sessionUser);
      } catch (error) {
        console.error("Failed to load session:", error);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  // Effect for handling notifications and activity broadcasting, runs only when user is loaded
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const userNotifications = await getNotificationsForUser(user.id);
      setNotifications(userNotifications);

      const currentUnreadCount = userNotifications.filter(n => !n.isRead).length;
      if (currentUnreadCount > previousUnreadCount.current) {
        playNotificationSound();
      }
      previousUnreadCount.current = currentUnreadCount;
    };

    fetchNotifications(); // Initial fetch for the logged-in user

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === NOTIFICATION_STORAGE_KEY) {
        fetchNotifications();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // --- Student-specific activity tracking ---
    let events: (keyof WindowEventMap)[] = [];
    const resetIdleTimer = () => {
      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
      }
      idleTimer.current = setTimeout(() => {
        broadcastActivity('idle');
      }, IDLE_TIMEOUT);
    };

    if (user.role === 'student') {
      events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => window.addEventListener(event, resetIdleTimer));
      resetIdleTimer();
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (user.role === 'student') {
        events.forEach(event => window.removeEventListener(event, resetIdleTimer));
        if (idleTimer.current) {
          clearTimeout(idleTimer.current);
        }
      }
    };
  }, [user, playNotificationSound, broadcastActivity]);

  return { user, notifications, loading };
}

const empatheticMessages = [
    {
        title: '🧠 Feeling a bit distracted?',
        description: "It happens! A short break can do wonders for focus. We're here when you get back!",
    },
    {
        title: '✨ You seem a bit tired.',
        description: "Remember to take care of yourself. Your well-being comes first. We'll be ready when you are!",
    },
    {
        title: '🤔 Is something on your mind?',
        description: "Take a moment if you need to. Your learning journey is a marathon, not a sprint.",
    },
    {
        title: '🙌 Don\'t give up!',
        description: "Every expert was once a beginner. Keep pushing forward, you're making great progress!",
    },
];


export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, notifications, loading } = useUserSession();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && user && user.role === 'student') {
        const randomMessage = empatheticMessages[Math.floor(Math.random() * empatheticMessages.length)];
        toast(randomMessage);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, toast]);


  if (pathname.includes('/certificates/') || pathname.includes('/classroom-mood')) {
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
        <LiveQuizProvider>
            <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                <AppSidebar user={user} />
                <div className="flex flex-col">
                <AppHeader user={user} notifications={notifications} />
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
                    {children}
                </main>
                </div>
                {user.role === 'student' && <FloatingAIAssistant />}
                {user.role === 'student' && <LiveQuizTaker />}
            </div>
        </LiveQuizProvider>
    </ReactFlowProvider>
  );
}
