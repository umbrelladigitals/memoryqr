'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  User, 
  Settings, 
  CreditCard, 
  Shield, 
  Bell, 
  Palette,
  Database,
  HardDrive,
  Crown,
  Calendar,
  Image as ImageIcon,
  Upload,
  Eye,
  EyeOff,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

interface Customer {
  id: string
  name: string
  email: string
  subdomain: string | null
  isActive: boolean
  lastLogin: Date | null
  createdAt: Date
  plan: {
    id: string
    name: string
    displayName: string
    description: string | null
    price: number
    currency: string
    maxEvents: number | null
    maxPhotosPerEvent: number | null
    maxStorageGB: number | null
    customDomain: boolean
    analytics: boolean
    prioritySupport: boolean
    apiAccess: boolean
    whitelabel: boolean
  } | null
  subscription: {
    id: string
    status: string
    startDate: Date
    endDate: Date | null
    price: number
    currency: string
    plan: {
      displayName: string
    }
  } | null
}

interface Usage {
  events: number
  uploads: number
  storage: number
}

interface SettingsClientProps {
  customer: Customer
  usage: Usage
}

export default function SettingsClient({ customer, usage }: SettingsClientProps) {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: customer.name,
    email: customer.email,
    subdomain: customer.subdomain || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [notifications, setNotifications] = useState({
    emailUploads: true,
    emailWeekly: true,
    emailMarketing: false,
    pushUploads: true,
    pushSystem: true
  })

  const [preferences, setPreferences] = useState({
    language: 'tr',
    timezone: 'Europe/Istanbul',
    theme: 'light',
    dateFormat: 'dd/mm/yyyy'
  })

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUsagePercentage = (used: number, limit: number | null) => {
    if (!limit) return 0
    return Math.min((used / limit) * 100, 100)
  }

  const getStorageUsagePercentage = () => {
    if (!customer.plan?.maxStorageGB) return 0
    const limitBytes = customer.plan.maxStorageGB * 1024 * 1024 * 1024
    return Math.min((usage.storage / limitBytes) * 100, 100)
  }

  const handleProfileUpdate = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('İsim ve email alanları zorunludur')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subdomain: formData.subdomain || null
        }),
      })

      if (response.ok) {
        toast.success('Profil başarıyla güncellendi')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Güncelleme hatası')
      }
    } catch (error) {
      toast.error('Güncelleme sırasında hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Tüm şifre alanları zorunludur')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor')
      return
    }

    if (formData.newPassword.length < 6) {
      toast.error('Yeni şifre en az 6 karakter olmalıdır')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      })

      if (response.ok) {
        toast.success('Şifre başarıyla güncellendi')
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      } else {
        const error = await response.json()
        toast.error(error.message || 'Şifre güncelleme hatası')
      }
    } catch (error) {
      toast.error('Şifre güncelleme sırasında hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationUpdate = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notifications),
      })

      if (response.ok) {
        toast.success('Bildirim ayarları güncellendi')
      } else {
        toast.error('Güncelleme hatası')
      }
    } catch (error) {
      toast.error('Güncelleme sırasında hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleAccountDelete = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/delete-account', {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Hesap silme işlemi başlatıldı')
        // Redirect to login after a delay
        setTimeout(() => {
          window.location.href = '/auth/signin'
        }, 2000)
      } else {
        toast.error('Hesap silme hatası')
      }
    } catch (error) {
      toast.error('Hesap silme sırasında hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">⚙️ Ayarlar</h1>
              <p className="text-gray-600 text-sm sm:text-base">Hesap ve tercihlerinizi yönetin</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={customer.plan ? 'default' : 'secondary'}>
                {customer.plan?.displayName || 'Ücretsiz'}
              </Badge>
              {customer.subscription && (
                <Badge variant="outline" className="text-xs">
                  {customer.subscription.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Plan Usage Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Plan Kullanımı
            </CardTitle>
            <CardDescription>
              Mevcut planınızın kullanım durumu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Events Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Etkinlikler</span>
                  <span className="text-sm text-gray-500">
                    {usage.events} / {customer.plan?.maxEvents || '∞'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${getUsagePercentage(usage.events, customer.plan?.maxEvents)}%` 
                    }}
                  />
                </div>
              </div>

              {/* Photos Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Toplam Fotoğraf</span>
                  <span className="text-sm text-gray-500">{usage.uploads}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full w-full" />
                </div>
              </div>

              {/* Storage Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Depolama</span>
                  <span className="text-sm text-gray-500">
                    {formatBytes(usage.storage)} / {customer.plan?.maxStorageGB ? `${customer.plan.maxStorageGB}GB` : '∞'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getStorageUsagePercentage()}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="profile" className="text-xs sm:text-sm">Profil</TabsTrigger>
            <TabsTrigger value="security" className="text-xs sm:text-sm">Güvenlik</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm">Bildirimler</TabsTrigger>
            <TabsTrigger value="billing" className="text-xs sm:text-sm">Faturalandırma</TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs sm:text-sm">Gelişmiş</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profil Bilgileri</CardTitle>
                <CardDescription>
                  Kişisel bilgilerinizi güncelleyin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">İsim</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Adınız ve soyadınız"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subdomain">Alt Domain (İsteğe bağlı)</Label>
                    <div className="flex">
                      <Input
                        id="subdomain"
                        value={formData.subdomain}
                        onChange={(e) => setFormData(prev => ({ ...prev, subdomain: e.target.value }))}
                        placeholder="your-domain"
                        className="rounded-r-none"
                      />
                      <div className="flex items-center px-3 bg-gray-100 border border-l-0 rounded-r-md text-sm text-gray-500">
                        .memoryqr.com
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Hesap Durumu</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant={customer.isActive ? 'default' : 'destructive'}>
                        {customer.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                      {customer.lastLogin && (
                        <span className="text-sm text-gray-500">
                          Son giriş: {formatDate(customer.lastLogin)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Button onClick={handleProfileUpdate} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Güncelleniyor...' : 'Profili Güncelle'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Güvenlik Ayarları</CardTitle>
                <CardDescription>
                  Hesap güvenliğinizi yönetin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Mevcut şifrenizi girin"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Yeni Şifre</Label>
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Yeni şifrenizi girin"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Yeni şifrenizi tekrar girin"
                    />
                  </div>
                </div>

                <Button onClick={handlePasswordUpdate} disabled={loading}>
                  <Shield className="h-4 w-4 mr-2" />
                  {loading ? 'Güncelleniyor...' : 'Şifre Güncelle'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Bildirim Ayarları</CardTitle>
                <CardDescription>
                  Hangi bildirimleri almak istediğinizi seçin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Yeni upload bildirimleri</Label>
                      <p className="text-sm text-gray-500">Etkinliklerinize fotoğraf yüklendiğinde email alın</p>
                    </div>
                    <Switch
                      checked={notifications.emailUploads}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailUploads: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Haftalık rapor</Label>
                      <p className="text-sm text-gray-500">Haftalık aktivite raporunu email ile alın</p>
                    </div>
                    <Switch
                      checked={notifications.emailWeekly}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailWeekly: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Pazarlama emailları</Label>
                      <p className="text-sm text-gray-500">Yeni özellikler ve promosyonlar hakkında bilgi alın</p>
                    </div>
                    <Switch
                      checked={notifications.emailMarketing}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailMarketing: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Push bildirimleri</Label>
                      <p className="text-sm text-gray-500">Yeni uploadlar için anında bildirim alın</p>
                    </div>
                    <Switch
                      checked={notifications.pushUploads}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushUploads: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Sistem bildirimleri</Label>
                      <p className="text-sm text-gray-500">Sistem güncellemeleri ve önemli duyurular</p>
                    </div>
                    <Switch
                      checked={notifications.pushSystem}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushSystem: checked }))}
                    />
                  </div>
                </div>

                <Button onClick={handleNotificationUpdate} disabled={loading}>
                  <Bell className="h-4 w-4 mr-2" />
                  {loading ? 'Güncelleniyor...' : 'Bildirimleri Güncelle'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <div className="space-y-6">
              {/* Current Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Mevcut Plan</CardTitle>
                  <CardDescription>
                    Plan bilgileriniz ve fatura durumu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {customer.plan ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{customer.plan.displayName}</h3>
                          <p className="text-sm text-gray-500">{customer.plan.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            ₺{customer.plan.price}/{customer.plan.currency === 'USD' ? 'ay' : 'ay'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Etkinlik Limiti:</span>
                          <span className="ml-2 font-medium">
                            {customer.plan.maxEvents || 'Sınırsız'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Depolama:</span>
                          <span className="ml-2 font-medium">
                            {customer.plan.maxStorageGB ? `${customer.plan.maxStorageGB}GB` : 'Sınırsız'}
                          </span>
                        </div>
                      </div>

                      {customer.subscription && (
                        <div className="pt-4 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <span>Sonraki fatura tarihi:</span>
                            <span className="font-medium">
                              {customer.subscription.endDate 
                                ? formatDate(customer.subscription.endDate)
                                : 'Belirsiz'
                              }
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Ücretsiz Plan</h3>
                      <p className="text-gray-500 mb-4">Daha fazla özellik için premium plana geçin</p>
                      <Button>
                        <Zap className="h-4 w-4 mr-2" />
                        Plana Geç
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Plan Features */}
              {customer.plan && (
                <Card>
                  <CardHeader>
                    <CardTitle>Plan Özellikleri</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Temel analytics</span>
                      </div>
                      {customer.plan.analytics && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Gelişmiş analytics</span>
                        </div>
                      )}
                      {customer.plan.customDomain && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Özel domain</span>
                        </div>
                      )}
                      {customer.plan.prioritySupport && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Öncelikli destek</span>
                        </div>
                      )}
                      {customer.plan.apiAccess && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">API erişimi</span>
                        </div>
                      )}
                      {customer.plan.whitelabel && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">White-label</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced">
            <div className="space-y-6">
              {/* Data Export */}
              <Card>
                <CardHeader>
                  <CardTitle>Veri Yönetimi</CardTitle>
                  <CardDescription>
                    Verilerinizi dışa aktarın veya hesabınızı silin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Database className="h-4 w-4 mr-2" />
                    Tüm Verileri İndir
                  </Button>
                  
                  <div className="pt-4 border-t">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-red-900 mb-1">Hesap Silme</h4>
                          <p className="text-sm text-red-700 mb-3">
                            Bu işlem geri alınamaz. Tüm etkinlikleriniz, fotoğraflarınız ve verileriniz kalıcı olarak silinecektir.
                          </p>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Hesabı Sil
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hesabınızı silmek istediğinizden emin misiniz?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction onClick={handleAccountDelete} className="bg-red-600 hover:bg-red-700">
                                  Evet, Hesabı Sil
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
