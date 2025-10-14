
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps } from 'firebase-admin/app';

const PROTECTED_ROUTES = ['/dashboard', '/courses', '/my-grades', '/ai-assistant', '/assignments', '/students', '/leaderboard', '/career-advisor', '/resume-builder', '/timetable', '/brain-stretches', '/challenges', '/internship', '/my-certificates'];

if (!getApps().length) {
  initializeApp();
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value || '';

  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  let decodedToken = null;
  try {
    decodedToken = await getAuth().verifySessionCookie(sessionCookie, true);
  } catch (error) {
    // Session cookie is invalid or expired.
  }
  
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !decodedToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if ((pathname === '/login' || pathname === '/signup') && decodedToken) {
     const url = request.nextUrl.clone();
     url.pathname = '/dashboard';
     return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
