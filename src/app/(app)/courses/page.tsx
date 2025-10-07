import { getSession } from '@/lib/session';
import { getAllCourses, getStudentEnrollments } from '@/lib/data';
import CourseCard from '@/components/course-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';

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
    <div className="container mx-auto p-0">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold font-headline">Courses</h1>
        <div className="flex w-full sm:w-auto gap-2">
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                {/* A proper search would use a form and handle state, this is a simplified version */}
                <Input
                    type="search"
                    placeholder="Search courses..."
                    className="pl-8"
                    defaultValue={query}
                />
            </div>
            {user.role === 'teacher' && (
                <Button asChild>
                    <Link href="/courses/create">
                        <PlusCircle className="mr-2 h-4 w-4" /> Create Course
                    </Link>
                </Button>
            )}
        </div>
      </div>

      {allCourses.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold">No courses found</h2>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search or check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              user={user}
              isEnrolled={enrolledCourseIds.has(course.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
