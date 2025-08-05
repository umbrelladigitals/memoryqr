'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  BarChart3, 
  Globe, 
  Save, 
  AlertTriangle,
  ExternalLink,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface SEOSettingsProps {
  settings: any
  onSettingsChange: (key: string, value: any) => void
  hasChanges: boolean
  onSave: () => void
  saving: boolean
}

export default function SEOSettings({ 
  settings, 
  onSettingsChange, 
  hasChanges, 
  onSave, 
  saving 
}: SEOSettingsProps) {
  
  const checkGoogleAnalytics = () => {
    if (settings?.googleAnalyticsId) {
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

  const generateSitemap = async () => {
    try {
      const response = await fetch('/api/admin/generate-sitemap', {
        method: 'POST',
      })
      if (response.ok) {
        window.open('/sitemap.xml', '_blank')
      }
    } catch (error) {
      console.error('Sitemap generation error:', error)
    }
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

      {/* Meta Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Meta Etiketleri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="metaTitle">Meta Başlık</Label>
              <Badge variant="secondary">
                {settings?.metaTitle?.length || 0}/60 karakter
              </Badge>
            </div>
            <Input
              id="metaTitle"
              value={settings?.metaTitle || ''}
              onChange={(e) => onSettingsChange('metaTitle', e.target.value)}
              placeholder="MemoryQR - QR Kod ile Anı Paylaşım Platformu"
              maxLength={60}
            />
            <p className="text-sm text-gray-500">
              Arama motorlarında görünen ana başlık (50-60 karakter önerilir)
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="metaDescription">Meta Açıklama</Label>
              <Badge variant="secondary">
                {settings?.metaDescription?.length || 0}/160 karakter
              </Badge>
            </div>
            <Textarea
              id="metaDescription"
              value={settings?.metaDescription || ''}
              onChange={(e) => onSettingsChange('metaDescription', e.target.value)}
              placeholder="QR kod ile kolayca anılarınızı paylaşın. Etkinlikleriniz için özel QR kodlar oluşturun ve misafirlerinizin fotoğraflarını tek yerde toplayın."
              maxLength={160}
              rows={3}
            />
            <p className="text-sm text-gray-500">
              Arama sonuçlarında görünen açıklama (150-160 karakter önerilir)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaKeywords">Anahtar Kelimeler</Label>
            <Input
              id="metaKeywords"
              value={settings?.metaKeywords || ''}
              onChange={(e) => onSettingsChange('metaKeywords', e.target.value)}
              placeholder="qr kod, fotoğraf paylaşım, etkinlik, anı, düğün, mezuniyet"
            />
            <p className="text-sm text-gray-500">
              Virgülle ayrılmış anahtar kelimeler (5-10 adet önerilir)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Google Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Google Servisleri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
              {checkGoogleAnalytics()}
            </div>
            <Input
              id="googleAnalyticsId"
              value={settings?.googleAnalyticsId || ''}
              onChange={(e) => onSettingsChange('googleAnalyticsId', e.target.value)}
              placeholder="G-XXXXXXXXXX veya UA-XXXXXXXX-X"
            />
            <p className="text-sm text-gray-500">
              GA4 için G-XXXXXXXXXX formatında, Universal Analytics için UA-XXXXXXXX-X formatında
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="googleSiteVerification">Google Site Verification</Label>
            <Input
              id="googleSiteVerification"
              value={settings?.googleSiteVerification || ''}
              onChange={(e) => onSettingsChange('googleSiteVerification', e.target.value)}
              placeholder="google-site-verification meta tag content değeri"
            />
            <p className="text-sm text-gray-500">
              Google Search Console doğrulama kodu
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Google Analytics Dashboard</h4>
              <p className="text-sm text-gray-500">Analytics verilerinizi görüntüleyin</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://analytics.google.com', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Analytics Aç
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sitemap and Robots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Site Haritası ve Robots
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Sitemap.xml</h4>
              <p className="text-sm text-gray-500">
                Arama motorları için site haritası
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={generateSitemap} className="flex-1">
                  Sitemap Oluştur
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.open('/sitemap.xml', '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Robots.txt</h4>
              <p className="text-sm text-gray-500">
                Arama motoru tarama kuralları
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  Robots Düzenle
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.open('/robots.txt', '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* SEO Score */}
          <div className="space-y-3">
            <h4 className="font-medium">SEO Skoru</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">85</div>
                <div className="text-sm text-green-700">Meta Tags</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">70</div>
                <div className="text-sm text-yellow-700">İçerik</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">90</div>
                <div className="text-sm text-blue-700">Teknik</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">80</div>
                <div className="text-sm text-purple-700">Genel</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Meta */}
      <Card>
        <CardHeader>
          <CardTitle>Sosyal Medya Meta Etiketleri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Open Graph */}
            <div className="space-y-4">
              <h4 className="font-medium text-blue-600">Open Graph (Facebook)</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-sm">OG Title</Label>
                  <Input
                    value={settings?.metaTitle || ''}
                    onChange={(e) => onSettingsChange('metaTitle', e.target.value)}
                    placeholder="Facebook'ta görünecek başlık"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">OG Description</Label>
                  <Textarea
                    value={settings?.metaDescription || ''}
                    onChange={(e) => onSettingsChange('metaDescription', e.target.value)}
                    placeholder="Facebook'ta görünecek açıklama"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Twitter Cards */}
            <div className="space-y-4">
              <h4 className="font-medium text-sky-600">Twitter Cards</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-sm">Twitter Title</Label>
                  <Input
                    value={settings?.metaTitle || ''}
                    onChange={(e) => onSettingsChange('metaTitle', e.target.value)}
                    placeholder="Twitter'da görünecek başlık"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Twitter Description</Label>
                  <Textarea
                    value={settings?.metaDescription || ''}
                    onChange={(e) => onSettingsChange('metaDescription', e.target.value)}
                    placeholder="Twitter'da görünecek açıklama"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
