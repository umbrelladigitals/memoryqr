// R2 connection test script
import { r2Service } from '../src/lib/r2-service'

export async function testR2Connection() {
  console.log('🧪 Testing Cloudflare R2 connection...')
  
  try {
    // Test file content
    const testContent = Buffer.from('Hello from MemoryQR R2 Test!')
    const testFileName = `test-${Date.now()}.txt`
    
    console.log('📤 Uploading test file...')
    
    // Test upload
    const r2Key = await r2Service.uploadFile({
      customerId: 'test-customer',
      eventId: 'test-event',
      fileName: testFileName,
      fileBuffer: testContent,
      contentType: 'text/plain',
    })
    
    console.log(`✅ Upload successful! R2 Key: ${r2Key}`)
    
    // Test URL generation
    const fileUrl = r2Service.getFileUrl(r2Key)
    console.log(`🔗 File URL: ${fileUrl}`)
    
    // Test delete
    console.log('🗑️ Deleting test file...')
    await r2Service.deleteFile(r2Key)
    console.log('✅ Delete successful!')
    
    console.log('\n🎉 R2 connection test PASSED!')
    return true
    
  } catch (error) {
    console.error('❌ R2 connection test FAILED:', error)
    console.error('\n🔧 Please check your .env.local file:')
    console.error('- CLOUDFLARE_ACCOUNT_ID')
    console.error('- CLOUDFLARE_R2_ACCESS_KEY_ID')
    console.error('- CLOUDFLARE_R2_SECRET_ACCESS_KEY')
    console.error('- CLOUDFLARE_R2_BUCKET_NAME')
    console.error('- CLOUDFLARE_R2_ENDPOINT')
    return false
  }
}

// Run test
if (require.main === module) {
  testR2Connection()
    .then((success) => {
      process.exit(success ? 0 : 1)
    })
    .catch((error) => {
      console.error('💥 Test script error:', error)
      process.exit(1)
    })
}
