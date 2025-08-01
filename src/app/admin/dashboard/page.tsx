import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminDashboardClient from './admin-dashboard-client'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export default async function AdminDashboardPage() {
  // Check admin authentication
  const cookieStore = await cookies()
  const token = cookieStore.get('adminToken')?.value

  if (!token) {
    redirect('/admin/login')
  }

  let adminUser
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    adminUser = payload
  } catch {
    redirect('/admin/login')
  }

  // Get platform statistics with error handling
  let stats
  try {
    const [
      totalCustomers,
      activeCustomers,
      totalEvents,
      totalUploads,
      recentCustomers,
      recentEvents,
      subscriptionStats
    ] = await Promise.all([
      // Total customers
      prisma.customer.count().catch(() => 0),
      
      // Active customers (logged in last 30 days)
      prisma.customer.count({
        where: {
          lastLogin: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }).catch(() => 0),
      
      // Total events
      prisma.event.count().catch(() => 0),
      
      // Total uploads
      prisma.upload.count().catch(() => 0),
      
      // Recent customers
      prisma.customer.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          plan: {
            select: {
              name: true,
              displayName: true
            }
          },
          _count: {
            select: {
              events: true,
              payments: true
            }
          }
        }
      }).catch(() => []),
      
      // Recent events
      prisma.event.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
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
        }
      }).catch(() => []),
      
      // Get customer plan distribution instead of subscription stats
      prisma.$queryRaw`
        SELECT p.name as plan, COUNT(c.id) as count
        FROM "Customer" c
        LEFT JOIN "Plan" p ON c."planId" = p.id
        GROUP BY p.name
      `.catch(() => [])
    ])

    stats = {
      totalCustomers,
      activeCustomers,
      totalEvents,
      totalUploads,
      recentCustomers,
      recentEvents,
      subscriptionStats
    }
  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    // Fallback data
    stats = {
      totalCustomers: 0,
      activeCustomers: 0,
      totalEvents: 0,
      totalUploads: 0,
      recentCustomers: [],
      recentEvents: [],
      subscriptionStats: []
    }
  }

  return (
    <AdminDashboardClient 
      stats={stats}
      user={{
        id: adminUser.sub as string,
        name: adminUser.name as string,
        email: adminUser.email as string,
        role: adminUser.role as string
      }}
    />
  )
}
