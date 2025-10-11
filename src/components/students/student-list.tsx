
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


type StudentWithStats = {
    id: string;
    name: string;
    email: string;
    courses: string[];
    averageGrade: number;
    assignmentsCompleted: number;
    trend: 'improving' | 'declining' | 'stable';
}

type StudentListProps = {
  students: StudentWithStats[];
  currentFilter: string;
};

function FilterButton({ label, filterValue, currentFilter }: { label: string, filterValue: string, currentFilter: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleClick = () => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));

        if (filterValue === 'all') {
            current.delete('filter');
        } else {
            current.set('filter', filterValue);
        }

        const search = current.toString();
        const query = search ? `?${search}` : '';

        router.push(`${pathname}${query}`);
    };
    
    const isActive = currentFilter === filterValue;

    return (
        <Button
            variant={isActive ? 'default' : 'outline'}
            onClick={handleClick}
            size="sm"
        >
            {label}
        </Button>
    )
}

const getGradeRowClass = (grade: number) => {
    if (grade === 0) return 'bg-background hover:bg-muted/50';
    if (grade >= 90) return 'bg-green-100/50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40';
    if (grade >= 70) return 'bg-yellow-100/50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/40';
    return 'bg-red-100/50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40';
};

const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
        case 'improving':
            return <ArrowUpRight className="h-5 w-5 text-green-600" />;
        case 'declining':
            return <ArrowDownRight className="h-5 w-5 text-red-600" />;
        case 'stable':
            return <Minus className="h-5 w-5 text-gray-500" />;
    }
}

export default function StudentList({ students, currentFilter }: StudentListProps) {
    
  return (
    <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
            <FilterButton label="All" filterValue="all" currentFilter={currentFilter} />
            <FilterButton label="High-Performing (≥90%)" filterValue="high" currentFilter={currentFilter} />
            <FilterButton label="Average (70-89%)" filterValue="average" currentFilter={currentFilter} />
            <FilterButton label="At-Risk (<70%)" filterValue="at_risk" currentFilter={currentFilter} />
        </div>

      {students.length > 0 ? (
        <TooltipProvider>
          <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Enrolled Courses</TableHead>
                      <TableHead className="text-center">Assignments</TableHead>
                      <TableHead className="text-center">Trend</TableHead>
                      <TableHead className="text-right">Avg. Grade</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {students.map((student) => (
                      <TableRow key={student.id} className={cn(getGradeRowClass(student.averageGrade))}>
                          <TableCell>
                              <div className="flex items-center gap-3">
                                  <Avatar>
                                      <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                      <p className="font-medium">{student.name}</p>
                                      <p className="text-xs text-muted-foreground">{student.email}</p>
                                  </div>
                              </div>
                          </TableCell>
                          <TableCell>
                            <Tooltip>
                                <TooltipTrigger>
                                    <p className="truncate max-w-xs text-sm text-muted-foreground">{student.courses.join(', ')}</p>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <ul className='list-disc list-inside'>
                                        {student.courses.map(c => <li key={c}>{c}</li>)}
                                    </ul>
                                </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">{student.assignmentsCompleted}</TableCell>
                          <TableCell className="text-center">
                              <Tooltip>
                                <TooltipTrigger>
                                    <div className='flex justify-center'>
                                        {getTrendIcon(student.trend)}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Performance is {student.trend}</p>
                                </TooltipContent>
                              </Tooltip>
                          </TableCell>
                           <TableCell className="text-right">
                                {student.averageGrade > 0 ? (
                                    <span className='font-bold text-lg'>{student.averageGrade}%</span>
                                ) : (
                                    <span className="text-muted-foreground text-sm">N/A</span>
                                )}
                          </TableCell>
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
        </TooltipProvider>
      ) : (
        <p className="text-muted-foreground text-center py-8">No students match the current filter.</p>
      )}
    </div>
  );
}
