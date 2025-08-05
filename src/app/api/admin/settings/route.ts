import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { jwtVerify } from 'jose'

const prisma = new PrismaClient()

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

// Get system settings
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request)
    
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create system settings
    let settings = null
    try {
      const systemSettings = await prisma.$queryRaw`SELECT * FROM system_settings LIMIT 1` as any[]
      if (systemSettings.length > 0) {
        settings = systemSettings[0]
      } else {
        // Create default settings
        await prisma.$executeRaw`
          INSERT INTO system_settings (
            maxImageSizeMB, maxVideoSizeMB, allowedImageFormats, allowedVideoFormats,
            maxUploadsPerEvent, enableVideoUploads, enableImageUploads, createdAt, updatedAt
          ) VALUES (
            10, 100, 'jpg,jpeg,png,gif,webp', 'mp4,mov,avi,mkv,webm,m4v',
            100, 1, 1, datetime('now'), datetime('now')
          )
        `
        const newSettings = await prisma.$queryRaw`SELECT * FROM system_settings LIMIT 1` as any[]
        settings = newSettings[0]
      }
    } catch (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { error: 'Ayarlar alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

// Update system settings
export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request)
    
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Received system settings update:', body)
    
    try {
      const existingSettings = await prisma.$queryRaw`SELECT * FROM system_settings LIMIT 1` as any[]
      
      if (existingSettings.length > 0) {
        // Build dynamic update query
        const updateFields: string[] = []
        const updateValues: any[] = []
        
        if (body.maxImageSizeMB !== undefined) {
          updateFields.push('maxImageSizeMB = ?')
          updateValues.push(body.maxImageSizeMB)
        }
        if (body.max_file_size_mb !== undefined) {
          updateFields.push('maxImageSizeMB = ?')
          updateValues.push(body.max_file_size_mb)
        }
        if (body.maxVideoSizeMB !== undefined) {
          updateFields.push('maxVideoSizeMB = ?')
          updateValues.push(body.maxVideoSizeMB)
        }
        if (body.allowedImageFormats !== undefined) {
          updateFields.push('allowedImageFormats = ?')
          updateValues.push(body.allowedImageFormats)
        }
        if (body.allowed_file_types !== undefined) {
          updateFields.push('allowedImageFormats = ?')
          updateValues.push(body.allowed_file_types)
        }
        if (body.allowedVideoFormats !== undefined) {
          updateFields.push('allowedVideoFormats = ?')
          updateValues.push(body.allowedVideoFormats)
        }
        if (body.maxUploadsPerEvent !== undefined) {
          updateFields.push('maxUploadsPerEvent = ?')
          updateValues.push(body.maxUploadsPerEvent)
        }
        if (body.autoDeleteAfterDays !== undefined) {
          updateFields.push('autoDeleteAfterDays = ?')
          updateValues.push(body.autoDeleteAfterDays)
        }
        if (body.cleanup_days !== undefined) {
          updateFields.push('autoDeleteAfterDays = ?')
          updateValues.push(body.cleanup_days)
        }
        if (body.enableVideoUploads !== undefined) {
          updateFields.push('enableVideoUploads = ?')
          updateValues.push(body.enableVideoUploads ? 1 : 0)
        }
        if (body.enableImageUploads !== undefined) {
          updateFields.push('enableImageUploads = ?')
          updateValues.push(body.enableImageUploads ? 1 : 0)
        }
        
        // Always update the updatedAt field
        updateFields.push('updatedAt = datetime("now")')
        updateValues.push(existingSettings[0].id) // ID for WHERE clause
        
        if (updateFields.length > 1) { // More than just updatedAt
          const query = `UPDATE system_settings SET ${updateFields.join(', ')} WHERE id = ?`
          await prisma.$executeRawUnsafe(query, ...updateValues)
        }
      } else {
        // Create new settings
        await prisma.$executeRaw`
          INSERT INTO system_settings (
            maxImageSizeMB, maxVideoSizeMB, allowedImageFormats, allowedVideoFormats,
            maxUploadsPerEvent, autoDeleteAfterDays, enableVideoUploads, enableImageUploads,
            createdAt, updatedAt
          ) VALUES (
            ${body.maxImageSizeMB || body.max_file_size_mb || 10},
            ${body.maxVideoSizeMB || 100},
            ${body.allowedImageFormats || body.allowed_file_types || 'jpg,jpeg,png,gif,webp'},
            ${body.allowedVideoFormats || 'mp4,mov,avi,mkv,webm,m4v'},
            ${body.maxUploadsPerEvent || 100},
            ${body.autoDeleteAfterDays || body.cleanup_days},
            ${body.enableVideoUploads !== undefined ? (body.enableVideoUploads ? 1 : 0) : 1},
            ${body.enableImageUploads !== undefined ? (body.enableImageUploads ? 1 : 0) : 1},
            datetime('now'),
            datetime('now')
          )
        `
      }
      
      // Get updated/created settings
      const finalSettings = await prisma.$queryRaw`SELECT * FROM system_settings LIMIT 1` as any[]
      console.log('System settings updated successfully')
      return NextResponse.json(finalSettings[0])
      
    } catch (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: 'Ayarlar güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}
