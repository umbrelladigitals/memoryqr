import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SubscriptionManagementClient from './subscription-management-client'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export default async function SubscriptionManagementPage() {
  // Check admin authentication
  const cookieStore = await cookies()
  const token = cookieStore.get('adminToken')?.value

  if (!token) {
    redirect('/admin/login')
  }

  try {
    await jwtVerify(token, JWT_SECRET)
  } catch {
    redirect('/admin/login')
  }

  // Get customers with their plans as "subscriptions"
  let subscriptions: any[] = [], subscriptionStats: any[] = [], monthlyRevenue: any[] = []
  try {
    const customerSubscriptions = await prisma.customer.findMany({
      include: {
        plan: true,
        _count: {
          select: {
            events: true,
            payments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform customer-plan data to subscription format
    subscriptions = customerSubscriptions.map((customer: any) => ({
      id: customer.id,
      plan: customer.plan?.name || 'FREE',
      status: 'ACTIVE',
      startDate: customer.createdAt.toISOString(),
      endDate: null,
      price: customer.plan?.price || 0,
      currency: customer.plan?.currency || 'USD',
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        isActive: customer.isActive,
        createdAt: customer.createdAt.toISOString(),
        _count: customer._count
      }
    }))

    // Get customer plan distribution as subscription statistics
    subscriptionStats = await prisma.$queryRaw`
      SELECT p.name as plan, 'ACTIVE' as status, COUNT(c.id) as count, SUM(p.price) as revenue
      FROM "customers" c
      LEFT JOIN "plans" p ON c."planId" = p.id
      WHERE c."isActive" = true
      GROUP BY p.name, p.price
    `

    // Get revenue statistics
    monthlyRevenue = await prisma.payment.groupBy({
      by: ['createdAt'],
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1)
        }
      },
      _sum: {
        amount: true
      }
    }).catch(() => [])
  } catch (error) {
    console.error('Subscriptions fetch error:', error)
    subscriptions = []
    subscriptionStats = []
    monthlyRevenue = []
  }

  return (
    <SubscriptionManagementClient 
      user={{
        id: 'admin',
        name: 'Admin',
        email: 'admin@memoryqr.com',
        role: 'ADMIN'
      }}
      subscriptions={subscriptions}
      stats={subscriptionStats}
      monthlyRevenue={monthlyRevenue}
    />
  )
}
