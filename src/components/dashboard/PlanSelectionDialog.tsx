'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Loader2, Crown, Zap, Globe } from 'lucide-react'
import { toast } from 'sonner'

interface Plan {
  id: string
  name: string
  displayName: string
  description: string | null
  price: number
  currency: string
  maxEvents: number | null
  maxPhotosPerEvent: number | null
  maxStorageGB: number | null
  customBranding: boolean
  analytics: boolean
  prioritySupport: boolean
  whitelabel: boolean
  isActive: boolean
}

export default function PlanSelectionDialog() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const selectPlanId = searchParams?.get('selectPlan')
  
  const [isOpen, setIsOpen] = useState(!!selectPlanId)
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(false)
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    if (selectPlanId) {
      fetchPlans()
    }
  }, [selectPlanId])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/plans')
      if (response.ok) {
        const data = await response.json()
        setPlans(data.plans)
        
        // Find the selected plan
        const plan = data.plans.find((p: Plan) => p.id === selectPlanId)
        if (plan) {
          setSelectedPlan(plan)
        }
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
      toast.error('Planlar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async () => {
    if (!selectedPlan) return

    try {
      setSubscribing(true)
      const response = await fetch('/api/plans/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planId: selectedPlan.id,
          paymentMethod: 'BANK_TRANSFER'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Plan aboneliği başarısız')
      }

      if (data.paymentRequired) {
        // Ödeme gerekli - havale bilgilerini göster
        toast.success('Plan aboneliği oluşturuldu!', {
          description: 'Ödeme bilgileri sayfasına yönlendiriliyorsunuz...',
        })
        
        // Payment bilgilerini localStorage'a kaydet
        localStorage.setItem('pendingPayment', JSON.stringify({
          paymentId: data.payment.id,
          amount: data.payment.amount,
          currency: data.payment.currency,
          paymentInfo: data.paymentInfo
        }))
        
        setIsOpen(false)
        // Ödeme sayfasına yönlendir
        router.push('/dashboard/billing/payment')
      } else {
        // Ücretsiz plan - direkt aktif
        toast.success(`${selectedPlan.displayName} planına başarıyla geçildi!`)
        setIsOpen(false)
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error(error instanceof Error ? error.message : 'Plan aboneliği başarısız')
    } finally {
      setSubscribing(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    router.push('/dashboard')
  }

  if (!selectPlanId) return null

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'FREE': return Globe
      case 'PRO': return Zap
      case 'ENTERPRISE': return Crown
      default: return Globe
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Plan Değişikliği</DialogTitle>
          <DialogDescription>
            Seçtiğiniz plana geçmek istediğinizden emin misiniz?
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : selectedPlan ? (
          <div className="space-y-6">
            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4">
                  {(() => {
                    const Icon = getPlanIcon(selectedPlan.name)
                    return <Icon className="h-12 w-12 text-blue-600" />
                  })()}
                </div>
                <CardTitle className="text-xl">{selectedPlan.displayName}</CardTitle>
                <div className="text-2xl font-bold text-blue-600">
                  {selectedPlan.price === 0 ? (
                    'Ücretsiz'
                  ) : (
                    `₺${selectedPlan.price}/ay`
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  <span className="text-sm">
                    {selectedPlan.maxEvents === null ? 'Sınırsız' : selectedPlan.maxEvents} etkinlik
                  </span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  <span className="text-sm">
                    Etkinlik başına {selectedPlan.maxPhotosPerEvent === null ? 'sınırsız' : selectedPlan.maxPhotosPerEvent} fotoğraf
                  </span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  <span className="text-sm">
                    {selectedPlan.maxStorageGB === null ? 'Sınırsız' : `${selectedPlan.maxStorageGB} GB`} depolama
                  </span>
                </div>
                {selectedPlan.customBranding && (
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Özel markalama</span>
                  </div>
                )}
                {selectedPlan.analytics && (
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Gelişmiş analitik</span>
                  </div>
                )}
                {selectedPlan.prioritySupport && (
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Öncelikli destek</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                İptal
              </Button>
              <Button 
                onClick={handleSubscribe} 
                disabled={subscribing}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {subscribing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    İşleniyor...
                  </>
                ) : (
                  selectedPlan.price === 0 ? 'Bu Plana Geç' : 'Planı Satın Al'
                )}
              </Button>
            </div>

            {selectedPlan.price > 0 && (
              <p className="text-xs text-gray-500 text-center">
                Bu demo sürümünde ödeme simüle edilir. Gerçek ödeme işlemi yapılmaz.
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">Plan bulunamadı</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
