import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventId } = await params

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if user owns this event
    if (event.customer.id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ 
      event,
      success: true 
    })
  } catch (error) {
    console.error('Get event error:', error)
    return NextResponse.json(
      { error: 'Event bilgileri alınamadı' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventId } = await params
    const body = await request.json()
    const { templateId, customColors, customLogo, customBanner } = body

    // Verify event exists and user owns it
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        customer: true
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.customer.id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update event with template and customizations
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        selectedTemplate: templateId || null,
        customColors: customColors || null,
        customLogo: customLogo || null,
        bannerImage: customBanner || null,
        updatedAt: new Date()
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ 
      event: updatedEvent,
      success: true 
    })
  } catch (error) {
    console.error('Update event template error:', error)
    return NextResponse.json(
      { error: 'Şablon uygulanamadı' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventId } = await params
    const body = await request.json()
    const { templateId, customColors, customLogo, customBanner } = body

    // Verify event exists and user owns it
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        customer: true
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.customer.id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update event with template and customizations
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        selectedTemplate: templateId || null,
        customColors: customColors || null,
        customLogo: customLogo || null,
        bannerImage: customBanner || null,
        updatedAt: new Date()
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ 
      event: updatedEvent,
      success: true 
    })
  } catch (error) {
    console.error('Update event template error:', error)
    return NextResponse.json(
      { error: 'Şablon uygulanamadı' },
      { status: 500 }
    )
  }
}
