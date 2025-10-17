'use server';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'coursepilot_session';
const PUBLIC_ROUTES = ['/login', '/signup', '/showcase'];

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  // If user has a session and tries to access a public auth page (login/signup), redirect to dashboard
  if (sessionCookie && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is on a public route, let them proceed
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Handle root path redirection
  if (pathname === '/') {
    const destination = sessionCookie ? '/dashboard' : '/login';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // For all other routes, they are protected. If no session, redirect to login.
  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname); // Pass the original path for redirection after login
    return NextResponse.redirect(loginUrl);
  }

  // If user has a session and is accessing a protected route, let them proceed
  return NextResponse.next();
}

export const config = {
  // This matcher ensures the middleware runs on all paths except for static files
  // and other internal Next.js assets.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
