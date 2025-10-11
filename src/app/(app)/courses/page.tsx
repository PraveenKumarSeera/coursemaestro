import { getSession } from '@/lib/session';
import { getAllCourses, getStudentEnrollments } from '@/lib/data';
import CourseCard from '@/components/course-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import CourseMindMap from '@/components/courses/course-mind-map';

export default async function CoursesPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
  };
}) {
  const { user } = await getSession();
  if (!user) return null;

  const query = searchParams?.query || '';
  const allCourses = await getAllCourses(query);

  const studentEnrollments =
    user.role === 'student' ? await getStudentEnrollments(user.id) : [];
  const enrolledCourseIds = new Set(
    studentEnrollments.map((e) => e.courseId)
  );

  return (
    <div className="container mx-auto p-0 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold font-headline">Courses</h1>
        <div className="flex w-full sm:w-auto gap-2">
          <form className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              name="query"
              placeholder="Search courses..."
              className="pl-8"
              defaultValue={query}
            />
          </form>
          {user.role === 'teacher' && (
            <Button asChild>
              <Link href="/courses/create">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Course
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="flex-grow relative">
        <CourseMindMap courses={allCourses} user={user} enrolledCourseIds={enrolledCourseIds} />
      </div>
    </div>
  );
}
