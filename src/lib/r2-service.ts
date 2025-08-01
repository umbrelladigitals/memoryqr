import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

// R2 Client Configuration
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
})

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
}

// Strategy 1: Single Bucket with Customer/Event Structure
export const r2Service: CloudflareR2Service = {
  async uploadFile({ customerId, eventId, fileName, fileBuffer, contentType }: UploadOptions): Promise<string> {
    const key = `${customerId}/${eventId}/${fileName}`
    
    try {
      const command = new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
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
    try {
      const command = new DeleteObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
        Key: filePath,
      })

      await r2Client.send(command)
    } catch (error) {
      console.error('R2 delete error:', error)
      throw new Error('File deletion failed')
    }
  },

  getFileUrl(filePath: string): string {
    // With custom domain
    if (process.env.CLOUDFLARE_R2_PUBLIC_URL) {
      return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${filePath}`
    }
    
    // Direct R2 URL (fallback)
    return `${process.env.CLOUDFLARE_R2_ENDPOINT}/${process.env.CLOUDFLARE_R2_BUCKET_NAME}/${filePath}`
  },
}

// Alternative Strategy 2: Per-Customer Buckets
export const r2PerCustomerService: CloudflareR2Service = {
  async uploadFile({ customerId, eventId, fileName, fileBuffer, contentType }: UploadOptions): Promise<string> {
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
    return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${filePath}`
  },
}
