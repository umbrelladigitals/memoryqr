import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { planId } = await request.json()

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    // Get the target plan
    const targetPlan = await prisma.plan.findUnique({
      where: { id: planId }
    })

    if (!targetPlan || !targetPlan.isActive) {
      return NextResponse.json(
        { error: 'Plan not found or inactive' },
        { status: 404 }
      )
    }

    // Get current customer with plan
    const userId = session.user.id!  // Safe to use after auth check
    const customer = await prisma.customer.findUnique({
      where: { id: userId },
      include: {
        plan: true,
        subscription: true
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Check if trying to downgrade (we'll prevent this for now)
    if (customer.plan && targetPlan.price < customer.plan.price) {
      return NextResponse.json(
        { error: 'Downgrading plans is not supported yet. Please contact support.' },
        { status: 400 }
      )
    }

    // Check if already on this plan
    if (customer.planId === planId) {
      return NextResponse.json(
        { error: 'You are already on this plan' },
        { status: 400 }
      )
    }

    // Start a transaction to update customer and create/update subscription
    const result = await prisma.$transaction(async (tx: any) => {
      // Update customer's plan
      const updatedCustomer = await tx.customer.update({
        where: { id: userId },
        data: { planId },
        include: {
          plan: true
        }
      })

      // Handle subscription
      let subscription
      if (customer.subscription) {
        // Update existing subscription
        subscription = await tx.subscription.update({
          where: { id: customer.subscription.id },
          data: {
            planId,
            price: targetPlan.price,
            status: targetPlan.price > 0 ? 'ACTIVE' : 'ACTIVE',
            startDate: new Date(),
            endDate: targetPlan.price > 0 ? 
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : // 30 days from now
              null, // Free plan has no end date
          }
        })
      } else {
        // Create new subscription
        subscription = await tx.subscription.create({
          data: {
            customerId: userId,
            planId,
            price: targetPlan.price,
            status: 'ACTIVE',
            startDate: new Date(),
            endDate: targetPlan.price > 0 ? 
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : 
              null,
          }
        })
      }

      // Create payment record for paid plans
      if (targetPlan.price > 0) {
        await tx.payment.create({
          data: {
            customerId: userId,
            subscriptionId: subscription.id,
            amount: targetPlan.price,
            currency: targetPlan.currency,
            status: 'COMPLETED', // In real app, this would be PENDING until payment processor confirms
            paymentMethod: 'Credit Card', // In real app, this would come from payment form
            description: `Upgrade to ${targetPlan.displayName}`,
            transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          }
        })
      }

      // Create notification
      await tx.notification.create({
        data: {
          type: 'BILLING',
          title: 'Plan Upgraded Successfully',
          message: `You have successfully upgraded to ${targetPlan.displayName}. Your new features are now available.`,
          recipientId: userId,
          recipientType: 'customer',
          actionUrl: '/dashboard?tab=plan',
        }
      })

      return { customer: updatedCustomer, subscription, plan: targetPlan }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${targetPlan.displayName}`,
      customer: result.customer,
      plan: result.plan
    })

  } catch (error) {
    console.error('Plan upgrade error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get current plan and available plans
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get customer with current plan
    const customer = await prisma.customer.findUnique({
      where: { id: session.user.id },
      include: {
        plan: true,
        subscription: true
      }
    })

    // Get all available plans
    const availablePlans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    })

    return NextResponse.json({
      currentPlan: customer?.plan,
      subscription: customer?.subscription,
      availablePlans
    })

  } catch (error) {
    console.error('Get plans error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
