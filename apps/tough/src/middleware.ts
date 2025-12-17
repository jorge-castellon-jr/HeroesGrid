import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Only check access for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check if user has auth cookie
    const authCookie = request.cookies.get('payload-token')

    if (!authCookie) {
      // No auth cookie, redirect to roadmap
      return NextResponse.redirect(new URL('/roadmap', request.url))
    }

    // If cookie exists, let Payload handle the access check via admin.access config
    // We can't use Payload here because middleware runs on Edge runtime
    // The actual access control will be handled by Payload's admin UI
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
