
import { getSession } from '@/lib/session';
import { getStudentGrades } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import type { GradedSubmission } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import TargetedPractice from '@/components/practice/targeted-practice';


export default async function MyGradesPage() {
  const { user } = await getSession();
  if (!user || user.role !== 'student') {
    notFound();
  }

  const gradedSubmissions: GradedSubmission[] = await getStudentGrades(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">My Grades</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Graded Assignments</CardTitle>
          <CardDescription>
            Here is a summary of your grades for all courses. Click on an assignment to see feedback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {gradedSubmissions.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {gradedSubmissions.map((sub) => (
                <AccordionItem value={sub.id} key={sub.id}>
                    <AccordionTrigger>
                        <div className="flex justify-between items-center w-full pr-4 text-sm">
                            <div className='text-left'>
                                <p className="font-medium">{sub.assignment.title}</p>
                                <p className="text-xs text-muted-foreground">{sub.course.title}</p>
                            </div>
                             <div className="text-right">
                                <p className="font-bold text-primary">{sub.grade}%</p>
                                <p className="text-xs text-muted-foreground">Graded: {format(new Date(sub.submittedAt), 'PPP')}</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="px-4 py-2 space-y-4">
                            <div>
                                <h4 className="font-semibold">Teacher Feedback:</h4>
                                <p className="text-muted-foreground">{sub.feedback || "No feedback provided."}</p>
                            </div>
                            {sub.grade && sub.grade < 80 && (
                                <TargetedPractice
                                    courseTitle={sub.course.title}
                                    assignmentTitle={sub.assignment.title}
                                    grade={sub.grade}
                                />
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-muted-foreground text-center py-8">You do not have any graded assignments yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
