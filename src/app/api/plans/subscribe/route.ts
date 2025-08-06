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

    const { planId, paymentMethod = 'BANK_TRANSFER' } = await request.json()

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

    // Get payment settings
    const paymentSettings = await prisma.paymentSettings.findUnique({
      where: { id: 'default' }
    })

    // If it's a free plan, activate immediately
    if (plan.price === 0) {
      const updatedCustomer = await prisma.customer.update({
        where: { id: session.user.id },
        data: { planId },
        include: { plan: true }
      })

      return NextResponse.json({
        message: 'Ücretsiz plan başarıyla aktif edildi',
        customer: {
          id: updatedCustomer.id,
          planId: updatedCustomer.planId,
          plan: updatedCustomer.plan
        },
        paymentRequired: false
      })
    }

    // For paid plans, check payment method availability
    if (paymentMethod === 'BANK_TRANSFER' && (!paymentSettings?.bankTransferEnabled)) {
      return NextResponse.json(
        { error: 'Havale/EFT ödemeleri şu anda kullanılamıyor' },
        { status: 400 }
      )
    }

    // Create pending subscription
    const subscription = await prisma.subscription.upsert({
      where: { customerId: session.user.id },
      update: {
        planId,
        status: 'PAST_DUE', // Pending payment
        startDate: new Date(),
        endDate: null, // Will be set after payment
        price: plan.price,
        currency: plan.currency,
        paymentMethod,
      },
      create: {
        customerId: session.user.id,
        planId,
        status: 'PAST_DUE', // Pending payment
        startDate: new Date(),
        endDate: null, // Will be set after payment
        price: plan.price,
        currency: plan.currency,
        paymentMethod,
      }
    })

    // Create pending payment record
    const payment = await prisma.payment.create({
      data: {
        customerId: session.user.id,
        subscriptionId: subscription.id,
        amount: plan.price,
        currency: plan.currency,
        status: 'PENDING',
        paymentMethod,
        description: `${plan.displayName} planı aboneliği`,
      }
    })

    // Don't update customer's plan yet - wait for payment confirmation
    const customer = await prisma.customer.findUnique({
      where: { id: session.user.id },
      include: { plan: true }
    })

    return NextResponse.json({
      message: 'Ödeme bekleyen abonelik oluşturuldu',
      customer,
      subscription,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
      },
      paymentRequired: true,
      paymentInfo: paymentMethod === 'BANK_TRANSFER' ? {
        bankName: paymentSettings?.bankName,
        bankAccountName: paymentSettings?.bankAccountName,
        bankAccountNumber: paymentSettings?.bankAccountNumber,
        bankIban: paymentSettings?.bankIban,
        bankSwiftCode: paymentSettings?.bankSwiftCode,
        bankBranch: paymentSettings?.bankBranch,
        instructions: paymentSettings?.paymentInstructions,
        paymentId: payment.id,
        timeoutHours: paymentSettings?.paymentTimeoutHours || 24,
      } : null
    })
  } catch (error) {
    console.error('Plan subscription error:', error)
    return NextResponse.json(
      { error: 'Plan aboneliği oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}
