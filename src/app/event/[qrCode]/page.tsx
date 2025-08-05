import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import UploadClient from './upload-client'
import { Metadata } from 'next'

interface UploadPageProps {
  params: Promise<{
    qrCode: string
  }>
}

export async function generateMetadata({ params }: UploadPageProps): Promise<Metadata> {
  const { qrCode } = await params
  
  // Get event for metadata
  const event = await prisma.event.findUnique({
    where: { qrCode },
    select: {
      title: true,
      description: true,
      bannerImage: true,
      date: true,
      location: true,
      customer: {
        select: { name: true }
      }
    }
  })

  if (!event) {
    return {
      title: 'Etkinlik Bulunamadı - MemoryQR',
      description: 'Aradığınız etkinlik bulunamadı.',
    }
  }

  const title = `${event.title} - Fotoğraf Yükleme | MemoryQR`
  const description = event.description 
    ? `${event.title} etkinliğine fotoğraf yükleyin. ${event.description.substring(0, 100)}...`
    : `${event.title} etkinliğine fotoğraf yükleyin. QR kod ile kolay fotoğraf paylaşımı.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: event.bannerImage ? [
        {
          url: event.bannerImage,
          width: 1200,
          height: 630,
          alt: event.title,
        }
      ] : [],
      locale: 'tr_TR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: event.bannerImage ? [event.bannerImage] : [],
    },
    robots: {
      index: false, // Event pages shouldn't be indexed for privacy
      follow: false,
    },
    alternates: {
      canonical: `https://memoryqr.com/event/${qrCode}`,
    },
  }
}

export default async function UploadPage({ params }: UploadPageProps) {
  const { qrCode } = await params

  // Get event with customer data
  const event = await prisma.event.findUnique({
    where: { qrCode },
    include: {
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

  // Get template if selectedTemplate is available
  let template: any = null
  if (event.selectedTemplate) {
    // For now, we'll create a default template object based on selectedTemplate
    template = {
      id: 'default',
      name: event.selectedTemplate,
      displayName: event.selectedTemplate,
      primaryColor: '#007bff',
      secondaryColor: '#6c757d', 
      backgroundColor: '#ffffff',
      textColor: '#000000',
      logoImage: null
    }
  }

  // Apply event customizations to template
  let finalTemplate = template
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
