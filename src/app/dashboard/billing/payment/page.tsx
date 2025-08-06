'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  Building2, 
  Clock, 
  CheckCircle, 
  Copy,
  ArrowLeft,
  CreditCard,
  AlertCircle
} from 'lucide-react'

interface PaymentInfo {
  paymentId: string
  amount: number
  currency: string
  paymentInfo: {
    bankName: string
    bankAccountName: string
    bankAccountNumber: string
    bankIban: string
    bankSwiftCode?: string
    bankBranch?: string
    instructions: string
    timeoutHours: number
  }
}

export default function PaymentPage() {
  const router = useRouter()
  const [paymentData, setPaymentData] = useState<PaymentInfo | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const pendingPayment = localStorage.getItem('pendingPayment')
    if (pendingPayment) {
      setPaymentData(JSON.parse(pendingPayment))
    } else {
      // Eğer pending payment yoksa billing sayfasına yönlendir
      router.push('/dashboard/billing')
    }
  }, [router])

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      toast.success(`${label} kopyalandı`)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      toast.error('Kopyalama başarısız')
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'TRY'
    }).format(amount)
  }

  const handlePaymentComplete = () => {
    localStorage.removeItem('pendingPayment')
    toast.success('Ödeme bildiriminiz alındı!', {
      description: 'Ödemeniz onaylandıktan sonra planınız aktif edilecektir.'
    })
    router.push('/dashboard/billing')
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Ödeme bilgileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  const { paymentInfo } = paymentData

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri Dön
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ödeme Talimatları</h1>
            <p className="text-gray-600">Plan aboneliğinizi tamamlamak için ödemenizi gerçekleştirin</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Ödeme Özeti</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ödeme ID:</span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {paymentData.paymentId}
                </code>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tutar:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(paymentData.amount, paymentData.currency)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Durum:</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Ödeme Bekleniyor
                </Badge>
              </div>

              <Separator />

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Önemli Uyarı</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Ödemenizi {paymentInfo.timeoutHours} saat içinde tamamlamalısınız. 
                      Bu süre dolduğunda sipariş otomatik iptal edilir.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Transfer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Havale/EFT Bilgileri</span>
              </CardTitle>
              <CardDescription>
                Aşağıdaki hesap bilgilerini kullanarak ödemenizi gerçekleştirin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentInfo.bankName && (
                <div className="space-y-2">
                  <Label>Banka Adı</Label>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium">{paymentInfo.bankName}</span>
                  </div>
                </div>
              )}

              {paymentInfo.bankAccountName && (
                <div className="space-y-2">
                  <Label>Hesap Sahibi</Label>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium">{paymentInfo.bankAccountName}</span>
                  </div>
                </div>
              )}

              {paymentInfo.bankAccountNumber && (
                <div className="space-y-2">
                  <Label>Hesap Numarası</Label>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="font-mono">{paymentInfo.bankAccountNumber}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(paymentInfo.bankAccountNumber, 'Hesap Numarası')}
                    >
                      <Copy className="w-4 h-4" />
                      {copied === 'Hesap Numarası' ? 'Kopyalandı!' : 'Kopyala'}
                    </Button>
                  </div>
                </div>
              )}

              {paymentInfo.bankIban && (
                <div className="space-y-2">
                  <Label>IBAN</Label>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="font-mono text-sm">{paymentInfo.bankIban}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(paymentInfo.bankIban, 'IBAN')}
                    >
                      <Copy className="w-4 h-4" />
                      {copied === 'IBAN' ? 'Kopyalandı!' : 'Kopyala'}
                    </Button>
                  </div>
                </div>
              )}

              {paymentInfo.bankBranch && (
                <div className="space-y-2">
                  <Label>Şube</Label>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span>{paymentInfo.bankBranch}</span>
                  </div>
                </div>
              )}

              {paymentInfo.bankSwiftCode && (
                <div className="space-y-2">
                  <Label>SWIFT Kodu</Label>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="font-mono">{paymentInfo.bankSwiftCode}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(paymentInfo.bankSwiftCode!, 'SWIFT Kodu')}
                    >
                      <Copy className="w-4 h-4" />
                      {copied === 'SWIFT Kodu' ? 'Kopyalandı!' : 'Kopyala'}
                    </Button>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Label>Açıklama Kısmına Yazınız</Label>
                <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <span className="font-mono font-bold text-blue-800">
                    {paymentData.paymentId}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(paymentData.paymentId, 'Ödeme ID')}
                  >
                    <Copy className="w-4 h-4" />
                    {copied === 'Ödeme ID' ? 'Kopyalandı!' : 'Kopyala'}
                  </Button>
                </div>
                <p className="text-sm text-blue-600">
                  Bu ID'yi havale açıklama kısmına mutlaka yazın
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        {paymentInfo.instructions && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Ödeme Talimatları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 whitespace-pre-wrap">
                  {paymentInfo.instructions}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="mt-8 text-center space-y-4">
          <Button 
            onClick={handlePaymentComplete}
            size="lg"
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Ödemeyi Yaptım, Onay Bekliyorum
          </Button>
          
          <p className="text-sm text-gray-500">
            Ödemeniz onaylandıktan sonra planınız otomatik olarak aktif edilecektir.
          </p>
        </div>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-gray-700">{children}</label>
}
