'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { 
  CreditCard, 
  Building2, 
  Shield, 
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface PaymentSettings {
  id: string
  bankTransferEnabled: boolean
  bankName: string
  bankAccountName: string
  bankAccountNumber: string
  bankIban: string
  bankSwiftCode: string
  bankBranch: string
  paymentInstructions: string
  autoApprovalEnabled: boolean
  manualApprovalRequired: boolean
  paymentTimeoutHours: number
  creditCardEnabled: boolean
  paypalEnabled: boolean
  cryptoEnabled: boolean
}

export default function PaymentSettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<PaymentSettings | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/payment-settings')
      if (!response.ok) throw new Error('Failed to fetch settings')
      
      const data = await response.json()
      setSettings(data.settings)
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Ödeme ayarları yüklenirken hata oluştu',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return
    
    setSaving(true)
    try {
      const response = await fetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (!response.ok) throw new Error('Failed to save settings')

      toast({
        title: 'Başarılı',
        description: 'Ödeme ayarları başarıyla güncellendi',
      })
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Ödeme ayarları kaydedilirken hata oluştu',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (updates: Partial<PaymentSettings>) => {
    if (!settings) return
    setSettings({ ...settings, ...updates })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-gray-500">Ödeme ayarları yüklenemedi</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ödeme Ayarları</h1>
          <p className="text-gray-600">Ödeme yöntemlerini ve ayarlarını yönetin</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Ayarları Kaydet
            </>
          )}
        </Button>
      </div>

      {/* Payment Methods Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium">Havale/EFT</p>
                  <p className="text-sm text-gray-500">Banka transferi</p>
                </div>
              </div>
              <Badge variant={settings.bankTransferEnabled ? "default" : "secondary"}>
                {settings.bankTransferEnabled ? "Aktif" : "Pasif"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-medium">Kredi Kartı</p>
                  <p className="text-sm text-gray-500">Online ödeme</p>
                </div>
              </div>
              <Badge variant={settings.creditCardEnabled ? "default" : "secondary"}>
                {settings.creditCardEnabled ? "Aktif" : "Pasif"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="font-medium">PayPal</p>
                  <p className="text-sm text-gray-500">Dijital cüzdan</p>
                </div>
              </div>
              <Badge variant={settings.paypalEnabled ? "default" : "secondary"}>
                {settings.paypalEnabled ? "Aktif" : "Pasif"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bank Transfer Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Havale/EFT Ayarları</span>
          </CardTitle>
          <CardDescription>
            Banka havale ve EFT ödemeleri için hesap bilgilerini ayarlayın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.bankTransferEnabled}
              onCheckedChange={(checked) => updateSettings({ bankTransferEnabled: checked })}
            />
            <Label>Havale/EFT ödemelerini etkinleştir</Label>
          </div>

          {settings.bankTransferEnabled && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">Banka Adı</Label>
                  <Input
                    id="bankName"
                    value={settings.bankName}
                    onChange={(e) => updateSettings({ bankName: e.target.value })}
                    placeholder="Örn: Türkiye İş Bankası"
                  />
                </div>
                <div>
                  <Label htmlFor="bankBranch">Şube</Label>
                  <Input
                    id="bankBranch"
                    value={settings.bankBranch}
                    onChange={(e) => updateSettings({ bankBranch: e.target.value })}
                    placeholder="Örn: Kadıköy Şubesi"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bankAccountName">Hesap Sahibi</Label>
                <Input
                  id="bankAccountName"
                  value={settings.bankAccountName}
                  onChange={(e) => updateSettings({ bankAccountName: e.target.value })}
                  placeholder="Hesap sahibinin adı"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankAccountNumber">Hesap Numarası</Label>
                  <Input
                    id="bankAccountNumber"
                    value={settings.bankAccountNumber}
                    onChange={(e) => updateSettings({ bankAccountNumber: e.target.value })}
                    placeholder="0000-0000-0000-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="bankIban">IBAN</Label>
                  <Input
                    id="bankIban"
                    value={settings.bankIban}
                    onChange={(e) => updateSettings({ bankIban: e.target.value })}
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bankSwiftCode">SWIFT Kodu (Opsiyonel)</Label>
                <Input
                  id="bankSwiftCode"
                  value={settings.bankSwiftCode}
                  onChange={(e) => updateSettings({ bankSwiftCode: e.target.value })}
                  placeholder="Örn: ISBKTRIS"
                />
              </div>

              <div>
                <Label htmlFor="paymentInstructions">Ödeme Talimatları</Label>
                <Textarea
                  id="paymentInstructions"
                  value={settings.paymentInstructions}
                  onChange={(e) => updateSettings({ paymentInstructions: e.target.value })}
                  placeholder="Müşterilere gösterilecek ödeme talimatları"
                  rows={4}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Approval Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Ödeme Onay Ayarları</span>
          </CardTitle>
          <CardDescription>
            Ödeme onay süreçlerini ve zaman aşımlarını yönetin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.manualApprovalRequired}
              onCheckedChange={(checked) => updateSettings({ manualApprovalRequired: checked })}
            />
            <Label>Manuel onay gereksin</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.autoApprovalEnabled}
              onCheckedChange={(checked) => updateSettings({ autoApprovalEnabled: checked })}
            />
            <Label>Otomatik onay (belirli koşullarda)</Label>
          </div>

          <div>
            <Label htmlFor="paymentTimeoutHours">Ödeme Zaman Aşımı (Saat)</Label>
            <Input
              id="paymentTimeoutHours"
              type="number"
              value={settings.paymentTimeoutHours}
              onChange={(e) => updateSettings({ paymentTimeoutHours: parseInt(e.target.value) || 24 })}
              min="1"
              max="168"
            />
            <p className="text-sm text-gray-500 mt-1">
              Ödeme bekleme süresi dolduğunda sipariş otomatik iptal edilir
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Other Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Diğer Ödeme Yöntemleri</CardTitle>
          <CardDescription>
            Gelecekte eklenecek ödeme yöntemlerini etkinleştirin/devre dışı bırakın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-green-500" />
              <div>
                <Label>Kredi Kartı Ödemeleri</Label>
                <p className="text-sm text-gray-500">Stripe veya iyzico entegrasyonu</p>
              </div>
            </div>
            <Switch
              checked={settings.creditCardEnabled}
              onCheckedChange={(checked) => updateSettings({ creditCardEnabled: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <Label>PayPal</Label>
                <p className="text-sm text-gray-500">PayPal ile online ödeme</p>
              </div>
            </div>
            <Switch
              checked={settings.paypalEnabled}
              onCheckedChange={(checked) => updateSettings({ paypalEnabled: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-5 w-5 bg-gradient-to-r from-orange-400 to-yellow-400 rounded" />
              <div>
                <Label>Kripto Para</Label>
                <p className="text-sm text-gray-500">Bitcoin ve diğer kripto paralar</p>
              </div>
            </div>
            <Switch
              checked={settings.cryptoEnabled}
              onCheckedChange={(checked) => updateSettings({ cryptoEnabled: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
