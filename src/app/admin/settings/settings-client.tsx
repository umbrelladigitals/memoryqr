'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Settings,
  Globe,
  Bell,
  Shield,
  Database,
  Mail,
  Users,
  Camera,
  QrCode,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface SystemSettings {
  general: {
    siteName: string
    siteUrl: string
    adminEmail: string
    timezone: string
    language: string
  }
  features: {
    userRegistration: boolean
    emailVerification: boolean
    photoUpload: boolean
    qrCodeGeneration: boolean
    eventSharing: boolean
  }
  limits: {
    maxPhotosPerEvent: number
    maxEventDuration: number
    maxFileSize: number
    maxEventsPerUser: number
  }
  notifications: {
    emailNotifications: boolean
    newUserAlerts: boolean
    paymentAlerts: boolean
    systemAlerts: boolean
  }
}

interface SettingsClientProps {
  settings: SystemSettings
}

export default function SettingsClient({ settings }: SettingsClientProps) {
  const [currentSettings, setCurrentSettings] = useState(settings)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)

  const updateGeneralSetting = (key: string, value: string) => {
    setCurrentSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [key]: value
      }
    }))
    setHasChanges(true)
  }

  const updateFeatureSetting = (key: string, value: boolean) => {
    setCurrentSettings(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [key]: value
      }
    }))
    setHasChanges(true)
  }

  const updateLimitSetting = (key: string, value: number) => {
    setCurrentSettings(prev => ({
      ...prev,
      limits: {
        ...prev.limits,
        [key]: value
      }
    }))
    setHasChanges(true)
  }

  const updateNotificationSetting = (key: string, value: boolean) => {
    setCurrentSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    setHasChanges(false)
    // Show success message
  }

  const handleReset = () => {
    setCurrentSettings(settings)
    setHasChanges(false)
  }

  return (
    <AdminLayout
      user={{
        id: 'admin',
        name: 'Admin',
        email: 'admin@memoryqr.com',
        role: 'ADMIN'
      }}
      title="Sistem Ayarları"
      description="Platform konfigürasyonu ve sistem yönetimi"
    >
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
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sıfırla
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Genel Ayarlar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Adı
                </label>
                <Input
                  value={currentSettings.general.siteName}
                  onChange={(e) => updateGeneralSetting('siteName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site URL
                </label>
                <Input
                  value={currentSettings.general.siteUrl}
                  onChange={(e) => updateGeneralSetting('siteUrl', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin E-posta
                </label>
                <Input
                  type="email"
                  value={currentSettings.general.adminEmail}
                  onChange={(e) => updateGeneralSetting('adminEmail', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zaman Dilimi
                </label>
                <select
                  value={currentSettings.general.timezone}
                  onChange={(e) => updateGeneralSetting('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Europe/Istanbul">Europe/Istanbul</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Özellik Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Kullanıcı Kaydı</p>
                    <p className="text-sm text-gray-500">Yeni kullanıcı kayıtlarını etkinleştir</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.features.userRegistration}
                  onChange={(e) => updateFeatureSetting('userRegistration', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">E-posta Doğrulama</p>
                    <p className="text-sm text-gray-500">Kayıt sırasında e-posta doğrulama</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.features.emailVerification}
                  onChange={(e) => updateFeatureSetting('emailVerification', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Camera className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Fotoğraf Yükleme</p>
                    <p className="text-sm text-gray-500">Kullanıcıların fotoğraf yüklemesine izin ver</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.features.photoUpload}
                  onChange={(e) => updateFeatureSetting('photoUpload', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <QrCode className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium">QR Kod Oluşturma</p>
                    <p className="text-sm text-gray-500">Etkinlikler için QR kod oluşturma</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.features.qrCodeGeneration}
                  onChange={(e) => updateFeatureSetting('qrCodeGeneration', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Sistem Limitleri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etkinlik Başına Maksimum Fotoğraf
                </label>
                <Input
                  type="number"
                  value={currentSettings.limits.maxPhotosPerEvent}
                  onChange={(e) => updateLimitSetting('maxPhotosPerEvent', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maksimum Etkinlik Süresi (gün)
                </label>
                <Input
                  type="number"
                  value={currentSettings.limits.maxEventDuration}
                  onChange={(e) => updateLimitSetting('maxEventDuration', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maksimum Dosya Boyutu (MB)
                </label>
                <Input
                  type="number"
                  value={currentSettings.limits.maxFileSize}
                  onChange={(e) => updateLimitSetting('maxFileSize', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kullanıcı Başına Maksimum Etkinlik
                </label>
                <Input
                  type="number"
                  value={currentSettings.limits.maxEventsPerUser}
                  onChange={(e) => updateLimitSetting('maxEventsPerUser', parseInt(e.target.value))}
                />
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">E-posta Bildirimleri</p>
                  <p className="text-sm text-gray-500">Sistem e-posta bildirimlerini etkinleştir</p>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.notifications.emailNotifications}
                  onChange={(e) => updateNotificationSetting('emailNotifications', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Yeni Kullanıcı Uyarıları</p>
                  <p className="text-sm text-gray-500">Yeni kullanıcı kayıtları için bildirim</p>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.notifications.newUserAlerts}
                  onChange={(e) => updateNotificationSetting('newUserAlerts', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Ödeme Uyarıları</p>
                  <p className="text-sm text-gray-500">Ödeme işlemleri için bildirim</p>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.notifications.paymentAlerts}
                  onChange={(e) => updateNotificationSetting('paymentAlerts', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sistem Uyarıları</p>
                  <p className="text-sm text-gray-500">Sistem hatalar ve uyarılar için bildirim</p>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.notifications.systemAlerts}
                  onChange={(e) => updateNotificationSetting('systemAlerts', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Sistem Durumu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Veritabanı</p>
                  <p className="text-sm text-green-700">Bağlantı aktif</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">E-posta Servisi</p>
                  <p className="text-sm text-green-700">Çalışıyor</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Dosya Depolama</p>
                  <p className="text-sm text-green-700">Erişilebilir</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
