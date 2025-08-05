import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ eventId: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { eventId } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if event belongs to user
    const event = await prisma.event.findUnique({
      where: { 
        id: eventId,
        customerId: session.user.id 
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Etkinlik bulunamadı' },
        { status: 404 }
      )
    }

    // Toggle event status
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        isActive: !event.isActive
      }
    })

    return NextResponse.json({
      message: `Etkinlik ${updatedEvent.isActive ? 'aktif' : 'pasif'} duruma getirildi`,
      event: updatedEvent
    })
  } catch (error) {
    console.error('Event toggle error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}
