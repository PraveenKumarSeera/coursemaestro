
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { createThreadAction } from '@/app/actions/discussions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Start Discussion
    </Button>
  );
}

type CreateThreadFormProps = {
  courseId: string;
};

export default function CreateThreadForm({ courseId }: CreateThreadFormProps) {
  const initialState = { message: '', success: false };
  const [state, formAction] = useActionState(createThreadAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Success' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        formRef.current?.reset();
        // This is a workaround to close the dialog. A better solution would use the Dialog's open/onOpenChange props.
        document.querySelector('[data-radix-dialog-content] [aria-label="Close"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      }
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
        <input type="hidden" name="courseId" value={courseId} />
        <div className="space-y-2">
            <Label htmlFor="title">Discussion Title</Label>
            <Input id="title" name="title" required placeholder="e.g., How to use Flexbox?" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="content">Your Question or Topic</Label>
            <Textarea id="content" name="content" required placeholder="Start the conversation here..."/>
        </div>
        <SubmitButton />
    </form>
  );
}
