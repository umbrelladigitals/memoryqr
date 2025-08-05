import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import TemplateEditor from './template-editor'

interface TemplatePageProps {
  params: {
    eventId: string
  }
}

export default async function TemplatePage({ params }: TemplatePageProps) {
  const { eventId } = await params

  // Get event with customer info
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })

  if (!event) {
    notFound()
  }

  // Get all available templates
  const templates = await prisma.uploadTemplate.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <TemplateEditor 
      event={event}
      templates={templates}
    />
  )
}
