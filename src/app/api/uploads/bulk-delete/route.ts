import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { r2Service } from '@/lib/r2-service'

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { uploadIds, eventId } = await request.json()

    if (!uploadIds || !Array.isArray(uploadIds) || uploadIds.length === 0) {
      return NextResponse.json(
        { error: 'Upload IDs gereklidir' },
        { status: 400 }
      )
    }

    // Verify event ownership and get uploads
    const event = await prisma.event.findUnique({
      where: { 
        id: eventId,
        customerId: session.user.id 
      },
      include: {
        uploads: {
          where: {
            id: {
              in: uploadIds
            }
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Etkinlik bulunamadı' },
        { status: 404 }
      )
    }

    // Delete files from R2
    const deletePromises = event.uploads.map(async (upload: { filePath: string }) => {
      try {
        await r2Service.deleteFile(upload.filePath)
      } catch (error) {
        console.error(`Error deleting file from R2 ${upload.filePath}:`, error)
        // Continue with database deletion even if R2 deletion fails
      }
    })

    await Promise.allSettled(deletePromises)

    // Delete from database
    await prisma.upload.deleteMany({
      where: {
        id: {
          in: uploadIds
        },
        eventId: eventId
      }
    })

    return NextResponse.json({
      message: `${uploadIds.length} fotoğraf başarıyla silindi`,
      deletedCount: uploadIds.length
    })
  } catch (error) {
    console.error('Bulk delete error:', error)
    return NextResponse.json(
      { error: 'Silme sırasında hata oluştu' },
      { status: 500 }
    )
  }
}
