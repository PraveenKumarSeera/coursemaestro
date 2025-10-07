
import { getSession } from '@/lib/session';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CourseForm from '@/components/courses/course-form';

export default async function CreateCoursePage() {
  const { user } = await getSession();
  if (!user || user.role !== 'teacher') {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Create New Course</h1>
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>
            Fill out the form below to create a new course.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourseForm />
        </CardContent>
      </Card>
    </div>
  );
}
