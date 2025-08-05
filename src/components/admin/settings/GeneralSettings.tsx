"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface SiteSettings {
  id: number
  site_name: string
  site_description: string
  site_url: string
  contact_email: string
  admin_email: string
  language: string
  timezone: string
  features_enabled: string
  [key: string]: any
}

interface GeneralSettingsProps {
  settings: SiteSettings
  onUpdate: (settings: Partial<SiteSettings>) => Promise<void>
  loading: boolean
}

export function GeneralSettings({ settings, onUpdate, loading }: GeneralSettingsProps) {
  const [formData, setFormData] = useState({
    site_name: settings?.site_name || '',
    site_description: settings?.site_description || '',
    site_url: settings?.site_url || '',
    contact_email: settings?.contact_email || '',
    admin_email: settings?.admin_email || '',
    language: settings?.language || 'tr',
    timezone: settings?.timezone || 'Europe/Istanbul',
    features_enabled: settings?.features_enabled || '[]'
  })

  const [features, setFeatures] = useState(() => {
    try {
      return JSON.parse(settings?.features_enabled || '[]')
    } catch {
      return []
    }
  })

  // Update form data when settings prop changes
  useEffect(() => {
    setFormData({
      site_name: settings?.site_name || '',
      site_description: settings?.site_description || '',
      site_url: settings?.site_url || '',
      contact_email: settings?.contact_email || '',
      admin_email: settings?.admin_email || '',
      language: settings?.language || 'tr',
      timezone: settings?.timezone || 'Europe/Istanbul',
      features_enabled: settings?.features_enabled || '[]'
    })
    
    try {
      setFeatures(JSON.parse(settings?.features_enabled || '[]'))
    } catch {
      setFeatures([])
    }
  }, [settings])

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleFeature = (feature: string) => {
    const newFeatures = features.includes(feature)
      ? features.filter((f: string) => f !== feature)
      : [...features, feature]
    
    setFeatures(newFeatures)
    setFormData(prev => ({ ...prev, features_enabled: JSON.stringify(newFeatures) }))
  }

  const handleSave = async () => {
    await onUpdate(formData)
  }

  const availableFeatures = [
    { id: 'qr_codes', label: 'QR Kod Oluşturma' },
    { id: 'file_upload', label: 'Dosya Yükleme' },
    { id: 'user_registration', label: 'Kullanıcı Kayıt' },
    { id: 'email_notifications', label: 'E-posta Bildirimleri' },
    { id: 'analytics', label: 'Analitik' },
    { id: 'api_access', label: 'API Erişimi' }
  ]

  return (
    <div className="space-y-6">
      {/* Site Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle>Site Bilgileri</CardTitle>
          <CardDescription>Temel site bilgilerini düzenleyin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site_name">Site Adı</Label>
              <Input
                id="site_name"
                value={formData.site_name}
                onChange={(e) => handleInputChange('site_name', e.target.value)}
                placeholder="Örn: Paylaşım Platformu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site_url">Site URL</Label>
              <Input
                id="site_url"
                value={formData.site_url}
                onChange={(e) => handleInputChange('site_url', e.target.value)}
                placeholder="Örn: https://example.com"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="site_description">Site Açıklaması</Label>
            <Textarea
              id="site_description"
              value={formData.site_description}
              onChange={(e) => handleInputChange('site_description', e.target.value)}
              placeholder="Sitenizin kısa açıklamasını girin"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* İletişim Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle>İletişim Bilgileri</CardTitle>
          <CardDescription>Site ve yönetici iletişim bilgileri</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_email">İletişim E-postası</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                placeholder="info@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_email">Admin E-postası</Label>
              <Input
                id="admin_email"
                type="email"
                value={formData.admin_email}
                onChange={(e) => handleInputChange('admin_email', e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Yerelleştirme */}
      <Card>
        <CardHeader>
          <CardTitle>Yerelleştirme</CardTitle>
          <CardDescription>Dil ve zaman dilimi ayarları</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Dil</Label>
              <Select 
                value={formData.language} 
                onValueChange={(value) => handleInputChange('language', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Dil seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tr">Türkçe</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Zaman Dilimi</Label>
              <Select 
                value={formData.timezone} 
                onValueChange={(value) => handleInputChange('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Zaman dilimi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Istanbul">İstanbul (UTC+3)</SelectItem>
                  <SelectItem value="UTC">UTC (UTC+0)</SelectItem>
                  <SelectItem value="Europe/London">Londra (UTC+0)</SelectItem>
                  <SelectItem value="Europe/Berlin">Berlin (UTC+1)</SelectItem>
                  <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Özellik Ayarları */}
      <Card>
        <CardHeader>
          <CardTitle>Özellik Ayarları</CardTitle>
          <CardDescription>Site özelliklerini etkinleştirin veya devre dışı bırakın</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableFeatures.map((feature) => (
              <div key={feature.id} className="flex items-center justify-between space-x-2">
                <Label htmlFor={feature.id} className="text-sm font-medium">
                  {feature.label}
                </Label>
                <Switch
                  id={feature.id}
                  checked={features.includes(feature.id)}
                  onCheckedChange={() => toggleFeature(feature.id)}
                />
              </div>
            ))}
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
