import { NextRequest, NextResponse } from 'next/server'
// Import the CLASS, not the singleton instance
import { ApiClient } from '@/lib/api-client'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // The matcher in `config` already ensures this runs only for /dashboard routes,
  // but this check is good for clarity.
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('access_token')?.value

    // If no token exists, redirect to the login page immediately.
    if (!token) {
      // Preserve the intended destination URL for a better user experience after login.
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      // --- CORRECT PATTERN: Create a new instance for each request ---
      // This ensures that each user's token is handled in isolation.
      const requestScopedApiClient = new ApiClient();
      requestScopedApiClient.setToken(token);

      // Verify the token by fetching the current user.
      const user = await requestScopedApiClient.getCurrentUser();
      
      // If the API returns a malformed user or the token is invalid, redirect.
      if (!user || !user.sub) {
        // Token is invalid or expired.
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // --- OPTIONAL BUT RECOMMENDED: Pass user data to the page ---
      // Create a new set of headers to avoid modifying the original request.
      const requestHeaders = new Headers(request.headers);
      
      // Add the user data as a header. The page can then read this
      // without needing to make another API call.
      requestHeaders.set('x-user-info', JSON.stringify(user));
      
      // Continue to the requested page, but with the new headers.
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

    } catch (error) {
      // This block catches network errors or if the API returns a 5xx error.
      console.error('Middleware authentication error:', error);

      // Redirect to login page on any failure.
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl);
    }
  }

  // If the route doesn't match, just continue.
  return NextResponse.next()
}

// This config ensures the middleware only runs on the specified paths.
export const config = {
  matcher: [
    /*
     * Match all request paths under /dashboard, except for:
     * - API routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/dashboard/:path*',
  ],
}