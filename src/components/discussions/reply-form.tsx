
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { createPostAction } from '@/app/actions/discussions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Posting...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Post Reply
        </>
      )}
    </Button>
  );
}

type ReplyFormProps = {
  threadId: string;
  courseId: string;
};

export default function ReplyForm({ threadId, courseId }: ReplyFormProps) {
  const initialState = { message: '', success: false };
  const [state, formAction] = useActionState(createPostAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        formRef.current?.reset();
      } else {
        toast({
            title: 'Error',
            description: state.message,
            variant: 'destructive',
        });
      }
    }
  }, [state, toast]);

  return (
    <Card>
        <form ref={formRef} action={formAction}>
            <CardHeader>
                <CardTitle>Join the Discussion</CardTitle>
            </CardHeader>
            <CardContent>
                <input type="hidden" name="threadId" value={threadId} />
                <input type="hidden" name="courseId" value={courseId} />
                <div className="space-y-2">
                    <Label htmlFor="content">Your Reply</Label>
                    <Textarea
                    id="content"
                    name="content"
                    required
                    placeholder="Add your thoughts..."
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
