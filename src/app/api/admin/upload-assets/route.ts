import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { r2Service } from '@/lib/r2-service'
import { nanoid } from 'nanoid'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

async function verifyAdminToken(request: NextRequest) {
  const token = request.cookies.get('adminToken')?.value
  
  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request)
    
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file || !type) {
      return NextResponse.json(
        { error: 'File ve type gereklidir' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = {
      logo: ['image/png', 'image/svg+xml', 'image/jpeg'],
      favicon: ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon'],
      appleTouchIcon: ['image/png'],
      ogImage: ['image/png', 'image/jpeg']
    }

    if (!allowedTypes[type as keyof typeof allowedTypes]?.includes(file.type)) {
      return NextResponse.json(
        { error: 'Geçersiz dosya formatı' },
        { status: 400 }
      )
    }

    // Size limits (in bytes)
    const sizeLimits = {
      logo: 2 * 1024 * 1024, // 2MB
      favicon: 500 * 1024, // 500KB
      appleTouchIcon: 1 * 1024 * 1024, // 1MB
      ogImage: 5 * 1024 * 1024 // 5MB
    }

    if (file.size > sizeLimits[type as keyof typeof sizeLimits]) {
      return NextResponse.json(
        { error: 'Dosya boyutu çok büyük' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${type}-${nanoid()}.${fileExtension}`
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Upload to Cloudflare R2
    const r2Key = await r2Service.uploadFile({
      customerId: 'admin',
      eventId: 'assets',
      fileName,
      fileBuffer: buffer,
      contentType: file.type,
    })

    // Return public URL
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${r2Key}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: fileName,
      type,
      size: file.size
    })

  } catch (error) {
    console.error('Asset upload error:', error)
    return NextResponse.json(
      { error: 'Dosya yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
