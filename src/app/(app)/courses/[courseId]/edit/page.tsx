
import { getSession } from '@/lib/session';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CourseForm from '@/components/courses/course-form';
import { getCourseById } from '@/lib/data';

export default async function EditCoursePage({ params }: { params: { courseId: string }}) {
  const { user } = await getSession();
  const course = await getCourseById(params.courseId);

  if (!user || user.role !== 'teacher' || !course || course.teacherId !== user.id) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Edit Course</h1>
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>
            Update the details for your course below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourseForm course={course} />
        </CardContent>
      </Card>
    </div>
  );
}
