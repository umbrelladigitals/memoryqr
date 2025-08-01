import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import SettingsClient from './settings-client'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export default async function SettingsPage() {
  const headersList = await headers()
  const cookieHeader = headersList.get('cookie')
  
  let adminToken = null
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {})
    adminToken = cookies.adminToken
  }

  if (!adminToken) {
    redirect('/admin/login')
  }

  try {
    await jwtVerify(adminToken, JWT_SECRET)
  } catch (error) {
    redirect('/admin/login')
  }

  // System settings would normally come from database
  const settings = {
    general: {
      siteName: 'MemoryQR',
      siteUrl: 'https://memoryqr.com',
      adminEmail: 'admin@memoryqr.com',
      timezone: 'Europe/Istanbul',
      language: 'tr',
    },
    features: {
      userRegistration: true,
      emailVerification: true,
      photoUpload: true,
      qrCodeGeneration: true,
      eventSharing: true,
    },
    limits: {
      maxPhotosPerEvent: 100,
      maxEventDuration: 365,
      maxFileSize: 10,
      maxEventsPerUser: 50,
    },
    notifications: {
      emailNotifications: true,
      newUserAlerts: true,
      paymentAlerts: true,
      systemAlerts: true,
    }
  }

  return <SettingsClient settings={settings} />
}
