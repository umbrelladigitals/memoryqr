import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import BillingClient from './billing-client'

export default async function BillingPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Get customer with plan details
  const customer = await prisma.customer.findUnique({
    where: { id: session.user.id },
    include: {
      plan: {
        select: {
          id: true,
          name: true,
          displayName: true,
          description: true,
          price: true,
          currency: true,
          maxEvents: true,
          maxPhotosPerEvent: true,
          maxStorageGB: true,
          customDomain: true,
          analytics: true,
          prioritySupport: true,
          apiAccess: true,
          whitelabel: true,
          isActive: true,
          isPopular: true
        }
      }
    }
  })

  // Get all plans for comparison
  const allPlans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' }
  })

  // Calculate usage stats
  const totalEvents = await prisma.event.count({
    where: { customerId: session.user.id }
  })

  const totalPhotos = await prisma.upload.count({
    where: {
      event: {
        customerId: session.user.id
      }
    }
  })

  const storageUsedGB = totalPhotos * 0.003 // Mock calculation

  // Get payment history with subscription and plan details
  const payments = await prisma.payment.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  // Get subscription details for each payment
  const paymentsWithDetails = await Promise.all(
    payments.map(async (payment) => {
      if (payment.subscriptionId) {
        const subscription = await prisma.subscription.findUnique({
          where: { id: payment.subscriptionId },
          include: {
            plan: {
              select: {
                displayName: true,
                name: true
              }
            }
          }
        })
        return {
          ...payment,
          subscription
        }
      }
      return payment
    })
  )

  // Get current subscription
  const currentSubscription = await prisma.subscription.findUnique({
    where: { customerId: session.user.id },
    include: {
      plan: true
    }
  })

  return (
    <BillingClient 
      customer={customer}
      allPlans={allPlans}
      payments={payments}
      currentSubscription={currentSubscription}
      usage={{
        eventsUsed: totalEvents,
        photosUsed: totalPhotos,
        storageUsedGB: storageUsedGB
      }}
    />
  )
}
