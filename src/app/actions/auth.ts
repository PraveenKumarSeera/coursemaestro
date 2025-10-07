'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { findUserByEmail, createUser } from '@/lib/data';
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

  await createSession(newUser.id);
  redirect('/dashboard');
}


export async function logout() {
  await deleteSession();
  redirect('/');
}
