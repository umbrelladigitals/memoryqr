import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { r2Service } from '@/lib/r2-service'
import archiver from 'archiver'

export async function POST(request: NextRequest) {
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

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 }
    })

    // Set headers for download
    const headers = new Headers()
    headers.set('Content-Type', 'application/zip')
    headers.set('Content-Disposition', `attachment; filename="${event.title}-photos.zip"`)

    // Create readable stream for response
    const stream = new ReadableStream({
      start(controller) {
        archive.on('data', (chunk) => {
          controller.enqueue(new Uint8Array(chunk))
        })

        archive.on('end', () => {
          controller.close()
        })

        archive.on('error', (err) => {
          controller.error(err)
        })

        // Add files to archive from R2
        for (const upload of event.uploads) {
          try {
            const fileUrl = r2Service.getFileUrl(upload.filePath)
            // For now, we'll use the R2 public URLs
            // In production, you might want to fetch files and add them to archive
            console.log(`File available at: ${fileUrl}`)
          } catch (error) {
            console.error(`Error processing file ${upload.originalName}:`, error)
          }
        }

        archive.finalize()
      }
    })

    return new Response(stream, { headers })
  } catch (error) {
    console.error('Bulk download error:', error)
    return NextResponse.json(
      { error: 'İndirme sırasında hata oluştu' },
      { status: 500 }
    )
  }
}
