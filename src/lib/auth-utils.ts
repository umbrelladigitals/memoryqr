import { signOut } from "@/auth"

export async function forceLogout() {
  try {
    await signOut({ redirectTo: '/auth/signin' })
  } catch (error) {
    console.error('Logout error:', error)
    // Fallback: redirect manually
    window.location.href = '/auth/signin'
  }
}

export function clearSessionStorage() {
  if (typeof window !== 'undefined') {
    // Clear any session storage
    sessionStorage.clear()
    localStorage.removeItem('session')
  }
}
