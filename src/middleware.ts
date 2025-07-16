import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isPublicRoute = pathname === '/login' ;

  if (token) {
    try {
      const secret = new TextEncoder().encode('flight_management');
      await jwtVerify(token, secret);

      if (isPublicRoute) {
        return NextResponse.redirect(new URL('/user', request.url));
      }

      return NextResponse.next();
    } catch  {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.set('token', '', { maxAge: 0 });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};