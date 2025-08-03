// Simple R2 test without CORS - just to check basic connectivity
import { config } from 'dotenv'
import { resolve } from 'path'
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

// Simple R2 client configuration
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

export async function simpleR2Test() {
  console.log('🧪 Simple R2 connectivity test...')
  console.log(`📦 Bucket: ${bucketName}`)
  console.log(`🔗 Endpoint: ${process.env.CLOUDFLARE_R2_ENDPOINT}`)
  console.log('')
  
  try {
    // Test 1: List objects (simple read operation)
    console.log('📋 Test 1: Listing objects in bucket...')
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 5
    })
    
    const listResult = await r2Client.send(listCommand)
    console.log(`✅ Bucket access successful! Found ${listResult.KeyCount || 0} objects`)
    
    if (listResult.Contents && listResult.Contents.length > 0) {
      console.log('📁 Sample objects:')
      listResult.Contents.slice(0, 3).forEach(obj => {
        console.log(`  - ${obj.Key} (${obj.Size} bytes)`)
      })
    }
    
    // Test 2: Upload a simple file
    console.log('\n📤 Test 2: Uploading test file...')
    const testKey = `test/simple-test-${Date.now()}.txt`
    const testContent = 'Hello from MemoryQR simple test!'
    
    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain'
    })
    
    await r2Client.send(putCommand)
    console.log(`✅ Upload successful! Key: ${testKey}`)
    
    console.log('\n🎉 Simple R2 test PASSED!')
    console.log('✅ R2 credentials and connectivity are working')
    console.log('💡 The issue with the main service might be in the implementation details')
    
    return true
    
  } catch (error: any) {
    console.error('❌ Simple R2 test FAILED:', error.message)
    console.error('🔍 Error details:', {
      name: error.name,
      code: error.Code || error.$metadata?.errorCode,
      statusCode: error.$metadata?.httpStatusCode
    })
    
    if (error.name === 'CredentialsProviderError') {
      console.error('🔑 Credential issue detected - check your R2 API tokens')
    } else if (error.name === 'NetworkingError') {
      console.error('🌐 Network issue - check your endpoint URL')  
    } else if (error.name === 'NoSuchBucket') {
      console.error('📦 Bucket not found - check your bucket name')
    }
    
    return false
  }
}

// Run simple test
if (require.main === module) {
  simpleR2Test()
    .then((success) => {
      process.exit(success ? 0 : 1)
    })
    .catch((error) => {
      console.error('💥 Test script error:', error)
      process.exit(1)
    })
}
