import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Get R2 configuration from environment
function getR2Config() {
  const config = {
    bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL,
  }
  
  // Validate required environment variables
  if (!config.bucketName || !config.endpoint || !config.accessKeyId || !config.secretAccessKey) {
    console.error('Missing R2 configuration:', {
      bucketName: !!config.bucketName,
      endpoint: !!config.endpoint,
      accessKeyId: !!config.accessKeyId,
      secretAccessKey: !!config.secretAccessKey,
    })
    throw new Error('Cloudflare R2 configuration is incomplete')
  }
  
  return config
}

// Create R2 client dynamically
function createR2Client() {
  const config = getR2Config()
  
  return new S3Client({
    region: 'auto',
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId!,
      secretAccessKey: config.secretAccessKey!,
    },
    forcePathStyle: true,
  })
}

export interface UploadOptions {
  customerId: string
  eventId: string
  fileName: string
  fileBuffer: Buffer
  contentType: string
}

export interface CloudflareR2Service {
  uploadFile: (options: UploadOptions) => Promise<string>
  deleteFile: (filePath: string) => Promise<void>
  getFileUrl: (filePath: string) => string
  getSignedUrl: (filePath: string) => Promise<string>
}

// Strategy 1: Single Bucket with Customer/Event Structure
export const r2Service: CloudflareR2Service = {
  async uploadFile({ customerId, eventId, fileName, fileBuffer, contentType }: UploadOptions): Promise<string> {
    const config = getR2Config()
    const r2Client = createR2Client()
    const key = `${customerId}/${eventId}/${fileName}`
    
    try {
      const command = new PutObjectCommand({
        Bucket: config.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        // Optional: Add metadata
        Metadata: {
          customerId,
          eventId,
          uploadedAt: new Date().toISOString(),
        },
      })

      await r2Client.send(command)
      return key
    } catch (error) {
      console.error('R2 upload error:', error)
      throw new Error('File upload failed')
    }
  },

  async deleteFile(filePath: string): Promise<void> {
    const config = getR2Config()
    const r2Client = createR2Client()
    
    try {
      const command = new DeleteObjectCommand({
        Bucket: config.bucketName,
        Key: filePath,
      })

      await r2Client.send(command)
    } catch (error) {
      console.error('R2 delete error:', error)
      throw new Error('File deletion failed')
    }
  },

  getFileUrl(filePath: string): string {
    const config = getR2Config()
    
    // With custom domain
    if (config.publicUrl) {
      return `${config.publicUrl}/${filePath}`
    }
    
    // Direct R2 URL (fallback)
    return `${config.endpoint}/${config.bucketName}/${filePath}`
  },

  async getSignedUrl(filePath: string): Promise<string> {
    const config = getR2Config()
    const r2Client = createR2Client()
    
    try {
      const command = new GetObjectCommand({
        Bucket: config.bucketName,
        Key: filePath,
      })

      // Generate signed URL valid for 24 hours
      const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 86400 })
      return signedUrl
    } catch (error) {
      console.error('R2 signed URL error:', error)
      throw new Error('Failed to generate signed URL')
    }
  },
}

// Alternative Strategy 2: Per-Customer Buckets
export const r2PerCustomerService: CloudflareR2Service = {
  async uploadFile({ customerId, eventId, fileName, fileBuffer, contentType }: UploadOptions): Promise<string> {
    const r2Client = createR2Client()
    const bucketName = `memoryqr-${customerId.toLowerCase()}`
    const key = `${eventId}/${fileName}`
    
    // Note: This strategy requires creating buckets dynamically
    // which might not be ideal due to bucket limits and management complexity
    
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      })

      await r2Client.send(command)
      return `${bucketName}/${key}`
    } catch (error) {
      console.error('R2 upload error:', error)
      throw new Error('File upload failed')
    }
  },

  async deleteFile(filePath: string): Promise<void> {
    const r2Client = createR2Client()
    const [bucketName, ...keyParts] = filePath.split('/')
    const key = keyParts.join('/')
    
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })

      await r2Client.send(command)
    } catch (error) {
      console.error('R2 delete error:', error)
      throw new Error('File deletion failed')
    }
  },

  getFileUrl(filePath: string): string {
    const config = getR2Config()
    return `${config.publicUrl}/${filePath}`
  },

  async getSignedUrl(filePath: string): Promise<string> {
    const r2Client = createR2Client()
    const [bucketName, ...keyParts] = filePath.split('/')
    const key = keyParts.join('/')
    
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      })

      // Generate signed URL valid for 1 hour
      const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 })
      return signedUrl
    } catch (error) {
      console.error('R2 signed URL error:', error)
      throw new Error('Failed to generate signed URL')
    }
  },
}
