import { r2Service } from './r2-service'

// Helper function to convert file paths to full URLs
export function getImageUrl(filePath: string): string {
  if (!filePath) return ''
  
  // If it's already a full URL, return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath
  }
  
  // If it starts with /uploads/ it's the old local path format
  if (filePath.startsWith('/uploads/')) {
    return filePath // Keep local path for now during migration
  }
  
  // Otherwise, it's an R2 key, get the full URL
  return r2Service.getFileUrl(filePath)
}

// Helper function to check if image is from R2
export function isR2Image(filePath: string): boolean {
  return !filePath.startsWith('/uploads/') && !filePath.startsWith('http')
}
