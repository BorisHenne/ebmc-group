import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'

// Paths that should skip i18n middleware
const publicPaths = [
  '/api',
  '/_next',
  '/favicon',
  '/logo',
  '/images',
  '/fonts',
]

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public files and API routes
  if (
    publicPaths.some(path => pathname.startsWith(path)) ||
    pathname.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next()
  }

  // For other paths, let next-intl handle it (if needed)
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, static files)
    '/((?!_next|api|.*\\..*).*)',
  ],
}
