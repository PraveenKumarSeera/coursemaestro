
'use client';

import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GraduationCap, LogOut, Menu, User as UserIcon } from 'lucide-react';
import type { User, Notification } from '@/lib/types';
import { logout } from '@/app/actions/auth';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AppSidebar from './app-sidebar';
import NotificationBell from './notifications/notification-bell';
import { ThemeToggle } from './theme-toggle';
import { getNotificationsForUser } from '@/lib/data';
import { useEffect, useState } from 'react';

type AppHeaderProps = {
  user: User;
};

export default function AppHeader({ user }: AppHeaderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    getNotificationsForUser(user.id).then(setNotifications);
  }, [user.id]);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
                <AppSidebar user={user} />
            </SheetContent>
        </Sheet>
        
        <div className="w-full flex-1">
            <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:hidden">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="font-headline">CourseMaestro</span>
            </Link>
        </div>

      <NotificationBell notifications={notifications} />
      <ThemeToggle />
        
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <Avatar>
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action={logout}>
            <button type="submit" className="w-full">
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
