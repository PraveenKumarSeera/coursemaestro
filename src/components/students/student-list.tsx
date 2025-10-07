
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';

type StudentWithStats = {
    id: string;
    name: string;
    email: string;
    courses: string[];
    averageGrade: number;
    assignmentsCompleted: number;
}

type StudentListProps = {
  students: StudentWithStats[];
};

function FilterButton({ label, filterValue, currentFilter }: { label: string, filterValue: string, currentFilter: string | null }) {
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
    
    const isActive = (currentFilter === null && filterValue === 'all') || currentFilter === filterValue;

    return (
        <Button
            variant={isActive ? 'default' : 'outline'}
            onClick={handleClick}
        >
            {label}
        </Button>
    )
}

const getGradeBadgeVariant = (grade: number) => {
    if (grade >= 90) return 'default';
    if (grade >= 70) return 'secondary';
    if (grade > 0) return 'destructive';
    return 'outline';
};

export default function StudentList({ students }: StudentListProps) {
    const searchParams = useSearchParams();
    const currentFilter = searchParams.get('filter');
    
  return (
    <div className="space-y-4">
        <div className="flex items-center gap-2">
            <FilterButton label="All" filterValue="all" currentFilter={currentFilter} />
            <FilterButton label="High-Performing (≥90%)" filterValue="high" currentFilter={currentFilter} />
            <FilterButton label="Average (70-89%)" filterValue="average" currentFilter={currentFilter} />
            <FilterButton label="At-Risk (<70%)" filterValue="at_risk" currentFilter={currentFilter} />
        </div>

      {students.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          {students.map((student) => (
            <AccordionItem value={student.id} key={student.id}>
              <AccordionTrigger>
                <div className="flex justify-between items-center w-full pr-4">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-left">{student.name}</p>
                        <p className="text-sm text-muted-foreground text-left">{student.email}</p>
                      </div>
                    </div>
                     <div className='text-right'>
                         {student.averageGrade > 0 ? (
                             <Badge variant={getGradeBadgeVariant(student.averageGrade)}>
                                Avg. Grade: {student.averageGrade}%
                            </Badge>
                         ) : (
                            <Badge variant="outline">No Grades</Badge>
                         )}
                    </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-16 grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Enrolled Courses:</h4>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {student.courses.map((courseTitle) => (
                        <li key={courseTitle}>{courseTitle}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                      <h4 className="font-semibold mb-2">Statistics:</h4>
                      <p className='text-sm text-muted-foreground'>Assignments Completed: {student.assignmentsCompleted}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p className="text-muted-foreground text-center py-8">No students match the current filter.</p>
      )}
    </div>
  );
}
