import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Environment variables kontrolü
    const r2Config = {
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
      hasAccessKey: !!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL,
    }

    // Konfigürasyon eksikliklerini kontrol et
    const missingConfig = []
    if (!r2Config.endpoint) missingConfig.push('CLOUDFLARE_R2_ENDPOINT')
    if (!r2Config.bucketName) missingConfig.push('CLOUDFLARE_R2_BUCKET_NAME')
    if (!r2Config.accountId) missingConfig.push('CLOUDFLARE_ACCOUNT_ID')
    if (!r2Config.hasAccessKey) missingConfig.push('CLOUDFLARE_R2_ACCESS_KEY_ID')
    if (!r2Config.hasSecretKey) missingConfig.push('CLOUDFLARE_R2_SECRET_ACCESS_KEY')

    const isConfigured = missingConfig.length === 0

    return NextResponse.json({
      status: isConfigured ? 'configured' : 'incomplete',
      message: isConfigured 
        ? 'Cloudflare R2 configuration is complete' 
        : 'Cloudflare R2 configuration is incomplete',
      config: {
        endpoint: r2Config.endpoint || 'NOT_SET',
        bucketName: r2Config.bucketName || 'NOT_SET',
        accountId: r2Config.accountId || 'NOT_SET',
        hasCredentials: r2Config.hasAccessKey && r2Config.hasSecretKey,
        publicUrl: r2Config.publicUrl || 'NOT_SET',
      },
      missingConfig,
      recommendations: isConfigured ? [
        'Run `npm run r2:test` to test the connection',
        'Check the setup guide at /docs/CLOUDFLARE_R2_SETUP.md'
      ] : [
        'Complete the missing configuration variables',
        'Follow the setup guide at /docs/CLOUDFLARE_R2_SETUP.md',
        'Create a Cloudflare R2 bucket and API token'
      ]
    })
  } catch (error) {
    console.error('R2 status check error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Error checking R2 configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
