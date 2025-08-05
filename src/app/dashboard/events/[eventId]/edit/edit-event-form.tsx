'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  MapPin, 
  Palette,
  Heart,
  Cake,
  Building,
  Baby,
  Crown,
  Star,
  ArrowLeft,
  Save,
  Trash2,
  QrCode,
  Upload,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Template {
  id: string
  name: string
  displayName: string
  description: string
  primaryColor: string
}

interface Event {
  id: string
  title: string
  description: string | null
  date: Date
  location: string | null
  qrCode: string
  eventType?: string | null
  participants?: any
  maxUploads?: number | null
  autoArchive?: boolean
  archiveDate?: Date | null
  customColors?: any
  customMessage?: string | null
  bannerImage?: string | null
  customLogo?: string | null
  customStyles?: any
  selectedTemplate?: string | null
  isActive: boolean
  customer: {
    name: string
  }
}

interface EditEventFormProps {
  event: Event
}

const eventTypeConfig = {
  wedding: {
    name: 'Düğün',
    icon: Heart,
    color: '#f472b6'
  },
  engagement: {
    name: 'Nişan', 
    icon: Crown,
    color: '#a855f7'
  },
  birthday: {
    name: 'Doğum Günü',
    icon: Cake,
    color: '#f97316'
  },
  baby_shower: {
    name: 'Baby Shower',
    icon: Baby,
    color: '#3b82f6'
  },
  corporate: {
    name: 'Kurumsal Etkinlik',
    icon: Building,
    color: '#6b7280'
  },
  other: {
    name: 'Diğer',
    icon: Star,
    color: '#6366f1'
  }
}

