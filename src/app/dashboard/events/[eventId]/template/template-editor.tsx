'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft,
  Save,
  Eye,
  Upload,
  Palette,
  Image as ImageIcon,
  Users
} from 'lucide-react'
import { toast } from 'sonner'
import { getImageUrl } from '@/lib/image-utils'

interface Template {
  id: string
  name: string
  displayName: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  headerStyle: string
  buttonStyle: string
  cardStyle: string
  heroImage?: string
  logoImage?: string
}

interface Event {
  id: string
  title: string
  description: string | null
  date: Date
  location: string | null
  templateId: string | null
  customColors: any
  customLogo: string | null
  bannerImage: string | null
  qrCode: string
  template?: Template
  customer: {
    id: string
    name: string
    email: string
  }
}

interface TemplateEditorProps {
  event: Event
  templates: Template[]
}

export default function TemplateEditor({ event, templates }: TemplateEditorProps) {
  const router = useRouter()
  const [selectedTemplateId, setSelectedTemplateId] = useState(event.templateId || '')
  const [customColors, setCustomColors] = useState({
    primaryColor: event.customColors?.primaryColor || '',
    secondaryColor: event.customColors?.secondaryColor || '',
    backgroundColor: event.customColors?.backgroundColor || '',
    textColor: event.customColors?.textColor || ''
  })
  const [customLogo, setCustomLogo] = useState(event.customLogo || '')
  const [customBanner, setCustomBanner] = useState(event.bannerImage || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'logo')

      const response = await fetch('/api/templates/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setCustomLogo(data.filePath)
        toast.success('Logo yüklendi')
      } else {
        toast.error('Logo yükleme hatası')
      }
    } catch (error) {
      toast.error('Logo yükleme sırasında hata oluştu')
    }
    setUploading(false)
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'banner')

      const response = await fetch('/api/templates/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setCustomBanner(data.filePath)
        toast.success('Banner yüklendi')
      } else {
        toast.error('Banner yükleme hatası')
      }
    } catch (error) {
      toast.error('Banner yükleme sırasında hata oluştu')
    }
    setUploading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/events/${event.id}/template`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: selectedTemplateId || null,
          customColors,
          customLogo,
          customBanner,
        }),
      })

      if (response.ok) {
        toast.success('Şablon ayarları kaydedildi')
        router.push(`/dashboard/events/${event.id}`)
        router.refresh()
      } else {
        toast.error('Kaydetme hatası')
      }
    } catch (error) {
      toast.error('Kaydetme sırasında hata oluştu')
    }
    setSaving(false)
  }

  const getPreviewStyle = () => {
    const template = selectedTemplate
    if (!template) return {}

    return {
      backgroundColor: customColors.backgroundColor || template.backgroundColor,
      color: customColors.textColor || template.textColor,
    }
  }

  const getPreviewButtonStyle = () => {
    const template = selectedTemplate
    if (!template) return {}

    return {
      backgroundColor: customColors.primaryColor || template.primaryColor,
      color: '#ffffff',
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/dashboard/events/${event.id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Geri
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Şablon Düzenle</h1>
                <p className="text-sm text-gray-600">{event.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href={`/event/${event.qrCode}`} target="_blank">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Önizleme
                </Button>
              </Link>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="space-y-6">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Şablon Seçimi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedTemplateId === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      onClick={() => setSelectedTemplateId(template.id)}
                    >
                      <div
                        className="w-full h-24 rounded mb-2"
                        style={{
                          backgroundColor: template.backgroundColor,
                          background: `linear-gradient(135deg, ${template.primaryColor} 0%, ${template.secondaryColor} 100%)`
                        }}
                      />
                      <p className="text-sm font-medium">{template.displayName}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Color Customization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Renk Özelleştirme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Ana Renk</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={customColors.primaryColor || selectedTemplate?.primaryColor || '#3B82F6'}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={customColors.primaryColor || selectedTemplate?.primaryColor || '#3B82F6'}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, primaryColor: e.target.value }))}
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor">İkincil Renk</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={customColors.secondaryColor || selectedTemplate?.secondaryColor || '#8B5CF6'}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={customColors.secondaryColor || selectedTemplate?.secondaryColor || '#8B5CF6'}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        placeholder="#8B5CF6"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="backgroundColor">Arka Plan Rengi</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={customColors.backgroundColor || selectedTemplate?.backgroundColor || '#F8FAFC'}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={customColors.backgroundColor || selectedTemplate?.backgroundColor || '#F8FAFC'}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        placeholder="#F8FAFC"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="textColor">Metin Rengi</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="textColor"
                        type="color"
                        value={customColors.textColor || selectedTemplate?.textColor || '#1F2937'}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, textColor: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={customColors.textColor || selectedTemplate?.textColor || '#1F2937'}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, textColor: e.target.value }))}
                        placeholder="#1F2937"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logo Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Logo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customLogo && (
                    <div className="flex items-center space-x-4">
                      <img 
                        src={getImageUrl(customLogo)} 
                        alt="Logo" 
                        className="w-16 h-16 object-contain rounded border"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCustomLogo('')}
                      >
                        Kaldır
                      </Button>
                    </div>
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG veya SVG formatında logo yükleyebilirsiniz.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Banner Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Banner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customBanner && (
                    <div className="space-y-2">
                      <img 
                        src={getImageUrl(customBanner)} 
                        alt="Banner" 
                        className="w-full h-32 object-cover rounded border"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCustomBanner('')}
                      >
                        Kaldır
                      </Button>
                    </div>
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      disabled={uploading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Etkinlik banner'ı olarak kullanılacak görseli yükleyebilirsiniz.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Önizleme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="border rounded-lg overflow-hidden"
                  style={getPreviewStyle()}
                >
                  {/* Banner Preview */}
                  {customBanner && (
                    <div className="relative">
                      <img 
                        src={getImageUrl(customBanner)} 
                        alt="Banner" 
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h2 className="text-xl font-bold">{event.title}</h2>
                        {event.description && (
                          <p className="text-sm opacity-90">{event.description}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Header Preview */}
                  <div className="p-6 text-center">
                    {/* Logo Preview */}
                    {!customBanner && customLogo && (
                      <div className="mb-4">
                        <img 
                          src={getImageUrl(customLogo)} 
                          alt="Logo" 
                          className="w-16 h-16 object-contain mx-auto rounded"
                        />
                      </div>
                    )}

                    {/* Title Preview */}
                    {!customBanner && (
                      <>
                        <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
                        {event.description && (
                          <p className="text-sm opacity-75 mb-4">{event.description}</p>
                        )}
                        <p className="text-xs opacity-60 mb-4">
                          📅 {new Date(event.date).toLocaleDateString('tr-TR')}
                          {event.location && ` • 📍 ${event.location}`}
                        </p>
                      </>
                    )}

                    <p className="text-sm opacity-70 mb-4">
                      Etkinlik fotoğraflarınızı yükleyin ve anılarınızı paylaşın
                    </p>

                    {/* Button Preview */}
                    <button
                      className="px-6 py-2 rounded-lg font-semibold text-white"
                      style={getPreviewButtonStyle()}
                    >
                      Fotoğraf Yükle
                    </button>
                  </div>

                  {/* Upload Area Preview */}
                  <div className="p-6 border-t border-opacity-20">
                    <div className="border-2 border-dashed border-opacity-30 rounded-lg p-4 text-center">
                      <Upload className="h-8 w-8 mx-auto opacity-50 mb-2" />
                      <p className="text-sm opacity-75">
                        Fotoğrafları buraya sürükleyin veya seçin
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
