import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DownloadsClient from './downloads-client'

export default async function DownloadsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const customerId = session.user.id

  // Fetch user's events with upload counts
  const events = await prisma.event.findMany({
    where: { customerId },
    include: {
      uploads: {
        select: {
          id: true,
          fileName: true,
          originalName: true,
          fileSize: true,
          filePath: true,
          guestName: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: {
          uploads: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Calculate total storage usage
  const totalStorageUsed = events.reduce((total, event) => 
    total + event.uploads.reduce((eventTotal, upload) => eventTotal + upload.fileSize, 0), 0
  )

  return (
    <DownloadsClient 
      events={events}
      totalStorageUsed={totalStorageUsed}
    />
  )
}
