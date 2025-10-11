
import { getSession } from '@/lib/session';
import { getAllCourses, getStudentEnrollments, getTeacherCourses } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Library } from 'lucide-react';
import Link from 'next/link';
import CourseMindMap from '@/components/courses/course-mind-map';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export default async function CoursesPage({
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
  let courses = [];
  let enrolledCourseIds = new Set<string>();

  if (user.role === 'student') {
    const studentEnrollments = await getStudentEnrollments(user.id);
    enrolledCourseIds = new Set(studentEnrollments.map((e) => e.courseId));
    const allCourses = await getAllCourses(query);
    courses = allCourses.filter(course => enrolledCourseIds.has(course.id));
  } else { // teacher
    courses = await getTeacherCourses(user.id, query);
  }

  return (
    <div className="container mx-auto p-0 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline">
            {user.role === 'student' ? 'My Courses' : 'My Courses'}
          </h1>
          <p className="text-muted-foreground">
            {user.role === 'student' ? 'The courses you are currently enrolled in.' : 'The courses you are currently teaching.'}
          </p>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          {user.role === 'student' && (
             <Button asChild variant="outline">
              <Link href="/courses/browse">
                <Library className="mr-2 h-4 w-4" /> Browse Catalog
              </Link>
            </Button>
          )}
          {user.role === 'teacher' && (
            <Button asChild>
              <Link href="/courses/create">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Course
              </Link>
            </Button>
          )}
        </div>
      </div>

       {courses.length > 0 ? (
          <div className="flex-grow relative">
            <CourseMindMap courses={courses} user={user} enrolledCourseIds={enrolledCourseIds} />
          </div>
       ) : (
        <Card className="flex flex-col items-center justify-center text-center p-10 flex-grow">
            <CardHeader>
                <div className='p-4 bg-muted rounded-full mx-auto'>
                    <BookOpen className="h-8 w-8 text-accent" />
                </div>
                <CardTitle>
                  {user.role === 'student' ? 'No Courses Yet' : 'No Courses Created'}
                </CardTitle>
                <CardDescription>
                   {user.role === 'student' 
                    ? "You haven't enrolled in any courses yet."
                    : "You haven't created any courses yet."
                   }
                </CardDescription>
            </CardHeader>
             {user.role === 'student' && (
                <CardContent>
                    <Button asChild>
                        <Link href="/courses/browse">
                            <Library className="mr-2 h-4 w-4" /> Browse Course Catalog
                        </Link>
                    </Button>
                </CardContent>
             )}
        </Card>
       )}
    </div>
  );
}
