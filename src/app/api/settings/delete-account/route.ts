import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get customer with related data
    const customer = await prisma.customer.findUnique({
      where: {
        email: session.user.email
      },
      include: {
        events: {
          include: {
            uploads: true
          }
        },
        subscription: true
      }
    })

    if (!customer) {
      return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // Start transaction to delete all related data
    await prisma.$transaction(async (tx) => {
      // Delete all uploads for all events
      for (const event of customer.events) {
        await tx.upload.deleteMany({
          where: {
            eventId: event.id
          }
        })
      }

      // Delete all events
      await tx.event.deleteMany({
        where: {
          customerId: customer.id
        }
      })

      // Delete subscription if exists
      if (customer.subscription) {
        await tx.subscription.delete({
          where: {
            id: customer.subscription.id
          }
        })
      }

      // Finally delete the customer
      await tx.customer.delete({
        where: {
          id: customer.id
        }
      })
    })

    return NextResponse.json({ 
      message: 'Hesap başarıyla silindi' 
    })

  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ message: 'Hesap silme hatası' }, { status: 500 })
  }
}
