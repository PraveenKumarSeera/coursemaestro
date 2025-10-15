
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { updateUser } from '@/lib/data';
import { getSession } from '@/lib/session';

const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type FormState = {
  message: string;
  success: boolean;
};

export async function updateUserAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { user } = await getSession();
  if (!user) {
    return { message: 'Permission denied', success: false };
  }

  const validatedFields = updateUserSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.issues.map(issue => issue.message).join(', ');
    return {
      message: `Invalid form data: ${errorMessages}`,
      success: false,
    };
  }
  
  const { name, password } = validatedFields.data;

  // Don't require password if it's not being changed
  if (password && password.length < 6) {
    return {
      message: 'Password must be at least 6 characters.',
      success: false,
    };
  }

  try {
    const updateData: { name: string; password?: string } = { name };
    if (password) {
        updateData.password = password;
    }
    await updateUser(user.id, updateData);
    revalidatePath('/(app)', 'layout');
    return { message: 'Profile updated successfully.', success: true };
  } catch (error) {
    return { message: 'Failed to update profile.', success: false };
  }
}
