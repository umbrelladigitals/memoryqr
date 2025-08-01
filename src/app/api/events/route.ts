import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateEventCode } from '@/lib/qr-utils'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, description, date, location, templateId } = await request.json()

    if (!title || !date) {
      return NextResponse.json(
        { error: 'Etkinlik adı ve tarihi zorunludur' },
        { status: 400 }
      )
    }

    // Generate unique QR code
    const qrCode = generateEventCode()

    // Create event
    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        date: new Date(date),
        location: location || null,
        qrCode,
        customerId: session.user.id,
        templateId: templateId || null,
      }
    })

    return NextResponse.json({
      message: 'Etkinlik başarıyla oluşturuldu',
      event: {
        id: event.id,
        title: event.title,
        qrCode: event.qrCode,
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
