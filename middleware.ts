import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { adminMiddleware } from "@/lib/admin-middleware"
import { prisma } from "@/lib/prisma"

export default auth(async (req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Handle admin routes separately
  if (nextUrl.pathname.startsWith('/admin')) {
    return await adminMiddleware(req)
  }

  // Protected customer routes
  const isProtectedRoute = nextUrl.pathname.startsWith('/dashboard')

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/signin', nextUrl))
  }

  // For logged in users, verify customer still exists in database
  if (isLoggedIn && isProtectedRoute && req.auth?.user?.id) {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: req.auth.user.id }
      })
      
      if (!customer) {
        // Customer doesn't exist, clear session and redirect to login
        console.log('Customer not found for session, redirecting to login')
        const response = NextResponse.redirect(new URL('/auth/signin', nextUrl))
        // Clear session cookies
        response.cookies.delete('authjs.session-token')
        response.cookies.delete('__Secure-authjs.session-token')
        return response
      }
    } catch (error) {
      console.error('Error checking customer existence:', error)
      // On database error, allow to continue
    }
  }

  // Redirect logged in users away from auth pages
  if (isLoggedIn && (nextUrl.pathname.startsWith('/auth'))) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ]
}
