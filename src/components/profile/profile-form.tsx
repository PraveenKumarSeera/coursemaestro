'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { updateUserAction } from '@/actions/users';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Save Changes
    </Button>
  );
}

type ProfileFormProps = {
  user: User;
};

export default function ProfileForm({ user }: ProfileFormProps) {
  const initialState = { message: '', success: false };
  const [state, formAction] = useActionState(updateUserAction, initialState);
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
        // Only reset password fields
        if (formRef.current) {
          const passwordInput = formRef.current.querySelector<HTMLInputElement>('input[name="password"]');
          const confirmPasswordInput = formRef.current.querySelector<HTMLInputElement>('input[name="confirmPassword"]');
          if (passwordInput) passwordInput.value = '';
          if (confirmPasswordInput) confirmPasswordInput.value = '';
        }
        // Force a reload to reflect name change in the header.
        // A more advanced solution might use a global state manager.
        window.location.reload();
      }
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={user.name} required />
      </div>
       <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" value={user.email} disabled />
         <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input id="password" name="password" type="password" placeholder="Leave blank to keep current password" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" />
      </div>
      <SubmitButton />
    </form>
  );
}
