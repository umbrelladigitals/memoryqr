'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface EventDetailsCardProps {
  event: {
    title: string
    description?: string | null
    date: Date
    location?: string | null
    customer: {
      name: string
    }
  }
  config: any
  IconComponent: any
  formatDate: (date: Date) => string
}

export default function EventDetailsCard({
  event,
  config,
  IconComponent,
  formatDate
}: EventDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <IconComponent className={`h-6 w-6 ${config.iconColor}`} />
          <span>Etkinlik Detayları</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
          <p className="text-gray-900 font-medium">{config.name}</p>
        </div>
        
        {event.description && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Açıklama</h4>
            <p className="text-sm text-gray-600">{event.description}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-3">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Tarih</h4>
            <p className="text-sm text-gray-900">{formatDate(event.date)}</p>
          </div>
          
          {event.location && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Konum</h4>
              <p className="text-sm text-gray-900">{event.location}</p>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Düzenleyen</h4>
            <p className="text-sm text-gray-900">{event.customer.name}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
