
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PerformanceAnalyzer from '@/components/performance-analyzer';
import { useTimeline } from '@/hooks/use-timeline';
import type { GradedSubmission, User } from '@/lib/types';
import { format } from 'date-fns';
import { useEffect } from 'react';

export default function GradesClient({
  user,
  gradedSubmissions,
}: {
  user: User;
  gradedSubmissions: GradedSubmission[];
}) {
  const { addTimelineEvent, events } = useTimeline();

  useEffect(() => {
    const recordedGradeIds = new Set(events.filter(e => e.type === 'grade_received').map(e => e.referenceId));
    
    gradedSubmissions.forEach(sub => {
      if (!recordedGradeIds.has(sub.id)) {
        addTimelineEvent({
          type: 'grade_received',
          title: `Graded: ${sub.assignment.title}`,
          details: `Received ${sub.grade}% in ${sub.course.title}.`,
          icon: '⭐',
          referenceId: sub.id,
        });
      }
    });
  }, [gradedSubmissions, addTimelineEvent, events]);

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
