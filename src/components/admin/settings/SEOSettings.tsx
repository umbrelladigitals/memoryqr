"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface SiteSettings {
  id: number
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string | null
  google_analytics_id: string | null
  google_tag_manager_id: string | null
  facebook_pixel_id: string | null
  social_facebook: string | null
  social_twitter: string | null
  social_instagram: string | null
  social_linkedin: string | null
  [key: string]: any
}

interface SEOSettingsProps {
  settings: SiteSettings
  onUpdate: (settings: Partial<SiteSettings>) => Promise<void>
  loading: boolean
}

export function SEOSettings({ settings, onUpdate, loading }: SEOSettingsProps) {
  const [formData, setFormData] = useState({
    meta_title: settings?.meta_title || '',
    meta_description: settings?.meta_description || '',
    meta_keywords: settings?.meta_keywords || '',
    google_analytics_id: settings?.google_analytics_id || '',
    google_tag_manager_id: settings?.google_tag_manager_id || '',
    facebook_pixel_id: settings?.facebook_pixel_id || '',
    social_facebook: settings?.social_facebook || '',
    social_twitter: settings?.social_twitter || '',
    social_instagram: settings?.social_instagram || '',
    social_linkedin: settings?.social_linkedin || ''
  })

  // Update form data when settings prop changes
  useEffect(() => {
    setFormData({
      meta_title: settings?.meta_title || '',
      meta_description: settings?.meta_description || '',
      meta_keywords: settings?.meta_keywords || '',
      google_analytics_id: settings?.google_analytics_id || '',
      google_tag_manager_id: settings?.google_tag_manager_id || '',
      facebook_pixel_id: settings?.facebook_pixel_id || '',
      social_facebook: settings?.social_facebook || '',
      social_twitter: settings?.social_twitter || '',
      social_instagram: settings?.social_instagram || '',
      social_linkedin: settings?.social_linkedin || ''
    })
  }, [settings])

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    await onUpdate(formData)
  }

  return (
    <div className="space-y-6">
      {/* Meta Etiketleri */}
      <Card>
        <CardHeader>
          <CardTitle>Meta Etiketleri</CardTitle>
          <CardDescription>Arama motorları için meta bilgiler</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meta_title">Meta Başlık</Label>
            <Input
              id="meta_title"
              value={formData.meta_title}
              onChange={(e) => handleInputChange('meta_title', e.target.value)}
              placeholder="Site başlığı (50-60 karakter önerilir)"
              maxLength={60}
            />
            <p className="text-xs text-gray-500">
              {formData.meta_title.length}/60 karakter
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="meta_description">Meta Açıklama</Label>
            <Textarea
              id="meta_description"
              value={formData.meta_description}
              onChange={(e) => handleInputChange('meta_description', e.target.value)}
              placeholder="Site açıklaması (150-160 karakter önerilir)"
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-gray-500">
              {formData.meta_description.length}/160 karakter
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta_keywords">Meta Anahtar Kelimeler</Label>
            <Input
              id="meta_keywords"
              value={formData.meta_keywords}
              onChange={(e) => handleInputChange('meta_keywords', e.target.value)}
              placeholder="anahtar kelime 1, anahtar kelime 2, anahtar kelime 3"
            />
            <p className="text-xs text-gray-500">
              Anahtar kelimeleri virgülle ayırın
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Analytics ve İzleme */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics ve İzleme</CardTitle>
          <CardDescription>Web analitik ve izleme kodları</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
            <Input
              id="google_analytics_id"
              value={formData.google_analytics_id}
              onChange={(e) => handleInputChange('google_analytics_id', e.target.value)}
              placeholder="G-XXXXXXXXXX"
            />
            <p className="text-xs text-gray-500">
              Google Analytics 4 ölçüm kimliği
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="google_tag_manager_id">Google Tag Manager ID</Label>
            <Input
              id="google_tag_manager_id"
              value={formData.google_tag_manager_id}
              onChange={(e) => handleInputChange('google_tag_manager_id', e.target.value)}
              placeholder="GTM-XXXXXXX"
            />
            <p className="text-xs text-gray-500">
              Google Tag Manager container ID
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebook_pixel_id">Facebook Pixel ID</Label>
            <Input
              id="facebook_pixel_id"
              value={formData.facebook_pixel_id}
              onChange={(e) => handleInputChange('facebook_pixel_id', e.target.value)}
              placeholder="123456789012345"
            />
            <p className="text-xs text-gray-500">
              Facebook reklam piksel kimliği
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sosyal Medya */}
      <Card>
        <CardHeader>
          <CardTitle>Sosyal Medya Hesapları</CardTitle>
          <CardDescription>Sosyal medya profil bağlantıları</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="social_facebook">Facebook</Label>
              <Input
                id="social_facebook"
                value={formData.social_facebook}
                onChange={(e) => handleInputChange('social_facebook', e.target.value)}
                placeholder="https://facebook.com/sayfa-adiniz"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="social_twitter">Twitter/X</Label>
              <Input
                id="social_twitter"
                value={formData.social_twitter}
                onChange={(e) => handleInputChange('social_twitter', e.target.value)}
                placeholder="https://twitter.com/kullanici-adiniz"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="social_instagram">Instagram</Label>
              <Input
                id="social_instagram"
                value={formData.social_instagram}
                onChange={(e) => handleInputChange('social_instagram', e.target.value)}
                placeholder="https://instagram.com/kullanici-adiniz"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="social_linkedin">LinkedIn</Label>
              <Input
                id="social_linkedin"
                value={formData.social_linkedin}
                onChange={(e) => handleInputChange('social_linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/sirket-adiniz"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Önizleme */}
      <Card>
        <CardHeader>
          <CardTitle>Arama Sonucu Önizlemesi</CardTitle>
          <CardDescription>Google arama sonuçlarında nasıl görüneceğinin önizlemesi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="text-lg text-blue-600 hover:underline cursor-pointer">
              {formData.meta_title || 'Site Başlığı'}
            </div>
            <div className="text-green-600 text-sm">
              example.com
            </div>
            <div className="text-gray-600 text-sm mt-1">
              {formData.meta_description || 'Site açıklaması burada görünecek...'}
            </div>
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
