'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import PlanFeatures from '@/components/dashboard/PlanFeatures'
import PlansComparison from '@/components/dashboard/PlansComparison'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Crown, CreditCard, Eye, DollarSign } from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  plan: {
    id: string
    name: string
    displayName: string
    description?: string | null
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
  description?: string | null
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

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  paymentMethod: string
  transactionId?: string | null
  description?: string | null
  createdAt: Date
  updatedAt: Date
  subscription?: {
    plan?: {
      displayName: string
      name: string
    }
  } | null
}

interface Subscription {
  id: string
  status: string
  startDate: Date
  endDate?: Date | null
  plan: Plan
}

interface BillingClientProps {
  customer: Customer | null
  allPlans: Plan[]
  payments?: Payment[]
  currentSubscription?: Subscription | null
  usage: {
    eventsUsed: number
    photosUsed: number
    storageUsedGB: number
  }
}

export default function BillingClient({ 
  customer, 
  allPlans, 
  payments = [], 
  currentSubscription, 
  usage 
}: BillingClientProps) {
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showPaymentDetail, setShowPaymentDetail] = useState(false)
  const router = useRouter()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Tamamlandı</span>
      case 'PENDING':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Beklemede</span>
      case 'FAILED':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Başarısız</span>
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>
    }
  }

  const handlePaymentDetail = (payment: Payment) => {
    setSelectedPayment(payment)
    setShowPaymentDetail(true)
  }

  const handleMakePayment = async (payment: Payment) => {
    try {
      // Önce payment settings'i çek (customer API'si)
      const settingsResponse = await fetch('/api/payment-settings')
      let paymentInfo: any = null
      
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json()
        const settings = settingsData.settings
        
        if (settings && settings.bankTransferEnabled) {
          paymentInfo = {
            bankName: settings.bankName,
            bankAccountName: settings.bankAccountName,
            bankAccountNumber: settings.bankAccountNumber,
            bankIban: settings.bankIban,
            bankSwiftCode: settings.bankSwiftCode,
            bankBranch: settings.bankBranch,
            instructions: settings.paymentInstructions,
            paymentId: payment.id,
            timeoutHours: settings.paymentTimeoutHours || 24,
          }
        }
      }
      
      // Ödeme bilgilerini localStorage'a kaydet
      localStorage.setItem('pendingPayment', JSON.stringify({
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        paymentInfo: paymentInfo
      }))
      
      // Ödeme sayfasına yönlendir
      router.push('/dashboard/billing/payment')
    } catch (error) {
      console.error('Payment settings error:', error)
      toast.error('Ödeme bilgileri alınırken hata oluştu')
    }
  }

  const handlePlanUpgrade = async (planId: string) => {
    if (isUpgrading) return
    
    try {
      setIsUpgrading(true)
      
      const response = await fetch('/api/plans/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          planId,
          paymentMethod: 'BANK_TRANSFER' 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Plan aboneliği başarısız')
      }

      if (data.paymentRequired) {
        // Ödeme gerekli - havale bilgilerini göster
        toast.success('Plan aboneliği oluşturuldu!', {
          description: 'Ödeme bilgileri sayfaya yönlendiriliyorsunuz...',
        })
        
        // Payment bilgilerini state'e kaydet veya yeni sayfaya yönlendir
        localStorage.setItem('pendingPayment', JSON.stringify({
          paymentId: data.payment.id,
          amount: data.payment.amount,
          currency: data.payment.currency,
          paymentInfo: data.paymentInfo
        }))
        
        // Ödeme sayfasına yönlendir
        router.push('/dashboard/billing/payment')
      } else {
        // Ücretsiz plan - direkt aktif
        toast.success('Plan başarıyla aktif edildi!', {
          description: 'Yeni özellikleriniz şimdi kullanılabilir.',
        })
        
        router.refresh()
      }
      
    } catch (error) {
      console.error('Plan subscription error:', error)
      toast.error(error instanceof Error ? error.message : 'Plan aboneliği başarısız')
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Mevcut Plan
          </TabsTrigger>
          <TabsTrigger value="upgrade" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Plan Yükseltme
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Ödeme Geçmişi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          <PlanFeatures 
            currentPlan={customer?.plan as any || null}
            usage={usage}
          />
        </TabsContent>

        <TabsContent value="upgrade" className="space-y-6">
          <PlansComparison 
            plans={allPlans as any}
            currentPlan={customer?.plan as any || undefined}
            onUpgrade={handlePlanUpgrade}
            isLoading={isUpgrading}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-medium">Ödeme Geçmişi</h3>
              <p className="text-sm text-gray-600 mt-1">
                Tüm plan satın alma ve yükseltme işlemleriniz
              </p>
            </div>
            
            {currentSubscription && (
              <div className="p-6 border-b bg-blue-50">
                <h4 className="font-medium text-blue-900">Aktif Abonelik</h4>
                <div className="mt-2 text-sm text-blue-700">
                  <p><strong>Plan:</strong> {currentSubscription.plan?.displayName}</p>
                  <p><strong>Başlangıç:</strong> {new Date(currentSubscription.startDate).toLocaleDateString('tr-TR')}</p>
                  {currentSubscription.endDate && (
                    <p><strong>Bitiş:</strong> {new Date(currentSubscription.endDate).toLocaleDateString('tr-TR')}</p>
                  )}
                  <p><strong>Durum:</strong> 
                    <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                      currentSubscription.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {currentSubscription.status === 'ACTIVE' ? 'Aktif' : currentSubscription.status}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <div className="divide-y">
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <div key={payment.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">
                            {payment.subscription?.plan?.displayName || 'Plan Ödemesi'}
                          </h4>
                          {getStatusBadge(payment.status)}
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          <p>Ödeme ID: {payment.id}</p>
                          {payment.transactionId && (
                            <p>İşlem ID: {payment.transactionId}</p>
                          )}
                          {payment.description && (
                            <p>{payment.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">
                            {payment.amount} {payment.currency}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(payment.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payment.paymentMethod}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePaymentDetail(payment)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            Detay
                          </Button>
                          {payment.status === 'PENDING' && (
                            <Button
                              size="sm"
                              onClick={() => handleMakePayment(payment)}
                              className="flex items-center gap-1"
                            >
                              <DollarSign className="h-4 w-4" />
                              Ödeme Yap
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Henüz ödeme kaydı bulunmuyor</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Payment Detail Modal */}
      <Dialog open={showPaymentDetail} onOpenChange={setShowPaymentDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ödeme Detayları</DialogTitle>
            <DialogDescription>
              Ödeme işleminin tüm detayları
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-6">
              {/* Payment Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Ödeme Durumu</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedPayment.status === 'PENDING' && 'Ödeme bekleniyor'}
                    {selectedPayment.status === 'COMPLETED' && 'Ödeme tamamlandı'}
                    {selectedPayment.status === 'FAILED' && 'Ödeme başarısız'}
                  </p>
                </div>
                {getStatusBadge(selectedPayment.status)}
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Ödeme ID</label>
                    <p className="text-sm text-gray-900 mt-1 font-mono bg-gray-100 p-2 rounded">
                      {selectedPayment.id}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tutar</label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {selectedPayment.amount} {selectedPayment.currency}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Ödeme Yöntemi</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedPayment.paymentMethod === 'BANK_TRANSFER' ? 'Havale/EFT' : selectedPayment.paymentMethod}
                    </p>
                  </div>

                  {selectedPayment.transactionId && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">İşlem ID</label>
                      <p className="text-sm text-gray-900 mt-1 font-mono bg-gray-100 p-2 rounded">
                        {selectedPayment.transactionId}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Plan</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedPayment.subscription?.plan?.displayName || 'Plan Bilgisi Yok'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Oluşturulma Tarihi</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(selectedPayment.createdAt).toLocaleString('tr-TR')}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Son Güncelleme</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(selectedPayment.updatedAt).toLocaleString('tr-TR')}
                    </p>
                  </div>

                  {selectedPayment.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Açıklama</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedPayment.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedPayment.status === 'PENDING' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={async () => {
                      setShowPaymentDetail(false)
                      await handleMakePayment(selectedPayment)
                    }}
                    className="flex items-center gap-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    Ödeme Yap
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPaymentDetail(false)}
                  >
                    Kapat
                  </Button>
                </div>
              )}

              {selectedPayment.status !== 'PENDING' && (
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowPaymentDetail(false)}
                  >
                    Kapat
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
