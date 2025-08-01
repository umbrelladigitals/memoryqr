import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EventDetailClient from './event-detail-client'

interface EventDetailPageProps {
  params: Promise<{ eventId: string }>
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const session = await auth()
  const { eventId } = await params

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Fetch event with uploads
  const event = await prisma.event.findUnique({
    where: { 
      id: eventId,
      customerId: session.user.id // Ensure user owns this event
    },
    include: {
      uploads: {
        orderBy: {
          createdAt: 'desc'
        }
      },
      customer: {
        select: {
          name: true,
          email: true
        }
      }
    }
  })

  if (!event) {
    notFound()
  }

  return (
    <EventDetailClient 
      event={event}
      userId={session.user.id}
    />
  )
}
