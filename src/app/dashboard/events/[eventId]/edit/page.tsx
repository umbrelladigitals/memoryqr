import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import EditEventForm from './edit-event-form'

interface EditEventPageProps {
  params: Promise<{ eventId: string }>
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return notFound()
  }

  const { eventId } = await params
  
  const event = await prisma.event.findUnique({
    where: { 
      id: eventId,
      customerId: session.user.id // Ensure user owns this event
    },
    include: {
      customer: {
        select: {
          name: true
        }
      }
    }
  })

  if (!event) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <EditEventForm event={event} />
      </div>
    </div>
  )
}
