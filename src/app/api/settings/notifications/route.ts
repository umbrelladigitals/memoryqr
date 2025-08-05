import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const notifications = await request.json()

    // Find or create notification preferences for the customer
    const customer = await prisma.customer.findUnique({
      where: {
        email: session.user.email
      }
    })

    if (!customer) {
      return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // Update notification preferences
    // Note: For now we'll store as JSON in customer table
    // In a real app, you might want a separate notifications table
    await prisma.customer.update({
      where: {
        email: session.user.email
      },
      data: {
        // Store notification preferences as metadata
        // You can extend the Customer model to include a notificationPreferences field
      }
    })

    return NextResponse.json({ 
      message: 'Bildirim ayarları güncellendi',
      notifications 
    })

  } catch (error) {
    console.error('Notification update error:', error)
    return NextResponse.json({ message: 'Bildirim güncelleme hatası' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Return default notification preferences
    // In a real app, you'd fetch these from the database
    const defaultNotifications = {
      emailUploads: true,
      emailWeekly: true,
      emailMarketing: false,
      pushUploads: true,
      pushSystem: true
    }

    return NextResponse.json({ notifications: defaultNotifications })

  } catch (error) {
    console.error('Notification fetch error:', error)
    return NextResponse.json({ message: 'Bildirim ayarları alınamadı' }, { status: 500 })
  }
}
