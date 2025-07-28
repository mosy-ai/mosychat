import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/api-client'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('access_token')?.value

    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      apiClient.setToken(token);

      const user = await apiClient.auth.getCurrentUser();
      
      if (!user || !user.sub) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(loginUrl)
      }

      const requestHeaders = new Headers(request.headers);
      
      requestHeaders.set('x-user-info', JSON.stringify(user));
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

    } catch (error) {
      console.error('Middleware authentication error:', error);

      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
}