import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Database bağlantı testi
    await prisma.$queryRaw`SELECT 1`
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '0.1.0',
      database: 'connected',
      services: {
        prisma: 'connected',
        cloudflare_r2: process.env.CLOUDFLARE_R2_BUCKET_NAME ? 'configured' : 'not_configured',
        auth: process.env.NEXTAUTH_SECRET ? 'configured' : 'not_configured'
      }
    }
    
    return NextResponse.json(health)
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        environment: process.env.NODE_ENV
      },
      { status: 503 }
    )
  }
}
