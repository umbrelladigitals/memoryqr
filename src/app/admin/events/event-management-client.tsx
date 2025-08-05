'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Eye, 
  Calendar,
  Camera,
  User,
  MapPin,
  Clock,
  QrCode,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string | null
  date: string
  archiveDate: string | null
  location: string | null
  isActive: boolean
  qrCode: string
  createdAt: string
  customer: {
    id: string
    name: string
    email: string
    plan: {
      name: string
      displayName: string
    }
  }
  _count: {
    uploads: number
  }
}

interface EventStats {
  totalEvents: number
  activeEvents: number
  totalPhotos: number
  expiredEvents: number
  eventsByPlan: Array<{ plan: string; count: number }>
}

interface EventManagementClientProps {
  events: Event[]
  stats: EventStats
}

export default function EventManagementClient({ events, stats }: EventManagementClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlan, setFilterPlan] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPlan = filterPlan === 'all' || event.customer.plan.name === filterPlan
    
    const isActive = !event.archiveDate || new Date(event.archiveDate) > new Date()
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && isActive) ||
                         (filterStatus === 'expired' && !isActive)
    
    return matchesSearch && matchesPlan && matchesStatus
  })

  const getPlanColor = (plan: { name: string; displayName: string } | string) => {
    const planName = typeof plan === 'string' ? plan : plan.name
    switch (planName) {
      case 'FREE': return 'bg-gray-100 text-gray-800'
      case 'PRO': return 'bg-blue-100 text-blue-800'
      case 'ENTERPRISE': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (archiveDate: string | null) => {
    const isActive = !archiveDate || new Date(archiveDate) > new Date()
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  const getStatusIcon = (archiveDate: string | null) => {
    const isActive = !archiveDate || new Date(archiveDate) > new Date()
    return isActive ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDaysRemaining = (archiveDate: string | null) => {
    if (!archiveDate) return Infinity // Never expires
    const today = new Date()
    const archive = new Date(archiveDate)
    const diffTime = archive.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <AdminLayout
      user={{
        id: 'admin',
        name: 'Admin',
        email: 'admin@memoryqr.com',
        role: 'ADMIN'
      }}
      title="Etkinlik Yönetimi"
      description="Tüm etkinliklerin yönetimi ve takibi"
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg p-3 bg-blue-50">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Toplam Etkinlik</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg p-3 bg-green-50">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Aktif Etkinlik</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.activeEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg p-3 bg-purple-50">
                  <Camera className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Toplam Fotoğraf</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalPhotos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg p-3 bg-orange-50">
                  <XCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Süresi Dolmuş</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.expiredEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.eventsByPlan.map((planStat, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <Badge className={getPlanColor(planStat.plan)}>
                    {planStat.plan}
                  </Badge>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{planStat.count}</p>
                  <p className="text-sm text-gray-500">etkinlik</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Etkinlik ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tüm Planlar</option>
                <option value="FREE">Free</option>
                <option value="PRO">Pro</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="expired">Süresi Dolmuş</option>
              </select>

              <div className="flex items-center justify-end">
                <span className="text-sm text-gray-600">
                  {filteredEvents.length} sonuç
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event List */}
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const isActive = !event.archiveDate || new Date(event.archiveDate) > new Date()
            const daysRemaining = getDaysRemaining(event.archiveDate)
            
            return (
              <Card key={event.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
                          <Badge className={getStatusColor(event.archiveDate)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(event.archiveDate)}
                              <span>{!event.archiveDate || new Date(event.archiveDate) > new Date() ? 'Aktif' : 'Arşivlenmiş'}</span>
                            </div>
                          </Badge>
                          <Badge className={getPlanColor(event.customer.plan)}>
                            {event.customer.plan.displayName}
                          </Badge>
                        </div>
                        
                        {event.description && (
                          <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>{event.customer.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Camera className="h-4 w-4" />
                            <span>{event._count.uploads} fotoğraf</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Time remaining indicator */}
                      {isActive && event.archiveDate && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {daysRemaining > 0 ? `${daysRemaining} gün kaldı` : 'Bugün arşivleniyor'}
                          </p>
                          <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${daysRemaining > 7 ? 'bg-green-500' : daysRemaining > 3 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ 
                                width: `${Math.max(10, Math.min(100, (daysRemaining / 30) * 100))}%` 
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Detay
                        </Button>
                        {event.qrCode && (
                          <Button variant="outline" size="sm">
                            <QrCode className="h-4 w-4 mr-1" />
                            QR Kod
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Fotoğraflar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filteredEvents.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Etkinlik bulunamadı
                </h3>
                <p className="text-gray-500">
                  Arama kriterlerinize uygun etkinlik bulunmuyor.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
