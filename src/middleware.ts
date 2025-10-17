
'use server';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'coursepilot_session';
const PUBLIC_ROUTES = ['/login', '/signup', '/showcase'];
const PROTECTED_ROUTES = ['/dashboard', '/courses', '/assignments', '/students', '/attendance', '/materials', '/my-grades', '/my-certificates', '/leaderboard', '/career-advisor', '/resume-builder', '/timetable', '/internship', '/challenges', '/brain-stretches', '/my-projects', '/wellness-check', '/live-progress', '/instant-quiz', '/my-journey'];

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const { pathname } = request.nextUrl;

  // Allow access to public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    // If logged in and trying to access login/signup, redirect to dashboard
    if (sessionCookie && (pathname === '/login' || pathname === '/signup')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Check if it's a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  // If it's a protected route and there's no session, redirect to login
  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname); // Pass the original path for redirection after login
    return NextResponse.redirect(loginUrl);
  }
  
  // Handle root path
  if (pathname === '/') {
    const destination = sessionCookie ? '/dashboard' : '/login';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
