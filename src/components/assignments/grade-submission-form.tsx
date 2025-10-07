
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { gradeSubmissionAction } from '@/app/actions/assignments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Submission } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="sm">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Save Grade
    </Button>
  );
}

type GradeSubmissionFormProps = {
  submission: Submission;
  assignmentId: string;
};

export default function GradeSubmissionForm({ submission, assignmentId }: GradeSubmissionFormProps) {
  const initialState = { message: '', success: false };
  const [state, formAction] = useActionState(gradeSubmissionAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Success' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="grade">
        <AccordionTrigger className="text-sm">
            {submission.grade !== null ? 'Update Grade' : 'Grade Submission'}
        </AccordionTrigger>
        <AccordionContent>
          <form ref={formRef} action={formAction} className="space-y-4 pt-4">
            <input type="hidden" name="submissionId" value={submission.id} />
            <input type="hidden" name="assignmentId" value={assignmentId} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-1">
                    <Label htmlFor={`grade-${submission.id}`}>Grade (0-100)</Label>
                    <Input
                        id={`grade-${submission.id}`}
                        name="grade"
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={submission.grade ?? ''}
                        required
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`feedback-${submission.id}`}>Feedback</Label>
                    <Textarea
                        id={`feedback-${submission.id}`}
                        name="feedback"
                        defaultValue={submission.feedback ?? ''}
                        placeholder="Provide constructive feedback..."
                    />
                </div>
            </div>
            <SubmitButton />
          </form>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
