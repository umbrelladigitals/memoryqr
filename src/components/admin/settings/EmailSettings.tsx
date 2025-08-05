"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Send, Shield } from 'lucide-react'

interface SiteSettings {
  id: number
  smtp_host: string | null
  smtp_port: number | null
  smtp_username: string | null
  smtp_password: string | null
  smtp_from_email: string | null
  smtp_from_name: string | null
  email_notifications_enabled: boolean
  welcome_email_enabled: boolean
  [key: string]: any
}

interface EmailSettingsProps {
  settings: SiteSettings
  onUpdate: (settings: Partial<SiteSettings>) => Promise<void>
  loading: boolean
}

export function EmailSettings({ settings, onUpdate, loading }: EmailSettingsProps) {
  const [formData, setFormData] = useState({
    smtp_host: settings?.smtp_host || '',
    smtp_port: settings?.smtp_port || 587,
    smtp_username: settings?.smtp_username || '',
    smtp_password: settings?.smtp_password || '',
    smtp_from_email: settings?.smtp_from_email || '',
    smtp_from_name: settings?.smtp_from_name || '',
    email_notifications_enabled: settings?.email_notifications_enabled || false,
    welcome_email_enabled: settings?.welcome_email_enabled || false
  })

  const [testLoading, setTestLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Update form data when settings prop changes
  useEffect(() => {
    setFormData({
      smtp_host: settings?.smtp_host || '',
      smtp_port: settings?.smtp_port || 587,
      smtp_username: settings?.smtp_username || '',
      smtp_password: settings?.smtp_password || '',
      smtp_from_email: settings?.smtp_from_email || '',
      smtp_from_name: settings?.smtp_from_name || '',
      email_notifications_enabled: settings?.email_notifications_enabled || false,
      welcome_email_enabled: settings?.welcome_email_enabled || false
    })
  }, [settings])

  const handleInputChange = (name: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    await onUpdate(formData)
  }

  const testEmailConnection = async () => {
    setTestLoading(true)
    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smtp_host: formData.smtp_host,
          smtp_port: formData.smtp_port,
          smtp_username: formData.smtp_username,
          smtp_password: formData.smtp_password,
          smtp_from_email: formData.smtp_from_email,
          smtp_from_name: formData.smtp_from_name
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        alert('E-posta bağlantısı başarılı! Test e-postası gönderildi.')
      } else {
        alert(`Bağlantı hatası: ${data.error}`)
      }
    } catch (error) {
      console.error('Email test error:', error)
      alert('E-posta testi sırasında bir hata oluştu')
    } finally {
      setTestLoading(false)
    }
  }

  const commonSMTPProviders = [
    {
      name: 'Gmail',
      host: 'smtp.gmail.com',
      port: 587,
      note: 'Uygulama şifresi gerektirir'
    },
    {
      name: 'Outlook/Hotmail',
      host: 'smtp-mail.outlook.com',
      port: 587,
      note: 'OAuth2 önerilir'
    },
    {
      name: 'Yahoo',
      host: 'smtp.mail.yahoo.com',
      port: 587,
      note: 'Uygulama şifresi gerektirir'
    },
    {
      name: 'SendGrid',
      host: 'smtp.sendgrid.net',
      port: 587,
      note: 'API anahtarı kullanın'
    }
  ]

  const setProvider = (provider: typeof commonSMTPProviders[0]) => {
    handleInputChange('smtp_host', provider.host)
    handleInputChange('smtp_port', provider.port)
  }

  return (
    <div className="space-y-6">
      {/* SMTP Ayarları */}
      <Card>
        <CardHeader>
          <CardTitle>SMTP Yapılandırması</CardTitle>
          <CardDescription>E-posta gönderimi için SMTP sunucu ayarları</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Yaygın SMTP Sağlayıcıları */}
          <div className="space-y-2">
            <Label>Hızlı Kurulum</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {commonSMTPProviders.map(provider => (
                <Button
                  key={provider.name}
                  variant="outline"
                  className="justify-start h-auto p-3"
                  onClick={() => setProvider(provider)}
                >
                  <div className="text-left">
                    <div className="font-medium">{provider.name}</div>
                    <div className="text-xs text-gray-500">{provider.note}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp_host">SMTP Sunucusu</Label>
              <Input
                id="smtp_host"
                value={formData.smtp_host}
                onChange={(e) => handleInputChange('smtp_host', e.target.value)}
                placeholder="smtp.gmail.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_port">Port</Label>
              <Input
                id="smtp_port"
                type="number"
                value={formData.smtp_port}
                onChange={(e) => handleInputChange('smtp_port', parseInt(e.target.value))}
                placeholder="587"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp_username">Kullanıcı Adı</Label>
              <Input
                id="smtp_username"
                value={formData.smtp_username}
                onChange={(e) => handleInputChange('smtp_username', e.target.value)}
                placeholder="your-email@gmail.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_password">Şifre</Label>
              <div className="relative">
                <Input
                  id="smtp_password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.smtp_password}
                  onChange={(e) => handleInputChange('smtp_password', e.target.value)}
                  placeholder="Uygulama şifrenizi girin"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Shield className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Gmail ve diğer sağlayıcılar için uygulama şifresi kullanmanız gerekebilir. 
              Normal hesap şifrenizi kullanmayın.
            </AlertDescription>
          </Alert>

          <Button
            variant="outline"
            onClick={testEmailConnection}
            disabled={testLoading || !formData.smtp_host}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {testLoading ? 'Test Ediliyor...' : 'Bağlantıyı Test Et'}
          </Button>
        </CardContent>
      </Card>

      {/* Gönderen Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle>Gönderen Bilgileri</CardTitle>
          <CardDescription>E-postalarda görünecek gönderen bilgileri</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp_from_email">Gönderen E-posta</Label>
              <Input
                id="smtp_from_email"
                type="email"
                value={formData.smtp_from_email}
                onChange={(e) => handleInputChange('smtp_from_email', e.target.value)}
                placeholder="noreply@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_from_name">Gönderen Adı</Label>
              <Input
                id="smtp_from_name"
                value={formData.smtp_from_name}
                onChange={(e) => handleInputChange('smtp_from_name', e.target.value)}
                placeholder="Paylaşım Platformu"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* E-posta Bildirimleri */}
      <Card>
        <CardHeader>
          <CardTitle>E-posta Bildirimleri</CardTitle>
          <CardDescription>Otomatik e-posta gönderimi ayarları</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_notifications_enabled">E-posta Bildirimleri</Label>
              <p className="text-sm text-gray-500">
                Sistem bildirimlerini e-posta ile gönder
              </p>
            </div>
            <Switch
              id="email_notifications_enabled"
              checked={formData.email_notifications_enabled}
              onCheckedChange={(checked) => handleInputChange('email_notifications_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="welcome_email_enabled">Hoş Geldin E-postası</Label>
              <p className="text-sm text-gray-500">
                Yeni üyelere hoş geldin e-postası gönder
              </p>
            </div>
            <Switch
              id="welcome_email_enabled"
              checked={formData.welcome_email_enabled}
              onCheckedChange={(checked) => handleInputChange('welcome_email_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* E-posta Şablonları */}
      <Card>
        <CardHeader>
          <CardTitle>E-posta Şablonları</CardTitle>
          <CardDescription>E-posta şablonlarını özelleştirin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              E-posta şablonları özelleştirme özelliği yakında eklenecek. 
              Şu anda varsayılan şablonlar kullanılmaktadır.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" disabled>
              Hoş Geldin Şablonu
            </Button>
            <Button variant="outline" disabled>
              Şifre Sıfırlama
            </Button>
            <Button variant="outline" disabled>
              Bildirim Şablonu
            </Button>
            <Button variant="outline" disabled>
              Haber Bülteni
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Kaydet Butonu */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={loading}
          className="min-w-[120px]"
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>
    </div>
  )
}
