import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { eventId, templateId, userId } = body

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 401 })
    }

    // Verify the event belongs to the user
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        customer: {
          email: session.user.email
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Verify the template exists
    const template = await prisma.uploadTemplate.findUnique({
      where: { id: templateId }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Apply the template to the event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        templateId: templateId
      },
      include: {
        template: true
      }
    })

    return NextResponse.json({
      success: true,
      event: updatedEvent
    })

  } catch (error) {
    console.error('Apply template error:', error)
    return NextResponse.json(
      { error: 'Template could not be applied to event' },
      { status: 500 }
    )
  }
}
