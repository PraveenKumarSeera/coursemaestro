
'use server';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'coursemestro_session';
const PROTECTED_ROUTES = ['/dashboard', '/courses', '/assignments', '/students', '/attendance', '/materials', '/my-grades', '/my-certificates', '/leaderboard', '/career-advisor', '/resume-builder', '/timetable', '/internship', '/challenges', '/brain-stretches', '/my-projects', '/wellness-check', '/classroom-mood'];
const PUBLIC_ROUTES = ['/login', '/signup', '/showcase'];

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const { pathname } = request.nextUrl;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // If trying to access a protected route without a session, redirect to login
  if (isProtectedRoute && !sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If visiting a public-only route (like login) with a session, redirect to dashboard
  if (['/login', '/signup'].includes(pathname) && sessionCookie) {
     const url = request.nextUrl.clone();
     url.pathname = '/dashboard';
     return NextResponse.redirect(url);
  }
  
  // If visiting the root, redirect based on session
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = sessionCookie ? '/dashboard' : '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
