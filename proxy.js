import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const publicRoutes = ['/login', '/register', '/invite/accept', '/api/auth', '/api/register'];
  const isPublic =
    pathname === '/' ||
    publicRoutes.some((route) => pathname.startsWith(route));

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (session && !session.user.workspaceId && pathname !== '/onboarding') {
    if (!pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }
  }

  if (session && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
