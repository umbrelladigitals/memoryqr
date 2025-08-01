import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret')
const adminRoutes = ['/admin']
const publicAdminRoutes = ['/admin/auth/signin']

export async function adminMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if it's an admin route
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isPublicAdminRoute = publicAdminRoutes.some(route => pathname.startsWith(route))

  if (!isAdminRoute) {
    return NextResponse.next()
  }

  // Allow access to public admin routes
  if (isPublicAdminRoute) {
    // If already authenticated, redirect to admin dashboard
    const token = request.cookies.get('admin-token')?.value
    if (token) {
      try {
        await jwtVerify(token, secret)
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      } catch {
        // Invalid token, continue to login page
      }
    }
    return NextResponse.next()
  }

  // Protect admin routes
  const token = request.cookies.get('admin-token')?.value
  
  if (!token) {
    return NextResponse.redirect(new URL('/admin/auth/signin', request.url))
  }

  try {
    const { payload } = await jwtVerify(token, secret)
    
    // Check super admin routes
    if (pathname.startsWith('/admin/system') && payload.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    return NextResponse.next()
  } catch {
    // Invalid token
    const response = NextResponse.redirect(new URL('/admin/auth/signin', request.url))
    response.cookies.delete('admin-token')
    return response
  }
}
