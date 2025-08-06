import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.admin.upsert({
    where: { email: 'klyapi@klyapi.com.tr' },
    update: {},
    create: {
      email: 'klyapi@klyapi.com.tr',
      password: hashedPassword,
      name: 'Admin',
      role: 'SUPER_ADMIN',
    },
  })

  console.log('✅ Admin user created:', admin.email)

  // Create default subscription plans
  const freePlan = await prisma.plan.upsert({
    where: { name: 'FREE' },
    update: {},
    create: {
      name: 'FREE',
      displayName: 'Free Plan',
      description: 'Perfect for getting started with event photo sharing',
      price: 0,
      currency: 'USD',
      maxEvents: 3,
      maxPhotosPerEvent: 100,
      maxStorageGB: 1,
      customDomain: false,
      analytics: false,
      prioritySupport: false,
      apiAccess: false,
      whitelabel: false,
      isActive: true,
      isPopular: false,
      sortOrder: 1
    }
  })

  const proPlan = await prisma.plan.upsert({
    where: { name: 'PRO' },
    update: {},
    create: {
      name: 'PRO',
      displayName: 'Pro Plan',
      description: 'For professionals who need more events and features',
      price: 29.99,
      currency: 'USD',
      maxEvents: 50,
      maxPhotosPerEvent: 1000,
      maxStorageGB: 10,
      customDomain: true,
      analytics: true,
      prioritySupport: false,
      apiAccess: true,
      whitelabel: false,
      isActive: true,
      isPopular: true,
      sortOrder: 2
    }
  })

  const enterprisePlan = await prisma.plan.upsert({
    where: { name: 'ENTERPRISE' },
    update: {},
    create: {
      name: 'ENTERPRISE',
      displayName: 'Enterprise Plan',
      description: 'For large organizations with unlimited needs',
      price: 99.99,
      currency: 'USD',
      maxEvents: null, // unlimited
      maxPhotosPerEvent: null, // unlimited
      maxStorageGB: null, // unlimited
      customDomain: true,
      analytics: true,
      prioritySupport: true,
      apiAccess: true,
      whitelabel: true,
      isActive: true,
      isPopular: false,
      sortOrder: 3
    }
  })

  console.log('✅ Plans created:')
  console.log('  - Free Plan:', freePlan.name)
  console.log('  - Pro Plan:', proPlan.name)
  console.log('  - Enterprise Plan:', enterprisePlan.name)

  // Create sample customer with Free plan
  const customerPassword = await bcrypt.hash('customer123', 10)
  
  const customer = await prisma.customer.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: customerPassword,
      name: 'Demo Customer',
      planId: freePlan.id,
      isActive: true,
    },
  })

  console.log('✅ Demo customer created:', customer.email)

  // Create a sample event for the customer
  const event = await prisma.event.create({
    data: {
      title: 'Demo Wedding Event',
      description: 'A beautiful wedding celebration',
      date: new Date(),
      location: 'Istanbul, Turkey',
      qrCode: 'demo-wedding-2024',
      customerId: customer.id,
      isActive: true,
      autoArchive: true,
      archiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      eventType: 'wedding',
      participants: JSON.stringify({
        bride: 'Ayşe Yılmaz',
        groom: 'Mehmet Kaya',
        guests: ['Ali Demir', 'Fatma Şahin', 'Ahmet Çelik']
      }),
      customColors: JSON.stringify({
        primary: '#DC2626',
        secondary: '#F59E0B',
        background: '#FEF7F0'
      }),
      selectedTemplate: 'wedding',
      customMessage: 'Mutlu günümüzü bizimle paylaşın!'
    }
  })

  console.log('✅ Demo event created:', event.title)

  // Create additional customers with different plans
  const proCustomer = await prisma.customer.upsert({
    where: { email: 'pro@example.com' },
    update: {},
    create: {
      email: 'pro@example.com',
      password: customerPassword,
      name: 'Pro Customer',
      planId: proPlan.id,
      isActive: true,
      lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
  })

  const enterpriseCustomer = await prisma.customer.upsert({
    where: { email: 'enterprise@example.com' },
    update: {},
    create: {
      email: 'enterprise@example.com',
      password: customerPassword,
      name: 'Enterprise Customer',
      planId: enterprisePlan.id,
      isActive: true,
      lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  })

  console.log('✅ Additional customers created')

  // Create more events for different customers
  const proEvent = await prisma.event.create({
    data: {
      title: 'Corporate Annual Meeting',
      description: 'Annual company gathering with team building activities',
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      location: 'Ankara, Turkey',
      qrCode: 'corporate-2024',
      customerId: proCustomer.id,
      isActive: true,
      autoArchive: true,
      archiveDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      eventType: 'corporate',
      participants: JSON.stringify({
        organizer: 'Tech Corp Ltd.',
        speakers: ['Dr. Ahmet Yılmaz', 'Prof. Elif Demir'],
        attendees: 150
      }),
      customColors: JSON.stringify({
        primary: '#1D4ED8',
        secondary: '#4F46E5',
        background: '#F8FAFC'
      }),
      selectedTemplate: 'corporate',
      customMessage: 'Şirketimizin başarı hikayesini keşfedin!'
    }
  })

  const enterpriseEvent = await prisma.event.create({
    data: {
      title: 'Tech Conference 2024',
      description: 'Leading technology conference with industry experts',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      location: 'Izmir, Turkey',
      qrCode: 'techconf-2024',
      customerId: enterpriseCustomer.id,
      isActive: true,
      autoArchive: true,
      archiveDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      eventType: 'conference',
      participants: JSON.stringify({
        keynote: 'Elon Musk',
        sponsors: ['Google', 'Microsoft', 'Amazon'],
        expectedAttendees: 500
      }),
      customColors: JSON.stringify({
        primary: '#059669',
        secondary: '#0D9488',
        background: '#F0FDF4'
      }),
      selectedTemplate: 'corporate',
      maxUploads: 1000,
      customMessage: 'Teknolojinin geleceğini birlikte şekillendiriyoruz!'
    }
  })

  console.log('✅ Additional events created')

  // Create sample uploads for events
  const uploads = [
    {
      fileName: 'wedding-photo-1.jpg',
      originalName: 'beautiful-moment.jpg',
      fileSize: 2048000,
      mimeType: 'image/jpeg',
      filePath: '/uploads/wedding/photo-1.jpg',
      thumbnailPath: '/uploads/wedding/thumb-1.jpg',
      guestName: 'John Doe',
      eventId: event.id,
      likes: 5,
      metadata: JSON.stringify({ camera: 'iPhone 14 Pro', location: 'Istanbul' })
    },
    {
      fileName: 'wedding-photo-2.jpg',
      originalName: 'ceremony.jpg',
      fileSize: 1536000,
      mimeType: 'image/jpeg',
      filePath: '/uploads/wedding/photo-2.jpg',
      thumbnailPath: '/uploads/wedding/thumb-2.jpg',
      guestName: 'Jane Smith',
      eventId: event.id,
      likes: 12,
      metadata: JSON.stringify({ camera: 'Canon EOS R5', professional: true })
    },
    {
      fileName: 'wedding-video-1.mp4',
      originalName: 'first-dance.mp4',
      fileSize: 15360000,
      mimeType: 'video/mp4',
      filePath: '/uploads/wedding/video-1.mp4',
      thumbnailPath: '/uploads/wedding/video-thumb-1.jpg',
      guestName: 'Michael Johnson',
      eventId: event.id,
      likes: 8,
      metadata: JSON.stringify({ duration: 120, resolution: '1080p' })
    },
    {
      fileName: 'corporate-photo-1.jpg',
      originalName: 'team-photo.jpg',
      fileSize: 1024000,
      mimeType: 'image/jpeg',
      filePath: '/uploads/corporate/photo-1.jpg',
      thumbnailPath: '/uploads/corporate/thumb-1.jpg',
      guestName: 'Sarah Wilson',
      eventId: proEvent.id,
      likes: 3,
      metadata: JSON.stringify({ group: 'Marketing Team', department: 'Sales' })
    },
    {
      fileName: 'conference-photo-1.jpg',
      originalName: 'keynote-speech.jpg',
      fileSize: 2560000,
      mimeType: 'image/jpeg',
      filePath: '/uploads/conference/photo-1.jpg',
      thumbnailPath: '/uploads/conference/thumb-1.jpg',
      guestName: 'Tech Attendee',
      eventId: enterpriseEvent.id,
      likes: 25,
      metadata: JSON.stringify({ speaker: 'Elon Musk', session: 'Keynote' })
    }
  ]

  for (const uploadData of uploads) {
    await prisma.upload.create({ data: uploadData })
  }

  console.log('✅ Sample uploads created')

  // Create sample payments
  const payments = [
    {
      customerId: proCustomer.id,
      amount: 29.99,
      currency: 'USD',
      status: 'COMPLETED' as const,
      paymentMethod: 'Credit Card',
      transactionId: 'txn_pro_001',
      description: 'Pro Plan Monthly Subscription',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      customerId: enterpriseCustomer.id,
      amount: 99.99,
      currency: 'USD',
      status: 'COMPLETED' as const,
      paymentMethod: 'Bank Transfer',
      transactionId: 'txn_ent_001',
      description: 'Enterprise Plan Monthly Subscription',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      customerId: proCustomer.id,
      amount: 29.99,
      currency: 'USD',
      status: 'PENDING' as const,
      paymentMethod: 'Credit Card',
      description: 'Pro Plan Renewal',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    }
  ]

  for (const paymentData of payments) {
    await prisma.payment.create({ data: paymentData })
  }

  console.log('✅ Sample payments created')

  // Create sample analytics data
  const analyticsData = [
    {
      customerId: customer.id,
      eventId: event.id,
      metric: 'page_view',
      value: 1,
      metadata: { page: '/event/demo-wedding-2024' },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      customerId: proCustomer.id,
      eventId: proEvent.id,
      metric: 'upload',
      value: 1,
      metadata: { fileType: 'image/jpeg', fileSize: 1024000 },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0...',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
    {
      customerId: enterpriseCustomer.id,
      metric: 'dashboard_view',
      value: 1,
      metadata: { section: 'events' },
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0...',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    }
  ]

  for (const analytics of analyticsData) {
    await prisma.analytics.create({ data: analytics })
  }

  console.log('✅ Sample analytics created')

  // Create sample notifications
  const notifications = [
    {
      type: 'BILLING' as const,
      title: 'Payment Successful',
      message: 'Your Pro plan subscription has been renewed successfully.',
      recipientId: proCustomer.id,
      recipientType: 'customer',
      actionUrl: '/billing',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'FEATURE' as const,
      title: 'New Feature Available',
      message: 'Analytics dashboard is now available for Enterprise customers.',
      recipientId: enterpriseCustomer.id,
      recipientType: 'customer',
      actionUrl: '/analytics',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'SYSTEM' as const,
      title: 'System Maintenance',
      message: 'Scheduled maintenance on Sunday 2AM-4AM UTC.',
      recipientType: 'admin',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    }
  ]

  for (const notification of notifications) {
    await prisma.notification.create({ data: notification })
  }

  console.log('✅ Sample notifications created')

  // Create Upload Templates
  console.log('🎨 Creating upload templates...')
  
  const templates = await Promise.all([
        // Wedding Template
    prisma.uploadTemplate.create({
      data: {
        name: 'wedding',
        displayName: 'Düğün Teması',
        description: 'Romantik ve zarif düğün etkinlikleri için özel tasarım',
        primaryColor: '#DC2626',     // Rose red
        secondaryColor: '#F59E0B',   // Amber
        backgroundColor: '#FEF7F0',  // Light rose background
        textColor: '#7C2D12',        // Dark brown text
        headerStyle: 'gradient',
        buttonStyle: 'rounded',
        cardStyle: 'shadow',
        heroImage: '/uploads/templates/wedding/hero-default.jpg',
        logoImage: '/uploads/templates/wedding/logo-default.png',
        isDefault: true,
        isActive: true,
        sortOrder: 1
      }
    }),

    // Birthday Template
    prisma.uploadTemplate.create({
      data: {
        name: 'birthday',
        displayName: 'Doğum Günü Teması',
        description: 'Neşeli ve renkli doğum günü kutlamaları için eğlenceli tasarım',
        primaryColor: '#7C3AED',     // Violet
        secondaryColor: '#06B6D4',   // Cyan
        backgroundColor: '#F3F4F6',  // Light gray background
        textColor: '#1F2937',        // Dark gray text
        headerStyle: 'gradient',
        buttonStyle: 'pill',
        cardStyle: 'shadow',
        heroImage: '/uploads/templates/birthday/hero-default.jpg',
        logoImage: '/uploads/templates/birthday/logo-default.png',
        isDefault: false,
        isActive: true,
        sortOrder: 2
      }
    }),

    // Corporate Template
    prisma.uploadTemplate.create({
      data: {
        name: 'corporate',
        displayName: 'Kurumsal Etkinlik Teması',
        description: 'Profesyonel ve modern kurumsal etkinlikler için şık tasarım',
        primaryColor: '#1D4ED8',     // Blue
        secondaryColor: '#4F46E5',   // Indigo
        backgroundColor: '#F8FAFC',  // Very light blue background
        textColor: '#1E293B',        // Slate gray text
        headerStyle: 'minimal',
        buttonStyle: 'square',
        cardStyle: 'border',
        heroImage: '/uploads/templates/corporate/hero-default.jpg',
        logoImage: '/uploads/templates/corporate/logo-default.png',
        isDefault: false,
        isActive: true,
        sortOrder: 3
      }
    })
  ])
  
  console.log('✅ Upload templates created')

  // Create default system settings
  try {
    await prisma.$executeRaw`
      INSERT OR REPLACE INTO system_settings (
        id, maxImageSizeMB, maxVideoSizeMB, allowedImageFormats, allowedVideoFormats,
        maxUploadsPerEvent, autoDeleteAfterDays, enableVideoUploads, enableImageUploads,
        createdAt, updatedAt
      ) VALUES (
        'default', 10, 100, 'jpg,jpeg,png,gif,webp', 'mp4,mov,avi,mkv,webm,m4v',
        100, 30, 1, 1, datetime('now'), datetime('now')
      )
    `
    console.log('✅ System settings created')
  } catch (error) {
    console.log('⚠️ System settings already exist or error:', error)
  }

  // Create default payment settings
  try {
    await prisma.$executeRaw`
      INSERT OR REPLACE INTO payment_settings (
        id, bankTransferEnabled, bankName, bankAccountName, bankAccountNumber,
        bankIban, bankSwiftCode, bankBranch, paymentInstructions,
        autoApprovalEnabled, manualApprovalRequired, paymentTimeoutHours,
        creditCardEnabled, paypalEnabled, cryptoEnabled, createdAt, updatedAt
      ) VALUES (
        'default', 1, 'Türkiye İş Bankası', 'Snaprella Teknoloji Ltd. Şti.',
        '1234-5678-9012-3456', 'TR33 0006 4000 0011 2345 6789 01', 'ISBKTRIS',
        'Kadıköy Şubesi', 'Havale/EFT yaparken açıklama kısmına sipariş numaranızı yazınız. Ödemeniz onaylandıktan sonra planınız aktif edilecektir.',
        0, 1, 24, 0, 0, 0, datetime('now'), datetime('now')
      )
    `
    console.log('✅ Payment settings created')
  } catch (error) {
    console.log('⚠️ Payment settings already exist or error:', error)
  }

  // Create default site settings
  try {
    await prisma.$executeRaw`
      INSERT OR REPLACE INTO site_settings (
        id, siteName, siteDescription, siteUrl, adminEmail, supportEmail,
        timezone, language, currency, primaryColor, secondaryColor, accentColor,
        backgroundColor, textColor, emailNotifications, smsNotifications,
        pushNotifications, userRegistration, emailVerification, socialLogin,
        maintenanceMode, emailFromName, createdAt, updatedAt
      ) VALUES (
        'default', 'Snaprella Paylaşım Platformu', 'QR kod ile anı paylaşım platformu - Modern, güvenli ve kolay kullanım',
        'http://localhost:3000', 'admin@snaprella.com', 'support@snaprella.com',
        'Europe/Istanbul', 'tr', 'TRY', '#3B82F6', '#10B981', '#F59E0B',
        '#FFFFFF', '#1F2937', 1, 0, 1, 1, 1, 1, 0, 'Snaprella',
        datetime('now'), datetime('now')
      )
    `
    console.log('✅ Site settings created')
  } catch (error) {
    console.log('⚠️ Site settings already exist or error:', error)
  }

  console.log('🎉 Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
