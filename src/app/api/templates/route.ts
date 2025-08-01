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
    const userId = searchParams.get('userId')
    const eventId = searchParams.get('eventId')

    // Get base templates only (not user-created ones)
    const baseTemplates = await prisma.uploadTemplate.findMany({
      where: { 
        isActive: true,
        name: {
          in: ['wedding', 'birthday', 'corporate'] // Only base templates
        }
      },
      orderBy: [
        { isDefault: 'desc' },
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    })

    let templates = baseTemplates.map((template: any) => ({
      id: template.id,
      name: template.name,
      displayName: template.displayName,
      description: template.description,
      primaryColor: template.primaryColor,
      secondaryColor: template.secondaryColor,
      backgroundColor: template.backgroundColor,
      textColor: template.textColor,
      headerStyle: template.headerStyle,
      buttonStyle: template.buttonStyle,
      cardStyle: template.cardStyle,
      isDefault: template.isDefault,
      heroImage: template.heroImage,
      logoImage: template.logoImage
    }))

    // If eventId is provided, get event-specific customizations
    if (eventId) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: {
          id: true,
          templateId: true,
          customColors: true,
          customLogo: true,
          template: true
        }
      }) as any // Temporary bypass for TypeScript

      if (event && (event.customColors || event.customStyles)) {
        // Find the template this event uses and apply customizations
        const eventTemplateIndex = templates.findIndex(t => t.id === event.templateId)
        if (eventTemplateIndex !== -1) {
          const customColors = event.customColors as any
          const customStyles = event.customStyles as any
          
          templates[eventTemplateIndex] = {
            ...templates[eventTemplateIndex],
            primaryColor: customColors?.primaryColor || templates[eventTemplateIndex].primaryColor,
            secondaryColor: customColors?.secondaryColor || templates[eventTemplateIndex].secondaryColor,
            backgroundColor: customColors?.backgroundColor || templates[eventTemplateIndex].backgroundColor,
            textColor: customColors?.textColor || templates[eventTemplateIndex].textColor,
            headerStyle: customStyles?.headerStyle || templates[eventTemplateIndex].headerStyle,
            buttonStyle: customStyles?.buttonStyle || templates[eventTemplateIndex].buttonStyle,
            cardStyle: customStyles?.cardStyle || templates[eventTemplateIndex].cardStyle,
            logoImage: event.customLogo || templates[eventTemplateIndex].logoImage
          }
        }
      }
    }

    return NextResponse.json({ 
      templates,
      success: true 
    })
  } catch (error) {
    console.error('Templates API error:', error)
    return NextResponse.json(
      { error: 'Şablonlar yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      displayName,
      description,
      primaryColor,
      secondaryColor,
      backgroundColor,
      textColor,
      headerStyle,
      buttonStyle,
      cardStyle,
      heroImage,
      logoImage
    } = body

    // Create new custom template
    const newTemplate = await prisma.uploadTemplate.create({
      data: {
        name: name || `custom_${Date.now()}`,
        displayName: displayName || 'Özel Şablon',
        description: description || 'Kullanıcı tarafından oluşturulan özel şablon',
        primaryColor: primaryColor || '#3B82F6',
        secondaryColor: secondaryColor || '#8B5CF6',
        backgroundColor: backgroundColor || '#F8FAFC',
        textColor: textColor || '#1F2937',
        headerStyle: headerStyle || 'minimal',
        buttonStyle: buttonStyle || 'rounded',
        cardStyle: cardStyle || 'shadow',
        heroImage,
        logoImage,
        isActive: true,
        isDefault: false,
        sortOrder: 999
      }
    })

    return NextResponse.json({ 
      template: newTemplate,
      success: true 
    })
  } catch (error) {
    console.error('Create template error:', error)
    return NextResponse.json(
      { error: 'Şablon oluşturulamadı' },
      { status: 500 }
    )
  }
}
