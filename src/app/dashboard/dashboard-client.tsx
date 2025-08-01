'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import Link from 'next            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Genel Bakış
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Etkinlikler
            </TabsTrigger>
            <TabsTrigger value="plan" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Plan & Özellikler
            </TabsTrigger>Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  QrCode, 
  Plus, 
  Calendar, 
  Image, 
  Users, 
  Settings, 
  LogOut,
  Eye,
  Download,
  BarChart3,
  Crown,
  Palette
} from 'lucide-react'
import CreateEventDialog from '@/components/create-event-dialog'
import DashboardStats from '@/components/dashboard/DashboardStats'
import PlanFeatures from '@/components/dashboard/PlanFeatures'
import PlansComparison from '@/components/dashboard/PlansComparison'

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

interface Customer {
  id: string
  name: string
  email: string
  plan: {
    id: string
    name: string
    displayName: string
    description?: string
    price: number
    currency?: string
    maxEvents: number | null
    maxPhotosPerEvent: number | null
    maxStorageGB: number | null
    customDomain: boolean
    analytics: boolean
    prioritySupport: boolean
    apiAccess: boolean
    whitelabel: boolean
    isActive: boolean
    isPopular: boolean
    features?: string[]
  } | null
}

interface DashboardStats {
  totalEvents: number
  activeEvents: number
  totalPhotos: number
  totalViews: number
  thisMonthEvents: number
  thisMonthPhotos: number
  storageUsedGB: number
  planLimit: {
    events: number | null
    storage: number | null
  }
}

interface DashboardClientProps {
  events: Event[]
  customer: Customer | null
  userId: string
  stats: DashboardStats
  allPlans: any[]
}

export default function DashboardClient({ events, customer, userId, stats, allPlans }: DashboardClientProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [isUpgrading, setIsUpgrading] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  const handlePlanUpgrade = async (planId: string) => {
    if (isUpgrading) return
    
    try {
      setIsUpgrading(true)
      
      const response = await fetch('/api/plans/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Plan yükseltme başarısız')
      }

      toast.success('Plan başarıyla yükseltildi!', {
        description: 'Yeni özellikleriniz şimdi kullanılabilir.',
      })
      
      // Refresh the page to get updated customer data
      router.refresh()
      
    } catch (error) {
      console.error('Plan upgrade error:', error)
      toast.error(error instanceof Error ? error.message : 'Plan yükseltme başarısız')
    } finally {
      setIsUpgrading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getPlanBadge = (planName: string) => {
    const colors = {
      FREE: 'bg-gray-100 text-gray-800',
      PRO: 'bg-blue-100 text-blue-800',
      ENTERPRISE: 'bg-purple-100 text-purple-800'
    }
    return colors[planName as keyof typeof colors] || colors.FREE
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <QrCode className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">MemoryQR</span>
            </Link>
            <Badge className={getPlanBadge(customer?.plan?.name || 'FREE')}>
              {customer?.plan?.displayName || 'FREE'}
            </Badge>
            {customer?.plan?.name === 'ENTERPRISE' && (
              <Crown className="h-5 w-5 text-purple-600" />
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Hoş geldiniz, {customer?.name}
            </span>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Genel Bakış
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Etkinlikler
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Şablonlar
            </TabsTrigger>
            <TabsTrigger value="plan" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Plan Detayları
            </TabsTrigger>
            <TabsTrigger value="upgrade" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Plan Yükseltme
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <DashboardStats stats={stats} />
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Etkinliklerim</h2>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
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
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
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
                            onClick={() => router.push(`/dashboard/templates?eventId=${event.id}`)}
                          >
                            <Palette className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => router.push(`/dashboard/events/${event.id}/qr`)}
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
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center">
                  <Palette className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Şablon Yönetimi
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Etkinlikleriniz için özel yükleme sayfası şablonları oluşturun ve özelleştirin
                  </p>
                  <Link href="/dashboard/templates">
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                      <Palette className="w-4 h-4 mr-2" />
                      Şablonları Yönet
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-rose-200 bg-rose-50">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-rose-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <Image className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-rose-900">Düğün Şablonu</CardTitle>
                  <CardDescription className="text-rose-700">
                    Romantik ve zarif tasarım
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2 mb-3">
                    <div className="w-4 h-4 rounded-full bg-rose-400"></div>
                    <div className="w-4 h-4 rounded-full bg-amber-400"></div>
                    <div className="w-4 h-4 rounded-full bg-pink-300"></div>
                  </div>
                  <p className="text-sm text-rose-700">
                    Özel gününüz için romantik tema
                  </p>
                </CardContent>
              </Card>

              <Card className="border-violet-200 bg-violet-50">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-violet-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-violet-900">Doğum Günü Şablonu</CardTitle>
                  <CardDescription className="text-violet-700">
                    Neşeli ve canlı tasarım
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2 mb-3">
                    <div className="w-4 h-4 rounded-full bg-violet-400"></div>
                    <div className="w-4 h-4 rounded-full bg-cyan-400"></div>
                    <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                  </div>
                  <p className="text-sm text-violet-700">
                    Kutlamalar için eğlenceli tema
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-blue-900">Kurumsal Şablon</CardTitle>
                  <CardDescription className="text-blue-700">
                    Profesyonel ve modern tasarım
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2 mb-3">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <div className="w-4 h-4 rounded-full bg-indigo-500"></div>
                    <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                  </div>
                  <p className="text-sm text-blue-700">
                    İş etkinlikleri için profesyonel tema
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Plan Details Tab */}
          <TabsContent value="plan" className="space-y-6">
            <PlanFeatures 
              currentPlan={customer?.plan || null}
              usage={{
                eventsUsed: stats.totalEvents,
                photosUsed: stats.totalPhotos,
                storageUsedGB: stats.storageUsedGB
              }}
            />
          </TabsContent>

          {/* Plan Upgrade Tab */}
          <TabsContent value="upgrade" className="space-y-6">
            <PlansComparison 
              plans={allPlans}
              currentPlan={customer?.plan || undefined}
              onUpgrade={handlePlanUpgrade}
              isLoading={isUpgrading}
            />
          </TabsContent>
        </Tabs>
      </div>

      <CreateEventDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        customerId={userId}
      />
    </div>
  )
}
