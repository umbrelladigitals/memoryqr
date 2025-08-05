import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateEventCode } from '@/lib/qr-utils'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    console.log('🔍 Session debug:', {
      session: session ? 'exists' : 'null',
      user: session?.user ? 'exists' : 'null',
      userId: session?.user?.id,
      userEmail: session?.user?.email
    })
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: session.user.id }
    })
    
    console.log('🔍 Customer check:', {
      customerId: session.user.id,
      customerFound: customer ? 'yes' : 'no',
      customerEmail: customer?.email
    })
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
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
      qrCode,
      eventType,
      participants
    } = await request.json()

    if (!title || !date) {
      return NextResponse.json(
        { error: 'Etkinlik adı ve tarihi zorunludur' },
        { status: 400 }
      )
    }

    // Generate unique QR code if not provided
    const finalQrCode = qrCode || generateEventCode()

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

    // Create event
    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        date: new Date(date),
        location: location || null,
        qrCode: finalQrCode,
        customerId: session.user.id,
        eventType: eventType || null,
        participants: parsedParticipants || undefined,
        maxUploads: maxUploads || null,
        autoArchive: autoArchive || false,
        archiveDate: finalArchiveDate,
        customColors: parsedCustomColors || undefined,
        customMessage: customMessage || null,
        bannerImage: bannerImage || null,
        selectedTemplate: selectedTemplate || null,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        customer: true,
      }
    })

    return NextResponse.json({
      message: 'Etkinlik başarıyla oluşturuldu',
      event: {
        id: event.id,
        title: event.title,
        qrCode: event.qrCode,
        date: event.date,
        location: event.location,
        isActive: event.isActive,
        selectedTemplate: event.selectedTemplate,
      }
    })
  } catch (error) {
    console.error('Event creation error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify customer exists
    const customerExists = await prisma.customer.findUnique({
      where: { id: session.user.id }
    })

    if (!customerExists) {
      console.error('Customer not found for session user ID:', session.user.id)
      return NextResponse.json(
        { error: 'Customer account not found. Please login again.' },
        { status: 403 }
      )
    }

    const events = await prisma.event.findMany({
      where: {
        customerId: session.user.id
      },
      include: {
        uploads: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Events fetch error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}
