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

    const { eventId } = await params, NextResponse } from 'next/server'
iexport async function PUT(
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

    const { eventId } = await paramsfrom '@/auth'
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

    const { eventId } = params

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        template: true,
        customer: {
          select: {
            id: true,
            name: true,
            plan: {
              select: {
                maxPhotosPerEvent: true
              }
            }
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { eventId } = params

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
      participants,
      customLogo,
      customStyles
    } = await request.json()

    // Parse archive date
    let finalArchiveDate: Date | null = null
    if (autoArchive) {
      finalArchiveDate = archiveDate ? new Date(archiveDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }

    // Update event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title,
        description: description || null,
        date: new Date(date),
        location: location || null,
        eventType: eventType || null,
        participants: participants || null,
        maxUploads: maxUploads || null,
        autoArchive: autoArchive || false,
        archiveDate: finalArchiveDate,
        customColors: customColors || null,
        customMessage: customMessage || null,
        bannerImage: bannerImage || null,
        customLogo: customLogo || null,
        customStyles: customStyles || null,
        selectedTemplate: selectedTemplate || null,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        customer: true,
      }
    })

    return NextResponse.json({
      message: 'Etkinlik başarıyla güncellendi',
      event: {
        id: updatedEvent.id,
        title: updatedEvent.title,
        qrCode: updatedEvent.qrCode,
        date: updatedEvent.date,
        location: updatedEvent.location,
        isActive: updatedEvent.isActive,
        selectedTemplate: updatedEvent.selectedTemplate,
      }
    })
  } catch (error) {
    console.error('Event update error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { eventId } = params

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

    // Delete event (uploads will be cascade deleted)
    await prisma.event.delete({
      where: { id: eventId }
    })

    return NextResponse.json({
      message: 'Etkinlik başarıyla silindi'
    })
  } catch (error) {
    console.error('Event delete error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}
