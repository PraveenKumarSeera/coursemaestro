
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { enrollInCourseAction } from '@/app/actions/enrollments';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Enrolling...
        </>
      ) : (
        'Enroll Now'
      )}
    </Button>
  );
}

export default function EnrollButton({ courseId }: { courseId: string }) {
  const enrollAction = enrollInCourseAction.bind(null, courseId);
  const [state, formAction] = useActionState(enrollAction, { message: '', success: false });
  const { toast } = useToast();

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
    <form action={formAction}>
      <SubmitButton />
    </form>
  );
}
