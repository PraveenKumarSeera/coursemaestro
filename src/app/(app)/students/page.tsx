
import { getSession } from '@/lib/session';
import { getTeacherStudents } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { notFound } from 'next/navigation';
import type { User } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import StudentList from '@/components/students/student-list';

async function getStudentsWithPerformance(teacherId: string) {
    const students = await getTeacherStudents(teacherId);
    return students.sort((a, b) => b.averageGrade - a.averageGrade);
}

export default async function StudentsPage({ searchParams }: { searchParams?: { filter?: string } }) {
  const { user } = await getSession();

  if (!user || user.role !== 'teacher') {
    notFound();
  }

  const allStudents = await getStudentsWithPerformance(user.id);
  const filter = searchParams?.filter;

  const filteredStudents = allStudents.filter(student => {
    if (filter === 'high') return student.averageGrade >= 90;
    if (filter === 'average') return student.averageGrade >= 70 && student.averageGrade < 90;
    if (filter === 'at_risk') return student.averageGrade > 0 && student.averageGrade < 70;
    return true;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">My Students</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Enrolled Students</CardTitle>
          <CardDescription>
            A list of all students enrolled in your courses, with performance metrics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudentList students={filteredStudents} />
        </CardContent>
      </Card>
    </div>
  );
}
