
import { getSession } from '@/lib/session';
import { getAllCourses, getStudentEnrollments } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { redirect } from 'next/navigation';
import CourseMindMap from '@/components/courses/course-mind-map';

export default async function BrowseCoursesPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
  };
}) {
  const { user } = await getSession();
  if (!user) {
    redirect('/login');
  }

  const query = searchParams?.query || '';
  const allCourses = await getAllCourses(query);

  const studentEnrollments =
    user.role === 'student' ? await getStudentEnrollments(user.id) : [];
  const enrolledCourseIds = new Set(
    studentEnrollments.map((e) => e.courseId)
  );

  return (
    <div className="container mx-auto p-0 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="space-y-1">
            <h1 className="text-3xl font-bold font-headline">Browse Courses</h1>
            <p className="text-muted-foreground">Explore and enroll in new courses.</p>
        </div>
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
        </div>
      </div>

      <div className="flex-grow relative">
        <CourseMindMap courses={allCourses} user={user} enrolledCourseIds={enrolledCourseIds} />
      </div>
    </div>
  );
}
