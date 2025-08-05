'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  QrCode, 
  Plus, 
  Calendar, 
  Image, 
  Eye,
  Edit
} from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string | null
  date: Date
  location: string | null
  isActive: boolean
  qrCode: string
  uploads: { id: string }[]
  createdAt: Date
}

interface EventsClientProps {
  events: Event[]
  userId: string
}

export default function EventsClient({ events, userId }: EventsClientProps) {
  const router = useRouter()

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Etkinliklerim</h1>
          <p className="text-gray-600 mt-2">
            Etkinliklerinizi yönetin ve QR kodlarını görüntüleyin
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/events/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Etkinlik
        </Button>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Henüz etkinlik yok</h3>
            <p className="text-gray-600 mb-4">
              İlk etkinliğinizi oluşturun ve QR kod ile fotoğraf toplamaya başlayın.
            </p>
            <Button onClick={() => router.push('/dashboard/events/create')}>
              <Plus className="h-4 w-4 mr-2" />
              İlk Etkinliğimi Oluştur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription>
                      {formatDate(event.date)}
                    </CardDescription>
                  </div>
                  <Badge variant={event.isActive ? 'default' : 'secondary'}>
                    {event.isActive ? 'Aktif' : 'Pasif'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {event.location && (
                    <p className="text-sm text-gray-600">{event.location}</p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Image className="h-4 w-4 mr-1" />
                      {event.uploads.length} fotoğraf
                    </span>
                    <span className="text-gray-500">
                      {formatDate(event.createdAt)}
                    </span>
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => router.push(`/dashboard/events/${event.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Görüntüle
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => router.push(`/dashboard/events/${event.id}/edit`)}
                      title="Düzenle"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => router.push(`/dashboard/events/${event.id}/qr`)}
                      title="QR Kod"
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
