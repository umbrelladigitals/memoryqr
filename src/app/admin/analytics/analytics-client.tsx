'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Calendar, 
  Camera, 
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Target,
  Zap,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react'

interface AnalyticsOverview {
  totalUsers: number
  totalEvents: number
  totalPhotos: number
  activeUsers: number
  newUsersThisMonth: number
  eventsThisMonth: number
  photosThisMonth: number
}

interface UserGrowthData {
  date: string
  count: number
}

interface PlanData {
  plan: string
  count: number
}

interface RevenueData {
  month: string
  revenue: number
}

interface AnalyticsData {
  overview: AnalyticsOverview
  userGrowth: UserGrowthData[]
  eventsByPlan: PlanData[]
  photosByPlan: PlanData[]
  revenueByMonth: RevenueData[]
}

interface AnalyticsClientProps {
  analytics: AnalyticsData
}

export default function AnalyticsClient({ analytics }: AnalyticsClientProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  const { overview, userGrowth, eventsByPlan, photosByPlan, revenueByMonth } = analytics

  // Calculate engagement metrics
  const engagementRate = overview.totalUsers > 0 
    ? ((overview.activeUsers / overview.totalUsers) * 100).toFixed(1)
    : '0'
  
  const photosPerEvent = overview.totalEvents > 0 
    ? (overview.totalPhotos / overview.totalEvents).toFixed(1)
    : '0'

  // Calculate growth trends
  const userGrowthTrend = userGrowth.length > 1 
    ? userGrowth[userGrowth.length - 1].count - userGrowth[userGrowth.length - 2].count
    : 0

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'bg-gray-100 text-gray-800'
      case 'PRO': return 'bg-blue-100 text-blue-800'
      case 'ENTERPRISE': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Simple chart data visualization
  const renderSimpleBarChart = (data: PlanData[], title: string) => {
    const maxValue = Math.max(...data.map(d => d.count))
    
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">{title}</h4>
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{item.plan}</span>
              <span className="font-medium">{item.count}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(item.count / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderGrowthChart = () => {
    const maxValue = Math.max(...userGrowth.map(d => d.count))
    const chartHeight = 120
    
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Kullanıcı Büyümesi (Son 30 Gün)</h4>
        <div className="relative">
          <div className="flex items-end justify-between h-24 space-x-1">
            {userGrowth.map((point, index) => (
              <div 
                key={index}
                className="bg-blue-500 rounded-t-sm flex-1 transition-all duration-300 hover:bg-blue-600"
                style={{ 
                  height: `${(point.count / maxValue) * 100}%`,
                  minHeight: point.count > 0 ? '4px' : '0px'
                }}
                title={`${point.date}: ${point.count} yeni kullanıcı`}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout
      user={{
        id: 'admin',
        name: 'Admin',
        email: 'admin@memoryqr.com',
        role: 'ADMIN'
      }}
      title="Analitik Dashboard"
      description="Sistem performansı ve kullanıcı analitikleri"
    >
      <div className="space-y-6">
        {/* Period Selector */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {['7d', '30d', '90d', '1y'].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {period === '7d' && '7 Gün'}
                {period === '30d' && '30 Gün'}
                {period === '90d' && '90 Gün'}
                {period === '1y' && '1 Yıl'}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Rapor İndir
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg p-3 bg-blue-50">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Toplam Kullanıcı</p>
                  <p className="text-2xl font-semibold text-gray-900">{overview.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center text-sm">
                    <span className="text-green-600">+{overview.newUsersThisMonth}</span>
                    <span className="text-gray-500 ml-1">bu ay</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg p-3 bg-green-50">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Aktif Kullanıcı</p>
                  <p className="text-2xl font-semibold text-gray-900">{overview.activeUsers.toLocaleString()}</p>
                  <div className="flex items-center text-sm">
                    <span className="text-blue-600">%{engagementRate}</span>
                    <span className="text-gray-500 ml-1">katılım oranı</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg p-3 bg-purple-50">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Toplam Etkinlik</p>
                  <p className="text-2xl font-semibold text-gray-900">{overview.totalEvents.toLocaleString()}</p>
                  <div className="flex items-center text-sm">
                    <span className="text-green-600">+{overview.eventsThisMonth}</span>
                    <span className="text-gray-500 ml-1">bu ay</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg p-3 bg-orange-50">
                  <Camera className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Toplam Fotoğraf</p>
                  <p className="text-2xl font-semibold text-gray-900">{overview.totalPhotos.toLocaleString()}</p>
                  <div className="flex items-center text-sm">
                    <span className="text-blue-600">{photosPerEvent}</span>
                    <span className="text-gray-500 ml-1">etkinlik başına</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Indicators */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Performans Göstergeleri</h3>
                <Target className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Kullanıcı Aktivasyonu</span>
                  <span className="text-sm font-medium text-green-600">%{engagementRate}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${engagementRate}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ortalama Fotoğraf/Etkinlik</span>
                  <span className="text-sm font-medium text-blue-600">{photosPerEvent}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min((parseFloat(photosPerEvent) / 50) * 100, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Büyüme Trendi</span>
                  <div className="flex items-center">
                    {userGrowthTrend > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${userGrowthTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {userGrowthTrend > 0 ? '+' : ''}{userGrowthTrend}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Plan Dağılımı</h3>
                <PieChart className="h-5 w-5 text-gray-400" />
              </div>
              {renderSimpleBarChart(eventsByPlan, 'Etkinlikler')}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Kullanıcı Büyümesi</h3>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
              {renderGrowthChart()}
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-900">{overview.newUsersThisMonth}</p>
                  <p className="text-sm text-gray-500">Bu Ay</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{overview.activeUsers}</p>
                  <p className="text-sm text-gray-500">Aktif</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trends */}
        {revenueByMonth.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Gelir Trendi (Son 12 Ay)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {revenueByMonth.slice(-4).map((revenue, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">{revenue.month}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: 'TRY'
                      }).format(revenue.revenue)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-16 flex-col">
                <Users className="h-5 w-5 mb-1" />
                <span>Kullanıcı Raporu</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <Calendar className="h-5 w-5 mb-1" />
                <span>Etkinlik Analizi</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <DollarSign className="h-5 w-5 mb-1" />
                <span>Gelir Raporu</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
