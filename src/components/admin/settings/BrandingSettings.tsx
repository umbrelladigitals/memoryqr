"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Upload, X } from 'lucide-react'

interface SiteSettings {
  id: number
  site_logo_url: string | null
  favicon_url: string | null
  primary_color: string
  secondary_color: string
  theme_mode: string
  custom_css: string | null
  [key: string]: any
}

interface BrandingSettingsProps {
  settings: SiteSettings
  onUpdate: (settings: Partial<SiteSettings>) => Promise<void>
  loading: boolean
}

export function BrandingSettings({ settings, onUpdate, loading }: BrandingSettingsProps) {
  const [formData, setFormData] = useState({
    site_logo_url: settings?.site_logo_url || '',
    favicon_url: settings?.favicon_url || '',
    primary_color: settings?.primary_color || '#0070f3',
    secondary_color: settings?.secondary_color || '#666666',
    theme_mode: settings?.theme_mode || 'light',
    custom_css: settings?.custom_css || ''
  })

  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)

  // Update form data when settings prop changes
  useEffect(() => {
    setFormData({
      site_logo_url: settings?.site_logo_url || '',
      favicon_url: settings?.favicon_url || '',
      primary_color: settings?.primary_color || '#0070f3',
      secondary_color: settings?.secondary_color || '#666666',
      theme_mode: settings?.theme_mode || 'light',
      custom_css: settings?.custom_css || ''
    })
  }, [settings])

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
    const setUploading = type === 'logo' ? setUploadingLogo : setUploadingFavicon
    const fieldName = type === 'logo' ? 'site_logo_url' : 'favicon_url'
    
    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      
      const response = await fetch('/api/admin/upload-assets', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Dosya yüklenemedi')
      }
      
      const data = await response.json()
      
      setFormData(prev => ({ ...prev, [fieldName]: data.url }))
      
      // Hemen güncelle
      await onUpdate({ [fieldName]: data.url })
      
    } catch (error) {
      console.error('Upload error:', error)
      alert('Dosya yüklenirken bir hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    await onUpdate(formData)
  }

  const removeAsset = async (type: 'logo' | 'favicon') => {
    const fieldName = type === 'logo' ? 'site_logo_url' : 'favicon_url'
    setFormData(prev => ({ ...prev, [fieldName]: '' }))
    await onUpdate({ [fieldName]: null })
  }

  return (
    <div className="space-y-6">
      {/* Logo ve Favicon */}
      <Card>
        <CardHeader>
          <CardTitle>Logo ve Simgeler</CardTitle>
          <CardDescription>Site logosu ve favicon'inizi yükleyin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Site Logo */}
          <div className="space-y-4">
            <Label>Site Logosu</Label>
            {formData.site_logo_url ? (
              <div className="flex items-center space-x-4">
                <img 
                  src={formData.site_logo_url} 
                  alt="Site Logo" 
                  className="h-12 w-auto object-contain border rounded"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeAsset('logo')}
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Kaldır
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Logo yüklemek için tıklayın
                      </span>
                      <input
                        id="logo-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file, 'logo')
                        }}
                        disabled={uploadingLogo}
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG, SVG dosyaları desteklenir
                    </p>
                  </div>
                </div>
              </div>
            )}
            {uploadingLogo && (
              <p className="text-sm text-blue-600">Logo yükleniyor...</p>
            )}
          </div>

          {/* Favicon */}
          <div className="space-y-4">
            <Label>Favicon</Label>
            {formData.favicon_url ? (
              <div className="flex items-center space-x-4">
                <img 
                  src={formData.favicon_url} 
                  alt="Favicon" 
                  className="h-8 w-8 object-contain border rounded"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeAsset('favicon')}
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Kaldır
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="favicon-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Favicon yüklemek için tıklayın
                      </span>
                      <input
                        id="favicon-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file, 'favicon')
                        }}
                        disabled={uploadingFavicon}
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      16x16 veya 32x32 piksel önerilir
                    </p>
                  </div>
                </div>
              </div>
            )}
            {uploadingFavicon && (
              <p className="text-sm text-blue-600">Favicon yükleniyor...</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Renk Paleti */}
      <Card>
        <CardHeader>
          <CardTitle>Renk Paleti</CardTitle>
          <CardDescription>Site renk temasını özelleştirin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Birincil Renk</Label>
              <div className="flex space-x-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => handleInputChange('primary_color', e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => handleInputChange('primary_color', e.target.value)}
                  placeholder="#0070f3"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary_color">İkincil Renk</Label>
              <div className="flex space-x-2">
                <Input
                  id="secondary_color"
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.secondary_color}
                  onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                  placeholder="#666666"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tema Ayarları */}
      <Card>
        <CardHeader>
          <CardTitle>Tema Ayarları</CardTitle>
          <CardDescription>Site tema modunu seçin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme_mode">Tema Modu</Label>
            <Select 
              value={formData.theme_mode} 
              onValueChange={(value) => handleInputChange('theme_mode', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tema modu seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Açık Tema</SelectItem>
                <SelectItem value="dark">Koyu Tema</SelectItem>
                <SelectItem value="system">Sistem Ayarı</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Özel CSS */}
      <Card>
        <CardHeader>
          <CardTitle>Özel CSS</CardTitle>
          <CardDescription>Site görünümünü özelleştirmek için CSS kodları ekleyin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom_css">CSS Kodları</Label>
            <Textarea
              id="custom_css"
              value={formData.custom_css}
              onChange={(e) => handleInputChange('custom_css', e.target.value)}
              placeholder="/* Özel CSS kodlarınızı buraya yazın */"
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              CSS kodları site genelinde uygulanacaktır. Dikkatli kullanın.
            </p>
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
