import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { r2Service } from '@/lib/r2-service'
import { nanoid } from 'nanoid'

// Default settings when no system settings found
const DEFAULT_SETTINGS = {
  maxImageSizeMB: 10,
  maxVideoSizeMB: 100,
  allowedImageFormats: "jpg,jpeg,png,gif,webp",
  allowedVideoFormats: "mp4,mov,avi,mkv,webm,m4v",
  enableVideoUploads: true,
  enableImageUploads: true
}

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

    // Get system settings or use defaults
    let settings = DEFAULT_SETTINGS
    try {
      const systemSettings = await prisma.$queryRaw`SELECT * FROM system_settings LIMIT 1` as any[]
      if (systemSettings.length > 0) {
        settings = systemSettings[0]
      }
    } catch (error) {
      console.log('Using default settings')
    }

    // Validate file type (image or video)
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    
    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Sadece resim ve video dosyaları yüklenebilir' },
        { status: 400 }
      )
    }

    // Check if image/video uploads are enabled
    if (isImage && !settings.enableImageUploads) {
      return NextResponse.json(
        { error: 'Resim yükleme devre dışı' },
        { status: 400 }
      )
    }
    
    if (isVideo && !settings.enableVideoUploads) {
      return NextResponse.json(
        { error: 'Video yükleme devre dışı' },
        { status: 400 }
      )
    }

    // Dynamic size limits based on settings
    const maxSizeImage = settings.maxImageSizeMB * 1024 * 1024
    const maxSizeVideo = settings.maxVideoSizeMB * 1024 * 1024
    
    if (isImage && file.size > maxSizeImage) {
      return NextResponse.json(
        { error: `Resim dosyası boyutu ${settings.maxImageSizeMB}MB'dan büyük olamaz` },
        { status: 400 }
      )
    }
    
    if (isVideo && file.size > maxSizeVideo) {
      return NextResponse.json(
        { error: `Video dosyası boyutu ${settings.maxVideoSizeMB}MB'dan büyük olamaz` },
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
      message: isImage ? 'Fotoğraf başarıyla yüklendi' : 'Video başarıyla yüklendi',
      upload: {
        id: upload.id,
        fileName: upload.fileName,
        filePath: upload.filePath,
        mimeType: upload.mimeType,
        isVideo: isVideo
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
