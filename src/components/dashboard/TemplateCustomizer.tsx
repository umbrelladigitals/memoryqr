'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Palette, 
  Save, 
  X, 
  Eye,
  Upload,
  Loader2
} from 'lucide-react'

interface UploadTemplate {
  id: string
  name: string
  displayName: string
  description: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  headerStyle: string
  buttonStyle: string
  cardStyle: string
  isDefault: boolean
  heroImage?: string
  logoImage?: string
}

interface TemplateCustomizerProps {
  template: UploadTemplate
  onSave: (customizedTemplate: UploadTemplate) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function TemplateCustomizer({ 
  template, 
  onSave, 
  onCancel, 
  isLoading = false 
}: TemplateCustomizerProps) {
  const [customTemplate, setCustomTemplate] = useState<UploadTemplate>(template)

  const updateTemplate = (updates: Partial<UploadTemplate>) => {
    setCustomTemplate(prev => ({ ...prev, ...updates }))
  }

  const handleSave = () => {
    onSave(customTemplate)
  }

  const getPreviewStyle = () => ({
    backgroundColor: customTemplate.backgroundColor,
    color: customTemplate.textColor,
    borderColor: customTemplate.primaryColor
  })

  const getButtonStyle = () => ({
    backgroundColor: customTemplate.primaryColor,
    color: 'white'
  })

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Customization Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Şablon Özelleştirme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Temel Bilgiler</h3>
                
                <div>
                  <Label htmlFor="displayName">Şablon Adı</Label>
                  <Input
                    id="displayName"
                    value={customTemplate.displayName}
                    onChange={(e) => updateTemplate({ displayName: e.target.value })}
                    placeholder="Örn: Benim Düğün Teması"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    value={customTemplate.description}
                    onChange={(e) => updateTemplate({ description: e.target.value })}
                    placeholder="Şablonunuz hakkında kısa bir açıklama"
                    rows={2}
                  />
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Renkler</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Ana Renk</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={customTemplate.primaryColor}
                        onChange={(e) => updateTemplate({ primaryColor: e.target.value })}
                        className="w-12 h-10 p-1 border rounded"
                      />
                      <Input
                        value={customTemplate.primaryColor}
                        onChange={(e) => updateTemplate({ primaryColor: e.target.value })}
                        placeholder="#3B82F6"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondaryColor">İkincil Renk</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={customTemplate.secondaryColor}
                        onChange={(e) => updateTemplate({ secondaryColor: e.target.value })}
                        className="w-12 h-10 p-1 border rounded"
                      />
                      <Input
                        value={customTemplate.secondaryColor}
                        onChange={(e) => updateTemplate({ secondaryColor: e.target.value })}
                        placeholder="#8B5CF6"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="backgroundColor">Arkaplan Rengi</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={customTemplate.backgroundColor}
                        onChange={(e) => updateTemplate({ backgroundColor: e.target.value })}
                        className="w-12 h-10 p-1 border rounded"
                      />
                      <Input
                        value={customTemplate.backgroundColor}
                        onChange={(e) => updateTemplate({ backgroundColor: e.target.value })}
                        placeholder="#F8FAFC"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="textColor">Yazı Rengi</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="textColor"
                        type="color"
                        value={customTemplate.textColor}
                        onChange={(e) => updateTemplate({ textColor: e.target.value })}
                        className="w-12 h-10 p-1 border rounded"
                      />
                      <Input
                        value={customTemplate.textColor}
                        onChange={(e) => updateTemplate({ textColor: e.target.value })}
                        placeholder="#1F2937"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Style Options */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Stil Seçenekleri</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Header Stili</Label>
                    <select
                      value={customTemplate.headerStyle}
                      onChange={(e) => updateTemplate({ headerStyle: e.target.value })}
                      className="w-full mt-1 p-2 border rounded-md"
                    >
                      <option value="minimal">Minimal</option>
                      <option value="gradient">Gradient</option>
                      <option value="image">Resimli</option>
                    </select>
                  </div>

                  <div>
                    <Label>Buton Stili</Label>
                    <select
                      value={customTemplate.buttonStyle}
                      onChange={(e) => updateTemplate({ buttonStyle: e.target.value })}
                      className="w-full mt-1 p-2 border rounded-md"
                    >
                      <option value="rounded">Yuvarlatılmış</option>
                      <option value="square">Kare</option>
                      <option value="pill">Hap Şekli</option>
                    </select>
                  </div>

                  <div>
                    <Label>Kart Stili</Label>
                    <select
                      value={customTemplate.cardStyle}
                      onChange={(e) => updateTemplate({ cardStyle: e.target.value })}
                      className="w-full mt-1 p-2 border rounded-md"
                    >
                      <option value="shadow">Gölgeli</option>
                      <option value="border">Çerçeveli</option>
                      <option value="glass">Cam Efekti</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Logo Upload */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Logo</h3>
                
                <div>
                  <Label htmlFor="logoImage">Logo URL</Label>
                  <Input
                    id="logoImage"
                    value={customTemplate.logoImage || ''}
                    onChange={(e) => updateTemplate({ logoImage: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Logo URL'si girin veya dosya yükleme özelliği yakında eklenecek
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t">
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Kaydet
                </Button>
                
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  İptal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Önizleme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="p-6 rounded-lg border-2 min-h-96"
                style={getPreviewStyle()}
              >
                {/* Header Preview */}
                <div className={`p-4 mb-4 rounded ${
                  customTemplate.headerStyle === 'gradient' 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white' 
                    : customTemplate.headerStyle === 'image'
                    ? 'bg-gray-200'
                    : 'border-b'
                }`}>
                  <div className="text-center">
                    {customTemplate.logoImage && (
                      <div className="mb-4">
                        <img 
                          src={customTemplate.logoImage} 
                          alt="Logo" 
                          className="w-16 h-16 object-contain mx-auto rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    <h1 className="text-2xl font-bold mb-2">
                      Örnek Etkinlik Başlığı
                    </h1>
                    <p className="opacity-90">
                      Bu bir örnek açıklamadır
                    </p>
                    <p className="text-sm opacity-75 mt-2">
                      📅 25 Temmuz 2024 • 📍 İstanbul
                    </p>
                  </div>
                </div>

                {/* Upload Area Preview */}
                <div className="text-center">
                  <p className="text-sm opacity-75 mb-4">
                    0 fotoğraf yüklenmiş
                  </p>
                  
                  <div className={`
                    border-2 border-dashed p-8 rounded-lg mb-4
                    ${customTemplate.cardStyle === 'shadow' ? 'shadow-lg' : ''}
                    ${customTemplate.cardStyle === 'border' ? 'border-gray-300' : ''}
                    ${customTemplate.cardStyle === 'glass' ? 'backdrop-blur-sm bg-white/10' : 'bg-white'}
                  `}>
                    <Upload className="w-12 h-12 mx-auto mb-4 opacity-60" />
                    <h3 className="text-lg font-semibold mb-2">
                      Fotoğraf Yükleyin
                    </h3>
                    <p className="text-sm opacity-75 mb-4">
                      Dosyalarınızı sürükleyip bırakın veya seçmek için tıklayın
                    </p>
                    <button
                      className={`
                        px-6 py-3 text-white font-medium transition-all
                        ${customTemplate.buttonStyle === 'rounded' ? 'rounded-xl' : ''}
                        ${customTemplate.buttonStyle === 'square' ? 'rounded-none' : ''}
                        ${customTemplate.buttonStyle === 'pill' ? 'rounded-full' : ''}
                        ${customTemplate.buttonStyle === 'default' ? 'rounded-lg' : ''}
                      `}
                      style={getButtonStyle()}
                    >
                      Fotoğraf Yükle
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
