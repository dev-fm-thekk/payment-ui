import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for the access token in cookies (or headers depending on your auth mechanism)
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // If the user is trying to access a dashboard route and doesn't have a token,
  // we redirect them to the login page.
  // Note: True validation of the token (verifying signature, expiration) 
  // or calling a refresh endpoint is best handled here if needed, 
  // but just checking presence is a good start for Edge middleware.
  if (!accessToken && !refreshToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/dashboard/:path*',
};
