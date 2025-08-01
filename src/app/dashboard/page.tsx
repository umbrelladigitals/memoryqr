import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DashboardStats from '@/components/dashboard/DashboardStats'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Calculate dashboard stats
  const totalUploads = await prisma.upload.count({
    where: {
      event: {
        customerId: session.user.id
      }
    }
  })

  const thisMonth = new Date()
  thisMonth.setDate(1)
  
  const thisMonthEvents = await prisma.event.count({
    where: {
      customerId: session.user.id,
      createdAt: {
        gte: thisMonth
      }
    }
  })

  const thisMonthPhotos = await prisma.upload.count({
    where: {
      event: {
        customerId: session.user.id
      },
      createdAt: {
        gte: thisMonth
      }
    }
  })

  // Get events count for stats
  const eventsCount = await prisma.event.count({
    where: {
      customerId: session.user.id
    }
  })

  const activeEventsCount = await prisma.event.count({
    where: {
      customerId: session.user.id,
      isActive: true
    }
  })

  // Get customer plan info for limits
  const customer = await prisma.customer.findUnique({
    where: { id: session.user.id },
    include: {
      plan: {
        select: {
          maxEvents: true,
          maxStorageGB: true
        }
      }
    }
  })

  // Mock storage calculation (should be calculated from actual file sizes)
  const storageUsedGB = totalUploads * 0.003 // Assume avg 3MB per photo

  const stats = {
    totalEvents: eventsCount,
    activeEvents: activeEventsCount,
    totalPhotos: totalUploads,
    totalViews: totalUploads * 5, // Mock view count
    thisMonthEvents,
    thisMonthPhotos,
    storageUsedGB,
    planLimit: {
      events: customer?.plan?.maxEvents || null,
      storage: customer?.plan?.maxStorageGB || null
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Genel Bakış</h1>
        <p className="text-gray-600 mt-2">
          Hesabınızın genel durumu ve istatistikleri
        </p>
      </div>
      <DashboardStats stats={stats} />
    </div>
  )
}
