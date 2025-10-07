
import { getCourseById, getAssignmentsByCourse, getStudentSubmission, getStudentsByCourse, getThreadsByCourse, isEnrolled, getMaterialsByCourse } from '@/lib/data';
import { getSession } from '@/lib/session';
import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookText, ClipboardList, Users, Clock, User as UserIcon, Sparkles, Edit, Trash, MessageSquare, FileText } from 'lucide-react';
import AiAssistant from '@/components/ai-assistant';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AssignmentList from '@/components/assignments/assignment-list';
import { Button } from '@/components/ui/button';
import DeleteCourseButton from '@/components/courses/delete-course-button';
import DiscussionList from '@/components/discussions/discussion-list';
import MaterialList from '@/components/materials/material-list';

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: { courseId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { user } = await getSession();
  const course = await getCourseById(params.courseId);

  if (!course || !user) {
    notFound();
  }
  
  const isTeacher = user.role === 'teacher' && user.id === course.teacherId;
  const isUserEnrolled = user.role === 'student' ? await isEnrolled(user.id, course.id) : false;

  // For teachers or enrolled students, fetch course data
  if (!isTeacher && !isUserEnrolled) {
    // If a student is not enrolled, redirect them to the main courses page
    redirect('/courses');
  }

  const enrolledStudents = isTeacher ? await getStudentsByCourse(course.id) : [];
  const assignments = await getAssignmentsByCourse(params.courseId);
  const discussionThreads = await getThreadsByCourse(params.courseId);
  const materials = await getMaterialsByCourse(params.courseId);

  // For students, fetch their submission status for each assignment
  const assignmentsWithSubmissions = user.role === 'student' ? await Promise.all(
    assignments.map(async (assignment) => {
      const submission = await getStudentSubmission(user.id, assignment.id);
      return { ...assignment, submission };
    })
  ) : assignments;

  const defaultTab = typeof searchParams?.tab === 'string' ? searchParams.tab : 'overview';

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

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <BookText className="mr-2 h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <ClipboardList className="mr-2 h-4 w-4" /> Assignments
          </TabsTrigger>
           <TabsTrigger value="discussions">
            <MessageSquare className="mr-2 h-4 w-4" /> Discussions
          </TabsTrigger>
           <TabsTrigger value="materials">
            <FileText className="mr-2 h-4 w-4" /> Materials
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
        <TabsContent value="discussions">
            <DiscussionList 
                courseId={course.id}
                threads={discussionThreads}
            />
        </TabsContent>
        <TabsContent value="materials">
            <MaterialList 
                materials={materials}
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
