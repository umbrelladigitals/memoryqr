import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

async function verifyAdminToken(request: NextRequest) {
  const adminToken = request.cookies.get('adminToken')?.value

  if (!adminToken) {
    throw new Error('No admin token')
  }

  try {
    await jwtVerify(adminToken, JWT_SECRET)
    return true
  } catch (error) {
    throw new Error('Invalid admin token')
  }
}

// GET - List all plans
export async function GET(request: NextRequest) {
  try {
    await verifyAdminToken(request)

    const plans = await prisma.plan.findMany({
      include: {
        _count: {
          select: {
            customers: true
          }
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    })

    return NextResponse.json(plans)
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// POST - Create new plan
export async function POST(request: NextRequest) {
  try {
    await verifyAdminToken(request)

    const data = await request.json()

    const plan = await prisma.plan.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        price: data.price,
        currency: data.currency,
        maxEvents: data.maxEvents,
        maxPhotosPerEvent: data.maxPhotosPerEvent,
        maxStorageGB: data.maxStorageGB,
        customDomain: data.customDomain,
        analytics: data.analytics,
        prioritySupport: data.prioritySupport,
        apiAccess: data.apiAccess,
        whitelabel: data.whitelabel,
        isActive: data.isActive,
        isPopular: data.isPopular,
        sortOrder: data.sortOrder
      },
      include: {
        _count: {
          select: {
            customers: true
          }
        }
      }
    })

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error creating plan:', error)
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    )
  }
}
