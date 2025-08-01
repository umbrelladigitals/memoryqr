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

// GET - Get single plan
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyAdminToken(request)

    const plan = await prisma.plan.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            customers: true
          }
        }
      }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(plan)
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// PUT - Update plan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyAdminToken(request)

    const data = await request.json()

    const plan = await prisma.plan.update({
      where: { id: params.id },
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
    console.error('Error updating plan:', error)
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    )
  }
}

// DELETE - Delete plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyAdminToken(request)

    // Check if plan has customers
    const planWithCustomers = await prisma.plan.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            customers: true
          }
        }
      }
    })

    if (!planWithCustomers) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    if (planWithCustomers._count.customers > 0) {
      return NextResponse.json(
        { error: 'Cannot delete plan with active customers' },
        { status: 400 }
      )
    }

    await prisma.plan.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting plan:', error)
    return NextResponse.json(
      { error: 'Failed to delete plan' },
      { status: 500 }
    )
  }
}
