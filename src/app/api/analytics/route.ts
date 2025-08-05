import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'
    const eventId = searchParams.get('eventId') || 'all'

    const customerId = session.user.id

    // Calculate date range
    const now = new Date()
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))

    // Build base query
    const baseQuery = {
      customerId,
      ...(eventId !== 'all' && { id: eventId }),
      createdAt: {
        gte: startDate
      }
    }

    // Get analytics data
    const [totalEvents, totalUploads, events, uploads] = await Promise.all([
      prisma.event.count({ 
        where: { 
          customerId,
          ...(eventId !== 'all' && { id: eventId })
        } 
      }),
      prisma.upload.count({ 
        where: { 
          event: baseQuery,
          createdAt: { gte: startDate }
        } 
      }),
      prisma.event.findMany({
        where: { 
          customerId,
          ...(eventId !== 'all' && { id: eventId })
        },
        include: {
          _count: {
            select: {
              uploads: {
                where: {
                  createdAt: { gte: startDate }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.upload.findMany({
        where: {
          event: baseQuery,
          createdAt: { gte: startDate }
        },
        include: {
          event: {
            select: { title: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ])

    // Generate time series data
    const timeSeriesData = generateTimeSeriesFromUploads(uploads, days)

    // Mock additional data (you can implement real tracking later)
    const analyticsData = {
      overview: {
        totalEvents,
        totalUploads,
        totalViews: Math.floor(totalUploads * 1.5),
        totalDownloads: Math.floor(totalUploads * 0.3),
        avgUploadsPerEvent: totalEvents > 0 ? Math.round(totalUploads / totalEvents) : 0,
        activeEvents: events.filter(e => e.isActive).length,
        topUploadDay: getMostActiveDay(uploads),
        totalStorageUsed: uploads.reduce((total, upload) => total + upload.fileSize, 0)
      },
      eventStats: events.map(event => ({
        id: event.id,
        title: event.title,
        uploads: event._count.uploads,
        views: Math.floor(event._count.uploads * 1.5),
        downloads: Math.floor(event._count.uploads * 0.3),
        date: event.date.toLocaleDateString('tr-TR'),
        status: event.isActive ? 'active' as const : 'inactive' as const
      })),
      timeSeriesData,
      deviceStats: generateDeviceStats(totalUploads),
      locationStats: generateLocationStats(totalUploads),
      popularTimes: generatePopularTimes(uploads)
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Analytics verisi alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

function generateTimeSeriesFromUploads(uploads: any[], days: number) {
  const data = []
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
    
    const dayUploads = uploads.filter(upload => {
      const uploadDate = new Date(upload.createdAt)
      return uploadDate >= dayStart && uploadDate < dayEnd
    }).length

    data.push({
      date: date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
      uploads: dayUploads,
      views: Math.floor(dayUploads * 1.5),
      downloads: Math.floor(dayUploads * 0.3)
    })
  }
  return data
}

function getMostActiveDay(uploads: any[]) {
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
  const dayCount: { [key: string]: number } = {}
  
  uploads.forEach(upload => {
    const day = days[new Date(upload.createdAt).getDay()]
    dayCount[day] = (dayCount[day] || 0) + 1
  })
  
  return Object.keys(dayCount).reduce((a, b) => dayCount[a] > dayCount[b] ? a : b, 'Cumartesi')
}

function generateDeviceStats(totalUploads: number) {
  return [
    { device: 'Mobil', count: Math.floor(totalUploads * 0.7), percentage: 70 },
    { device: 'Desktop', count: Math.floor(totalUploads * 0.25), percentage: 25 },
    { device: 'Tablet', count: Math.floor(totalUploads * 0.05), percentage: 5 }
  ]
}

function generateLocationStats(totalUploads: number) {
  return [
    { location: 'İstanbul', count: Math.floor(totalUploads * 0.4), percentage: 40 },
    { location: 'Ankara', count: Math.floor(totalUploads * 0.2), percentage: 20 },
    { location: 'İzmir', count: Math.floor(totalUploads * 0.15), percentage: 15 },
    { location: 'Antalya', count: Math.floor(totalUploads * 0.1), percentage: 10 },
    { location: 'Diğer', count: Math.floor(totalUploads * 0.15), percentage: 15 }
  ]
}

function generatePopularTimes(uploads: any[]) {
  const hourCount: { [key: number]: number } = {}
  
  uploads.forEach(upload => {
    const hour = new Date(upload.createdAt).getHours()
    hourCount[hour] = (hourCount[hour] || 0) + 1
  })
  
  const data = []
  for (let hour = 0; hour < 24; hour++) {
    data.push({
      hour,
      uploads: hourCount[hour] || 0
    })
  }
  return data
}
