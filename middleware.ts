import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { adminMiddleware } from "@/lib/admin-middleware"

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
