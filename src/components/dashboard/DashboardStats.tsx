'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Image, 
  Users, 
  DollarSign,
  Activity,
  Eye,
  Download,
  Upload
} from 'lucide-react'

interface DashboardStat {
  id: string
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
    period: string
  }
  icon: React.ReactNode
  color: string
  description?: string
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
}

interface DashboardStatsProps {
  stats: {
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
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const dashboardStats: DashboardStat[] = [
    {
      id: 'events',
      title: 'Toplam Etkinlik',
      value: stats.totalEvents,
      change: {
        value: stats.thisMonthEvents,
        type: stats.thisMonthEvents > 0 ? 'increase' : 'decrease',
        period: 'Bu ay'
      },
      icon: <Calendar className="h-5 w-5" />,
      color: 'text-blue-600',
      description: `${stats.activeEvents} aktif etkinlik`
    },
    {
      id: 'photos',
      title: 'Toplam Fotoğraf',
      value: stats.totalPhotos.toLocaleString(),
      change: {
        value: stats.thisMonthPhotos,
        type: stats.thisMonthPhotos > 0 ? 'increase' : 'decrease',
        period: 'Bu ay'
      },
      icon: <Image className="h-5 w-5" />,
      color: 'text-purple-600',
      description: 'Tüm etkinliklerden'
    },
    {
      id: 'views',
      title: 'Toplam Görüntüleme',
      value: stats.totalViews.toLocaleString(),
      icon: <Eye className="h-5 w-5" />,
      color: 'text-green-600',
      description: 'Galeri görüntülemeleri'
    },
    {
      id: 'storage',
      title: 'Kullanılan Depolama',
      value: `${stats.storageUsedGB.toFixed(1)} GB`,
      icon: <Upload className="h-5 w-5" />,
      color: 'text-orange-600',
      description: stats.planLimit.storage 
        ? `${stats.planLimit.storage} GB limitinden`
        : 'Sınırsız'
    }
  ]

  const quickActions: QuickAction[] = [
    {
      id: 'create-event',
      title: 'Yeni Etkinlik',
      description: 'Hızlıca yeni bir etkinlik oluşturun',
      icon: <Calendar className="h-5 w-5" />,
      href: '/dashboard/events/create',
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100'
    },
    {
      id: 'view-analytics',
      title: 'Analitikler',
      description: 'Detaylı istatistikleri görüntüleyin',
      icon: <Activity className="h-5 w-5" />,
      href: '/dashboard/analytics',
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100'
    },
    {
      id: 'download-photos',
      title: 'Toplu İndirme',
      description: 'Tüm fotoğrafları indirin',
      icon: <Download className="h-5 w-5" />,
      href: '/dashboard/downloads',
      color: 'bg-green-50 text-green-600 hover:bg-green-100'
    },
    {
      id: 'manage-settings',
      title: 'Ayarlar',
      description: 'Hesap ve plan ayarlarını yönetin',
      icon: <Users className="h-5 w-5" />,
      href: '/dashboard/settings',
      color: 'bg-orange-50 text-orange-600 hover:bg-orange-100'
    }
  ]

  const getUsagePercentage = (used: number, limit: number | null) => {
    if (limit === null) return 0
    return Math.min((used / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage < 50) return 'text-green-600'
    if (percentage < 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => (
          <Card key={stat.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  {stat.description && (
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  )}
                  {stat.change && (
                    <div className="flex items-center mt-2">
                      {stat.change.type === 'increase' ? (
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs ${
                        stat.change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        +{stat.change.value} {stat.change.period}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Alerts */}
      {(stats.planLimit.events || stats.planLimit.storage) && (
        <Card className="border-l-4 border-l-orange-400">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Plan Kullanımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.planLimit.events && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Etkinlik Limiti</span>
                    <Badge variant="outline">
                      {stats.totalEvents} / {stats.planLimit.events}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${getUsagePercentage(stats.totalEvents, stats.planLimit.events)}%` 
                      }}
                    />
                  </div>
                  <p className={`text-xs mt-1 ${getUsageColor(getUsagePercentage(stats.totalEvents, stats.planLimit.events))}`}>
                    %{getUsagePercentage(stats.totalEvents, stats.planLimit.events).toFixed(0)} kullanıldı
                  </p>
                </div>
              )}
              
              {stats.planLimit.storage && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Depolama Limiti</span>
                    <Badge variant="outline">
                      {stats.storageUsedGB.toFixed(1)} GB / {stats.planLimit.storage} GB
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${getUsagePercentage(stats.storageUsedGB, stats.planLimit.storage)}%` 
                      }}
                    />
                  </div>
                  <p className={`text-xs mt-1 ${getUsageColor(getUsagePercentage(stats.storageUsedGB, stats.planLimit.storage))}`}>
                    %{getUsagePercentage(stats.storageUsedGB, stats.planLimit.storage).toFixed(0)} kullanıldı
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Hızlı İşlemler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <a
                key={action.id}
                href={action.href}
                className={`p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 ${action.color}`}
              >
                <div className="flex items-center gap-3">
                  {action.icon}
                  <div>
                    <h4 className="font-medium">{action.title}</h4>
                    <p className="text-xs opacity-80 mt-1">{action.description}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
