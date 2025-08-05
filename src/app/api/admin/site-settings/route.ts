import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { jwtVerify } from 'jose'

const prisma = new PrismaClient()

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

async function verifyAdminToken(request: NextRequest) {
  const token = request.cookies.get('adminToken')?.value
  
  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    return null
  }
}

// Get site settings
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request)
    
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create site settings using raw SQL for compatibility
    let settings = null
    try {
      const siteSettings = await prisma.$queryRaw`SELECT * FROM site_settings LIMIT 1` as any[]
      if (siteSettings.length > 0) {
        settings = siteSettings[0]
      } else {
        // Create default settings if none exist
        await prisma.$executeRaw`
          INSERT INTO site_settings (
            siteName, siteDescription, siteUrl, adminEmail, supportEmail,
            timezone, language, currency, primaryColor, secondaryColor,
            emailNotifications, userRegistration, emailVerification, socialLogin,
            maintenanceMode, createdAt, updatedAt
          ) VALUES (
            'MemoryQR Platform',
            'QR Kod ile Anı Paylaşım Platformu',
            'https://memoryqr.com',
            'admin@memoryqr.com',
            'support@memoryqr.com',
            'Europe/Istanbul',
            'tr',
            'TRY',
            '#3B82F6',
            '#10B981',
            1,
            1,
            1,
            1,
            0,
            datetime('now'),
            datetime('now')
          )
        `
        const newSettings = await prisma.$queryRaw`SELECT * FROM site_settings ORDER BY id DESC LIMIT 1` as any[]
        settings = newSettings[0]
      }
    } catch (error) {
      console.error('Error fetching site settings:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    
    return NextResponse.json(settings)
    
  } catch (error) {
    console.error('Site settings get error:', error)
    return NextResponse.json(
      { error: 'Site ayarları alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

// Update site settings
export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request)
    
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Received update data:', body)
    
    // Get existing settings or create new ones
    try {
      const existingSettings = await prisma.$queryRaw`SELECT * FROM site_settings LIMIT 1` as any[]
      
      if (existingSettings.length > 0) {
        // Build dynamic update query
        const updateFields: string[] = []
        const updateValues: any[] = []
        
        if (body.site_name !== undefined) {
          updateFields.push('siteName = ?')
          updateValues.push(body.site_name)
        }
        if (body.site_description !== undefined) {
          updateFields.push('siteDescription = ?')
          updateValues.push(body.site_description)
        }
        if (body.site_url !== undefined) {
          updateFields.push('siteUrl = ?')
          updateValues.push(body.site_url)
        }
        if (body.contact_email !== undefined) {
          updateFields.push('supportEmail = ?')
          updateValues.push(body.contact_email)
        }
        if (body.admin_email !== undefined) {
          updateFields.push('adminEmail = ?')
          updateValues.push(body.admin_email)
        }
        if (body.language !== undefined) {
          updateFields.push('language = ?')
          updateValues.push(body.language)
        }
        if (body.timezone !== undefined) {
          updateFields.push('timezone = ?')
          updateValues.push(body.timezone)
        }
        if (body.currency !== undefined) {
          updateFields.push('currency = ?')
          updateValues.push(body.currency)
        }
        if (body.site_logo_url !== undefined) {
          updateFields.push('logo = ?')
          updateValues.push(body.site_logo_url)
        }
        if (body.favicon_url !== undefined) {
          updateFields.push('favicon = ?')
          updateValues.push(body.favicon_url)
        }
        if (body.primary_color !== undefined) {
          updateFields.push('primaryColor = ?')
          updateValues.push(body.primary_color)
        }
        if (body.secondary_color !== undefined) {
          updateFields.push('secondaryColor = ?')
          updateValues.push(body.secondary_color)
        }
        if (body.accent_color !== undefined) {
          updateFields.push('accentColor = ?')
          updateValues.push(body.accent_color)
        }
        if (body.background_color !== undefined) {
          updateFields.push('backgroundColor = ?')
          updateValues.push(body.background_color)
        }
        if (body.text_color !== undefined) {
          updateFields.push('textColor = ?')
          updateValues.push(body.text_color)
        }
        if (body.meta_title !== undefined) {
          updateFields.push('metaTitle = ?')
          updateValues.push(body.meta_title)
        }
        if (body.meta_description !== undefined) {
          updateFields.push('metaDescription = ?')
          updateValues.push(body.meta_description)
        }
        if (body.meta_keywords !== undefined) {
          updateFields.push('metaKeywords = ?')
          updateValues.push(body.meta_keywords)
        }
        if (body.google_analytics_id !== undefined) {
          updateFields.push('googleAnalyticsId = ?')
          updateValues.push(body.google_analytics_id)
        }
        if (body.google_site_verification !== undefined) {
          updateFields.push('googleSiteVerification = ?')
          updateValues.push(body.google_site_verification)
        }
        if (body.social_facebook !== undefined) {
          updateFields.push('facebookUrl = ?')
          updateValues.push(body.social_facebook)
        }
        if (body.social_twitter !== undefined) {
          updateFields.push('twitterUrl = ?')
          updateValues.push(body.social_twitter)
        }
        if (body.social_instagram !== undefined) {
          updateFields.push('instagramUrl = ?')
          updateValues.push(body.social_instagram)
        }
        if (body.social_linkedin !== undefined) {
          updateFields.push('linkedinUrl = ?')
          updateValues.push(body.social_linkedin)
        }
        if (body.social_youtube !== undefined) {
          updateFields.push('youtubeUrl = ?')
          updateValues.push(body.social_youtube)
        }
        if (body.smtp_host !== undefined) {
          updateFields.push('smtpHost = ?')
          updateValues.push(body.smtp_host)
        }
        if (body.smtp_port !== undefined) {
          updateFields.push('smtpPort = ?')
          updateValues.push(body.smtp_port)
        }
        if (body.smtp_user !== undefined) {
          updateFields.push('smtpUser = ?')
          updateValues.push(body.smtp_user)
        }
        if (body.smtp_password !== undefined) {
          updateFields.push('smtpPassword = ?')
          updateValues.push(body.smtp_password)
        }
        if (body.smtp_secure !== undefined) {
          updateFields.push('smtpSecure = ?')
          updateValues.push(body.smtp_secure)
        }
        if (body.email_from_address !== undefined) {
          updateFields.push('emailFromAddress = ?')
          updateValues.push(body.email_from_address)
        }
        if (body.email_from_name !== undefined) {
          updateFields.push('emailFromName = ?')
          updateValues.push(body.email_from_name)
        }
        if (body.email_notifications !== undefined) {
          updateFields.push('emailNotifications = ?')
          updateValues.push(body.email_notifications)
        }
        if (body.sms_notifications !== undefined) {
          updateFields.push('smsNotifications = ?')
          updateValues.push(body.sms_notifications)
        }
        if (body.push_notifications !== undefined) {
          updateFields.push('pushNotifications = ?')
          updateValues.push(body.push_notifications)
        }
        if (body.user_registration !== undefined) {
          updateFields.push('userRegistration = ?')
          updateValues.push(body.user_registration)
        }
        if (body.email_verification !== undefined) {
          updateFields.push('emailVerification = ?')
          updateValues.push(body.email_verification)
        }
        if (body.social_login !== undefined) {
          updateFields.push('socialLogin = ?')
          updateValues.push(body.social_login)
        }
        if (body.maintenance_mode !== undefined) {
          updateFields.push('maintenanceMode = ?')
          updateValues.push(body.maintenance_mode)
        }
        if (body.maintenance_message !== undefined) {
          updateFields.push('maintenanceMessage = ?')
          updateValues.push(body.maintenance_message)
        }
        
        // Always update the updatedAt field
        updateFields.push('updatedAt = datetime("now")')
        updateValues.push(existingSettings[0].id) // ID for WHERE clause
        
        if (updateFields.length > 1) { // More than just updatedAt
          const query = `UPDATE site_settings SET ${updateFields.join(', ')} WHERE id = ?`
          await prisma.$executeRawUnsafe(query, ...updateValues)
        }
        
        // Get updated settings to return
        const finalSettings = await prisma.$queryRaw`SELECT * FROM site_settings WHERE id = ${existingSettings[0].id}` as any[]
        console.log('Settings updated successfully')
        return NextResponse.json(finalSettings[0])
        
      } else {
        // Create new settings with provided data
        await prisma.$executeRaw`
          INSERT INTO site_settings (
            siteName, siteDescription, siteUrl, supportEmail, adminEmail,
            language, timezone, currency, logo, favicon, primaryColor, secondaryColor,
            accentColor, backgroundColor, textColor, metaTitle, metaDescription, metaKeywords, 
            googleAnalyticsId, googleSiteVerification, facebookUrl, twitterUrl, instagramUrl, 
            linkedinUrl, youtubeUrl, smtpHost, smtpPort, smtpUser, smtpPassword, smtpSecure,
            emailFromAddress, emailFromName, emailNotifications, smsNotifications, 
            pushNotifications, userRegistration, emailVerification, socialLogin,
            maintenanceMode, maintenanceMessage, createdAt, updatedAt
          )
          VALUES (
            ${body.site_name || 'MemoryQR Platform'},
            ${body.site_description || 'QR Kod ile Anı Paylaşım Platformu'},
            ${body.site_url || 'https://memoryqr.com'},
            ${body.contact_email || 'support@memoryqr.com'},
            ${body.admin_email || 'admin@memoryqr.com'},
            ${body.language || 'tr'},
            ${body.timezone || 'Europe/Istanbul'},
            ${body.currency || 'TRY'},
            ${body.site_logo_url},
            ${body.favicon_url},
            ${body.primary_color || '#3B82F6'},
            ${body.secondary_color || '#10B981'},
            ${body.accent_color || '#F59E0B'},
            ${body.background_color || '#FFFFFF'},
            ${body.text_color || '#1F2937'},
            ${body.meta_title},
            ${body.meta_description},
            ${body.meta_keywords},
            ${body.google_analytics_id},
            ${body.google_site_verification},
            ${body.social_facebook},
            ${body.social_twitter},
            ${body.social_instagram},
            ${body.social_linkedin},
            ${body.social_youtube},
            ${body.smtp_host},
            ${body.smtp_port},
            ${body.smtp_user},
            ${body.smtp_password},
            ${body.smtp_secure !== undefined ? body.smtp_secure : 1},
            ${body.email_from_address},
            ${body.email_from_name || 'MemoryQR'},
            ${body.email_notifications !== undefined ? body.email_notifications : 1},
            ${body.sms_notifications !== undefined ? body.sms_notifications : 0},
            ${body.push_notifications !== undefined ? body.push_notifications : 1},
            ${body.user_registration !== undefined ? body.user_registration : 1},
            ${body.email_verification !== undefined ? body.email_verification : 1},
            ${body.social_login !== undefined ? body.social_login : 1},
            ${body.maintenance_mode !== undefined ? body.maintenance_mode : 0},
            ${body.maintenance_message},
            datetime('now'),
            datetime('now')
          )
        `
        
        // Get created settings to return
        const newSiteSettings = await prisma.$queryRaw`SELECT * FROM site_settings ORDER BY id DESC LIMIT 1` as any[]
        console.log('Settings created successfully')
        return NextResponse.json(newSiteSettings[0])
      }
      
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Database error: ' + (dbError as Error).message }, 
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
