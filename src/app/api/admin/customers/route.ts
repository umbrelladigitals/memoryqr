import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const customers = await prisma.customer.findMany({
      include: {
        plan: true,
        subscription: true,
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

    return NextResponse.json({ customers })
  } catch (error) {
    console.error('Customers fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { customerId, action, data } = await request.json()

    if (!customerId || !action) {
      return NextResponse.json(
        { error: 'Customer ID and action are required' },
        { status: 400 }
      )
    }

    let updatedCustomer

    switch (action) {
      case 'activate':
        updatedCustomer = await prisma.customer.update({
          where: { id: customerId },
          data: { isActive: true }
        })
        break

      case 'deactivate':
        updatedCustomer = await prisma.customer.update({
          where: { id: customerId },
          data: { isActive: false }
        })
        break

      case 'update':
        updatedCustomer = await prisma.customer.update({
          where: { id: customerId },
          data: {
            name: data.name,
            email: data.email,
            planId: data.planId
          }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      message: 'Customer updated successfully',
      customer: updatedCustomer
    })
  } catch (error) {
    console.error('Customer update error:', error)
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}
