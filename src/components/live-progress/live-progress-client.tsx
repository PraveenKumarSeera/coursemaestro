
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { RefreshCw, Radio, Ban, Pencil } from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';
import { useLiveStudentActivity, type ActivityStatus } from '@/hooks/use-live-student-activity';
import type { User } from '@/lib/types';
import { format } from 'date-fns';
import FocusPulseMonitor from './focus-pulse-monitor';

const statusConfig: {
  [key in ActivityStatus]: {
    label: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
  };
} = {
  watching: {
    label: 'Watching Lesson',
    icon: Radio,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  submitting: {
    label: 'Submitting Assignment',
    icon: Pencil,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  idle: {
    label: 'Idle',
    icon: Ban,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
};

export default function LiveProgressClient({
  initialStudents,
}: {
  initialStudents: User[];
}) {
  const { students, summary, forceRefresh, pulse } = useLiveStudentActivity(initialStudents);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline">Live Progress Tracker</h1>
          <p className="text-muted-foreground">
            A real-time overview of your students' study activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={forceRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Now
            </Button>
            <ThemeToggle />
        </div>
      </div>

      <FocusPulseMonitor pulse={pulse} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Radio className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.watching}</div>
            <p className="text-xs text-muted-foreground">Currently watching lessons</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Pencil className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.submitting}</div>
            <p className="text-xs text-muted-foreground">Working on assignments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Idle Students</CardTitle>
            <Ban className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.idle}</div>
            <p className="text-xs text-muted-foreground">Inactive for more than 2 minutes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead className="text-right">Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const config = statusConfig[student.status];
                const Icon = config.icon;
                return (
                  <TableRow key={student.id} className="transition-all duration-300">
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn('transition-all duration-300', config.bgColor, config.color)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {format(student.lastActive, 'HH:mm:ss')}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
