
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
  CalendarClock,
  Library,
  Lightbulb,
  Building,
  BrainCircuit,
  FolderKanban,
  Rocket,
  HeartHandshake,
  School,
  RadioTower,
  Map,
  Send,
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
    { href: '/courses', label: user.role === 'student' ? 'My Courses' : 'My Courses', icon: BookOpen },
    { href: '/showcase', label: 'Project Showcase', icon: Rocket },
  ];

  const teacherRoutes = [
    { href: '/students', label: 'My Students', icon: Users },
    { href: '/assignments', label: 'Assignments', icon: ClipboardList },
    { href: '/live-progress', label: 'Live Session', icon: RadioTower, isNew: true },
    { href: '/instant-quiz', label: 'Instant Quiz', icon: Send, isNew: true },
    { href: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { href: '/materials/upload', label: 'Upload Materials', icon: UploadCloud },
  ];

  const studentRoutes = [
    { href: '/my-journey', label: 'My Journey', icon: Map, isNew: true },
    { href: '/my-projects', label: 'My Projects', icon: FolderKanban },
    { href: '/courses/browse', label: 'Browse Courses', icon: Library },
    { href: '/challenges', label: 'Challenges', icon: Lightbulb },
    { href: '/internship', label: 'Internship Sim', icon: Building },
    { href: '/my-grades', label: 'My Grades', icon: GraduationCap },
    { href: '/my-certificates', label: 'My Certificates', icon: Award },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/timetable', label: 'Smart Timetable', icon: CalendarClock },
    { href: '/career-advisor', label: 'Career Advisor', icon: Briefcase, isNew: true },
    { href: '/resume-builder', label: 'Resume Builder', icon: FileDown },
    { href: '/wellness-check', label: 'Wellness Check-in', icon: HeartHandshake, isNew: true },
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
            <span className="font-headline">CoursePilot</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map(({ href, label, icon: Icon, isNew }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  pathname.startsWith(href) && href !== '/dashboard' && href !== '/courses' && 'bg-muted text-primary',
                  pathname === href && (href === '/dashboard' || href === '/courses') && 'bg-muted text-primary'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
                {(isNew) && (
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
