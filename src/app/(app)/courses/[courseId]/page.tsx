
import { getCourseById, getAssignmentsByCourse, getStudentSubmission, getStudentsByCourse } from '@/lib/data';
import { getSession } from '@/lib/session';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookText, ClipboardList, Users, Clock, User as UserIcon, Sparkles, Edit, Trash } from 'lucide-react';
import AiAssistant from '@/components/ai-assistant';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AssignmentList from '@/components/assignments/assignment-list';
import { Button } from '@/components/ui/button';
import DeleteCourseButton from '@/components/courses/delete-course-button';

export default async function CourseDetailPage({
  params,
}: {
  params: { courseId: string };
}) {
  const { user } = await getSession();
  const course = await getCourseById(params.courseId);

  if (!course || !user) {
    notFound();
  }
  
  const isTeacher = user.role === 'teacher' && user.id === course.teacherId;
  const enrolledStudents = isTeacher ? await getStudentsByCourse(course.id) : [];
  const assignments = await getAssignmentsByCourse(params.courseId);

  // For students, fetch their submission status for each assignment
  const assignmentsWithSubmissions = user.role === 'student' ? await Promise.all(
    assignments.map(async (assignment) => {
      const submission = await getStudentSubmission(user.id, assignment.id);
      return { ...assignment, submission };
    })
  ) : assignments;


  return (
    <div className="space-y-6">
      <div className="relative h-64 w-full rounded-lg overflow-hidden">
        <Image
          src={course.imageUrl}
          alt={course.title}
          fill
          className="object-cover"
          data-ai-hint="course"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-6">
          <h1 className="text-4xl font-bold text-white font-headline">
            {course.title}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-300 mt-2">
            <div className="flex items-center gap-1">
                <UserIcon className="h-4 w-4" />
                <span>{course.teacher.name}</span>
            </div>
            <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
            </div>
          </div>
        </div>
      </div>
      
      {isTeacher && (
        <div className="flex gap-2 justify-end">
            <Button asChild variant="outline" size="sm">
                <Link href={`/courses/${course.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </Link>
            </Button>
            <DeleteCourseButton courseId={course.id} />
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
          <TabsTrigger value="overview">
            <BookText className="mr-2 h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <ClipboardList className="mr-2 h-4 w-4" /> Assignments
          </TabsTrigger>
           {isTeacher ? (
             <TabsTrigger value="students">
                <Users className="mr-2 h-4 w-4" /> Students
            </TabsTrigger>
           ) : (
            <TabsTrigger value="ai-assistant">
                <Sparkles className="mr-2 h-4 w-4" /> AI Assistant
            </TabsTrigger>
           )}
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Course Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{course.description}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="assignments">
            <AssignmentList 
                assignments={assignmentsWithSubmissions} 
                user={user} 
                courseId={course.id}
            />
        </TabsContent>
        {isTeacher ? (
            <TabsContent value="students">
            <Card>
                <CardHeader>
                    <CardTitle>Enrolled Students</CardTitle>
                    <CardDescription>A list of students enrolled in this course.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {enrolledStudents.length > 0 ? (
                        enrolledStudents.map(student => (
                            <div key={student.id} className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={`https://i.pravatar.cc/150?u=${student.id}`} />
                                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{student.name}</p>
                                    <p className="text-sm text-muted-foreground">{student.email}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground">No students are currently enrolled.</p>
                    )}
                </CardContent>
            </Card>
            </TabsContent>
        ) : (
            <TabsContent value="ai-assistant">
                <AiAssistant course={course} />
            </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
