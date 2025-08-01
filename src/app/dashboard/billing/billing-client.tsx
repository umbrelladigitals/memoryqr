'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import PlanFeatures from '@/components/dashboard/PlanFeatures'
import PlansComparison from '@/components/dashboard/PlansComparison'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Crown, CreditCard } from 'lucide-react'

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
  } | null
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
}

interface BillingClientProps {
  customer: Customer | null
  allPlans: Plan[]
  usage: {
    eventsUsed: number
    photosUsed: number
    storageUsedGB: number
  }
}

export default function BillingClient({ customer, allPlans, usage }: BillingClientProps) {
  const [isUpgrading, setIsUpgrading] = useState(false)
  const router = useRouter()

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Plan & Faturalandırma</h1>
        <p className="text-gray-600 mt-2">
          Mevcut planınızı görüntüleyin ve yükseltme seçeneklerini keşfedin
        </p>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Mevcut Plan
          </TabsTrigger>
          <TabsTrigger value="upgrade" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Plan Yükseltme
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          <PlanFeatures 
            currentPlan={customer?.plan || null}
            usage={usage}
          />
        </TabsContent>

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
  )
}
