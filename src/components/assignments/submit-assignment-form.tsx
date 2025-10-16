
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { submitAssignmentAction } from '@/app/actions/assignments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { useStudentActivityBroadcaster } from '@/hooks/use-live-student-activity';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Submit Assignment
    </Button>
  );
}

type SubmitAssignmentFormProps = {
  assignmentId: string;
  courseId: string;
};

export default function SubmitAssignmentForm({ assignmentId, courseId }: SubmitAssignmentFormProps) {
  const initialState = { message: '', success: false };
  const [state, formAction] = useActionState(submitAssignmentAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const { broadcastActivity } = useStudentActivityBroadcaster();
  
  const playSuccessSound = () => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!context) return;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, context.currentTime + 0.05);

      gainNode.gain.setValueAtTime(0.2, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.15);

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.15);
    } catch (e) {
      console.error("Failed to play sound", e);
    }
  };


  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Success' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        formRef.current?.reset();
        broadcastActivity('idle');
        playSuccessSound();
      }
    }
  }, [state, toast, broadcastActivity]);

  return (
    <Card className="bg-background">
        <CardHeader>
            <CardTitle className='text-base'>Submit Your Work</CardTitle>
        </CardHeader>
        <form ref={formRef} action={formAction}>
            <input type="hidden" name="assignmentId" value={assignmentId} />
            <input type="hidden" name="courseId" value={courseId} />
            <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="content">Your Submission</Label>
                    <Textarea
                    id="content"
                    name="content"
                    required
                    placeholder="Enter your submission content or a link to your work..."
                    onFocus={() => broadcastActivity('submitting')}
                    onBlur={() => broadcastActivity('idle')}
                    />
                </div>
            </CardContent>
            <CardFooter>
                 <SubmitButton />
            </CardFooter>
        </form>
    </Card>
  );
}
