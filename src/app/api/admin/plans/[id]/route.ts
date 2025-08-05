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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdminToken(request)
    const resolvedParams = await params

    const plan = await prisma.plan.findUnique({
      where: { id: resolvedParams.id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdminToken(request)
    const resolvedParams = await params

    const data = await request.json()

    const plan = await prisma.plan.update({
      where: { id: resolvedParams.id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdminToken(request)
    const resolvedParams = await params

    // Check if plan has any customers
    const customerCount = await prisma.customer.count({
      where: { planId: resolvedParams.id }
    })

    if (customerCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete plan with existing customers' },
        { status: 400 }
      )
    }

    await prisma.plan.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      message: 'Plan deleted successfully'
    })
  } catch (error) {
    console.error('Plan delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete plan' },
      { status: 500 }
    )
  }
}