'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Globe, Mail, Clock, DollarSign, Save, AlertTriangle } from 'lucide-react'

interface GeneralSettingsProps {
  settings: {
    id: string
    siteName: string
    siteDescription: string
    siteUrl: string
    supportEmail: string
    adminEmail: string
    language: string
    timezone: string
    currency: string
    userRegistration: boolean
    emailVerification: boolean
    socialLogin: boolean
    maintenanceMode: boolean
    maintenanceMessage?: string | null
  }
  onSettingsChange: (key: string, value: any) => void
  hasChanges: boolean
  onSave: () => void
  saving: boolean
}

export default function GeneralSettings({ 
  settings, 
  onSettingsChange, 
  hasChanges, 
  onSave, 
  saving 
}: GeneralSettingsProps) {
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

      {/* Site Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Site Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Adı</Label>
              <Input
                id="siteName"
                value={settings?.siteName || ''}
                onChange={(e) => onSettingsChange('siteName', e.target.value)}
                placeholder="MemoryQR"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteUrl">Site URL</Label>
              <Input
                id="siteUrl"
                value={settings?.siteUrl || ''}
                onChange={(e) => onSettingsChange('siteUrl', e.target.value)}
                placeholder="https://memoryqr.com"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="siteDescription">Site Açıklaması</Label>
            <Textarea
              id="siteDescription"
              value={settings?.siteDescription || ''}
              onChange={(e) => onSettingsChange('siteDescription', e.target.value)}
              placeholder="QR Kod ile Anı Paylaşım Platformu"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            İletişim Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Admin E-posta</Label>
              <Input
                id="adminEmail"
                type="email"
                value={settings?.adminEmail || ''}
                onChange={(e) => onSettingsChange('adminEmail', e.target.value)}
                placeholder="admin@memoryqr.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Destek E-posta</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings?.supportEmail || ''}
                onChange={(e) => onSettingsChange('supportEmail', e.target.value)}
                placeholder="support@memoryqr.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Localization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Bölge ve Dil Ayarları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Zaman Dilimi</Label>
              <Select value={settings?.timezone || 'Europe/Istanbul'} onValueChange={(value) => onSettingsChange('timezone', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Zaman dilimi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Istanbul">Turkey (GMT+3)</SelectItem>
                  <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                  <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (GMT+9)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language">Dil</Label>
              <Select value={settings?.language || 'tr'} onValueChange={(value) => onSettingsChange('language', value)}>
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
              <Label htmlFor="currency">Para Birimi</Label>
              <Select value={settings?.currency || 'TRY'} onValueChange={(value) => onSettingsChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Para birimi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRY">Turkish Lira (₺)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="GBP">British Pound (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <CardTitle>Özellik Ayarları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="userRegistration">Kullanıcı Kaydı</Label>
                <Switch
                  id="userRegistration"
                  checked={settings?.userRegistration || false}
                  onCheckedChange={(checked) => onSettingsChange('userRegistration', checked)}
                />
              </div>
              <p className="text-sm text-gray-500">Yeni kullanıcıların kayıt olmasına izin ver</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailVerification">E-posta Doğrulama</Label>
                <Switch
                  id="emailVerification"
                  checked={settings?.emailVerification || false}
                  onCheckedChange={(checked) => onSettingsChange('emailVerification', checked)}
                />
              </div>
              <p className="text-sm text-gray-500">Kayıt sırasında e-posta doğrulaması iste</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="socialLogin">Sosyal Medya Girişi</Label>
                <Switch
                  id="socialLogin"
                  checked={settings?.socialLogin || false}
                  onCheckedChange={(checked) => onSettingsChange('socialLogin', checked)}
                />
              </div>
              <p className="text-sm text-gray-500">Google, Facebook ile giriş imkanı</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="maintenanceMode">Bakım Modu</Label>
                <Switch
                  id="maintenanceMode"
                  checked={settings?.maintenanceMode || false}
                  onCheckedChange={(checked) => onSettingsChange('maintenanceMode', checked)}
                />
              </div>
              <p className="text-sm text-gray-500">Siteyi bakım moduna al</p>
            </div>
          </div>

          {settings?.maintenanceMode && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="maintenanceMessage">Bakım Mesajı</Label>
                <Textarea
                  id="maintenanceMessage"
                  value={settings?.maintenanceMessage || ''}
                  onChange={(e) => onSettingsChange('maintenanceMessage', e.target.value)}
                  placeholder="Site şu anda bakımda. Lütfen daha sonra tekrar deneyin."
                  rows={3}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
