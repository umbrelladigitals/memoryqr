import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SettingsClient from './settings-client'

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const customerId = session.user.id

  // Fetch customer data with plan and subscription
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      plan: true,
      subscription: {
        include: {
          plan: true
        }
      }
    }
  })

  if (!customer) {
    redirect('/auth/signin')
  }

  // Get usage statistics
  const [eventCount, uploadCount, totalStorage] = await Promise.all([
    prisma.event.count({ where: { customerId } }),
    prisma.upload.count({ 
      where: { event: { customerId } } 
    }),
    prisma.upload.aggregate({
      where: { event: { customerId } },
      _sum: { fileSize: true }
    })
  ])

  const usage = {
    events: eventCount,
    uploads: uploadCount,
    storage: totalStorage._sum.fileSize || 0
  }

  return (
    <SettingsClient 
      customer={customer}
      usage={usage}
    />
  )
}
