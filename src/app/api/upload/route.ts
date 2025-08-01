import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { r2Service } from '@/lib/r2-service'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const eventId = formData.get('eventId') as string
    const guestName = formData.get('guestName') as string

    if (!file || !eventId) {
      return NextResponse.json(
        { error: 'File ve eventId gereklidir' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Sadece resim dosyaları yüklenebilir' },
        { status: 400 }
      )
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Dosya boyutu 10MB\'dan büyük olamaz' },
        { status: 400 }
      )
    }

    // Check if event exists and is active
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { customer: true }
    })

    if (!event || !event.isActive) {
      return NextResponse.json(
        { error: 'Etkinlik bulunamadı veya aktif değil' },
        { status: 404 }
      )
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${nanoid()}.${fileExtension}`
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Upload to Cloudflare R2
    const r2Key = await r2Service.uploadFile({
      customerId: event.customerId,
      eventId: event.id,
      fileName,
      fileBuffer: buffer,
      contentType: file.type,
    })

    // Save to database
    const upload = await prisma.upload.create({
      data: {
        fileName,
        originalName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        filePath: r2Key, // Store R2 key instead of local path
        guestName: guestName || 'Anonim',
        guestId: nanoid(8), // Anonymous guest ID
        eventId: event.id,
      }
    })

    return NextResponse.json({
      message: 'Fotoğraf başarıyla yüklendi',
      upload: {
        id: upload.id,
        fileName: upload.fileName,
        filePath: upload.filePath,
        fileUrl: r2Service.getFileUrl(upload.filePath), // Return R2 URL
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Yükleme sırasında hata oluştu' },
      { status: 500 }
    )
  }
}
