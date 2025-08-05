import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EventsClient from './events-client'

export default async function EventsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Fetch customer's events
  const events = await prisma.event.findMany({
    where: {
      customerId: session.user.id
    },
    include: {
      uploads: {
        select: {
          id: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <EventsClient 
      events={events}
      userId={session.user.id}
    />
  )
}
