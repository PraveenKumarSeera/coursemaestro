
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { submitChallengeAction } from '@/app/actions/challenges';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Submitting...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Submit My Solution
        </>
      )}
    </Button>
  );
}

export default function SubmitChallengeForm({ challengeId }: { challengeId: string }) {
  const initialState = { message: '', success: false };
  const action = submitChallengeAction.bind(null, challengeId);
  const [state, formAction] = useActionState(action, initialState);
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
        // A little trick to close the accordion
        const trigger = formRef.current?.closest('.AccordionContent')?.previousElementSibling as HTMLElement;
        trigger?.click();
      }
    }
  }, [state, toast]);

  return (
    <Accordion type="single" collapsible>
        <AccordionItem value="submit">
            <AccordionTrigger>
                <div className="text-lg font-semibold font-headline">Submit Your Solution</div>
            </AccordionTrigger>
            <AccordionContent>
                <form ref={formRef} action={formAction}>
                    <Card className="border-none shadow-none">
                        <CardHeader>
                            <CardTitle>Solution Details</CardTitle>
                            <CardDescription>Provide your solution or a link to your project (e.g., GitHub, CodePen).</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                name="content"
                                placeholder="Explain your approach and provide links to your work..."
                                className="min-h-[150px]"
                                required
                            />
                        </CardContent>
                        <CardFooter>
                            <SubmitButton />
                        </CardFooter>
                    </Card>
                </form>
            </AccordionContent>
        </AccordionItem>
    </Accordion>
  );
}
