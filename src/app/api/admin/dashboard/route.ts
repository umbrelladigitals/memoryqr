import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get dashboard statistics
    const [
      totalCustomers,
      totalEvents,
      totalUploads,
      totalPayments,
      recentEvents,
      recentCustomers,
      monthlyStats
    ] = await Promise.all([
      // Total customers
      prisma.customer.count(),
      
      // Total events
      prisma.event.count(),
      
      // Total uploads
      prisma.upload.count(),
      
      // Total payments
      prisma.payment.count(),
      
      // Recent events (last 10)
      prisma.event.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { name: true, email: true }
          },
          _count: {
            select: { uploads: true }
          }
        }
      }),
      
      // Recent customers (last 10)
      prisma.customer.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          plan: true,
          _count: {
            select: { events: true }
          }
        }
      }),
      
      // Monthly statistics for the last 12 months
      prisma.$queryRaw`
        SELECT 
          DATE_FORMAT(createdAt, '%Y-%m') as month,
          COUNT(*) as count,
          'events' as type
        FROM Event 
        WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
        ORDER BY month DESC
      `
    ])

    return NextResponse.json({
      stats: {
        totalCustomers,
        totalEvents,
        totalUploads,
        totalPayments
      },
      recentEvents,
      recentCustomers,
      monthlyStats
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}
