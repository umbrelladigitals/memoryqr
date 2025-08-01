import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const templateId = formData.get('templateId') as string
    const imageType = formData.get('imageType') as string // 'hero', 'logo', 'gallery'

    if (!file || !templateId || !imageType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'templates', templateId)
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const fileExtension = path.extname(file.name)
    const timestamp = Date.now()
    const fileName = `${imageType}_${timestamp}${fileExtension}`
    const filePath = path.join(uploadDir, fileName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Create public URL
    const publicUrl = `/uploads/templates/${templateId}/${fileName}`

    // Update template in database
    const updateData: any = {}
    if (imageType === 'hero') {
      updateData.heroImage = publicUrl
    } else if (imageType === 'logo') {
      updateData.logoImage = publicUrl
    } else if (imageType === 'gallery') {
      // For gallery images, we'll add to the existing array
      const template = await prisma.uploadTemplate.findUnique({
        where: { id: templateId },
        select: { galleryImages: true }
      })
      
      const currentGallery = (template?.galleryImages as string[]) || []
      updateData.galleryImages = [...currentGallery, publicUrl]
    }

    const updatedTemplate = await prisma.uploadTemplate.update({
      where: { id: templateId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      template: updatedTemplate
    })

  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { error: 'Image upload failed' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('templateId')
    const imageType = searchParams.get('imageType')
    const imageUrl = searchParams.get('imageUrl')

    if (!templateId || !imageType) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Update template in database
    const updateData: any = {}
    if (imageType === 'hero') {
      updateData.heroImage = null
    } else if (imageType === 'logo') {
      updateData.logoImage = null
    } else if (imageType === 'gallery' && imageUrl) {
      const template = await prisma.uploadTemplate.findUnique({
        where: { id: templateId },
        select: { galleryImages: true }
      })
      
      const currentGallery = (template?.galleryImages as string[]) || []
      updateData.galleryImages = currentGallery.filter(url => url !== imageUrl)
    }

    const updatedTemplate = await prisma.uploadTemplate.update({
      where: { id: templateId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      template: updatedTemplate
    })

  } catch (error) {
    console.error('Image delete error:', error)
    return NextResponse.json(
      { error: 'Image delete failed' },
      { status: 500 }
    )
  }
}
