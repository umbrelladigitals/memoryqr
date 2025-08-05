import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AnalyticsClient from './analytics-client'

export default async function AnalyticsPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  // Get customer with events for analytics
  const customer = await prisma.customer.findUnique({
    where: {
      email: session.user.email
    },
    include: {
      events: {
        include: {
          uploads: {
            select: {
              id: true,
              createdAt: true,
              fileName: true,
              fileSize: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!customer) {
    redirect('/auth/signin')
  }

  // Prepare initial analytics data
  const totalEvents = customer.events.length
  const totalUploads = customer.events.reduce((acc, event) => acc + event.uploads.length, 0)
  const totalStorage = customer.events.reduce((acc, event) => 
    acc + event.uploads.reduce((uploadAcc, upload) => uploadAcc + (upload.fileSize || 0), 0), 0
  )

  const initialData = {
    overview: {
      totalEvents,
      totalUploads,
      totalViews: 0, // Will be populated by API
      totalDownloads: 0, // Will be populated by API
      avgUploadsPerEvent: totalEvents > 0 ? Math.round(totalUploads / totalEvents) : 0,
      activeEvents: customer.events.filter(e => e.isActive).length,
      topUploadDay: 'Pazartesi', // Will be populated by API
      totalStorageUsed: totalStorage
    },
    eventStats: customer.events.map(event => ({
      id: event.id,
      title: event.title,
      uploads: event.uploads.length,
      views: 0, // Will be populated by API
      downloads: 0, // Will be populated by API
      date: event.createdAt.toISOString(),
      status: event.isActive ? 'active' as const : 'inactive' as const
    })),
    timeSeriesData: [], // Will be populated by API
    deviceStats: [], // Will be populated by API
    locationStats: [], // Will be populated by API
    popularTimes: [] // Will be populated by API
  }

  return <AnalyticsClient initialData={initialData} />
}
