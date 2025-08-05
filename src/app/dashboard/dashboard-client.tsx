'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Plus, 
  QrCode, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings,
  Crown,
  Camera,
  Download,
  Eye
} from 'lucide-react'
import Link from 'next/link'

interface Event {
  id: string
  title: string
  description?: string
  date: Date
  location?: string
  isActive: boolean
  qrCode: string
  _count: {
    uploads: number
  }
}

interface Customer {
  id: string
  name: string
  email: string
  plan: {
    name: string
    displayName: string
    maxEvents: number | null
    maxPhotosPerEvent: number | null
  } | null
}

export default function DashboardClient() {
  const { data: session } = useSession()
  const [events, setEvents] = useState<Event[]>([])
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Müşteri bilgilerini ve etkinlikleri yükle
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Müşteri bilgilerini al
        const customerResponse = await fetch('/api/customer/profile')
        if (customerResponse.ok) {
          const customerData = await customerResponse.json()
          setCustomer(customerData)
        }

        // Etkinlikleri al
        const eventsResponse = await fetch('/api/events')
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          setEvents(eventsData)
        }
      } catch (error) {
        console.error('Dashboard data loading error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      loadData()
    }
  }, [session])

  // Plan istatistikleri
  const planStats = customer?.plan ? {
    usedEvents: events.length,
    maxEvents: customer.plan.maxEvents,
    totalUploads: events.reduce((sum, event) => sum + event._count.uploads, 0),
    maxPhotosPerEvent: customer.plan.maxPhotosPerEvent
  } : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hoş geldin mesajı */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hoş geldin, {session?.user?.name || 'Kullanıcı'}!
          </h1>
          <p className="text-muted-foreground">
            QR kod ile etkinlik fotoğraf paylaşım sisteminizi yönetin
          </p>
        </div>
        <div className="flex items-center gap-4">
          {customer?.plan && (
            <Badge variant="outline" className="px-3 py-1">
              <Crown className="w-4 h-4 mr-1" />
              {customer.plan.displayName}
            </Badge>
          )}
          <Button asChild>
            <Link href="/dashboard/events/new">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Etkinlik
            </Link>
          </Button>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Etkinlik
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">
              {customer?.plan?.maxEvents ? `${customer.plan.maxEvents} etkinlik limiti` : 'Sınırsız'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Fotoğraf
            </CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.reduce((sum, event) => sum + event._count.uploads, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Yüklenen fotoğraflar
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktif Etkinlik
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.filter(e => e.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Şu anda aktif
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Plan
            </CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customer?.plan?.displayName || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Mevcut planınız
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plan kullanımı */}
      {planStats && customer?.plan?.maxEvents && (
        <Card>
          <CardHeader>
            <CardTitle>Plan Kullanımı</CardTitle>
            <CardDescription>
              Mevcut planınızın kullanım durumu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Etkinlik Kullanımı</span>
                <span>{planStats.usedEvents} / {customer.plan.maxEvents}</span>
              </div>
              <Progress 
                value={(planStats.usedEvents / customer.plan.maxEvents) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Etkinlikler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Etkinliklerim
          </CardTitle>
          <CardDescription>
            Oluşturduğunuz etkinlikleri görüntüleyin ve yönetin
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <QrCode className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Henüz etkinlik oluşturmadınız
              </h3>
              <p className="text-muted-foreground mb-4">
                İlk etkinliğinizi oluşturun ve misafirlerinizin fotoğraf paylaşmasını sağlayın
              </p>
              <Button asChild>
                <Link href="/dashboard/events/new">
                  <Plus className="w-4 h-4 mr-2" />
                  İlk Etkinliğimi Oluştur
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg leading-tight">
                        {event.title}
                      </CardTitle>
                      <Badge 
                        variant={event.isActive ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {event.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </div>
                    {event.description && (
                      <CardDescription className="line-clamp-2">
                        {event.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(event.date).toLocaleDateString('tr-TR')}
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Camera className="w-4 h-4 mr-2" />
                        {event._count.uploads} fotoğraf yüklendi
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button asChild size="sm" variant="outline" className="flex-1">
                          <Link href={`/dashboard/events/${event.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            Görüntüle
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="flex-1">
                          <Link href={`/dashboard/events/${event.id}/qr`}>
                            <QrCode className="w-4 h-4 mr-1" />
                            QR Kod
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* TODO: Etkinlik oluşturma dialog'u eklenecek */}
    </div>
  )
}
