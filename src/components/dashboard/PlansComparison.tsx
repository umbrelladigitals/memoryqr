'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Check, 
  X, 
  Zap, 
  Crown, 
  Star,
  ArrowRight,
  Sparkles,
  Loader2
} from 'lucide-react'

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

interface PlanCardProps {
  plan: Plan
  currentPlan?: Plan
  onUpgrade: (planId: string) => void
  isLoading?: boolean
}

interface PlansComparisonProps {
  plans: Plan[]
  currentPlan?: Plan
  onUpgrade: (planId: string) => void
  isLoading?: boolean
}

function PlanCard({ plan, currentPlan, onUpgrade, isLoading }: PlanCardProps) {
  const isCurrentPlan = currentPlan?.id === plan.id
  const canUpgrade = !isCurrentPlan && (
    !currentPlan || 
    plan.price > currentPlan.price
  )

  const getPlanIcon = () => {
    switch (plan.name) {
      case 'FREE': return <Zap className="h-6 w-6" />
      case 'PRO': return <Star className="h-6 w-6" />
      case 'ENTERPRISE': return <Crown className="h-6 w-6" />
      default: return <Zap className="h-6 w-6" />
    }
  }

  const getPlanColor = () => {
    switch (plan.name) {
      case 'FREE': return 'border-gray-200 bg-white'
      case 'PRO': return 'border-blue-200 bg-blue-50'
      case 'ENTERPRISE': return 'border-purple-200 bg-purple-50'
      default: return 'border-gray-200 bg-white'
    }
  }

  const getButtonStyle = () => {
    if (isCurrentPlan) {
      return 'bg-gray-100 text-gray-600 cursor-not-allowed'
    }
    
    switch (plan.name) {
      case 'PRO': return 'bg-blue-600 hover:bg-blue-700 text-white'
      case 'ENTERPRISE': return 'bg-purple-600 hover:bg-purple-700 text-white'
      default: return 'bg-gray-600 hover:bg-gray-700 text-white'
    }
  }

  return (
    <Card className={`relative ${getPlanColor()} ${plan.isPopular ? 'ring-2 ring-blue-500' : ''} transition-all hover:shadow-lg`}>
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-600 text-white px-3 py-1">
            <Sparkles className="h-3 w-3 mr-1" />
            En Popüler
          </Badge>
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge className="bg-green-600 text-white px-3 py-1">
            <Check className="h-3 w-3 mr-1" />
            Mevcut Plan
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-2">
          <div className={`p-3 rounded-full ${plan.name === 'FREE' ? 'bg-gray-100' : plan.name === 'PRO' ? 'bg-blue-100' : 'bg-purple-100'}`}>
            {getPlanIcon()}
          </div>
        </div>
        <CardTitle className="text-xl">{plan.displayName}</CardTitle>
        <div className="text-3xl font-bold">
          {plan.price === 0 ? (
            'Ücretsiz'
          ) : (
            <>
              ${plan.price}
              <span className="text-sm font-normal text-gray-500">/ay</span>
            </>
          )}
        </div>
        <p className="text-gray-600 text-sm">{plan.description || 'Plan açıklaması'}</p>
      </CardHeader>

      <CardContent>
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm">
              {plan.maxEvents === null ? 'Sınırsız' : plan.maxEvents} etkinlik
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm">
              Etkinlik başına {plan.maxPhotosPerEvent === null ? 'sınırsız' : plan.maxPhotosPerEvent} fotoğraf
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm">
              {plan.maxStorageGB === null ? 'Sınırsız' : `${plan.maxStorageGB} GB`} depolama
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {plan.customDomain ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-gray-400" />
            )}
            <span className={`text-sm ${plan.customDomain ? '' : 'text-gray-400'}`}>
              Özel domain
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {plan.analytics ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-gray-400" />
            )}
            <span className={`text-sm ${plan.analytics ? '' : 'text-gray-400'}`}>
              Gelişmiş analitik
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {plan.prioritySupport ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-gray-400" />
            )}
            <span className={`text-sm ${plan.prioritySupport ? '' : 'text-gray-400'}`}>
              Öncelikli destek
            </span>
          </div>
          
          {plan.apiAccess && (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">API erişimi</span>
            </div>
          )}
          
          {plan.whitelabel && (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">Beyaz etiket çözümü</span>
            </div>
          )}
        </div>

        <Button
          className={`w-full ${getButtonStyle()}`}
          onClick={() => onUpgrade(plan.id)}
          disabled={isCurrentPlan || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Yükseltiliyor...
            </>
          ) : isCurrentPlan ? (
            'Mevcut Planınız'
          ) : (
            <>
              {canUpgrade ? 'Yükselt' : 'Seç'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

export default function PlansComparison({ plans, currentPlan, onUpgrade, isLoading }: PlansComparisonProps) {
  // Sort plans by price
  const sortedPlans = [...plans].sort((a, b) => a.price - b.price)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Planınızı Seçin</h2>
        <p className="text-gray-600">
          İhtiyaçlarınızza en uygun planı seçin ve hemen başlayın
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sortedPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentPlan={currentPlan}
            onUpgrade={onUpgrade}
            isLoading={isLoading}
          />
        ))}
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Kurumsal Çözümler</h3>
          <p className="text-gray-600 mb-4">
            Büyük organizasyonlar için özel çözümler sunuyoruz. 
            Özelleştirilmiş özellikler ve dedicated destek ile ihtiyaçlarınızı karşılıyoruz.
          </p>
          <Button variant="outline" className="bg-white">
            Bizimle İletişime Geçin
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
