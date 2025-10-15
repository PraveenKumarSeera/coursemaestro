
import { getSession } from '@/lib/session';
import { getStudentGrades } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import type { GradedSubmission } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import PerformanceAnalyzer from '@/components/performance-analyzer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Target } from 'lucide-react';


export default async function MyGradesPage() {
  const { user } = await getSession();
  if (!user || user.role !== 'student') {
    notFound();
  }

  const gradedSubmissions: GradedSubmission[] = await getStudentGrades(user.id);
  const hasLowGrades = gradedSubmissions.some(sub => sub.grade && sub.grade < 80);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className='space-y-1'>
            <h1 className="text-3xl font-bold font-headline">My Grades</h1>
            <p className="text-muted-foreground">A summary of your grades for all courses.</p>
        </div>
        {gradedSubmissions.length > 0 && (
          <PerformanceAnalyzer user={user} gradedSubmissions={gradedSubmissions} />
        )}
      </div>

       {hasLowGrades && (
            <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900">
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/50">
                        <Target className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <CardTitle className="text-amber-900 dark:text-amber-200">Practice Makes Perfect</CardTitle>
                        <CardDescription className="text-amber-800 dark:text-amber-300">You have some assignments that could use improvement. Get a personalized practice session!</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Button asChild variant="default" className="bg-amber-600 hover:bg-amber-700 text-white">
                        <Link href="/targeted-practice">Go to Targeted Practice</Link>
                    </Button>
                </CardContent>
            </Card>
        )}

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
