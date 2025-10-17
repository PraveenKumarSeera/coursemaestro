
// In a real app, use a library like `jose` for proper JWT handling.
// For this demo, we'll use a simple approach.
'use server';

import { cookies } from 'next/headers';
import type { User } from './types';
import { findUserById } from './data';

const SESSION_COOKIE_NAME = 'coursepilot_session';

// This is not secure for production. Use a proper secret management strategy.
const SECRET_KEY = process.env.SESSION_SECRET || 'your-super-secret-key-that-is-at-least-32-characters-long';

// Dummy encryption/decryption. Replace with a real crypto library.
const encrypt = (data: any) => {
    // In a real app, you would use a library like 'jose' to create a JWE.
    // For this demo, we'll just Base64 encode it.
    return Buffer.from(JSON.stringify(data)).toString('base64');
}

const decrypt = (encryptedData: string) => {
    try {
        // In a real app, you would decrypt the JWE.
        return JSON.parse(Buffer.from(encryptedData, 'base64').toString('utf8'));
    } catch (e) {
        return null;
    }
}


export async function createSession(userId: string) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = encrypt({ userId, expires });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, session, {
    expires,
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export async function getSession(): Promise<{ user: User | null }> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) return { user: null };

  const session = decrypt(cookie);
  if (!session?.userId) {
    return { user: null };
  }

  const user = await findUserById(session.userId);

  if (!user || user.id === '0') {
    return { user: null };
  }
  
  // Omit password before returning
  const { password, ...userWithoutPassword } = user;

  return { user: userWithoutPassword as User };
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
