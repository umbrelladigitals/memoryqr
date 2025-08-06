import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

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
    const status = searchParams.get('status') || 'ALL'

    // Build where condition
    const whereCondition: any = {}
    if (status !== 'ALL') {
      whereCondition.status = status
    }

    // Fetch payments for export - simplified approach
    const payments = await prisma.payment.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get customer and subscription details separately
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
          ...payment,
          customer,
          subscription
        }
      })
    )

    // Convert to CSV format
    const csvHeaders = [
      'ID',
      'Müşteri Adı',
      'Müşteri Email',
      'Plan',
      'Tutar',
      'Para Birimi',
      'Durum',
      'Ödeme Yöntemi',
      'İşlem ID',
      'Açıklama',
      'Oluşturma Tarihi',
      'Güncelleme Tarihi'
    ]

    const csvRows = enrichedPayments.map(payment => [
      payment.id,
      payment.customer?.name || '',
      payment.customer?.email || '',
      payment.subscription?.plan.displayName || 'N/A',
      payment.amount.toString(),
      payment.currency,
      payment.status,
      payment.paymentMethod,
      payment.transactionId || '',
      payment.description || '',
      payment.createdAt.toISOString(),
      payment.updatedAt.toISOString()
    ])

    // Create CSV content
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n')

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="payments-${status}-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Payment export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
