import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import PaymentManagementClient from './payment-management-client'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export default async function PaymentsPage() {
  const headersList = await headers()
  const cookieHeader = headersList.get('cookie')
  
  let adminToken = null
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)
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

  // Fetch payments with customer data
  const payments = await prisma.payment.findMany({
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          plan: {
            select: {
              name: true,
              displayName: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Calculate revenue stats
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const [
    totalRevenue,
    monthlyRevenue,
    lastMonthRevenue,
    successfulPayments,
    failedPayments,
    pendingPayments
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startOfMonth }
      },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
      },
      _sum: { amount: true }
    }),
    prisma.payment.count({
      where: { status: 'COMPLETED' }
    }),
    prisma.payment.count({
      where: { status: 'FAILED' }
    }),
    prisma.payment.count({
      where: { status: 'PENDING' }
    })
  ])

  const stats = {
    totalRevenue: totalRevenue._sum.amount || 0,
    monthlyRevenue: monthlyRevenue._sum.amount || 0,
    lastMonthRevenue: lastMonthRevenue._sum.amount || 0,
    successfulPayments,
    failedPayments,
    pendingPayments,
    totalPayments: payments.length
  }

  // Calculate growth rate
  const growthRate = lastMonthRevenue._sum.amount 
    ? ((monthlyRevenue._sum.amount || 0) - (lastMonthRevenue._sum.amount || 0)) / (lastMonthRevenue._sum.amount || 1) * 100
    : 0

  return (
    <PaymentManagementClient 
      payments={payments} 
      stats={{ ...stats, growthRate }}
    />
  )
}
