import { S3Client, PutBucketPolicyCommand, GetBucketPolicyCommand } from '@aws-sdk/client-s3'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// R2 configuration
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

// Public access policy for the bucket
const publicPolicy = {
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'PublicReadGetObject',
      Effect: 'Allow',
      Principal: '*',
      Action: 's3:GetObject',
      Resource: `arn:aws:s3:::${bucketName}/*`
    }
  ]
}

async function setupPublicAccess() {
  try {
    console.log('Setting up public access for bucket:', bucketName)
    
    // Set bucket policy for public read access
    const putPolicyCommand = new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify(publicPolicy)
    })
    
    await r2Client.send(putPolicyCommand)
    console.log('✅ Public access policy set successfully')
    
    // Verify the policy
    const getPolicyCommand = new GetBucketPolicyCommand({
      Bucket: bucketName
    })
    
    const policyResult = await r2Client.send(getPolicyCommand)
    console.log('📋 Current bucket policy:', policyResult.Policy)
    
  } catch (error) {
    console.error('❌ Error setting up public access:', error)
  }
}

setupPublicAccess()
