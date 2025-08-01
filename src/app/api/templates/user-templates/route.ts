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
    const {
      baseTemplateId,
      customization,
      userId
    } = body

    // Verify user matches session
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the base template
    const baseTemplate = await prisma.uploadTemplate.findUnique({
      where: { id: baseTemplateId }
    })

    if (!baseTemplate) {
      return NextResponse.json({ error: 'Base template not found' }, { status: 404 })
    }

    // Create new custom template
    const customTemplate = await prisma.uploadTemplate.create({
      data: {
        name: `custom_${Date.now()}`,
        displayName: customization.displayName || `${baseTemplate.displayName} (Özel)`,
        description: customization.description || `${baseTemplate.description} - Özelleştirilmiş`,
        primaryColor: customization.primaryColor,
        secondaryColor: customization.secondaryColor,
        backgroundColor: customization.backgroundColor,
        textColor: customization.textColor,
        headerStyle: customization.headerStyle,
        buttonStyle: customization.buttonStyle,
        cardStyle: customization.cardStyle,
        heroImage: customization.heroImage || baseTemplate.heroImage,
        logoImage: customization.logoImage || baseTemplate.logoImage,
        isActive: true,
        isDefault: false,
        sortOrder: 999
      }
    })

    return NextResponse.json({ 
      template: customTemplate,
      success: true 
    })
  } catch (error) {
    console.error('Create user template error:', error)
    return NextResponse.json(
      { error: 'Özel şablon oluşturulamadı' },
      { status: 500 }
    )
  }
}
