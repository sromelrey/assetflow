import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/dashboard'];

// Routes only for non-authenticated users
const authRoutes = ['/login'];

// Default redirect for each role after login
const roleDefaultRoutes: Record<string, string> = {
  SUPER_ADMIN: '/dashboard',
  ADMIN: '/dashboard',
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for the accessToken cookie
  const hasAccessToken = request.cookies.has('accessToken');
  const isAuthenticated = hasAccessToken;
  const userRole = request.cookies.get('user_role')?.value || 'ADMIN';

  // Redirect authenticated users away from auth routes (e.g., /login)
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (isAuthenticated) {
      const redirectTo = roleDefaultRoutes[userRole] || '/dashboard';
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated users from protected routes to /login
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Root redirect
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
