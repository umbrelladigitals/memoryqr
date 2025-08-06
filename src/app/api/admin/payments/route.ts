import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

// GET - List payments with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('adminToken')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let adminUser
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      adminUser = await prisma.admin.findUnique({
        where: { id: payload.sub as string }
      })
      
      if (!adminUser || !adminUser.isActive) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Fetch payments with pagination - simplified approach
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: {
          status: status as any
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.payment.count({
        where: {
          status: status as any
        }
      })
    ])

    // Enrich with customer and subscription data
    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        const customer = await prisma.customer.findUnique({
          where: { id: payment.customerId }
        })
        
        const subscription = payment.subscriptionId 
          ? await prisma.subscription.findUnique({
              where: { id: payment.subscriptionId },
              include: { plan: true }
            })
          : null

        return {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          paymentMethod: payment.paymentMethod,
          transactionId: payment.transactionId,
          description: payment.description,
          createdAt: payment.createdAt.toISOString(),
          updatedAt: payment.updatedAt.toISOString(),
          customer: customer ? {
            id: customer.id,
            name: customer.name || '',
            email: customer.email || ''
          } : null,
          subscription: subscription ? {
            id: subscription.id,
            plan: {
              id: subscription.plan.id,
              displayName: subscription.plan.displayName,
              price: subscription.plan.price,
              currency: subscription.plan.currency
            }
          } : null
        }
      })
    )

    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      payments: enrichedPayments,
      pagination: {
        total,
        pages,
        page,
        limit
      }
    })

  } catch (error) {
    console.error('Fetch payments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Approve or reject payments
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('adminToken')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let adminUser
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      adminUser = await prisma.admin.findUnique({
        where: { id: payload.sub as string }
      })
      
      if (!adminUser || !adminUser.isActive) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { paymentId, action, transactionId, notes } = await request.json()

    if (!paymentId || !action) {
      return NextResponse.json({ error: 'Payment ID ve action gerekli' }, { status: 400 })
    }

    // Find the payment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    })

    if (!payment) {
      return NextResponse.json({ error: 'Ödeme bulunamadı' }, { status: 404 })
    }

    if (payment.status !== 'PENDING') {
      return NextResponse.json({ error: 'Bu ödeme zaten işlenmiş' }, { status: 400 })
    }

    // Get subscription if exists
    const subscription = payment.subscriptionId 
      ? await prisma.subscription.findUnique({
          where: { id: payment.subscriptionId },
          include: { plan: true }
        })
      : null

    if (action === 'approve') {
      // Approve payment and activate subscription
      await prisma.$transaction(async (tx) => {
        // Update payment status
        await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: 'COMPLETED',
            transactionId: transactionId || null,
            updatedAt: new Date()
          }
        })

        // Activate subscription if exists
        if (subscription) {
          const currentDate = new Date()
          const endDate = new Date()
          endDate.setMonth(endDate.getMonth() + 1) // 1 month from now

          await tx.subscription.update({
            where: { id: subscription.id },
            data: {
              status: 'ACTIVE',
              startDate: currentDate,
              endDate: endDate,
              updatedAt: new Date()
            }
          })

          // Update customer's active plan
          await tx.customer.update({
            where: { id: payment.customerId },
            data: {
              planId: subscription.planId,
              updatedAt: new Date()
            }
          })
        }

        // Create notification
        await tx.notification.create({
          data: {
            recipientId: payment.customerId,
            recipientType: 'CUSTOMER',
            title: 'Ödeme Onaylandı',
            message: `${payment.amount} ${payment.currency} tutarındaki ödemeniz onaylandı. Planınız aktif edildi.`,
            type: 'BILLING',
            isRead: false
          }
        })
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Ödeme onaylandı ve abonelik aktif edildi' 
      })

    } else if (action === 'reject') {
      // Reject payment
      await prisma.$transaction(async (tx) => {
        // Update payment status
        await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: 'FAILED',
            description: notes || 'Admin tarafından reddedildi',
            updatedAt: new Date()
          }
        })

        // Create notification
        await tx.notification.create({
          data: {
            recipientId: payment.customerId,
            recipientType: 'CUSTOMER',
            title: 'Ödeme Reddedildi',
            message: `${payment.amount} ${payment.currency} tutarındaki ödemeniz reddedildi. ${notes ? 'Sebep: ' + notes : ''}`,
            type: 'BILLING',
            isRead: false
          }
        })
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Ödeme reddedildi' 
      })

    } else {
      return NextResponse.json({ error: 'Geçersiz action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Payment approval error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
