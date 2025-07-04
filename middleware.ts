import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/api-client'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route requires authentication
  if (pathname.startsWith('/dashboard')) {
    const cookie = request.cookies.get('access_token')?.value

    if (!cookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Set the token in the API client
    apiClient.setToken(cookie)

    try {
      // Verify the token and get user info
      const user = await apiClient.getCurrentUser()
      if (!user || !user.sub) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch (error) {
      console.error('Authentication error:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}