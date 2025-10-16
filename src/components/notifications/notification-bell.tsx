
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell, Check } from 'lucide-react';
import type { Notification } from '@/lib/types';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { markNotificationAsAction } from '@/app/actions/notifications';
import { useTransition } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

const NOTIFICATION_STORAGE_KEY = 'coursepilot-notifications-update';


export default function NotificationBell({ notifications }: { notifications: Notification[] }) {
  const [isPending, startTransition] = useTransition();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (notificationId: string) => {
    startTransition(() => {
        markNotificationAsAction(notificationId).then(() => {
            // This is the key change: trigger a storage event that other tabs can listen to.
            localStorage.setItem(NOTIFICATION_STORAGE_KEY, Date.now().toString());
        });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-96">
            {notifications.length > 0 ? (
            notifications.map(notification => (
                <DropdownMenuItem key={notification.id} asChild className={cn('flex items-start gap-2 whitespace-normal', !notification.isRead && 'bg-accent/50')}>
                <Link href={notification.link} className="w-full">
                    <div className="flex-grow" onClick={() => handleMarkAsRead(notification.id)}>
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                     {!notification.isRead && <div className="h-2 w-2 rounded-full bg-primary mt-1" />}
                </Link>
                </DropdownMenuItem>
            ))
            ) : (
            <p className="p-4 text-center text-sm text-muted-foreground">You have no notifications.</p>
            )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
