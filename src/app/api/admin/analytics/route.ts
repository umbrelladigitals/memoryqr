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

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'
    const eventId = searchParams.get('eventId')

    let dateFilter
    switch (period) {
      case '7d':
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        dateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }

    const baseFilter = {
      createdAt: { gte: dateFilter },
      ...(eventId && { eventId })
    }

    const [
      uploadStats,
      customerGrowth,
      popularEvents,
      storageUsage,
      uploadTrends
    ] = await Promise.all([
      // Upload statistics
      prisma.upload.groupBy({
        by: ['mimeType'],
        where: baseFilter,
        _count: { id: true },
        _sum: { fileSize: true }
      }),

      // Customer growth over time
      prisma.customer.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: dateFilter }
        },
        _count: { id: true },
        orderBy: { createdAt: 'asc' }
      }),

      // Most popular events
      prisma.event.findMany({
        where: {
          createdAt: { gte: dateFilter }
        },
        include: {
          customer: {
            select: { name: true }
          },
          _count: {
            select: { uploads: true }
          }
        },
        orderBy: {
          uploads: {
            _count: 'desc'
          }
        },
        take: 10
      }),

      // Storage usage by customer
      prisma.upload.groupBy({
        by: ['eventId'],
        where: baseFilter,
        _sum: { fileSize: true },
        _count: { id: true },
        orderBy: {
          _sum: {
            fileSize: 'desc'
          }
        },
        take: 10
      }),

      // Upload trends by day
      prisma.$queryRaw`
        SELECT 
          DATE(createdAt) as date,
          COUNT(*) as uploads,
          SUM(fileSize) as totalSize
        FROM uploads 
        WHERE createdAt >= ${dateFilter}
        ${eventId ? `AND eventId = ${eventId}` : ''}
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      `
    ])

    return NextResponse.json({
      period,
      uploadStats,
      customerGrowth,
      popularEvents,
      storageUsage,
      uploadTrends
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
