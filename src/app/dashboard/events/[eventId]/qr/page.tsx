import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import QRCodeDisplay from './qr-display'

interface QRPageProps {
  params: Promise<{ eventId: string }>
}

export default async function QRPage({ params }: QRPageProps) {
  const { eventId } = await params
  
  const event = await prisma.event.findUnique({
    where: { id: eventId },
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

  const uploadUrl = `${process.env.APP_URL || 'http://localhost:3000'}/event/${event.qrCode}`

  return (
    <QRCodeDisplay 
      event={event}
      uploadUrl={uploadUrl}
    />
  )
}
