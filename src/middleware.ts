import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'coursepilot_session';
const PUBLIC_ROUTES = ['/login', '/signup', '/showcase'];

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  // If user has a session cookie
  if (sessionCookie) {
    // And is trying to access a public-only page like login/signup, redirect to dashboard
    if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Otherwise, let them proceed
    return NextResponse.next();
  }

  // If user does not have a session cookie
  if (!sessionCookie) {
    // And is trying to access a protected route (i.e., not a public one)
    if (!isPublicRoute && pathname !== '/') {
      // Redirect them to the login page
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Allow access to public routes for users without a session
  return NextResponse.next();
}

export const config = {
  // This matcher ensures the middleware runs on all paths except for static files
  // and other internal Next.js assets.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
