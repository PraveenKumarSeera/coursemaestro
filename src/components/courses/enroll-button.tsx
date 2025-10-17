
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { enrollInCourseAction } from '@/app/actions/enrollments';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTimeline } from '@/hooks/use-timeline';
import { getCourseById } from '@/lib/data';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending} size="lg">
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
  const router = useRouter();
  const { addTimelineEvent } = useTimeline();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Success' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        // Add course enrollment to timeline
        getCourseById(courseId).then(course => {
            if (course) {
                 addTimelineEvent({
                    type: 'course_enrolled',
                    title: `Started: ${course.title}`,
                    details: `You've officially started your journey in ${course.title}.`,
                    icon: '🎓',
                });
            }
        });
        // Force a client-side refresh to show the updated state
        router.refresh();
      }
    }
  }, [state, toast, router, courseId, addTimelineEvent]);

  return (
    <form action={formAction}>
      <SubmitButton />
    </form>
  );
}
