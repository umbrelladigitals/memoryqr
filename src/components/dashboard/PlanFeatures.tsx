'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Check, 
  X, 
  Zap, 
  Calendar, 
  Image, 
  Users, 
  Database,
  Shield,
  Globe,
  Headphones,
  TrendingUp
} from 'lucide-react'

interface PlanFeature {
  feature: string
  free: boolean | string
  pro: boolean | string
  enterprise: boolean | string
}

interface Plan {
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
}

interface PlanFeaturesProps {
  currentPlan: Plan | null
  usage: {
    eventsUsed: number
    photosUsed: number
    storageUsedGB: number
  }
}

const planFeatures: PlanFeature[] = [
  { feature: 'Etkinlik Sayısı', free: '10', pro: '∞', enterprise: '∞' },
  { feature: 'Etkinlik Başına Fotoğraf', free: '100', pro: '1000', enterprise: '∞' },
  { feature: 'Toplam Depolama', free: '1 GB', pro: '50 GB', enterprise: '500 GB' },
  { feature: 'Özel Domain', free: false, pro: true, enterprise: true },
  { feature: 'Gelişmiş Analitik', free: false, pro: true, enterprise: true },
  { feature: 'Öncelikli Destek', free: false, pro: false, enterprise: true },
  { feature: 'API Erişimi', free: false, pro: true, enterprise: true },
  { feature: 'Beyaz Etiket', free: false, pro: false, enterprise: true },
]

export default function PlanFeatures({ currentPlan, usage }: PlanFeaturesProps) {
  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'Etkinlik Sayısı': return <Calendar className="h-4 w-4" />
      case 'Etkinlik Başına Fotoğraf': return <Image className="h-4 w-4" />
      case 'Toplam Depolama': return <Database className="h-4 w-4" />
      case 'Özel Domain': return <Globe className="h-4 w-4" />
      case 'Gelişmiş Analitik': return <TrendingUp className="h-4 w-4" />
      case 'Öncelikli Destek': return <Headphones className="h-4 w-4" />
      case 'API Erişimi': return <Shield className="h-4 w-4" />
      case 'Beyaz Etiket': return <Zap className="h-4 w-4" />
      default: return <Check className="h-4 w-4" />
    }
  }

  const getUsagePercentage = (used: number, limit: number | null) => {
    if (limit === null) return 0
    return Math.min((used / limit) * 100, 100)
  }

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'FREE': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'PRO': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ENTERPRISE': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-500'
    if (percentage < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (!currentPlan) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Plan bilgisi yüklenemedi</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Mevcut Planınız
              </CardTitle>
            </div>
            {currentPlan.isPopular && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                En Popüler
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className={getPlanColor(currentPlan.name)}>
                  {currentPlan.displayName}
                </Badge>
                {currentPlan.price > 0 && (
                  <span className="text-2xl font-bold">
                    ${currentPlan.price}
                    <span className="text-sm font-normal text-gray-500">/ay</span>
                  </span>
                )}
              </div>
              <p className="text-gray-600">{currentPlan.description || 'Plan açıklaması'}</p>
            </div>
            <Button variant="outline" size="sm">
              Planı Yükselt
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Kullanım İstatistikleri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Events Usage */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Etkinlikler
              </span>
              <span className="text-sm text-gray-500">
                {usage.eventsUsed} / {currentPlan.maxEvents || '∞'}
              </span>
            </div>
            {currentPlan.maxEvents && (
              <Progress 
                value={getUsagePercentage(usage.eventsUsed, currentPlan.maxEvents)} 
                className="h-2"
              />
            )}
          </div>

          {/* Photos Usage */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <Image className="h-4 w-4" />
                Toplam Fotoğraf
              </span>
              <span className="text-sm text-gray-500">
                {usage.photosUsed.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Storage Usage */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Depolama
              </span>
              <span className="text-sm text-gray-500">
                {usage.storageUsedGB.toFixed(1)} GB / {currentPlan.maxStorageGB || '∞'} GB
              </span>
            </div>
            {currentPlan.maxStorageGB && (
              <Progress 
                value={getUsagePercentage(usage.storageUsedGB, currentPlan.maxStorageGB)} 
                className="h-2"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Features Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Plan Özellikleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {planFeatures.map((feature, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  {getFeatureIcon(feature.feature)}
                  <span className="text-sm font-medium">{feature.feature}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[60px]">
                    <div className="text-xs text-gray-500 mb-1">FREE</div>
                    {typeof feature.free === 'boolean' ? (
                      feature.free ? (
                        <Check className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mx-auto" />
                      )
                    ) : (
                      <span className="text-xs font-medium">{feature.free}</span>
                    )}
                  </div>
                  <div className="text-center min-w-[60px]">
                    <div className="text-xs text-gray-500 mb-1">PRO</div>
                    {typeof feature.pro === 'boolean' ? (
                      feature.pro ? (
                        <Check className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mx-auto" />
                      )
                    ) : (
                      <span className="text-xs font-medium">{feature.pro}</span>
                    )}
                  </div>
                  <div className="text-center min-w-[80px]">
                    <div className="text-xs text-gray-500 mb-1">ENTERPRISE</div>
                    {typeof feature.enterprise === 'boolean' ? (
                      feature.enterprise ? (
                        <Check className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mx-auto" />
                      )
                    ) : (
                      <span className="text-xs font-medium">{feature.enterprise}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
