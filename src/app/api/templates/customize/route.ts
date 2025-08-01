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
    const { templateId, customization, userId, eventId } = body

    // Update the template with customization
    const updatedTemplate = await prisma.uploadTemplate.update({
      where: { id: templateId },
      data: {
        displayName: customization.displayName,
        description: customization.description,
        primaryColor: customization.primaryColor,
        secondaryColor: customization.secondaryColor,
        backgroundColor: customization.backgroundColor,
        textColor: customization.textColor,
        headerStyle: customization.headerStyle,
        buttonStyle: customization.buttonStyle,
        cardStyle: customization.cardStyle,
        welcomeTitle: customization.welcomeTitle,
        welcomeMessage: customization.welcomeMessage,
        uploadButtonText: customization.uploadButtonText,
        animations: customization.animations || {},
        layout: customization.layout || {},
        fonts: customization.fonts || {}
      }
    })

    // If eventId is provided, apply the template to the event
    if (eventId) {
      await prisma.event.update({
        where: { id: eventId },
        data: {
          templateId: templateId
        }
      })
    }

    return NextResponse.json({
      success: true,
      template: updatedTemplate
    })

  } catch (error) {
    console.error('Customize template error:', error)
    return NextResponse.json(
      { error: 'Template customization could not be saved' },
      { status: 500 }
    )
  }
}
