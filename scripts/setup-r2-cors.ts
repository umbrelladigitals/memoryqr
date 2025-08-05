// Setup CORS policy for Cloudflare R2 bucket
import { config } from 'dotenv'
import { resolve } from 'path'
import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

// Create R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
})

const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME!

// CORS configuration for MemoryQR
const corsConfiguration = {
  CORSRules: [
    {
      ID: 'MemoryQR-CORS-Rule',
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
      AllowedOrigins: [
        'http://localhost:3000',
        'http://localhost:3001', 
        'http://localhost:3002',
        'https://*.vercel.app',
        'https://memoryqr.com',
        'https://*.memoryqr.com'
      ],
      ExposeHeaders: ['ETag'],
      MaxAgeSeconds: 3600
    }
  ]
}

export async function setupR2CORS() {
  console.log('🔧 Setting up CORS policy for R2 bucket...')
  console.log(`📦 Bucket: ${bucketName}`)
  
  try {
    // Check current CORS configuration
    console.log('📋 Checking current CORS configuration...')
    try {
      const getCurrentCors = new GetBucketCorsCommand({
        Bucket: bucketName
      })
      const currentCors = await r2Client.send(getCurrentCors)
      console.log('📄 Current CORS rules:', JSON.stringify(currentCors.CORSRules, null, 2))
    } catch (error: any) {
      if (error.name === 'NoSuchCORSConfiguration') {
        console.log('📄 No CORS configuration found - will create new one')
      } else {
        console.log('⚠️ Error checking current CORS:', error.message)
      }
    }
    
    // Set new CORS configuration
    console.log('🚀 Applying new CORS configuration...')
    const putCorsCommand = new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: corsConfiguration
    })
    
    await r2Client.send(putCorsCommand)
    console.log('✅ CORS policy applied successfully!')
    
    // Verify the configuration
    console.log('🔍 Verifying CORS configuration...')
    const verifyCors = new GetBucketCorsCommand({
      Bucket: bucketName
    })
    const newCors = await r2Client.send(verifyCors)
    console.log('✅ Verified CORS rules:', JSON.stringify(newCors.CORSRules, null, 2))
    
    return true
    
  } catch (error: any) {
    console.error('❌ CORS setup failed:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.Code || error.$metadata?.errorCode
    })
    return false
  }
}

// Run CORS setup
if (require.main === module) {
  setupR2CORS()
    .then((success) => {
      process.exit(success ? 0 : 1)
    })
    .catch((error) => {
      console.error('💥 CORS setup script error:', error)
      process.exit(1)
    })
}
