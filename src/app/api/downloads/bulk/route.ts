import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { r2Service } from '@/lib/r2-service'
import archiver from 'archiver'
import { Readable } from 'stream'

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

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID gereklidir' },
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
        uploads: uploadIds && uploadIds.length > 0 ? {
          where: {
            id: {
              in: uploadIds
            }
          }
        } : true
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Etkinlik bulunamadı' },
        { status: 404 }
      )
    }

    if (!event.uploads || event.uploads.length === 0) {
      return NextResponse.json(
        { error: 'İndirilecek fotoğraf bulunamadı' },
        { status: 404 }
      )
    }

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    })

    // Set headers for ZIP download
    const headers = new Headers()
    headers.set('Content-Type', 'application/zip')
    headers.set('Content-Disposition', `attachment; filename="${event.title.replace(/[^a-zA-Z0-9]/g, '_')}-photos.zip"`)
    headers.set('Cache-Control', 'no-cache')

    // Create a readable stream for the response
    const stream = new ReadableStream({
      start(controller) {
        // Handle archive data
        archive.on('data', (chunk) => {
          controller.enqueue(new Uint8Array(chunk))
        })

        // Handle archive end
        archive.on('end', () => {
          console.log(`ZIP archive created successfully for event: ${event.title}`)
          controller.close()
        })

        // Handle archive errors
        archive.on('error', (err) => {
          console.error('Archive error:', err)
          controller.error(err)
        })

        // Add files to archive
        Promise.all(
          event.uploads.map(async (upload, index) => {
            try {
              console.log(`Processing file ${index + 1}/${event.uploads.length}: ${upload.originalName}`)
              
              // Get signed URL for the file
              const signedUrl = await r2Service.getSignedUrl(upload.filePath)
              
              // Fetch file content
              const response = await fetch(signedUrl)
              if (!response.ok) {
                console.error(`Failed to fetch file: ${upload.originalName}`)
                return
              }

              const arrayBuffer = await response.arrayBuffer()
              const buffer = Buffer.from(arrayBuffer)
              
              // Add file to archive with original name
              archive.append(buffer, { name: upload.originalName })
              
            } catch (error) {
              console.error(`Error processing file ${upload.originalName}:`, error)
            }
          })
        ).then(() => {
          // Finalize the archive after all files are added
          console.log('All files processed, finalizing archive...')
          archive.finalize()
        }).catch((error) => {
          console.error('Error processing files:', error)
          controller.error(error)
        })
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
