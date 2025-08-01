import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import UploadClient from './upload-client'

interface UploadPageProps {
  params: {
    qrCode: string
  }
}

export default async function UploadPage({ params }: UploadPageProps) {
  const { qrCode } = params

  // Get event with template
  const event = await prisma.event.findUnique({
    where: { qrCode },
    include: {
      template: true,
      customer: {
        select: {
          name: true,
          plan: {
            select: {
              maxPhotosPerEvent: true
            }
          }
        }
      }
    }
  })

  if (!event || !event.isActive) {
    notFound()
  }

  // Get upload count for this event
  const uploadCount = await prisma.upload.count({
    where: { eventId: event.id }
  })

  // Apply event customizations to template
  let finalTemplate = event.template
  if (finalTemplate && event.customColors) {
    const customColors = event.customColors as any
    finalTemplate = {
      ...finalTemplate,
      primaryColor: customColors.primaryColor || finalTemplate.primaryColor,
      secondaryColor: customColors.secondaryColor || finalTemplate.secondaryColor,
      backgroundColor: customColors.backgroundColor || finalTemplate.backgroundColor,
      textColor: customColors.textColor || finalTemplate.textColor,
      logoImage: event.customLogo || finalTemplate.logoImage
    }
  }

  return (
    <UploadClient 
      event={event}
      template={finalTemplate}
      uploadCount={uploadCount}
      maxUploads={event.customer.plan?.maxPhotosPerEvent || null}
    />
  )
}