export default function EditEventForm({ event }: EditEventFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description || '',
    date: new Date(event.date).toISOString().slice(0, 16),
    location: event.location || '',
    eventType: event.eventType || '',
    participants: event.participants || {
      bride: '',
      groom: '',
      celebrant: '',
      organizer: '',
      parents: ''
    },
    maxUploads: event.maxUploads || '',
    autoArchive: event.autoArchive || false,
    archiveDate: event.archiveDate ? new Date(event.archiveDate).toISOString().slice(0, 16) : '',
    customMessage: event.customMessage || '',
    bannerImage: event.bannerImage || '',
    customLogo: event.customLogo || '',
    selectedTemplate: event.selectedTemplate || '',
    isActive: event.isActive
  })

  const router = useRouter()

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
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
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          participants: formData.participants,
          maxUploads: formData.maxUploads ? parseInt(formData.maxUploads as string) : null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Etkinlik başarıyla güncellendi!')
        router.push('/dashboard/events')
      } else {
        toast.error(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      toast.error('Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Etkinlik başarıyla silindi!')
        router.push('/dashboard/events')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Silme işlemi başarısız')
      }
    } catch (error) {
      toast.error('Bir hata oluştu')
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleParticipantChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      participants: { ...prev.participants, [field]: value }
    }))
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

  const getParticipantsText = () => {
    if (!formData.participants) return ''
    
    const participants = formData.participants
    if (formData.eventType === 'wedding' || formData.eventType === 'engagement') {
      return `${participants.bride || ''} & ${participants.groom || ''}`.trim()
    } else if (formData.eventType === 'birthday') {
      return participants.celebrant || ''
    } else if (formData.eventType === 'baby_shower') {
      return participants.parents || ''
    }
    return participants.organizer || ''
  }

  const eventConfig = eventTypeConfig[formData.eventType as keyof typeof eventTypeConfig] || eventTypeConfig.other
  const IconComponent = eventConfig.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/events">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Etkinliklere Dön
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Etkinlik Düzenle</h1>
            <p className="text-gray-600">Etkinlik bilgilerini güncelleyin</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link href={`/dashboard/events/${event.id}/qr`}>
            <Button variant="outline" size="sm">
              <QrCode className="h-4 w-4 mr-2" />
              QR Kod
            </Button>
          </Link>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Sil
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span>Etkinliği Sil</span>
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Bu etkinliği silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve 
                  etkinlikle ilgili tüm fotoğraflar da silinecektir.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Evet, Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Event Preview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <IconComponent className="h-6 w-6" style={{ color: eventConfig.color }} />
              <div>
                <CardTitle>{formData.title || 'Etkinlik Adı'}</CardTitle>
                <CardDescription>
                  {getParticipantsText() && `${getParticipantsText()} • `}
                  QR Kod: {event.qrCode}
                </CardDescription>
              </div>
            </div>
            <Badge variant={formData.isActive ? "default" : "secondary"}>
              {formData.isActive ? 'Aktif' : 'Pasif'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Temel Bilgiler</CardTitle>
              <CardDescription>
                Etkinliğinizin genel bilgilerini düzenleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleChange('isActive', checked)}
                />
                <Label htmlFor="isActive">
                  Etkinlik aktif (Fotoğraf yükleme {formData.isActive ? 'açık' : 'kapalı'})
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle>Katılımcı Bilgileri</CardTitle>
              <CardDescription>
                QR kod kartlarında görünecek isimler
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Event Type Selection */}
              <div className="space-y-2">
                <Label>Etkinlik Türü</Label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(eventTypeConfig).map(([key, config]) => {
                    const Icon = config.icon
                    const isSelected = formData.eventType === key
                    
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleChange('eventType', key)}
                        className={`p-3 border rounded-lg text-center transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div 
                          className="w-8 h-8 rounded mx-auto mb-2 flex items-center justify-center"
                          style={{ backgroundColor: config.color }}
                        >
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-xs font-medium text-gray-900">
                          {config.name}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Dynamic participant fields based on event type */}
              {formData.eventType && (
                <div className="space-y-2">
                  {(formData.eventType === 'wedding' || formData.eventType === 'engagement') && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Gelin adı"
                        value={formData.participants.bride}
                        onChange={(e) => handleParticipantChange('bride', e.target.value)}
                      />
                      <Input
                        placeholder="Damat adı"
                        value={formData.participants.groom}
                        onChange={(e) => handleParticipantChange('groom', e.target.value)}
                      />
                    </div>
                  )}
                  
                  {formData.eventType === 'birthday' && (
                    <Input
                      placeholder="Doğum günü sahibi"
                      value={formData.participants.celebrant}
                      onChange={(e) => handleParticipantChange('celebrant', e.target.value)}
                    />
                  )}
                  
                  {formData.eventType === 'baby_shower' && (
                    <Input
                      placeholder="Anne & Baba adı"
                      value={formData.participants.parents}
                      onChange={(e) => handleParticipantChange('parents', e.target.value)}
                    />
                  )}
                  
                  {(formData.eventType === 'corporate' || formData.eventType === 'other') && (
                    <Input
                      placeholder="Etkinlik organizatörü"
                      value={formData.participants.organizer}
                      onChange={(e) => handleParticipantChange('organizer', e.target.value)}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Şablon ve Tasarım</CardTitle>
              <CardDescription>
                Etkinlik sayfasının görünümünü belirleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Şablon Seçimi</Label>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map((template) => {
                    const IconComponent = getTemplateIcon(template.name)
                    const isSelected = formData.selectedTemplate === template.id
                    
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => handleChange('selectedTemplate', template.id)}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="customMessage">Özel Mesaj</Label>
                <Textarea
                  id="customMessage"
                  value={formData.customMessage}
                  onChange={(e) => handleChange('customMessage', e.target.value)}
                  placeholder="Misafirlerinize özel bir mesaj..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Ayarlar</CardTitle>
              <CardDescription>
                Etkinlik limitleri ve arşivleme ayarları
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxUploads">Maksimum Yükleme Sayısı</Label>
                <Input
                  id="maxUploads"
                  type="number"
                  value={formData.maxUploads}
                  onChange={(e) => handleChange('maxUploads', e.target.value)}
                  placeholder="Sınırsız için boş bırakın"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoArchive"
                  checked={formData.autoArchive}
                  onCheckedChange={(checked) => handleChange('autoArchive', checked)}
                />
                <Label htmlFor="autoArchive">Otomatik arşivleme</Label>
              </div>

              {formData.autoArchive && (
                <div className="space-y-2">
                  <Label htmlFor="archiveDate">Arşivleme Tarihi</Label>
                  <Input
                    id="archiveDate"
                    type="datetime-local"
                    value={formData.archiveDate}
                    onChange={(e) => handleChange('archiveDate', e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Media */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Medya</CardTitle>
              <CardDescription>
                Logo ve banner görselleri yükleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                </div>
              </div>

              <div className="border-t pt-6" />

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
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={isLoading} size="lg">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Güncelleniyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Değişiklikleri Kaydet
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
