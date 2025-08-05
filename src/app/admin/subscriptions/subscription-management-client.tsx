'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  CreditCard,
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
}

interface Customer {
  id: string
  name: string
  email: string
  isActive: boolean
  createdAt: string
  _count: {
    events: number
    payments: number
  }
}

interface Subscription {
  id: string
  plan: string
  status: string
  startDate: string
  endDate: string | null
  price: number
  currency: string
  maxEvents: number
  maxUploadsPerEvent: number
  maxStorageGB: number
  customer: Customer
}

interface SubscriptionStats {
  plan: string
  status: string
  count: number
  revenue: number | null
}

interface MonthlyRevenue {
  createdAt: Date
  _sum: { amount: number | null }
}

interface SubscriptionManagementClientProps {
  user: AdminUser
  subscriptions: Subscription[]
  stats: SubscriptionStats[]
  monthlyRevenue: MonthlyRevenue[]
}

export default function SubscriptionManagementClient({
  user,
  subscriptions,
  stats,
  monthlyRevenue
}: SubscriptionManagementClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlan, setFilterPlan] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = 
      subscription.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlan = filterPlan === 'all' || subscription.plan === filterPlan
    const matchesStatus = filterStatus === 'all' || subscription.status === filterStatus
    
    return matchesSearch && matchesPlan && matchesStatus
  })

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'bg-gray-100 text-gray-800'
      case 'PRO': return 'bg-blue-100 text-blue-800'
      case 'ENTERPRISE': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'EXPIRED': return 'bg-red-100 text-red-800'
      case 'CANCELLED': return 'bg-orange-100 text-orange-800'
      case 'PAST_DUE': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-4 w-4" />
      case 'EXPIRED': return <XCircle className="h-4 w-4" />
      case 'CANCELLED': return <Ban className="h-4 w-4" />
      case 'PAST_DUE': return <AlertCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  // Calculate overview statistics
  const totalRevenue = stats.reduce((sum, stat) => sum + (Number(stat.revenue) || 0), 0)
  const totalSubscriptions = stats.reduce((sum, stat) => sum + Number(stat.count), 0)
  const activeSubscriptions = stats
    .filter(stat => stat.status === 'ACTIVE')
    .reduce((sum, stat) => sum + Number(stat.count), 0)

  return (
    <AdminLayout
      user={user}
      title="Müşteri Abonelikleri"
      description="Aktif müşteri abonelikleri ve gelir analizi"
    >
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg p-3 bg-green-50">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Toplam Gelir</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg p-3 bg-blue-50">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Toplam Abonelik</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {totalSubscriptions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg p-3 bg-purple-50">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Aktif Abonelik</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {activeSubscriptions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg p-3 bg-orange-50">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Aylık Büyüme</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    +12.5%
                  </p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['FREE', 'PRO', 'ENTERPRISE'].map(plan => {
                const planStats = stats.filter(stat => stat.plan === plan)
                const planTotal = planStats.reduce((sum, stat) => sum + Number(stat.count), 0)
                const planRevenue = planStats.reduce((sum, stat) => sum + (Number(stat.revenue) || 0), 0)
                
                return (
                  <div key={plan} className="text-center">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border">
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {planTotal}
                      </div>
                      <Badge className={getPlanColor(plan)}>
                        {plan}
                      </Badge>
                      <div className="mt-2 text-sm text-gray-600">
                        ${planRevenue.toLocaleString()} gelir
                      </div>
                    </div>
                  </div>
                )
              })}
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
                  placeholder="Müşteri ara..."
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
                <option value="ACTIVE">Aktif</option>
                <option value="EXPIRED">Süresi Dolmuş</option>
                <option value="CANCELLED">İptal Edilmiş</option>
                <option value="PAST_DUE">Vadesi Geçmiş</option>
              </select>

              <div className="flex items-center justify-end">
                <span className="text-sm text-gray-600">
                  {filteredSubscriptions.length} sonuç
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions List */}
        <div className="space-y-4">
          {filteredSubscriptions.map((subscription) => (
            <Card key={subscription.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {subscription.customer.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {subscription.customer.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <Badge className={getPlanColor(subscription.plan)}>
                        {subscription.plan}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        ${subscription.price}/{subscription.currency}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center">
                        {getStatusIcon(subscription.status)}
                        <Badge className={`ml-1 ${getStatusColor(subscription.status)}`}>
                          {subscription.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Görüntüle
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Düzenle
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                      {subscription.maxEvents}
                    </p>
                    <p className="text-xs text-gray-500">Max Etkinlik</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                      {subscription.maxUploadsPerEvent}
                    </p>
                    <p className="text-xs text-gray-500">Max Upload</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                      {subscription.maxStorageGB}GB
                    </p>
                    <p className="text-xs text-gray-500">Depolama</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(subscription.startDate).toLocaleDateString('tr-TR')}
                    </p>
                    <p className="text-xs text-gray-500">Başlangıç</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                      {subscription.endDate 
                        ? new Date(subscription.endDate).toLocaleDateString('tr-TR')
                        : 'Süresiz'
                      }
                    </p>
                    <p className="text-xs text-gray-500">Bitiş</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredSubscriptions.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Abonelik bulunamadı
                </h3>
                <p className="text-gray-500">
                  Arama kriterlerinize uygun abonelik bulunmuyor.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
