
'use server';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'coursepilot_session';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const { pathname } = request.nextUrl;

  // Allow public access to the showcase page explicitly
  if (pathname.startsWith('/showcase')) {
    return NextResponse.next();
  }

  // Handle auth pages (login/signup)
  if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    // If a logged-in user tries to access login/signup, redirect them to the dashboard
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }
  
  // Handle root path redirection
  if (pathname === '/') {
    const destination = sessionCookie ? '/dashboard' : '/login';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // For all other routes, assume they are protected and require a session
  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname); // Pass the original path for redirection after login
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // This matcher ensures the middleware runs on all paths except for static files
  // and other internal Next.js assets.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
