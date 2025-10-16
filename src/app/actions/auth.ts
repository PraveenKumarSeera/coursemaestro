'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { findUserByEmail, createUser, createNotification } from '@/lib/data';
import { createSession, deleteSession } from '@/lib/session';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'teacher']),
});

type AuthState = {
  message?: string;
  success: boolean;
};

export async function login(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const validatedFields = loginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      message: 'Invalid fields.',
      success: false,
    };
  }

  const { email, password } = validatedFields.data;
  const user = await findUserByEmail(email);

  if (!user || user.password !== password) {
    return {
      message: 'Invalid email or password.',
      success: false,
    };
  }

  await createSession(user.id);
  redirect('/dashboard');
}

export async function signup(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const validatedFields = signupSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      message: 'Invalid fields.',
      success: false,
    };
  }

  const { name, email, password, role } = validatedFields.data;

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return {
      message: 'An account with this email already exists.',
      success: false,
    };
  }

  const newUser = await createUser({ name, email, password, role });
  
  // Create a welcome notification for the new user
  await createNotification({
    userId: newUser.id,
    message: `Welcome to CoursePilot! 🎉 We're excited to have you join our learning community. Whether you're here to master new skills, explore fresh ideas, or level up your career, you've come to the right place. Dive into your courses, track your progress, and let your learning journey begin! — Team CoursePilot`,
    link: '/dashboard',
  });

  await createSession(newUser.id);

  redirect('/dashboard');
}


export async function logout() {
  await deleteSession();
  redirect('/login');
}
