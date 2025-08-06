'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Calendar, 
  MapPin, 
  Palette,
  Heart,
  Cake,
  Building
} from 'lucide-react'
import { toast } from 'sonner'
import { eventTypeConfig } from '@/lib/eventTypeConfig'

interface Template {
  id: string
  name: string
  displayName: string
  description: string
  primaryColor: string
}

interface CreateEventDialogProps {
  isOpen: boolean
  onClose: () => void
  customerId: string
}

export default function CreateEventDialog({ isOpen, onClose, customerId }: CreateEventDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    templateId: '',
    customLogo: '',
    bannerImage: '',
    eventType: '',
    participants: {}
  })
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen])

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
        // Set default template
        const defaultTemplate = data.templates?.find((t: Template) => t.name === 'wedding')
        if (defaultTemplate) {
          setFormData(prev => ({ 
            ...prev, 
            templateId: defaultTemplate.id,
            eventType: defaultTemplate.name 
          }))
        }
      }
    } catch (error) {
      console.error('Template loading error:', error)
    }
  }

  const getTemplateIcon = (name: string) => {
    switch (name) {
      case 'wedding': return Heart
      case 'birthday': return Cake
      case 'corporate': return Building
      default: return Palette
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          customerId,
          participants: formData.participants,
          eventType: formData.eventType || 'other'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Etkinlik başarıyla oluşturuldu!')
        onClose()
        setFormData({ 
          title: '', 
          description: '', 
          date: '', 
          location: '',
          templateId: '',
          customLogo: '',
          bannerImage: '',
          eventType: '',
          participants: {}
        })
        router.refresh()
      } else {
        // Handle specific authentication errors
        if (response.status === 403 && data.error?.includes('login again')) {
          toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.')
          // Redirect to login page
          window.location.href = '/auth/signin'
        } else if (response.status === 401) {
          toast.error('Yetkiniz yok. Lütfen giriş yapın.')
          window.location.href = '/auth/signin'
        } else {
          toast.error(data.error || 'Bir hata oluştu')
        }
      }
    } catch (error) {
      toast.error('Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

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
        handleChange('customLogo', data.filePath)
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
        handleChange('bannerImage', data.filePath)
        toast.success('Banner yüklendi')
      } else {
        toast.error('Banner yükleme hatası')
      }
    } catch (error) {
      toast.error('Banner yükleme sırasında hata oluştu')
    }
    setUploading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Etkinlik Oluştur</DialogTitle>
          <DialogDescription>
            Etkinliğinizi oluşturun ve QR kodunuzu alın
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Etkinlik Adı *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Düğün, Doğum Günü, vs."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Etkinlik hakkında kısa bilgi..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Etkinlik Tarihi *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="date"
                type="datetime-local"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Şablon Seçimi</Label>
            <div className="grid grid-cols-3 gap-2">
              {templates.map((template) => {
                const IconComponent = getTemplateIcon(template.name)
                const isSelected = formData.templateId === template.id
                
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => {
                      handleChange('templateId', template.id)
                      setFormData(prev => ({ ...prev, eventType: template.name }))
                    }}
                    className={`p-3 border rounded-lg text-center transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded mx-auto mb-2 flex items-center justify-center"
                      style={{ backgroundColor: template.primaryColor }}
                    >
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xs font-medium text-gray-900">
                      {template.displayName}
                    </div>
                  </button>
                )
              })}
            </div>
            {formData.templateId && (
              <p className="text-xs text-gray-600">
                {templates.find(t => t.id === formData.templateId)?.description}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Konum</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Etkinlik konumu"
                className="pl-10"
              />
            </div>
          </div>

          {/* Participants based on event type */}
          {formData.templateId && (
            <div className="space-y-2">
              <Label>Özel Bilgiler</Label>
              {(() => {
                const selectedTemplate = templates.find(t => t.id === formData.templateId);
                const templateName = selectedTemplate?.name as keyof typeof eventTypeConfig;
                const eventConfig = eventTypeConfig[templateName];
                
                if (!eventConfig || !eventConfig.specialFields) {
                  return null;
                }

                return (
                  <div className="space-y-3">
                    {eventConfig.specialFields.map((field) => (
                      <div key={field.key} className="space-y-1">
                        <Label className="text-sm flex items-center gap-2">
                          <span>{field.icon}</span>
                          {field.label}
                        </Label>
                        <Input
                          placeholder={field.label}
                          value={formData.participants[field.key] || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            participants: { ...prev.participants, [field.key]: e.target.value }
                          }))}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                );
              })()}
              <p className="text-xs text-gray-500">
                Bu bilgiler QR kod kartlarında özel tasarımla görünecektir.
              </p>
            </div>
          )}

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo">Logo (Opsiyonel)</Label>
            <div className="space-y-2">
              {formData.customLogo && (
                <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                  <img 
                    src={`/api/images/${encodeURIComponent(formData.customLogo)}`}
                    alt="Logo" 
                    className="w-12 h-12 object-contain rounded border"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Logo yüklendi</p>
                    <p className="text-xs text-gray-500">Etkinlik sayfasında görünecek</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleChange('customLogo', '')}
                  >
                    Kaldır
                  </Button>
                </div>
              )}
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500">
                PNG, JPG veya SVG formatında logo yükleyebilirsiniz.
              </p>
            </div>
          </div>

          {/* Banner Upload */}
          <div className="space-y-2">
            <Label htmlFor="banner">Banner (Opsiyonel)</Label>
            <div className="space-y-2">
              {formData.bannerImage && (
                <div className="space-y-2">
                  <img 
                    src={`/api/images/${encodeURIComponent(formData.bannerImage)}`}
                    alt="Banner" 
                    className="w-full h-24 object-cover rounded border"
                  />
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Banner yüklendi</p>
                      <p className="text-xs text-gray-500">Etkinlik sayfasının üst kısmında görünecek</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleChange('bannerImage', '')}
                    >
                      Kaldır
                    </Button>
                  </div>
                </div>
              )}
              <Input
                id="banner"
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                disabled={uploading}
                className="file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500">
                Etkinlik banner'ı olarak kullanılacak görseli yükleyebilirsiniz.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Oluşturuluyor...' : 'Oluştur'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
