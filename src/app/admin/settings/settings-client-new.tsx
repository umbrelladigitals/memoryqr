'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Settings Components
import GeneralSettings from '@/components/admin/settings/general-settings'
import BrandingSettings from '@/components/admin/settings/branding-settings'
import SEOSettings from '@/components/admin/settings/seo-settings'
import UploadSettings from '@/components/admin/settings/upload-settings'
import EmailSettings from '@/components/admin/settings/email-settings'

interface SystemSettings {
  id: string
  maxImageSizeMB: number
  maxVideoSizeMB: number
  allowedImageFormats: string
  allowedVideoFormats: string
  maxUploadsPerEvent: number
  autoDeleteAfterDays?: number
  enableVideoUploads: boolean
  enableImageUploads: boolean
  createdAt: string
  updatedAt: string
}

interface SiteSettings {
  id: string
  siteName: string
  siteDescription: string
  siteUrl: string
  supportEmail: string
  adminEmail: string
  language: string
  timezone: string
  currency: string
  logo?: string | null
  favicon?: string | null
  primaryColor: string
  secondaryColor: string
  accentColor?: string
  backgroundColor?: string
  textColor?: string
  metaTitle?: string | null
  metaDescription?: string | null
  metaKeywords?: string | null
  googleAnalyticsId?: string | null
  googleSiteVerification?: string | null
  facebookUrl?: string | null
  twitterUrl?: string | null
  instagramUrl?: string | null
  linkedinUrl?: string | null
  youtubeUrl?: string | null
  smtpHost?: string | null
  smtpPort?: number | null
  smtpUser?: string | null
  smtpPassword?: string | null
  smtpSecure: boolean
  emailFromAddress?: string | null
  emailFromName: string
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  userRegistration: boolean
  emailVerification: boolean
  socialLogin: boolean
  maintenanceMode: boolean
  maintenanceMessage?: string | null
  createdAt: string
  updatedAt: string
}

interface SettingsClientProps {
  initialSystemSettings: SystemSettings
  initialSiteSettings: SiteSettings
}

