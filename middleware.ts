import { NextRequest, NextResponse } from 'next/server'
import { verifySessionFromRequest } from '@/lib/session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route requires authentication
  if (pathname.startsWith('/dashboard')) {
    const session = await verifySessionFromRequest(request)
    
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check admin-only routes
    if (pathname.startsWith('/dashboard/admin') && session.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
