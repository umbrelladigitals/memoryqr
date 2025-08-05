import { NextRequest, NextResponse } from 'next/server'
import { r2Service } from '@/lib/r2-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string[] }> | { filename: string[] } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const filePath = resolvedParams.filename.join('/')
    
    if (!filePath) {
      return new NextResponse('File path is required', { status: 400 })
    }

    console.log('Serving image for path:', filePath)

    // Get signed URL from R2
    const signedUrl = await r2Service.getSignedUrl(filePath)
    
    if (!signedUrl) {
      return new NextResponse('File not found', { status: 404 })
    }

    console.log('Fetching file from signed URL:', signedUrl)

    // Fetch the file content and serve it directly
    const response = await fetch(signedUrl)
    
    if (!response.ok) {
      console.error('Failed to fetch file from R2:', response.status, response.statusText)
      return new NextResponse('File not found', { status: 404 })
    }

    const fileBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    console.log('Successfully fetched file, size:', fileBuffer.byteLength, 'bytes')

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Error serving image:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