export default function SettingsClient({ 
  initialSystemSettings, 
  initialSiteSettings 
}: SettingsClientProps) {
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(initialSystemSettings)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSiteSettings)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [hasChanges, setHasChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const { toast } = useToast()

  const updateSystemSettings = async (newSettings: Partial<SystemSettings>) => {
    setLoading(true)
    setHasChanges(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Sistem ayarları güncellenirken bir hata oluştu')
      }

      const updatedSettings = await response.json()
      setSystemSettings(updatedSettings)
      setHasChanges(false)
      setLastSaved(new Date())
      
      toast({
        title: 'Başarılı',
        description: 'Sistem ayarları güncellendi',
      })
    } catch (error) {
      console.error('System settings update error:', error)
      toast({
        title: 'Hata',
        description: error instanceof Error ? error.message : 'Bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateSiteSettings = async (newSettings: Partial<SiteSettings>) => {
    setLoading(true)
    setHasChanges(true)
    try {
      // Convert camelCase to snake_case for API
      const apiData: any = {}
      
      Object.entries(newSettings).forEach(([key, value]) => {
        switch(key) {
          case 'siteName':
            apiData.site_name = value
            break
          case 'siteDescription':
            apiData.site_description = value
            break
          case 'siteUrl':
            apiData.site_url = value
            break
          case 'supportEmail':
            apiData.contact_email = value
            break
          case 'adminEmail':
            apiData.admin_email = value
            break
          case 'logo':
            apiData.site_logo_url = value
            break
          case 'favicon':
            apiData.favicon_url = value
            break
          case 'primaryColor':
            apiData.primary_color = value
            break
          case 'secondaryColor':
            apiData.secondary_color = value
            break
          case 'accentColor':
            apiData.accent_color = value
            break
          case 'backgroundColor':
            apiData.background_color = value
            break
          case 'textColor':
            apiData.text_color = value
            break
          case 'metaTitle':
            apiData.meta_title = value
            break
          case 'metaDescription':
            apiData.meta_description = value
            break
          case 'metaKeywords':
            apiData.meta_keywords = value
            break
          case 'googleAnalyticsId':
            apiData.google_analytics_id = value
            break
          case 'googleSiteVerification':
            apiData.google_site_verification = value
            break
          case 'facebookUrl':
            apiData.social_facebook = value
            break
          case 'twitterUrl':
            apiData.social_twitter = value
            break
          case 'instagramUrl':
            apiData.social_instagram = value
            break
          case 'linkedinUrl':
            apiData.social_linkedin = value
            break
          case 'youtubeUrl':
            apiData.social_youtube = value
            break
          case 'smtpHost':
            apiData.smtp_host = value
            break
          case 'smtpPort':
            apiData.smtp_port = value
            break
          case 'smtpUser':
            apiData.smtp_user = value
            break
          case 'smtpPassword':
            apiData.smtp_password = value
            break
          case 'smtpSecure':
            apiData.smtp_secure = value
            break
          case 'emailFromAddress':
            apiData.email_from_address = value
            break
          case 'emailFromName':
            apiData.email_from_name = value
            break
          case 'emailNotifications':
            apiData.email_notifications = value
            break
          case 'smsNotifications':
            apiData.sms_notifications = value
            break
          case 'pushNotifications':
            apiData.push_notifications = value
            break
          case 'userRegistration':
            apiData.user_registration = value
            break
          case 'emailVerification':
            apiData.email_verification = value
            break
          case 'socialLogin':
            apiData.social_login = value
            break
          case 'maintenanceMode':
            apiData.maintenance_mode = value
            break
          case 'maintenanceMessage':
            apiData.maintenance_message = value
            break
          default:
            apiData[key] = value
        }
      })

      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Site ayarları güncellenirken bir hata oluştu')
      }

      const updatedSettings = await response.json()
      
      // Convert back to camelCase
      const camelCaseSettings: Partial<SiteSettings> = {
        id: updatedSettings.id,
        siteName: updatedSettings.siteName,
        siteDescription: updatedSettings.siteDescription,
        siteUrl: updatedSettings.siteUrl,
        supportEmail: updatedSettings.supportEmail,
        adminEmail: updatedSettings.adminEmail,
        language: updatedSettings.language,
        timezone: updatedSettings.timezone,
        currency: updatedSettings.currency,
        logo: updatedSettings.logo,
        favicon: updatedSettings.favicon,
        primaryColor: updatedSettings.primaryColor,
        secondaryColor: updatedSettings.secondaryColor,
        accentColor: updatedSettings.accentColor,
        backgroundColor: updatedSettings.backgroundColor,
        textColor: updatedSettings.textColor,
        metaTitle: updatedSettings.metaTitle,
        metaDescription: updatedSettings.metaDescription,
        metaKeywords: updatedSettings.metaKeywords,
        googleAnalyticsId: updatedSettings.googleAnalyticsId,
        googleSiteVerification: updatedSettings.googleSiteVerification,
        facebookUrl: updatedSettings.facebookUrl,
        twitterUrl: updatedSettings.twitterUrl,
        instagramUrl: updatedSettings.instagramUrl,
        linkedinUrl: updatedSettings.linkedinUrl,
        youtubeUrl: updatedSettings.youtubeUrl,
        smtpHost: updatedSettings.smtpHost,
        smtpPort: updatedSettings.smtpPort,
        smtpUser: updatedSettings.smtpUser,
        smtpPassword: updatedSettings.smtpPassword,
        smtpSecure: updatedSettings.smtpSecure,
        emailFromAddress: updatedSettings.emailFromAddress,
        emailFromName: updatedSettings.emailFromName,
        emailNotifications: updatedSettings.emailNotifications,
        smsNotifications: updatedSettings.smsNotifications,
        pushNotifications: updatedSettings.pushNotifications,
        userRegistration: updatedSettings.userRegistration,
        emailVerification: updatedSettings.emailVerification,
        socialLogin: updatedSettings.socialLogin,
        maintenanceMode: updatedSettings.maintenanceMode,
        maintenanceMessage: updatedSettings.maintenanceMessage,
        createdAt: updatedSettings.createdAt,
        updatedAt: updatedSettings.updatedAt
      }
      
      setSiteSettings(prev => ({ ...prev, ...camelCaseSettings }))
      setHasChanges(false)
      setLastSaved(new Date())
      
      toast({
        title: 'Başarılı',
        description: 'Site ayarları güncellendi',
      })
      
    } catch (error) {
      console.error('Site settings update error:', error)
      toast({
        title: 'Hata',
        description: error instanceof Error ? error.message : 'Bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSettingsChange = (key: string, value: any) => {
    setHasChanges(true)
    setSiteSettings(prev => ({ ...prev, [key]: value }))
  }

  const saveAllSettings = async () => {
    if (!hasChanges) return
    
    await updateSiteSettings(siteSettings)
  }

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Sistem Ayarları</h1>
          <p className="text-gray-500">Platformunuzun tüm ayarlarını buradan yönetin</p>
        </div>
        
        <div className="flex items-center gap-4">
          {lastSaved && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Son kayıt: {lastSaved.toLocaleTimeString('tr-TR')}</span>
            </div>
          )}
          
          {hasChanges && (
            <Alert className="border-orange-200 bg-orange-50 max-w-sm">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700">
                Kaydedilmemiş değişiklikler var
              </AlertDescription>
            </Alert>
          )}
          
          {loading && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Kaydediliyor...</span>
            </div>
          )}
          
          {hasChanges && (
            <Button onClick={saveAllSettings} disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Genel</TabsTrigger>
          <TabsTrigger value="branding">Marka</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="uploads">Yüklemeler</TabsTrigger>
          <TabsTrigger value="email">E-posta</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Genel Site Ayarları</CardTitle>
              <CardDescription>
                Site bilgileri, iletişim bilgileri ve temel ayarlar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GeneralSettings 
                settings={siteSettings}
                onSettingsChange={handleSettingsChange}
                hasChanges={hasChanges}
                onSave={saveAllSettings}
                saving={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marka ve Tasarım</CardTitle>
              <CardDescription>
                Logo, renkler, tema ve görsel kimlik ayarları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BrandingSettings 
                settings={siteSettings}
                onSettingsChange={handleSettingsChange}
                hasChanges={hasChanges}
                onSave={saveAllSettings}
                saving={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO ve Analitik</CardTitle>
              <CardDescription>
                Arama motoru optimizasyonu ve izleme kodları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SEOSettings 
                settings={siteSettings}
                onSettingsChange={handleSettingsChange}
                hasChanges={hasChanges}
                onSave={saveAllSettings}
                saving={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uploads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dosya Yükleme Ayarları</CardTitle>
              <CardDescription>
                Dosya boyutu, türleri ve depolama ayarları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UploadSettings 
                settings={systemSettings}
                onSettingsChange={(key: string, value: any) => {
                  setHasChanges(true)
                  setSystemSettings(prev => ({ ...prev, [key]: value }))
                }}
                hasChanges={hasChanges}
                onSave={() => updateSystemSettings(systemSettings)}
                saving={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>E-posta Ayarları</CardTitle>
              <CardDescription>
                SMTP yapılandırması ve e-posta bildirimleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailSettings 
                settings={siteSettings}
                onSettingsChange={handleSettingsChange}
                hasChanges={hasChanges}
                onSave={saveAllSettings}
                saving={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
