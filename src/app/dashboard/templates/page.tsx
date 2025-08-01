import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import TemplateManagement from '@/components/dashboard/TemplateManagement'

interface TemplateManagementPageProps {
  searchParams: {
    eventId?: string
  }
}

export default async function TemplateManagementPage({ searchParams }: TemplateManagementPageProps) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const resolvedSearchParams = await searchParams

  return (
    <div className="container mx-auto px-4 py-8">
      <TemplateManagement 
        userId={session.user.id || ''}
        eventId={resolvedSearchParams.eventId}
      />
    </div>
  )
}
