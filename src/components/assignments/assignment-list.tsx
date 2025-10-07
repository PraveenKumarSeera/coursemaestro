
'use client';
import type { Assignment, Submission, User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import SubmitAssignmentForm from './submit-assignment-form';

type AssignmentWithSubmission = Assignment & { submission?: Submission | null };

type AssignmentListProps = {
  assignments: AssignmentWithSubmission[];
  user: User;
  courseId: string;
};

export default function AssignmentList({ assignments, user, courseId }: AssignmentListProps) {
  
    const getStatusBadge = (assignment: AssignmentWithSubmission) => {
        if (user.role === 'teacher') return null;

        if (assignment.submission) {
            return <Badge variant={assignment.submission.grade ? "default" : "secondary"}>
                {assignment.submission.grade ? `Graded: ${assignment.submission.grade}%` : 'Submitted'}
            </Badge>;
        }

        if (new Date(assignment.dueDate) < new Date()) {
            return <Badge variant="destructive">Past Due</Badge>;
        }
        
        return <Badge variant="outline">Not Submitted</Badge>;
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignments</CardTitle>
        <CardDescription>
          Here are the assignments for this course.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {assignments.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {assignments.map((assignment) => (
              <AccordionItem value={assignment.id} key={assignment.id}>
                <AccordionTrigger>
                  <div className="flex justify-between items-center w-full pr-4">
                    <div className='text-left'>
                        <p className="font-medium">{assignment.title}</p>
                        <p className="text-sm text-muted-foreground">Due: {format(new Date(assignment.dueDate), 'PPP')}</p>
                    </div>
                    {getStatusBadge(assignment)}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-4 py-2 space-y-4">
                    <p className="text-muted-foreground">{assignment.description}</p>
                    
                    {user.role === 'student' && (
                        assignment.submission ? (
                            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                <h4 className="font-semibold">Your Submission</h4>
                                <p className="text-sm">Submitted on: {format(new Date(assignment.submission.submittedAt), 'PPP p')}</p>
                                {assignment.submission.grade !== null ? (
                                    <>
                                        <p className="text-sm font-bold text-primary">Grade: {assignment.submission.grade}%</p>
                                        {assignment.submission.feedback && <p className="text-sm">Feedback: {assignment.submission.feedback}</p>}
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Awaiting grade.</p>
                                )}
                            </div>
                        ) : (
                           <SubmitAssignmentForm assignmentId={assignment.id} courseId={courseId} />
                        )
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No assignments have been posted for this course yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

