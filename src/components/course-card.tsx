
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Course, User } from '@/lib/types';
import { Clock, User as UserIcon } from 'lucide-react';
import { getTeacherById } from '@/lib/data';
import EnrollButton from './courses/enroll-button';

type CourseCardProps = {
  course: Course;
  user: User;
  isEnrolled: boolean;
};

export default async function CourseCard({ course, user, isEnrolled }: CourseCardProps) {
    const teacher = await getTeacherById(course.teacherId);
  return (
    <Card className="flex flex-col">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
            <Image
                src={course.imageUrl}
                alt={course.title}
                fill
                className="object-cover rounded-t-lg"
                data-ai-hint="course"
            />
        </div>
        <div className="p-6 pb-2">
            {isEnrolled && user.role === 'student' && <Badge className="mb-2">Enrolled</Badge>}
            <CardTitle className="font-headline text-xl">{course.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm line-clamp-3">{course.description}</p>
        <div className="mt-4 flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
                <UserIcon className="h-4 w-4" />
                <span>{teacher?.name}</span>
            </div>
            <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
            </div>
        </div>
      </CardContent>
      <CardFooter>
        {user.role === 'student' ? (
            isEnrolled ? (
                <Button asChild className="w-full">
                    <Link href={`/courses/${course.id}`}>View Course</Link>
                </Button>
            ) : (
                <EnrollButton courseId={course.id} />
            )
        ) : (
          <Button asChild className="w-full" variant="outline">
            <Link href={`/courses/${course.id}`}>Manage Course</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
