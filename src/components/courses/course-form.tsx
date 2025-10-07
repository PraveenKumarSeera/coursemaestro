
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { createCourseAction, updateCourseAction } from '@/app/actions/courses';
import type { Course } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isEditing ? 'Save Changes' : 'Create Course'}
    </Button>
  );
}

type CourseFormProps = {
  course?: Course;
};

export default function CourseForm({ course }: CourseFormProps) {
  const isEditing = !!course;
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const action = isEditing ? updateCourseAction.bind(null, course.id) : createCourseAction;
  const initialState = { message: '', success: false };
  const [state, formAction] = useActionState(action, initialState);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Success' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success && !isEditing) {
        formRef.current?.reset();
        router.push('/courses');
      }
      if (state.success && isEditing) {
        router.push(`/courses`);
      }
    }
  }, [state, toast, router, isEditing, course?.id]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="title">Course Title</Label>
        <Input id="title" name="title" defaultValue={course?.title} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={course?.description} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="duration">Duration (e.g., 8 Weeks)</Label>
        <Input id="duration" name="duration" defaultValue={course?.duration} required />
      </div>
      <SubmitButton isEditing={isEditing} />
    </form>
  );
}
