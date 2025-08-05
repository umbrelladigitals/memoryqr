import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { eventId } = await params

    // Verify event ownership
    const event = await prisma.event.findUnique({
      where: { 
        id: eventId,
        customerId: session.user.id
      },
      include: {
        customer: true,
        uploads: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            uploads: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Event fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { eventId } = await params

    // Verify event ownership
    const existingEvent = await prisma.event.findUnique({
      where: { 
        id: eventId,
        customerId: session.user.id
      }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found or access denied' },
        { status: 404 }
      )
    }

    const { 
      title, 
      description, 
      date, 
      location, 
      maxUploads,
      autoArchive,
      archiveDate,
      customColors,
      customMessage,
      bannerImage,
      selectedTemplate,
      isActive,
      eventType,
      participants
    } = await request.json()

    // Parse archive date
    let finalArchiveDate: Date | null = null
    if (autoArchive) {
      finalArchiveDate = archiveDate ? new Date(archiveDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }

    // Parse JSON fields if they are strings
    let parsedParticipants = null
    let parsedCustomColors = null
    
    try {
      if (typeof participants === 'string') {
        parsedParticipants = JSON.parse(participants)
      } else if (participants) {
        parsedParticipants = participants
      }
    } catch (e) {
      console.warn('Failed to parse participants:', e)
    }

    try {
      if (typeof customColors === 'string') {
        parsedCustomColors = JSON.parse(customColors)
      } else if (customColors) {
        parsedCustomColors = customColors
      }
    } catch (e) {
      console.warn('Failed to parse customColors:', e)
    }

    // Update event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: title || existingEvent.title,
        description: description !== undefined ? description : existingEvent.description,
        date: date ? new Date(date) : existingEvent.date,
        location: location !== undefined ? location : existingEvent.location,
        eventType: eventType !== undefined ? eventType : existingEvent.eventType,
        participants: parsedParticipants !== null ? parsedParticipants : (existingEvent.participants as any),
        maxUploads: maxUploads !== undefined ? maxUploads : existingEvent.maxUploads,
        autoArchive: autoArchive !== undefined ? autoArchive : existingEvent.autoArchive,
        archiveDate: finalArchiveDate !== null ? finalArchiveDate : existingEvent.archiveDate,
        customColors: parsedCustomColors !== null ? parsedCustomColors : (existingEvent.customColors as any),
        customMessage: customMessage !== undefined ? customMessage : existingEvent.customMessage,
        bannerImage: bannerImage !== undefined ? bannerImage : existingEvent.bannerImage,
        selectedTemplate: selectedTemplate !== undefined ? selectedTemplate : existingEvent.selectedTemplate,
        isActive: isActive !== undefined ? isActive : existingEvent.isActive,
      },
      include: {
        customer: true,
      }
    })

    return NextResponse.json({
      message: 'Etkinlik başarıyla güncellendi',
      event: updatedEvent
    })
  } catch (error) {
    console.error('Event update error:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { eventId } = await params

    // Verify event ownership
    const existingEvent = await prisma.event.findUnique({
      where: { 
        id: eventId,
        customerId: session.user.id
      }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found or access denied' },
        { status: 404 }
      )
    }

    // Delete event (cascades to uploads)
    await prisma.event.delete({
      where: { id: eventId }
    })

    return NextResponse.json({
      message: 'Etkinlik başarıyla silindi'
    })
  } catch (error) {
    console.error('Event deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
