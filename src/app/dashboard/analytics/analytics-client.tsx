'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  Image as ImageIcon, 
  Download, 
  Calendar,
  Eye,
  Upload,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  Share2,
  Clock,
  MapPin,
  Camera,
  Smartphone,
  Monitor,
  Globe,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { toast } from 'sonner'

interface AnalyticsData {
  overview: {
    totalEvents: number
    totalUploads: number
    totalViews: number
    totalDownloads: number
    avgUploadsPerEvent: number
    activeEvents: number
    topUploadDay: string
    totalStorageUsed: number
  }
  eventStats: {
    id: string
    title: string
    uploads: number
    views: number
    downloads: number
    date: string
    status: 'active' | 'inactive'
  }[]
  timeSeriesData: {
    date: string
    uploads: number
    views: number
    downloads: number
  }[]
  deviceStats: {
    device: string
    count: number
    percentage: number
  }[]
  locationStats: {
    location: string
    count: number
    percentage: number
  }[]
  popularTimes: {
    hour: number
    uploads: number
  }[]
}

const COLORS = ['#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#10B981', '#6366F1']

interface AnalyticsClientProps {
  initialData: AnalyticsData
}

export default function AnalyticsClient({ initialData }: AnalyticsClientProps) {
  const [data, setData] = useState<AnalyticsData>(initialData)
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedEvent, setSelectedEvent] = useState<string>('all')
  const [isMobile, setIsMobile] = useState(false)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const refreshData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics?timeRange=${timeRange}&eventId=${selectedEvent}`)
      if (response.ok) {
        const newData = await response.json()
        setData(newData)
        toast.success('Veriler güncellendi')
      } else {
        toast.error('Veri güncellenirken hata oluştu')
      }
    } catch (error) {
      toast.error('Bağlantı hatası')
    } finally {
      setLoading(false)
    }
  }

  const exportData = async () => {
    try {
      const response = await fetch(`/api/analytics/export?timeRange=${timeRange}&eventId=${selectedEvent}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${timeRange}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Rapor indiriliyor...')
      } else {
        toast.error('Export hatası')
      }
    } catch (error) {
      toast.error('Export sırasında hata oluştu')
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getGrowthIndicator = (current: number, previous: number) => {
    if (previous === 0) return { icon: ArrowUp, color: 'text-green-500', percentage: 0 }
    const growth = ((current - previous) / previous) * 100
    return {
      icon: growth >= 0 ? ArrowUp : ArrowDown,
      color: growth >= 0 ? 'text-green-500' : 'text-red-500',
      percentage: Math.abs(growth)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">📊 Analytics</h1>
              <p className="text-gray-600 text-sm sm:text-base">Etkinlik performansınızı takip edin</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              {/* Mobile: Stack filters vertically */}
              <div className="grid grid-cols-2 sm:flex gap-2">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 Gün</SelectItem>
                    <SelectItem value="30d">30 Gün</SelectItem>
                    <SelectItem value="90d">90 Gün</SelectItem>
                    <SelectItem value="1y">1 Yıl</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Etkinlikler</SelectItem>
                    {data.eventStats.map(event => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title.length > 20 ? event.title.substring(0, 20) + '...' : event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshData} 
                  disabled={loading}
                  className="flex-1 sm:flex-initial"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {isMobile ? 'Yenile' : 'Yenile'}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportData}
                  className="flex-1 sm:flex-initial"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {isMobile ? 'Export' : 'Export'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
          <Card className="overflow-hidden">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Toplam Etkinlik</p>
                  <p className="text-lg sm:text-2xl font-bold truncate">{data.overview.totalEvents}</p>
                  <p className="text-xs text-gray-500">{data.overview.activeEvents} aktif</p>
                </div>
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Toplam Upload</p>
                  <p className="text-lg sm:text-2xl font-bold">{data.overview.totalUploads}</p>
                  <p className="text-xs text-gray-500">Ort. {data.overview.avgUploadsPerEvent}/etkinlik</p>
                </div>
                <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Toplam Görüntüleme</p>
                  <p className="text-lg sm:text-2xl font-bold">{data.overview.totalViews}</p>
                  <p className="text-xs text-gray-500">Sayfa ziyaretleri</p>
                </div>
                <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Toplam İndirme</p>
                  <p className="text-lg sm:text-2xl font-bold">{data.overview.totalDownloads}</p>
                  <p className="text-xs text-gray-500">Fotoğraf indirmeleri</p>
                </div>
                <Download className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Genel Bakış</TabsTrigger>
            <TabsTrigger value="events" className="text-xs sm:text-sm">Etkinlikler</TabsTrigger>
            <TabsTrigger value="devices" className="text-xs sm:text-sm">Cihazlar</TabsTrigger>
            <TabsTrigger value="timing" className="text-xs sm:text-sm">Zaman Analizi</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Time Series Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Aktivite Trendi</CardTitle>
                <CardDescription>Zamana göre upload, görüntüleme ve indirme sayıları</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        fontSize={isMobile ? 10 : 12}
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                      />
                      <YAxis 
                        fontSize={isMobile ? 10 : 12}
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                      />
                      <Tooltip />
                      <Area type="monotone" dataKey="uploads" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
                      <Area type="monotone" dataKey="views" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" />
                      <Area type="monotone" dataKey="downloads" stackId="1" stroke="#EF4444" fill="#EF4444" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            {/* Events Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Etkinlik Performansı</CardTitle>
                <CardDescription>Her etkinliğin detaylı istatistikleri</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.eventStats.map((event, index) => (
                    <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1 mb-2 sm:mb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm sm:text-base truncate">{event.title}</h3>
                          <Badge variant={event.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                            {event.status === 'active' ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600">{event.date}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                        <div>
                          <p className="text-lg sm:text-xl font-bold">{event.uploads}</p>
                          <p className="text-xs text-gray-600">Upload</p>
                        </div>
                        <div>
                          <p className="text-lg sm:text-xl font-bold">{event.views}</p>
                          <p className="text-xs text-gray-600">Görüntüleme</p>
                        </div>
                        <div>
                          <p className="text-lg sm:text-xl font-bold">{event.downloads}</p>
                          <p className="text-xs text-gray-600">İndirme</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Device Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Cihaz Dağılımı</CardTitle>
                  <CardDescription>Kullanıcıların kullandığı cihazlar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.deviceStats}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ device, percentage }) => `${device}: ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {data.deviceStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Location Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Konum Dağılımı</CardTitle>
                  <CardDescription>Kullanıcıların coğrafi dağılımı</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.locationStats.map((location, index) => (
                      <div key={location.location} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm">{location.location}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{location.count}</span>
                          <span className="text-gray-500 text-sm ml-2">({location.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timing" className="space-y-6">
            {/* Popular Times */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Popüler Saatler</CardTitle>
                <CardDescription>Gün içinde en aktif upload saatleri</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.popularTimes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="hour" 
                        fontSize={isMobile ? 10 : 12}
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                      />
                      <YAxis 
                        fontSize={isMobile ? 10 : 12}
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                      />
                      <Tooltip />
                      <Bar dataKey="uploads" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
