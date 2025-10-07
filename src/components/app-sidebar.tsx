
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Sparkles,
  Users,
  FileText,
  Briefcase,
  UploadCloud,
  FileDown,
  Trophy,
  CalendarCheck,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';
import { Badge } from './ui/badge';

type AppSidebarProps = {
  user: User;
};

export default function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();

  const commonRoutes = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/courses', label: 'Courses', icon: BookOpen },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  const teacherRoutes = [
    { href: '/students', label: 'My Students', icon: Users },
    { href: '/assignments', label: 'Assignments', icon: ClipboardList },
    { href: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { href: '/materials/upload', label: 'Upload Materials', icon: UploadCloud },
    { href: '/quiz-generator', label: 'Quiz Generator', icon: FileText },
  ];

  const studentRoutes = [
    { href: '/my-grades', label: 'My Grades', icon: GraduationCap },
    { href: '/my-certificates', label: 'My Certificates', icon: Award },
    { href: '/ai-assistant', label: 'AI Assistant', icon: Sparkles },
    { href: '/career-advisor', label: 'Career Advisor', icon: Briefcase },
    { href: '/resume-builder', label: 'Resume Builder', icon: FileDown },
  ];
  
  const navItems = user.role === 'teacher' 
    ? [...commonRoutes, ...teacherRoutes] 
    : [...commonRoutes, ...studentRoutes];

  return (
    <div className="hidden border-r bg-card md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-headline">CourseMaestro</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  pathname.startsWith(href) && href !== '/dashboard' && 'bg-muted text-primary',
                  pathname === href && href === '/dashboard' && 'bg-muted text-primary'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
                {(label === 'AI Assistant' || label === 'Quiz Generator' || label === 'Career Advisor' || label === 'Upload Materials' || label === 'Resume Builder' || label === 'Leaderboard' || label === 'Attendance' || label === 'My Certificates') && (
                    <Badge variant="outline" className="ml-auto bg-accent/10 text-accent border-accent/50">
                        New
                    </Badge>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
