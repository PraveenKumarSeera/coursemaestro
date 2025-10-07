
import { getSession } from '@/lib/session';
import { notFound } from 'next/navigation';
import { getTeacherCourses } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CreateAssignmentForm from '@/components/assignments/create-assignment-form';

export default async function CreateAssignmentPage() {
  const { user } = await getSession();
  if (!user || user.role !== 'teacher') {
    notFound();
  }

  const courses = await getTeacherCourses(user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Create New Assignment</h1>
      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
          <CardDescription>
            Fill out the form below to create a new assignment for one of your
            courses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateAssignmentForm courses={courses} />
        </CardContent>
      </Card>
    </div>
  );
}
