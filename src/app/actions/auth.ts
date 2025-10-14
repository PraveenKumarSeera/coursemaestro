
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { findUserByEmail, createUser } from '@/lib/data';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

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
  
  try {
    const { auth } = initializeFirebase();
    await signInWithEmailAndPassword(auth, email, password);
  } catch (e: any) {
    return {
      message: e.message,
      success: false,
    };
  }
  
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

  try {
    const { auth } = initializeFirebase();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Now create user in our db
    await createUser({ id: userCredential.user.uid, name, email, role });
  } catch (e: any) {
     return {
      message: e.message,
      success: false,
    };
  }

  redirect('/dashboard');
}


export async function logout() {
  const { auth } = initializeFirebase();
  await auth.signOut();
  redirect('/login');
}
