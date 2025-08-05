'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Image, 
  Upload, 
  X, 
  Save, 
  AlertTriangle,
  Palette,
  Eye
} from 'lucide-react'

interface BrandingSettingsProps {
  settings: any
  onSettingsChange: (key: string, value: any) => void
  hasChanges: boolean
  onSave: () => void
  saving: boolean
}

export default function BrandingSettings({ 
  settings, 
  onSettingsChange, 
  hasChanges, 
  onSave, 
  saving 
}: BrandingSettingsProps) {
  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)
  const appleTouchIconInputRef = useRef<HTMLInputElement>(null)
  const ogImageInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File, type: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    try {
      const response = await fetch('/api/admin/upload-assets', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        onSettingsChange(type, result.url)
        toast.success(`${type} başarıyla yüklendi`)
      } else {
        toast.error('Dosya yüklenirken hata oluştu')
      }
    } catch (error) {
      toast.error('Bağlantı hatası')
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Logo dosyası 2MB\'dan küçük olmalıdır')
        return
      }
      handleFileUpload(file, 'logo')
    }
  }

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 500 * 1024) { // 500KB limit
        toast.error('Favicon dosyası 500KB\'dan küçük olmalıdır')
        return
      }
      handleFileUpload(file, 'favicon')
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

      {/* Logo and Icons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Image className="h-5 w-5 mr-2" />
            Logo ve İkonlar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Logo */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Ana Logo</Label>
              <Badge variant="secondary">Önerilen: 200x50px, PNG/SVG</Badge>
            </div>
            <div className="flex items-center space-x-4">
              {settings?.logo && (
                <div className="relative">
                  <img 
                    src={settings.logo} 
                    alt="Logo" 
                    className="h-12 w-auto border rounded"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0"
                    onClick={() => onSettingsChange('logo', null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex-1">
                <Input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {settings?.logo ? 'Logo Değiştir' : 'Logo Yükle'}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Favicon */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Favicon</Label>
              <Badge variant="secondary">32x32px, ICO/PNG</Badge>
            </div>
            <div className="flex items-center space-x-4">
              {settings?.favicon && (
                <div className="relative">
                  <img 
                    src={settings.favicon} 
                    alt="Favicon" 
                    className="h-8 w-8 border rounded"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0"
                    onClick={() => onSettingsChange('favicon', null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex-1">
                <Input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFaviconUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => faviconInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {settings?.favicon ? 'Favicon Değiştir' : 'Favicon Yükle'}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Apple Touch Icon */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Apple Touch Icon</Label>
              <Badge variant="secondary">180x180px, PNG</Badge>
            </div>
            <div className="flex items-center space-x-4">
              {settings?.appleTouchIcon && (
                <div className="relative">
                  <img 
                    src={settings.appleTouchIcon} 
                    alt="Apple Touch Icon" 
                    className="h-12 w-12 border rounded"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0"
                    onClick={() => onSettingsChange('appleTouchIcon', null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex-1">
                <Input
                  ref={appleTouchIconInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleFileUpload(file, 'appleTouchIcon')
                    }
                  }}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => appleTouchIconInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {settings?.appleTouchIcon ? 'Icon Değiştir' : 'Icon Yükle'}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* OG Image */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Sosyal Medya Görseli (OG Image)</Label>
              <Badge variant="secondary">1200x630px, PNG/JPG</Badge>
            </div>
            <div className="flex items-center space-x-4">
              {settings?.ogImage && (
                <div className="relative">
                  <img 
                    src={settings.ogImage} 
                    alt="OG Image" 
                    className="h-16 w-auto border rounded"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0"
                    onClick={() => onSettingsChange('ogImage', null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex-1">
                <Input
                  ref={ogImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleFileUpload(file, 'ogImage')
                    }
                  }}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => ogImageInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {settings?.ogImage ? 'Görsel Değiştir' : 'Görsel Yükle'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            Tema Renkleri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Ana Renk</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings?.primaryColor || '#3B82F6'}
                  onChange={(e) => onSettingsChange('primaryColor', e.target.value)}
                  className="w-12 h-10 p-1 rounded"
                />
                <Input
                  value={settings?.primaryColor || '#3B82F6'}
                  onChange={(e) => onSettingsChange('primaryColor', e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">İkincil Renk</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={settings?.secondaryColor || '#10B981'}
                  onChange={(e) => onSettingsChange('secondaryColor', e.target.value)}
                  className="w-12 h-10 p-1 rounded"
                />
                <Input
                  value={settings?.secondaryColor || '#10B981'}
                  onChange={(e) => onSettingsChange('secondaryColor', e.target.value)}
                  placeholder="#10B981"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor">Vurgu Rengi</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="accentColor"
                  type="color"
                  value={settings?.accentColor || '#F59E0B'}
                  onChange={(e) => onSettingsChange('accentColor', e.target.value)}
                  className="w-12 h-10 p-1 rounded"
                />
                <Input
                  value={settings?.accentColor || '#F59E0B'}
                  onChange={(e) => onSettingsChange('accentColor', e.target.value)}
                  placeholder="#F59E0B"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Arkaplan Rengi</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={settings?.backgroundColor || '#FFFFFF'}
                  onChange={(e) => onSettingsChange('backgroundColor', e.target.value)}
                  className="w-12 h-10 p-1 rounded"
                />
                <Input
                  value={settings?.backgroundColor || '#FFFFFF'}
                  onChange={(e) => onSettingsChange('backgroundColor', e.target.value)}
                  placeholder="#FFFFFF"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="textColor">Metin Rengi</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="textColor"
                  type="color"
                  value={settings?.textColor || '#1F2937'}
                  onChange={(e) => onSettingsChange('textColor', e.target.value)}
                  className="w-12 h-10 p-1 rounded"
                />
                <Input
                  value={settings?.textColor || '#1F2937'}
                  onChange={(e) => onSettingsChange('textColor', e.target.value)}
                  placeholder="#1F2937"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Color Preview */}
          <div className="space-y-2">
            <Label className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Renk Önizleme
            </Label>
            <div 
              className="p-6 rounded-lg border"
              style={{ 
                backgroundColor: settings?.backgroundColor || '#FFFFFF',
                color: settings?.textColor || '#1F2937'
              }}
            >
              <div className="space-y-3">
                <div 
                  className="text-lg font-semibold px-4 py-2 rounded"
                  style={{ backgroundColor: settings?.primaryColor || '#3B82F6', color: 'white' }}
                >
                  Ana Renk Örneği
                </div>
                <div 
                  className="text-sm px-4 py-2 rounded"
                  style={{ backgroundColor: settings?.secondaryColor || '#10B981', color: 'white' }}
                >
                  İkincil Renk Örneği
                </div>
                <div 
                  className="text-sm px-4 py-2 rounded"
                  style={{ backgroundColor: settings?.accentColor || '#F59E0B', color: 'white' }}
                >
                  Vurgu Rengi Örneği
                </div>
                <p style={{ color: settings?.textColor || '#1F2937' }}>
                  Bu metin renk örneğidir. Site genelinde bu renk kullanılacaktır.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
