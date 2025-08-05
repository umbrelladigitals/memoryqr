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
        { error: 'Plan ID gereklidir' },
        { status: 400 }
      )
    }

    // Check if plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Geçersiz plan' },
        { status: 404 }
      )
    }

    // Update customer's plan
    const updatedCustomer = await prisma.customer.update({
      where: { id: session.user.id },
      data: { planId },
      include: {
        plan: true
      }
    })

    // Create subscription record if it's a paid plan
    if (plan.price > 0) {
      await prisma.subscription.upsert({
        where: { customerId: session.user.id },
        update: {
          planId,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        create: {
          customerId: session.user.id,
          planId,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        }
      })

      // Create payment record
      await prisma.payment.create({
        data: {
          customerId: session.user.id,
          planId,
          amount: plan.price,
          currency: plan.currency,
          status: 'COMPLETED',
          paymentMethod: 'CREDIT_CARD', // This would come from actual payment processor
          transactionId: `tx_${Date.now()}`, // This would come from actual payment processor
        }
      })
    }

    return NextResponse.json({
      message: 'Plan başarıyla güncellendi',
      customer: {
        id: updatedCustomer.id,
        planId: updatedCustomer.planId,
        plan: updatedCustomer.plan
      }
    })
  } catch (error) {
    console.error('Plan subscription error:', error)
    return NextResponse.json(
      { error: 'Plan güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}
