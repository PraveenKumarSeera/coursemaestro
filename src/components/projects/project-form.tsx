
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { createProjectAction } from '@/actions/projects';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding Project...
        </>
      ) : (
        'Add My Project'
      )}
    </Button>
  );
}

export default function ProjectForm() {
  const initialState = { message: '', success: false };
  const [state, formAction] = useActionState(createProjectAction, initialState);
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
        const trigger = formRef.current?.closest('.AccordionContent')?.previousElementSibling as HTMLElement;
        trigger?.click();
      }
    }
  }, [state, toast]);

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="add-project">
        <AccordionTrigger>
          <div className="text-lg font-semibold font-headline flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Add a New Project
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <form ref={formRef} action={formAction}>
            <Card className="border-none shadow-none">
              <CardHeader>
                <CardDescription>
                  Fill out the form below to add a project to your portfolio.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input id="title" name="title" required placeholder="e.g., My Awesome App" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea id="description" name="description" required placeholder="Describe what your project does, the technologies you used, and what you learned." className="min-h-32" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectUrl">Project URL</Label>
                  <Input id="projectUrl" name="projectUrl" type="url" required placeholder="https://github.com/user/repo or live demo link" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input id="tags" name="tags" required placeholder="e.g., React, Next.js, AI" />
                  <p className="text-xs text-muted-foreground">Separate tags with commas.</p>
                </div>
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

    