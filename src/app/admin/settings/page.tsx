import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin-layout'
import SettingsClient from './settings-client'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export default async function SettingsPage() {
  const headersList = await headers()
  const cookieHeader = headersList.get('cookie')
  
  let adminToken: string | null = null
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {})
    adminToken = cookies.adminToken || null
  }

  if (!adminToken) {
    redirect('/admin/login')
  }

  try {
    await jwtVerify(adminToken, JWT_SECRET)
  } catch (error) {
    redirect('/admin/login')
  }

  // Try to get both site and system settings from database
  let siteSettings = null
  let systemSettings = null
  
  try {
    const siteSettingsData = await prisma.$queryRaw`SELECT * FROM site_settings LIMIT 1` as any[]
    if (siteSettingsData.length > 0) {
      siteSettings = siteSettingsData[0]
    }
    
    const systemSettingsData = await prisma.$queryRaw`SELECT * FROM system_settings LIMIT 1` as any[]
    if (systemSettingsData.length > 0) {
      systemSettings = systemSettingsData[0]
    }
  } catch (error) {
    console.log('No settings found, will use defaults. Error:', error)
  }

  // Create default settings if none exist
  const defaultSiteSettings = {
    id: (siteSettings as any)?.id || '1',
    siteName: (siteSettings as any)?.siteName || 'MemoryQR Platform',
    siteDescription: (siteSettings as any)?.siteDescription || 'QR Kod ile Anı Paylaşım Platformu',
    siteUrl: (siteSettings as any)?.siteUrl || 'https://memoryqr.com',
    supportEmail: (siteSettings as any)?.supportEmail || 'support@memoryqr.com',
    adminEmail: (siteSettings as any)?.adminEmail || 'admin@memoryqr.com',
    language: (siteSettings as any)?.language || 'tr',
    timezone: (siteSettings as any)?.timezone || 'Europe/Istanbul',
    currency: (siteSettings as any)?.currency || 'TRY',
    logo: (siteSettings as any)?.logo || null,
    favicon: (siteSettings as any)?.favicon || null,
    primaryColor: (siteSettings as any)?.primaryColor || '#3B82F6',
    secondaryColor: (siteSettings as any)?.secondaryColor || '#10B981',
    accentColor: (siteSettings as any)?.accentColor || '#F59E0B',
    backgroundColor: (siteSettings as any)?.backgroundColor || '#FFFFFF',
    textColor: (siteSettings as any)?.textColor || '#1F2937',
    metaTitle: (siteSettings as any)?.metaTitle || null,
    metaDescription: (siteSettings as any)?.metaDescription || null,
    metaKeywords: (siteSettings as any)?.metaKeywords || null,
    googleAnalyticsId: (siteSettings as any)?.googleAnalyticsId || null,
    googleSiteVerification: (siteSettings as any)?.googleSiteVerification || null,
    facebookUrl: (siteSettings as any)?.facebookUrl || null,
    twitterUrl: (siteSettings as any)?.twitterUrl || null,
    instagramUrl: (siteSettings as any)?.instagramUrl || null,
    linkedinUrl: (siteSettings as any)?.linkedinUrl || null,
    youtubeUrl: (siteSettings as any)?.youtubeUrl || null,
    smtpHost: (siteSettings as any)?.smtpHost || null,
    smtpPort: (siteSettings as any)?.smtpPort || null,
    smtpUser: (siteSettings as any)?.smtpUser || null,
    smtpPassword: (siteSettings as any)?.smtpPassword || null,
    smtpSecure: (siteSettings as any)?.smtpSecure || true,
    emailFromAddress: (siteSettings as any)?.emailFromAddress || null,
    emailFromName: (siteSettings as any)?.emailFromName || 'MemoryQR',
    emailNotifications: (siteSettings as any)?.emailNotifications || true,
    smsNotifications: (siteSettings as any)?.smsNotifications || false,
    pushNotifications: (siteSettings as any)?.pushNotifications || true,
    userRegistration: (siteSettings as any)?.userRegistration || true,
    emailVerification: (siteSettings as any)?.emailVerification || true,
    socialLogin: (siteSettings as any)?.socialLogin || true,
    maintenanceMode: (siteSettings as any)?.maintenanceMode || false,
    maintenanceMessage: (siteSettings as any)?.maintenanceMessage || null,
    createdAt: (siteSettings as any)?.createdAt || new Date().toISOString(),
    updatedAt: (siteSettings as any)?.updatedAt || new Date().toISOString()
  }

  const defaultSystemSettings = {
    id: (systemSettings as any)?.id || '1',
    maxImageSizeMB: (systemSettings as any)?.maxImageSizeMB || 10,
    maxVideoSizeMB: (systemSettings as any)?.maxVideoSizeMB || 100,
    allowedImageFormats: (systemSettings as any)?.allowedImageFormats || 'jpg,jpeg,png,gif,webp',
    allowedVideoFormats: (systemSettings as any)?.allowedVideoFormats || 'mp4,mov,avi,mkv,webm,m4v',
    maxUploadsPerEvent: (systemSettings as any)?.maxUploadsPerEvent || 100,
    autoDeleteAfterDays: (systemSettings as any)?.autoDeleteAfterDays || null,
    enableVideoUploads: (systemSettings as any)?.enableVideoUploads || true,
    enableImageUploads: (systemSettings as any)?.enableImageUploads || true,
    createdAt: (systemSettings as any)?.createdAt || new Date().toISOString(),
    updatedAt: (systemSettings as any)?.updatedAt || new Date().toISOString()
  }

  return (
    <AdminLayout 
      user={{
        id: '1',
        name: 'Admin',
        email: 'admin@example.com',
        role: 'admin'
      }}
      title="Sistem Ayarları"
      description="Platformunuzun tüm ayarlarını buradan yönetin"
    >
      <SettingsClient 
        initialSiteSettings={defaultSiteSettings} 
        initialSystemSettings={defaultSystemSettings} 
      />
    </AdminLayout>
  )
}
