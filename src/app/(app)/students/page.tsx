

import { getSession } from '@/lib/session';
import { getTeacherStudents } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import StudentList from '@/components/students/student-list';

export default async function StudentsPage({ searchParams }: { searchParams?: { filter?: string } }) {
  const { user } = await getSession();

  if (!user || user.role !== 'teacher') {
    notFound();
  }

  const allStudents = await getTeacherStudents(user.id);
  const filter = searchParams?.filter;

  const filteredStudents = allStudents.filter(student => {
    if (!filter || filter === 'all') return true;
    if (filter === 'high') return student.averageGrade >= 90;
    if (filter === 'average') return student.averageGrade >= 70 && student.averageGrade < 90;
    if (filter === 'at_risk') return student.averageGrade > 0 && student.averageGrade < 70;
    return true;
  }).sort((a, b) => b.averageGrade - a.averageGrade);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline">Student Performance</h1>
          <p className="text-muted-foreground">An overview of all students enrolled in your courses.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Performance Heatmap</CardTitle>
          <CardDescription>
            A color-coded list of your students based on their average grade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudentList students={filteredStudents} currentFilter={filter || 'all'}/>
        </CardContent>
      </Card>
    </div>
  );
}
