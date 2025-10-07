
import { getSession } from '@/lib/session';
import { getStudentGrades } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import Link from 'next/link';

export default async function MyGradesPage() {
  const { user } = await getSession();
  if (!user || user.role !== 'student') {
    notFound();
  }

  const gradedSubmissions = await getStudentGrades(user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">My Grades</h1>
      <Card>
        <CardHeader>
          <CardTitle>Graded Assignments</CardTitle>
          <CardDescription>
            Here is a summary of your grades for all courses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {gradedSubmissions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead className="text-right">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gradedSubmissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <Link href={`/courses/${sub.course.id}`} className="hover:underline text-primary">
                        {sub.course.title}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">{sub.assignment.title}</TableCell>
                    <TableCell>{format(new Date(sub.submittedAt), 'PPP')}</TableCell>
                    <TableCell className="text-right font-bold">{sub.grade}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">You do not have any graded assignments yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

