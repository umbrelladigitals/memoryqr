'use client'

import { SessionProvider } from 'next-auth/react'

export default function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      basePath="/api/admin/auth"
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  )
}
