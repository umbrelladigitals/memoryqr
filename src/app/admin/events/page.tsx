import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import EventManagementClient from './event-management-client'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export default async function EventsPage() {
  const headersList = await headers()
  const cookieHeader = headersList.get('cookie')
  
  let adminToken = null
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {})
    adminToken = cookies.adminToken
  }

  if (!adminToken) {
    redirect('/admin/login')
  }

  try {
    await jwtVerify(adminToken, JWT_SECRET)
  } catch (error) {
    redirect('/admin/login')
  }

  // Fetch events with user data and photo counts
  let events: any[], stats: any
  try {
    events = await prisma.event.findMany({
      include: {
        customer: {
          include: {
            plan: {
              select: {
                name: true,
                displayName: true
              }
            }
          }
        },
        _count: {
          select: {
            uploads: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate event stats
    const [
      totalEvents,
      activeEvents,
      totalPhotos,
      eventsByPlan
    ] = await Promise.all([
      prisma.event.count().catch(() => 0),
      prisma.event.count({
        where: {
          archiveDate: { gte: new Date() }
        }
      }).catch(() => 0),
      prisma.upload.count().catch(() => 0),
      // Get events by plan using raw query for better control
      prisma.$queryRaw`
        SELECT p.name as plan, COUNT(DISTINCT c.id) as count
        FROM "Customer" c
        LEFT JOIN "Plan" p ON c."planId" = p.id
        WHERE c.id IN (
          SELECT DISTINCT "customerId" FROM "Event"
        )
        GROUP BY p.name
      `.catch(() => [])
    ])

    stats = {
      totalEvents,
      activeEvents,
      totalPhotos,
      expiredEvents: totalEvents - activeEvents,
      eventsByPlan: (eventsByPlan as any[]).map((item: any) => ({
        plan: item.plan || 'Unknown',
        count: Number(item.count)
      }))
    }
  } catch (error) {
    console.error('Events fetch error:', error)
    events = []
    stats = {
      totalEvents: 0,
      activeEvents: 0,
      totalPhotos: 0,
      expiredEvents: 0,
      eventsByPlan: []
    }
  }

  return (
    <EventManagementClient 
      events={events} 
      stats={stats}
    />
  )
}
