'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { 
  Mail, 
  Send, 
  Server, 
  Save, 
  AlertTriangle,
  Shield,
  Bell,
  TestTube,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface EmailSettingsProps {
  settings: any
  onSettingsChange: (key: string, value: any) => void
  hasChanges: boolean
  onSave: () => void
  saving: boolean
}

export default function EmailSettings({ 
  settings, 
  onSettingsChange, 
  hasChanges, 
  onSave, 
  saving 
}: EmailSettingsProps) {
  const [testEmail, setTestEmail] = useState('')
  const [testing, setTesting] = useState(false)

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Test e-posta adresi girin')
      return
    }

    setTesting(true)
    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testEmail }),
      })

      if (response.ok) {
        toast.success('Test e-postası gönderildi')
      } else {
        toast.error('Test e-postası gönderilemedi')
      }
    } catch (error) {
      toast.error('Bağlantı hatası')
    } finally {
      setTesting(false)
    }
  }

  const getConnectionStatus = () => {
    if (settings?.smtpHost && settings?.smtpUser && settings?.smtpPassword) {
      return (
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">Yapılandırılmış</span>
        </div>
      )
    }
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <XCircle className="h-4 w-4" />
        <span className="text-sm">Yapılandırılmamış</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      {hasChanges && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-800 font-medium">Kaydedilmemiş değişiklikler var</span>
              </div>
              <Button size="sm" onClick={onSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SMTP Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Server className="h-5 w-5 mr-2" />
              SMTP Sunucu Ayarları
            </div>
            {getConnectionStatus()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP Sunucu</Label>
              <Input
                id="smtpHost"
                value={settings?.smtpHost || ''}
                onChange={(e) => onSettingsChange('smtpHost', e.target.value)}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">Port</Label>
              <Select 
                value={settings?.smtpPort?.toString() || '587'} 
                onValueChange={(value) => onSettingsChange('smtpPort', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Port seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 (Standart)</SelectItem>
                  <SelectItem value="587">587 (STARTTLS)</SelectItem>
                  <SelectItem value="465">465 (SSL)</SelectItem>
                  <SelectItem value="2525">2525 (Alternatif)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpUser">Kullanıcı Adı</Label>
              <Input
                id="smtpUser"
                value={settings?.smtpUser || ''}
                onChange={(e) => onSettingsChange('smtpUser', e.target.value)}
                placeholder="your-email@gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPassword">Şifre</Label>
              <Input
                id="smtpPassword"
                type="password"
                value={settings?.smtpPassword || ''}
                onChange={(e) => onSettingsChange('smtpPassword', e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-gray-500" />
              <Label htmlFor="smtpSecure">Güvenli Bağlantı (TLS/SSL)</Label>
            </div>
            <Switch
              id="smtpSecure"
              checked={settings?.smtpSecure || false}
              onCheckedChange={(checked) => onSettingsChange('smtpSecure', checked)}
            />
          </div>

          <Separator />

          {/* Test Email */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center">
              <TestTube className="h-4 w-4 mr-2" />
              Bağlantı Testi
            </h4>
            <div className="flex space-x-2">
              <Input
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={sendTestEmail} 
                disabled={testing || !settings?.smtpHost}
              >
                <Send className="h-4 w-4 mr-2" />
                {testing ? 'Gönderiliyor...' : 'Test Gönder'}
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              SMTP ayarlarını test etmek için bir e-posta adresi girin
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            E-posta Şablonları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emailFromName">Gönderen Adı</Label>
              <Input
                id="emailFromName"
                value={settings?.emailFromName || 'MemoryQR'}
                onChange={(e) => onSettingsChange('emailFromName', e.target.value)}
                placeholder="MemoryQR"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailFromAddress">Gönderen E-posta</Label>
              <Input
                id="emailFromAddress"
                type="email"
                value={settings?.emailFromAddress || ''}
                onChange={(e) => onSettingsChange('emailFromAddress', e.target.value)}
                placeholder="noreply@memoryqr.com"
              />
            </div>
          </div>

          <Separator />

          {/* Email Templates List */}
          <div className="space-y-4">
            <h4 className="font-medium">E-posta Şablonları</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">Hoş Geldin E-postası</h5>
                  <Badge variant="outline">Aktif</Badge>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  Yeni kullanıcılara gönderilen karşılama e-postası
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Düzenle
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">Şifre Sıfırlama</h5>
                  <Badge variant="outline">Aktif</Badge>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  Şifre sıfırlama talepleri için e-posta
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Düzenle
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">Etkinlik Bildirimi</h5>
                  <Badge variant="outline">Aktif</Badge>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  Yeni etkinlik oluşturulduğunda gönderilen bildirim
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Düzenle
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">Fatura E-postası</h5>
                  <Badge variant="outline">Aktif</Badge>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  Ödeme sonrası gönderilen fatura e-postası
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Düzenle
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Bildirim Ayarları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifications">E-posta Bildirimleri</Label>
                <Switch
                  id="emailNotifications"
                  checked={settings?.emailNotifications || false}
                  onCheckedChange={(checked) => onSettingsChange('emailNotifications', checked)}
                />
              </div>
              <p className="text-sm text-gray-500">
                Genel e-posta bildirimlerini etkinleştir
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="smsNotifications">SMS Bildirimleri</Label>
                <Switch
                  id="smsNotifications"
                  checked={settings?.smsNotifications || false}
                  onCheckedChange={(checked) => onSettingsChange('smsNotifications', checked)}
                />
              </div>
              <p className="text-sm text-gray-500">
                SMS bildirimlerini etkinleştir (ücretli)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="pushNotifications">Push Bildirimleri</Label>
                <Switch
                  id="pushNotifications"
                  checked={settings?.pushNotifications || false}
                  onCheckedChange={(checked) => onSettingsChange('pushNotifications', checked)}
                />
              </div>
              <p className="text-sm text-gray-500">
                Tarayıcı push bildirimlerini etkinleştir
              </p>
            </div>
          </div>

          <Separator />

          {/* Email Frequency */}
          <div className="space-y-4">
            <h4 className="font-medium">E-posta Sıklığı</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Günlük Özet</Label>
                <Select defaultValue="disabled">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disabled">Kapalı</SelectItem>
                    <SelectItem value="daily">Günlük</SelectItem>
                    <SelectItem value="weekly">Haftalık</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sistem Bildirimleri</Label>
                <Select defaultValue="immediate">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Anında</SelectItem>
                    <SelectItem value="hourly">Saatlik</SelectItem>
                    <SelectItem value="daily">Günlük</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Pazarlama E-postaları</Label>
                <Select defaultValue="weekly">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disabled">Kapalı</SelectItem>
                    <SelectItem value="weekly">Haftalık</SelectItem>
                    <SelectItem value="monthly">Aylık</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
