import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DashboardNavbar from '@/components/dashboard/DashboardNavbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Get user info for navbar
  const customer = await prisma.customer.findUnique({
    where: { id: session.user.id },
    include: {
      plan: {
        select: {
          name: true,
          displayName: true
        }
      }
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar 
        user={{
          name: customer?.name || 'Kullanıcı',
          plan: customer?.plan
        }}
      />
      <main className="p-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}
