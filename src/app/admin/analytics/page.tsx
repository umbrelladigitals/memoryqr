import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import AnalyticsClient from './analytics-client'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export default async function AnalyticsPage() {
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

  // Get current date for calculations
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  // Fetch analytics data with error handling
  let stats
  try {
    const [
      totalUsers,
      totalEvents,
      totalPhotos,
      activeUsers,
      newUsersThisMonth,
      eventsThisMonth,
      photosThisMonth,
      userGrowthData,
    eventsByPlan,
    photosByPlan,
    revenueByMonth
  ] = await Promise.all([
    // Total counts
    prisma.customer.count(),
    prisma.event.count(),
    prisma.upload.count(),
    
    // Active users (logged in last 7 days)
    prisma.customer.count({
      where: {
        lastLogin: { gte: sevenDaysAgo }
      }
    }),
    
    // This month counts
    prisma.customer.count({
      where: {
        createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) }
      }
    }),
    
    prisma.event.count({
      where: {
        createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) }
      }
    }),
    
    prisma.upload.count({
      where: {
        createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) }
      }
    }),
    
    // User growth data (last 30 days)
    prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as count
      FROM "customers" 
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date
    `,
    
    // Events by plan - join through customer
    prisma.$queryRaw`
      SELECT 
        p.name as plan,
        COUNT(e.id) as count
      FROM "events" e
      INNER JOIN "customers" c ON e."customerId" = c.id
      LEFT JOIN "plans" p ON c."planId" = p.id
      GROUP BY p.name
    `,
    
    // Photos by plan
    prisma.$queryRaw`
      SELECT 
        p.name as plan,
        COUNT(u.id) as count
      FROM "uploads" u
      INNER JOIN "events" e ON u."eventId" = e.id
      INNER JOIN "customers" c ON e."customerId" = c.id
      LEFT JOIN "plans" p ON c."planId" = p.id
      GROUP BY p.name
    `,
    
    // Revenue by month (last 12 months)
    prisma.$queryRaw`
      SELECT 
        TO_CHAR("createdAt", 'YYYY-MM') as month,
        SUM(amount) as revenue
      FROM "payments" 
      WHERE status = 'COMPLETED' 
        AND "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month
    `
  ])

  // Process analytics data
  const analytics = {
    overview: {
      totalUsers,
      totalEvents,
      totalPhotos,
      activeUsers,
      newUsersThisMonth,
      eventsThisMonth,
      photosThisMonth
    },
    userGrowth: userGrowthData as Array<{ date: string; count: number }>,
    eventsByPlan: eventsByPlan as Array<{ plan: string; count: number }>,
    photosByPlan: photosByPlan as Array<{ plan: string; count: number }>,
    revenueByMonth: revenueByMonth as Array<{ month: string; revenue: number }>
  }

  stats = analytics
  } catch (error) {
    console.error('Analytics fetch error:', error)
    // Fallback data structure
    stats = {
      overview: {
        totalUsers: 0,
        totalEvents: 0,
        totalPhotos: 0,
        activeUsers: 0,
        newUsersThisMonth: 0,
        eventsThisMonth: 0,
        photosThisMonth: 0
      },
      userGrowth: [],
      eventsByPlan: [],
      photosByPlan: [],
      revenueByMonth: []
    }
  }

  return <AnalyticsClient analytics={stats} />
}
