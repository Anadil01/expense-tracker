import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isPublic =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/invite/accept' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/register') ||
    pathname.startsWith('/api/invite');

  // Always let public routes through first
  if (isPublic) {
    // Only redirect away from login/register if they have a complete session
    if (session?.user?.workspaceId && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // Not logged in → /login
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Logged in but no workspace → /onboarding (only for non-API, non-onboarding routes)
  if (!session.user?.workspaceId && pathname !== '/onboarding') {
    if (!pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};