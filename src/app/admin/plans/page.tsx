import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import PlansManagementClient from './plans-management-client'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export default async function PlansPage() {
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

  // Fetch subscription plans and related statistics
  let plans: any[] = [], planStats: any[] = [], stats
  try {
    [plans, planStats] = await Promise.all([
      // Get all plans with their customer counts
      prisma.plan.findMany({
        include: {
          _count: {
            select: {
              customers: true
            }
          }
        },
        orderBy: {
          price: 'asc'
        }
      }).catch(() => []),
      
      // Get plan statistics
      prisma.customer.groupBy({
        by: ['planId'],
        _count: {
          id: true
        },
        where: {
          planId: {
            not: null
          }
        }
      }).catch(() => [])
    ])

    stats = {
      totalPlans: plans.length,
      activePlans: plans.filter((plan: any) => plan.isActive).length,
      totalCustomers: planStats.reduce((sum: number, stat: any) => sum + stat._count.id, 0),
      planDistribution: planStats.map((stat: any) => {
        const plan = plans.find((p: any) => p.id === stat.planId)
        return {
          plan: plan?.name || 'Unknown',
          count: stat._count.id
        }
      })
    }
  } catch (error) {
    console.error('Plans fetch error:', error)
    plans = []
    stats = {
      totalPlans: 0,
      activePlans: 0,
      totalCustomers: 0,
      planDistribution: []
    }
  }

  return <PlansManagementClient plans={plans} stats={stats} />
}
