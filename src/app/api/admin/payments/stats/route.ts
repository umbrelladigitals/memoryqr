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

    // Get current month date range
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Fetch payment statistics
    const [
      totalPending,
      totalCompleted,
      totalFailed,
      totalAmount,
      monthlyRevenue,
      pendingAmount
    ] = await Promise.all([
      // Total pending payments count
      prisma.payment.count({
        where: { status: 'PENDING' }
      }),
      
      // Total completed payments count  
      prisma.payment.count({
        where: { status: 'COMPLETED' }
      }),
      
      // Total failed payments count
      prisma.payment.count({
        where: { status: 'FAILED' }
      }),
      
      // Total amount from completed payments
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      
      // Monthly revenue (this month's completed payments)
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        _sum: { amount: true }
      }),
      
      // Total pending amount
      prisma.payment.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true }
      })
    ])

    const stats = {
      totalPending,
      totalCompleted,
      totalFailed,
      totalAmount: totalAmount._sum.amount || 0,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      pendingAmount: pendingAmount._sum.amount || 0
    }

    return NextResponse.json({ stats })

  } catch (error) {
    console.error('Payment stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
