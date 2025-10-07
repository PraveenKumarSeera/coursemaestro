
import { getSession } from '@/lib/session';
import { getTeacherCourses, getStudentsByCourse, findUserById } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { notFound } from 'next/navigation';
import type { User, Course } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

async function getTeacherStudents(teacherId: string) {
    const courses = await getTeacherCourses(teacherId);
    const studentMap = new Map<string, { user: User, courses: string[] }>();

    for (const course of courses) {
        const students = await getStudentsByCourse(course.id);
        for (const student of students) {
            if (!studentMap.has(student.id)) {
                studentMap.set(student.id, { user: student, courses: [] });
            }
            studentMap.get(student.id)!.courses.push(course.title);
        }
    }

    return Array.from(studentMap.values()).map(item => ({
        id: item.user.id,
        name: item.user.name,
        email: item.user.email,
        courses: item.courses,
    }));
}


export default async function StudentsPage() {
  const { user } = await getSession();

  if (!user || user.role !== 'teacher') {
    notFound();
  }

  const students = await getTeacherStudents(user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">My Students</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Enrolled Students</CardTitle>
          <CardDescription>
            A list of all students enrolled in your courses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {students.map((student) => (
                <AccordionItem value={student.id} key={student.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-left">{student.name}</p>
                        <p className="text-sm text-muted-foreground text-left">{student.email}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-16">
                      <h4 className="font-semibold mb-2">Enrolled Courses:</h4>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {student.courses.map((courseTitle) => (
                          <li key={courseTitle}>{courseTitle}</li>
                        ))}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-muted-foreground">You do not have any students enrolled in your courses yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
