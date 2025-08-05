'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar, 
  MapPin, 
  QrCode, 
  Palette, 
  Settings, 
  Eye, 
  Save, 
  Upload,
  Image as ImageIcon,
  Clock,
  Users,
  Download,
  Share2,
  Sparkles,
  Wand2,
  Heart,
  Camera,
  Monitor,
  Smartphone,
  Star,
  Play,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Filter,
  Search,
  X
} from 'lucide-react'
import { toast } from 'sonner'

interface Template {
  id: string
  name: string
  displayName: string
  description: string
  previewImage: string
  heroImage?: string
  logoImage?: string
  galleryImages?: string[]
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  headerStyle: string
  buttonStyle: string
  cardStyle: string
  customCSS?: string
  animations?: any
  layout?: any
  fonts?: any
  isDefault: boolean
  category: 'wedding' | 'birthday' | 'corporate' | 'party' | 'other'
  tags: string[]
  features: string[]
  popularity: number
}

interface EventFormData {
  title: string
  description: string
  date: string
  location: string
  maxUploads: number | null
  autoArchive: boolean
  archiveDate: string
  templateId: string
  eventType: string
  participants: {
    bride?: string
    groom?: string
    celebrant?: string
    parents?: string
    organizer?: string
  }
  customColors: {
    primary: string
    secondary: string
    background: string
  }
  customMessage: string
  bannerImage: string
  isActive: boolean
}

export default function CreateEventPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [qrPreview, setQrPreview] = useState<string>('')
  const [step, setStep] = useState(1)
  const [progress, setProgress] = useState(25)
  
  // Template preview states
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile')
  const [templateFilter, setTemplateFilter] = useState<'all' | 'wedding' | 'birthday' | 'corporate' | 'party' | 'other'>('all')
  const [templateSearch, setTemplateSearch] = useState('')
  const [showTemplatePreview, setShowTemplatePreview] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [sortBy, setSortBy] = useState<'popularity' | 'name' | 'category'>('popularity')
  const [selectedColorPalette, setSelectedColorPalette] = useState<string>('default')
  const [customBannerImage, setCustomBannerImage] = useState<string>('')

  // Önceden tanımlı renk paletleri
  const colorPalettes = [
    {
      id: 'default',
      name: 'Varsayılan',
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      background: '#F8FAFC'
    },
    {
      id: 'elegant-purple',
      name: 'Zarif Mor',
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      background: '#FAFAFA'
    },
    {
      id: 'emerald-green',
      name: 'Zümrüt Yeşil',
      primary: '#10B981',
      secondary: '#34D399',
      background: '#FFFFFF'
    },
    {
      id: 'sunset-orange',
      name: 'Gün Batımı',
      primary: '#F59E0B',
      secondary: '#FBBF24',
      background: '#FEF3C7'
    },
    {
      id: 'romantic-pink',
      name: 'Romantik Pembe',
      primary: '#EC4899',
      secondary: '#F472B6',
      background: '#FDF2F8'
    },
    {
      id: 'ocean-blue',
      name: 'Okyanus Mavi',
      primary: '#0EA5E9',
      secondary: '#38BDF8',
      background: '#F0F9FF'
    },
    {
      id: 'luxury-gold',
      name: 'Lüks Altın',
      primary: '#F59E0B',
      secondary: '#D97706',
      background: '#1F2937'
    }
  ]

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    location: '',
    maxUploads: null,
    autoArchive: true,
    archiveDate: '',
    templateId: '',
    eventType: 'other',
    participants: {},
    customColors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      background: '#F8FAFC'
    },
    customMessage: '',
    bannerImage: '',
    isActive: true
  })

  // Load templates
  useEffect(() => {
    loadTemplates()
  }, [])

  // Filter and sort templates
  const filteredTemplates = templates
    .filter(template => {
      const matchesCategory = templateFilter === 'all' || template.category === templateFilter
      const matchesSearch = template.displayName.toLowerCase().includes(templateSearch.toLowerCase()) ||
                           template.description.toLowerCase().includes(templateSearch.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(templateSearch.toLowerCase()))
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.displayName.localeCompare(b.displayName)
        case 'category':
          return a.category.localeCompare(b.category)
        case 'popularity':
        default:
          return b.popularity - a.popularity
      }
    })

  const handleTemplatePreview = (template: Template) => {
    setPreviewTemplate(template)
    setShowTemplatePreview(true)
  }

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
    setFormData(prev => ({
      ...prev,
      templateId: template.id,
      customColors: {
        primary: template.primaryColor,
        secondary: template.secondaryColor,
        background: template.backgroundColor
      }
    }))
    setShowTemplatePreview(false)
  }

  const handleColorPaletteSelect = (paletteId: string) => {
    const palette = colorPalettes.find(p => p.id === paletteId)
    if (palette) {
      setSelectedColorPalette(paletteId)
      setFormData(prev => ({
        ...prev,
        customColors: {
          primary: palette.primary,
          secondary: palette.secondary,
          background: palette.background
        }
      }))
    }
  }

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Dosya boyut kontrolü (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır.')
        return
      }

      // Dosya türü kontrolü
      if (!file.type.startsWith('image/')) {
        toast.error('Lütfen geçerli bir resim dosyası seçin.')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setCustomBannerImage(result)
        setFormData(prev => ({ ...prev, bannerImage: result }))
        toast.success('Banner görseli yüklendi!')
      }
      reader.readAsDataURL(file)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'wedding': return '💒'
      case 'birthday': return '🎂'
      case 'corporate': return '🏢'
      case 'party': return '🎉'
      default: return '📅'
    }
  }

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data) // API directly returns array now
        
        // Auto-select default template
        const defaultTemplate = data.find((t: Template) => t.isDefault)
        if (defaultTemplate) {
          setSelectedTemplate(defaultTemplate)
          setFormData(prev => ({ ...prev, templateId: defaultTemplate.id }))
        }
      }
    } catch (error) {
      console.error('Template loading error:', error)
      toast.error('Şablonlar yüklenirken hata oluştu')
    }
  }

  // Generate QR preview when title changes
  useEffect(() => {
    if (formData.title) {
      const qrCode = formData.title.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now().toString(36)
      setQrPreview(qrCode)
    }
  }, [formData.title])

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleColorChange = (colorType: keyof EventFormData['customColors'], value: string) => {
    setFormData(prev => ({
      ...prev,
      customColors: { ...prev.customColors, [colorType]: value }
    }))
  }

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1)
      setProgress(step * 25 + 25)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
      setProgress((step - 1) * 25)
    }
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.date) {
      toast.error('Lütfen zorunlu alanları doldurun')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          qrCode: qrPreview,
          customColors: JSON.stringify(formData.customColors),
          participants: JSON.stringify(formData.participants),
          bannerImage: customBannerImage || '',
          selectedTemplate: selectedTemplate?.id || null
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Etkinlik başarıyla oluşturuldu!')
        router.push(`/dashboard/events/${data.event.id}`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Etkinlik oluşturulurken hata oluştu')
      }
    } catch (error) {
      console.error('Create event error:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Yeni Etkinlik Oluştur</h1>
              <p className="text-gray-600 mt-1">Modern QR kodlu fotoğraf paylaşım deneyimi oluşturun</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Step Indicators */}
          <div className="flex justify-between items-center">
            {[
              { num: 1, title: 'Temel Bilgiler', icon: Calendar },
              { num: 2, title: 'Şablon Seçimi', icon: Palette },
              { num: 3, title: 'Özelleştirme', icon: Wand2 },
              { num: 4, title: 'Önizleme & Kaydet', icon: Eye }
            ].map(({ num, title, icon: Icon }) => (
              <div key={num} className={`flex items-center gap-2 ${step >= num ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  step >= num ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200'
                }`}>
                  {step > num ? (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span className={`font-medium hidden sm:block transition-colors ${
                  step >= num ? 'text-blue-600' : 'text-gray-500'
                }`}>{title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <Tabs value={step.toString()} className="space-y-6">
                  {/* Step 1: Basic Information */}
                  <TabsContent value="1" className="space-y-6">
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="title" className="text-lg font-semibold text-gray-900 mb-3 block">
                          Etkinlik Adı *
                        </Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Örn: Düğün Töreni, Doğum Günü Partisi"
                          className="h-12 text-lg"
                        />
                      </div>

                      <div>
                        <Label className="text-lg font-semibold text-gray-900 mb-3 block">
                          Etkinlik Türü *
                        </Label>
                        <Select
                          value={formData.eventType}
                          onValueChange={(value) => {
                            handleInputChange('eventType', value)
                            // Reset participants when event type changes
                            handleInputChange('participants', {})
                          }}
                        >
                          <SelectTrigger className="h-12 text-lg">
                            <SelectValue placeholder="Etkinlik türünü seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="wedding">💍 Düğün</SelectItem>
                            <SelectItem value="engagement">👑 Nişan</SelectItem>
                            <SelectItem value="birthday">🎂 Doğum Günü</SelectItem>
                            <SelectItem value="baby_shower">👶 Baby Shower</SelectItem>
                            <SelectItem value="corporate">🏢 Kurumsal Etkinlik</SelectItem>
                            <SelectItem value="other">✨ Diğer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Participants Section - Dynamic based on event type */}
                      {(formData.eventType === 'wedding' || formData.eventType === 'engagement') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-lg font-semibold text-gray-900 mb-3 block">
                              Gelin Adı
                            </Label>
                            <Input
                              value={formData.participants.bride || ''}
                              onChange={(e) => handleInputChange('participants', { ...formData.participants, bride: e.target.value })}
                              placeholder="Gelin adı"
                              className="h-12 text-lg"
                            />
                          </div>
                          <div>
                            <Label className="text-lg font-semibold text-gray-900 mb-3 block">
                              Damat Adı
                            </Label>
                            <Input
                              value={formData.participants.groom || ''}
                              onChange={(e) => handleInputChange('participants', { ...formData.participants, groom: e.target.value })}
                              placeholder="Damat adı"
                              className="h-12 text-lg"
                            />
                          </div>
                        </div>
                      )}

                      {formData.eventType === 'birthday' && (
                        <div>
                          <Label className="text-lg font-semibold text-gray-900 mb-3 block">
                            Doğum Günü Sahibi
                          </Label>
                          <Input
                            value={formData.participants.celebrant || ''}
                            onChange={(e) => handleInputChange('participants', { ...formData.participants, celebrant: e.target.value })}
                            placeholder="Doğum günü kutlanan kişinin adı"
                            className="h-12 text-lg"
                          />
                        </div>
                      )}

                      {formData.eventType === 'baby_shower' && (
                        <div>
                          <Label className="text-lg font-semibold text-gray-900 mb-3 block">
                            Anne & Baba
                          </Label>
                          <Input
                            value={formData.participants.parents || ''}
                            onChange={(e) => handleInputChange('participants', { ...formData.participants, parents: e.target.value })}
                            placeholder="Örn: Ayşe & Mehmet"
                            className="h-12 text-lg"
                          />
                        </div>
                      )}

                      {(formData.eventType === 'corporate' || formData.eventType === 'other') && (
                        <div>
                          <Label className="text-lg font-semibold text-gray-900 mb-3 block">
                            Organizatör
                          </Label>
                          <Input
                            value={formData.participants.organizer || ''}
                            onChange={(e) => handleInputChange('participants', { ...formData.participants, organizer: e.target.value })}
                            placeholder="Etkinlik organizatörü"
                            className="h-12 text-lg"
                          />
                        </div>
                      )}

                      <div>
                        <Label htmlFor="description" className="text-lg font-semibold text-gray-900 mb-3 block">
                          Açıklama
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Etkinliğiniz hakkında kısa bir açıklama yazın..."
                          rows={4}
                          className="text-lg"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="date" className="text-lg font-semibold text-gray-900 mb-3 block">
                            Etkinlik Tarihi *
                          </Label>
                          <Input
                            id="date"
                            type="datetime-local"
                            value={formData.date}
                            onChange={(e) => handleInputChange('date', e.target.value)}
                            className="h-12"
                          />
                        </div>

                        <div>
                          <Label htmlFor="location" className="text-lg font-semibold text-gray-900 mb-3 block">
                            Konum
                          </Label>
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            placeholder="Örn: İstanbul, Beşiktaş"
                            className="h-12"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="maxUploads" className="text-lg font-semibold text-gray-900 mb-3 block">
                            Maksimum Yükleme (Kişi başı)
                          </Label>
                          <Input
                            id="maxUploads"
                            type="number"
                            value={formData.maxUploads || ''}
                            onChange={(e) => handleInputChange('maxUploads', e.target.value ? parseInt(e.target.value) : null)}
                            placeholder="Sınırsız için boş bırakın"
                            className="h-12"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label className="text-lg font-semibold text-gray-900">Otomatik Arşivleme</Label>
                          <div className="flex items-center space-x-3">
                            <Switch
                              checked={formData.autoArchive}
                              onCheckedChange={(checked) => handleInputChange('autoArchive', checked)}
                            />
                            <span className="text-gray-600">30 gün sonra otomatik arşivle</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Step 2: Template Selection */}
                  <TabsContent value="2" className="space-y-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Şablon Seçimi</h3>
                        <p className="text-gray-600 mb-6">Etkinliğiniz için uygun şablonu seçin ve önizleyerek detaylarını inceleyin</p>
                      </div>

                      {/* Search and Filter Controls */}
                      <div className="flex flex-col lg:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Şablon ara..."
                              value={templateSearch}
                              onChange={(e) => setTemplateSearch(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <Select value={templateFilter} onValueChange={(value: any) => setTemplateFilter(value)}>
                            <SelectTrigger className="w-40">
                              <Filter className="h-4 w-4 mr-2" />
                              <SelectValue placeholder="Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tümü</SelectItem>
                              <SelectItem value="wedding">💒 Düğün</SelectItem>
                              <SelectItem value="birthday">🎂 Doğum Günü</SelectItem>
                              <SelectItem value="corporate">🏢 Kurumsal</SelectItem>
                              <SelectItem value="party">🎉 Parti</SelectItem>
                              <SelectItem value="other">📅 Diğer</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Sırala" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="popularity">Popülerlik</SelectItem>
                              <SelectItem value="name">İsim</SelectItem>
                              <SelectItem value="category">Kategori</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Template Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTemplates.map((template) => (
                          <Card 
                            key={template.id}
                            className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                              selectedTemplate?.id === template.id 
                                ? 'ring-2 ring-blue-500 bg-blue-50 shadow-lg' 
                                : 'hover:shadow-lg'
                            }`}
                          >
                            <CardContent className="p-0">
                              {/* Template Preview Image */}
                              <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
                                {template.previewImage ? (
                                  <img 
                                    src={template.previewImage} 
                                    alt={template.displayName}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                ) : (
                                  <div 
                                    className="w-full h-full flex items-center justify-center"
                                    style={{ backgroundColor: template.backgroundColor }}
                                  >
                                    <div className="text-center">
                                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                      <div className="text-sm font-medium" style={{ color: template.textColor }}>
                                        {template.displayName}
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Overlay with actions */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleTemplatePreview(template)
                                      }}
                                      className="bg-white text-gray-900 hover:bg-gray-100"
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Önizle
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleTemplateSelect(template)
                                      }}
                                      className="bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                      <Wand2 className="h-4 w-4 mr-1" />
                                      Seç
                                    </Button>
                                  </div>
                                </div>

                                {/* Badges */}
                                <div className="absolute top-3 left-3 flex gap-2">
                                  {template.isDefault && (
                                    <Badge className="bg-blue-600 text-white">
                                      <Star className="h-3 w-3 mr-1" />
                                      Varsayılan
                                    </Badge>
                                  )}
                                  <Badge variant="secondary" className="bg-white/90 text-gray-700">
                                    {getCategoryIcon(template.category)} {template.category}
                                  </Badge>
                                </div>

                                {/* Popularity Score */}
                                <div className="absolute top-3 right-3">
                                  <Badge variant="outline" className="bg-white/90 text-gray-700">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    {template.popularity}%
                                  </Badge>
                                </div>
                              </div>

                              {/* Template Info */}
                              <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold text-gray-900 text-lg">{template.displayName}</h4>
                                  {selectedTemplate?.id === template.id && (
                                    <div className="flex items-center text-blue-600">
                                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-1" />
                                      <span className="text-xs font-medium">Seçili</span>
                                    </div>
                                  )}
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                                
                                {/* Color Palette */}
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-xs text-gray-500">Renkler:</span>
                                  <div className="flex gap-1">
                                    <div 
                                      className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                                      style={{ backgroundColor: template.primaryColor }}
                                      title="Ana Renk"
                                    />
                                    <div 
                                      className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                                      style={{ backgroundColor: template.secondaryColor }}
                                      title="İkincil Renk"
                                    />
                                    <div 
                                      className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                                      style={{ backgroundColor: template.backgroundColor }}
                                      title="Arkaplan Rengi"
                                    />
                                  </div>
                                </div>

                                {/* Features */}
                                <div className="mb-3">
                                  <span className="text-xs text-gray-500 mb-1 block">Özellikler:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {template.features?.slice(0, 3).map((feature, index) => (
                                      <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                                        {feature}
                                      </Badge>
                                    ))}
                                    {template.features && template.features.length > 3 && (
                                      <Badge variant="outline" className="text-xs px-2 py-0.5">
                                        +{template.features.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1">
                                  {template.tags?.slice(0, 3).map((tag, index) => (
                                    <span key={index} className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {filteredTemplates.length === 0 && templateSearch && (
                        <div className="text-center py-12">
                          <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg">"{templateSearch}" için sonuç bulunamadı</p>
                          <p className="text-gray-400 text-sm mt-2">Farklı anahtar kelimeler deneyin</p>
                        </div>
                      )}

                      {filteredTemplates.length === 0 && !templateSearch && templates.length === 0 && (
                        <div className="text-center py-12">
                          <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg">Şablonlar yükleniyor...</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Step 3: Customization */}
                  <TabsContent value="3" className="space-y-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Şablon Özelleştirme</h3>
                        <p className="text-gray-600 mb-6">Seçtiğiniz şablonu etkinliğinize özel hale getirin</p>
                      </div>

                      <div className="space-y-8">
                        {/* Banner Görseli Yükleme */}
                        <div>
                          <Label className="text-lg font-semibold text-gray-900 mb-4 block">
                            <Upload className="h-5 w-5 inline mr-2" />
                            Banner Görseli
                          </Label>
                          <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                              {customBannerImage ? (
                                <div className="space-y-4">
                                  <img 
                                    src={customBannerImage} 
                                    alt="Banner Preview" 
                                    className="max-h-40 mx-auto rounded-lg shadow-md"
                                  />
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setCustomBannerImage('')}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Kaldır
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <ImageIcon className="h-8 w-8 text-gray-400" />
                                  </div>
                                  <div>
                                    <p className="text-lg font-medium text-gray-900">Banner görseli yükleyin</p>
                                    <p className="text-gray-600">Etkinliğinizin ana görseli olacak (Önerilen: 1200x400px)</p>
                                  </div>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBannerUpload}
                                    className="max-w-xs mx-auto"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Renk Paleti Seçimi */}
                        <div>
                          <Label className="text-lg font-semibold text-gray-900 mb-4 block">
                            <Palette className="h-5 w-5 inline mr-2" />
                            Renk Paleti
                          </Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {colorPalettes.map((palette) => (
                              <Card 
                                key={palette.id}
                                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                                  selectedColorPalette === palette.id 
                                    ? 'ring-2 ring-blue-500 shadow-lg' 
                                    : 'hover:shadow-md'
                                }`}
                                onClick={() => handleColorPaletteSelect(palette.id)}
                              >
                                <CardContent className="p-4">
                                  <div className="space-y-3">
                                    <div className="flex gap-2 h-8">
                                      <div 
                                        className="flex-1 rounded"
                                        style={{ backgroundColor: palette.primary }}
                                      />
                                      <div 
                                        className="flex-1 rounded"
                                        style={{ backgroundColor: palette.secondary }}
                                      />
                                      <div 
                                        className="flex-1 rounded border"
                                        style={{ backgroundColor: palette.background }}
                                      />
                                    </div>
                                    <div className="text-center">
                                      <p className="font-medium text-sm">{palette.name}</p>
                                      {selectedColorPalette === palette.id && (
                                        <Badge className="mt-1 bg-blue-600 text-white">
                                          <Star className="h-3 w-3 mr-1" />
                                          Seçili
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* Seçili Renklerin Önizlemesi */}
                        <div>
                          <Label className="text-lg font-semibold text-gray-900 mb-4 block">
                            Renk Önizleme
                          </Label>
                          <Card className="p-6">
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <div 
                                  className="h-16 rounded-lg border mb-2 mx-auto"
                                  style={{ backgroundColor: formData.customColors.primary }}
                                />
                                <p className="text-sm font-medium">Ana Renk</p>
                                <p className="text-xs text-gray-500 font-mono">{formData.customColors.primary}</p>
                              </div>
                              <div>
                                <div 
                                  className="h-16 rounded-lg border mb-2 mx-auto"
                                  style={{ backgroundColor: formData.customColors.secondary }}
                                />
                                <p className="text-sm font-medium">İkincil Renk</p>
                                <p className="text-xs text-gray-500 font-mono">{formData.customColors.secondary}</p>
                              </div>
                              <div>
                                <div 
                                  className="h-16 rounded-lg border mb-2 mx-auto"
                                  style={{ backgroundColor: formData.customColors.background }}
                                />
                                <p className="text-sm font-medium">Arkaplan</p>
                                <p className="text-xs text-gray-500 font-mono">{formData.customColors.background}</p>
                              </div>
                            </div>
                          </Card>
                        </div>

                        {/* Event Status */}
                        <div className="space-y-3">
                          <Label className="text-lg font-semibold text-gray-900">Etkinlik Durumu</Label>
                          <div className="flex items-center space-x-3">
                            <Switch
                              checked={formData.isActive}
                              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                            />
                            <span className="text-gray-600">
                              {formData.isActive ? 'Etkinlik aktif' : 'Etkinlik pasif'}
                            </span>
                          </div>
                          {!formData.isActive && (
                            <Alert>
                              <AlertDescription>
                                Pasif etkinliklere fotoğraf yüklenemez. Daha sonra aktif hale getirebilirsiniz.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Step 4: Preview & Save */}
                  <TabsContent value="4" className="space-y-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Önizleme & Kaydet</h3>
                        <p className="text-gray-600 mb-6">Etkinlik bilgilerinizi kontrol edin ve kaydedin</p>
                      </div>

                      {/* Etkinlik Önizlemesi */}
                      <Card className="overflow-hidden">
                        <CardContent className="p-0">
                          {/* Banner Image Preview */}
                          {(customBannerImage || selectedTemplate?.previewImage) && (
                            <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600">
                              <img 
                                src={customBannerImage || selectedTemplate?.previewImage} 
                                alt="Event Banner"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-30" />
                              <div className="absolute bottom-4 left-4 text-white">
                                <h3 className="text-2xl font-bold">{formData.title}</h3>
                                <p className="text-lg opacity-90">{formData.location}</p>
                              </div>
                            </div>
                          )}

                          <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Etkinlik Detayları */}
                              <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                  <Calendar className="h-5 w-5" />
                                  Etkinlik Bilgileri
                                </h4>
                                <div className="space-y-3">
                                  <div className="flex items-start gap-3">
                                    <QrCode className="h-4 w-4 mt-1 text-gray-500" />
                                    <div>
                                      <p className="font-medium text-gray-900">{formData.title}</p>
                                      <p className="text-sm text-gray-600">{formData.description || 'Açıklama eklenmedi'}</p>
                                    </div>
                                  </div>
                                  {formData.date && (
                                    <div className="flex items-center gap-3">
                                      <Calendar className="h-4 w-4 text-gray-500" />
                                      <span className="text-sm">{new Date(formData.date).toLocaleString('tr-TR')}</span>
                                    </div>
                                  )}
                                  {formData.location && (
                                    <div className="flex items-center gap-3">
                                      <MapPin className="h-4 w-4 text-gray-500" />
                                      <span className="text-sm">{formData.location}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-3">
                                    <Upload className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">Max yükleme: {formData.maxUploads || 'Sınırsız'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Tasarım Önizlemesi */}
                              <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                  <Palette className="h-5 w-5" />
                                  Tasarım Özeti
                                </h4>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-sm font-medium text-gray-600 mb-2">Seçili Şablon</p>
                                    <div className="flex items-center gap-3">
                                      {selectedTemplate?.previewImage && (
                                        <img 
                                          src={selectedTemplate.previewImage} 
                                          alt={selectedTemplate.displayName}
                                          className="w-12 h-12 rounded object-cover"
                                        />
                                      )}
                                      <span className="font-medium">{selectedTemplate?.displayName || 'Varsayılan'}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600 mb-2">Renk Paleti</p>
                                    <div className="flex gap-2">
                                      <div 
                                        className="w-8 h-8 rounded border-2 border-white shadow"
                                        style={{ backgroundColor: formData.customColors.primary }}
                                        title={`Ana Renk: ${formData.customColors.primary}`}
                                      />
                                      <div 
                                        className="w-8 h-8 rounded border-2 border-white shadow"
                                        style={{ backgroundColor: formData.customColors.secondary }}
                                        title={`İkincil Renk: ${formData.customColors.secondary}`}
                                      />
                                      <div 
                                        className="w-8 h-8 rounded border-2 border-white shadow"
                                        style={{ backgroundColor: formData.customColors.background }}
                                        title={`Arkaplan: ${formData.customColors.background}`}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={formData.isActive ? "default" : "secondary"}>
                                      {formData.isActive ? 'Aktif' : 'Pasif'}
                                    </Badge>
                                    {formData.autoArchive && (
                                      <Badge variant="outline">Otomatik Arşiv</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Alert>
                        <Sparkles className="h-4 w-4" />
                        <AlertDescription>
                          Etkinlik oluşturulduktan sonra QR kodu paylaşabilir ve misafirlerinizin fotoğraf yüklemesini sağlayabilirsiniz.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </TabsContent>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={step === 1}
                      className="h-12 px-8 flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Geri
                    </Button>
                    
                    <div className="flex items-center gap-3">
                      {/* Progress Indicator */}
                      <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                        Adım {step}/4
                      </div>
                      
                      <Button
                        onClick={step === 4 ? handleSubmit : nextStep}
                        disabled={loading || (step === 2 && !selectedTemplate)}
                        className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Kaydediliyor...
                          </>
                        ) : step === 4 ? (
                          <>
                            <Save className="h-4 w-4" />
                            Etkinliği Oluştur
                          </>
                        ) : (
                          <>
                            İleri
                            <ChevronRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            {/* QR Code Preview */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QR Kod Önizleme
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                {qrPreview ? (
                  <div className="space-y-4">
                    <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                      <QrCode className="h-24 w-24 text-gray-400" />
                    </div>
                    <div className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                      {qrPreview}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      QR kod etkinlik oluşturulduğunda hazırlanacak
                    </Badge>
                  </div>
                ) : (
                  <div className="text-gray-400 py-8">
                    Etkinlik adı girince QR kod önizlemesi görünecek
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Hızlı Bilgiler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Etkinlik Adı:</span>
                  <span className="font-medium">{formData.title || '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tarih:</span>
                  <span className="font-medium">
                    {formData.date ? new Date(formData.date).toLocaleDateString('tr-TR') : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Konum:</span>
                  <span className="font-medium">{formData.location || '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Max Yükleme:</span>
                  <span className="font-medium">{formData.maxUploads || 'Sınırsız'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Template Preview Modal */}
      {showTemplatePreview && previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getCategoryIcon(previewTemplate.category)}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{previewTemplate.displayName}</h2>
                    <p className="text-gray-600">{previewTemplate.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-white">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {previewTemplate.popularity}% Popüler
                  </Badge>
                  {previewTemplate.isDefault && (
                    <Badge className="bg-blue-600">
                      <Star className="h-3 w-3 mr-1" />
                      Varsayılan
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Device Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    size="sm"
                    variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                    onClick={() => setPreviewDevice('mobile')}
                    className="h-8 px-3"
                  >
                    <Smartphone className="h-4 w-4 mr-1" />
                    Mobil
                  </Button>
                  <Button
                    size="sm"
                    variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                    onClick={() => setPreviewDevice('desktop')}
                    className="h-8 px-3"
                  >
                    <Monitor className="h-4 w-4 mr-1" />
                    Desktop
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplatePreview(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex overflow-hidden" style={{ height: 'calc(90vh - 180px)' }}>
              {/* Preview Area */}
              <div className="flex-1 bg-gray-100 flex items-center justify-center p-8">
                <div className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
                  previewDevice === 'mobile' 
                    ? 'w-80 h-[600px]' 
                    : 'w-full max-w-4xl h-full'
                }`}>
                  {/* Device Mockup */}
                  <div className="w-full h-full relative">
                    {previewDevice === 'mobile' && (
                      <div className="absolute inset-0 bg-gray-900 rounded-[2rem] p-2">
                        <div className="w-full h-full bg-white rounded-[1.5rem] overflow-hidden">
                          <div className="h-6 bg-gray-900 flex items-center justify-center">
                            <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
                          </div>
                          <div className="flex-1 overflow-auto">
                            <TemplatePreviewContent template={previewTemplate} />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {previewDevice === 'desktop' && (
                      <div className="w-full h-full bg-white rounded-lg overflow-hidden border">
                        <div className="h-8 bg-gray-100 border-b flex items-center px-4 gap-2">
                          <div className="flex gap-1">
                            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          </div>
                          <div className="flex-1 text-center text-xs text-gray-500">
                            event-preview.memoryqr.com
                          </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                          <TemplatePreviewContent template={previewTemplate} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Template Details Sidebar */}
              <div className="w-80 bg-white border-l overflow-y-auto">
                <div className="p-6 space-y-6">
                  {/* Template Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Şablon Detayları</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-500">Kategori:</span>
                        <div className="mt-1">
                          <Badge variant="outline">
                            {getCategoryIcon(previewTemplate.category)} {previewTemplate.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Popülerlik:</span>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                              style={{ width: `${previewTemplate.popularity}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{previewTemplate.popularity}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Renk Paleti</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div 
                          className="w-full h-12 rounded-lg border border-gray-300 mb-2"
                          style={{ backgroundColor: previewTemplate.primaryColor }}
                        />
                        <span className="text-xs text-gray-600">Ana Renk</span>
                        <div className="text-xs font-mono mt-1">{previewTemplate.primaryColor}</div>
                      </div>
                      <div className="text-center">
                        <div 
                          className="w-full h-12 rounded-lg border border-gray-300 mb-2"
                          style={{ backgroundColor: previewTemplate.secondaryColor }}
                        />
                        <span className="text-xs text-gray-600">İkincil</span>
                        <div className="text-xs font-mono mt-1">{previewTemplate.secondaryColor}</div>
                      </div>
                      <div className="text-center">
                        <div 
                          className="w-full h-12 rounded-lg border border-gray-300 mb-2"
                          style={{ backgroundColor: previewTemplate.backgroundColor }}
                        />
                        <span className="text-xs text-gray-600">Arkaplan</span>
                        <div className="text-xs font-mono mt-1">{previewTemplate.backgroundColor}</div>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  {previewTemplate.features && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Özellikler</h3>
                      <div className="space-y-2">
                        {previewTemplate.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {previewTemplate.tags && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Etiketler</h3>
                      <div className="flex flex-wrap gap-2">
                        {previewTemplate.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Style Details */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Stil Detayları</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Başlık Stili:</span>
                        <span>{previewTemplate.headerStyle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Buton Stili:</span>
                        <span>{previewTemplate.buttonStyle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Kart Stili:</span>
                        <span>{previewTemplate.cardStyle}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t p-6">
                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      onClick={() => handleTemplateSelect(previewTemplate)}
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      Bu Şablonu Seç
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowTemplatePreview(false)}
                    >
                      Geri Dön
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Template Preview Content Component
function TemplatePreviewContent({ template }: { template: Template }) {
  return (
    <div 
      className="min-h-full"
      style={{ 
        backgroundColor: template.backgroundColor,
        color: template.textColor 
      }}
    >
      {/* Header */}
      <div 
        className="p-6 text-center"
        style={{ backgroundColor: template.primaryColor, color: 'white' }}
      >
        <h1 className="text-2xl font-bold mb-2">Örnek Etkinlik</h1>
        <p className="opacity-90">25 Aralık 2024 - İstanbul</p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Hero Section */}
        {template.heroImage ? (
          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
            <img 
              src={template.heroImage} 
              alt="Hero" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div 
            className="aspect-video rounded-lg flex items-center justify-center"
            style={{ backgroundColor: template.secondaryColor }}
          >
            <ImageIcon className="h-12 w-12 opacity-50" />
          </div>
        )}

        {/* Description */}
        <div className="text-center">
          <p className="text-lg mb-4">
            Bu bir örnek etkinlik açıklamasıdır. Burada etkinliğinizin detaylarını paylaşabilirsiniz.
          </p>
          <div 
            className={`inline-block px-6 py-3 rounded-lg text-white font-medium ${
              template.buttonStyle === 'rounded' ? 'rounded-full' : 
              template.buttonStyle === 'square' ? 'rounded-none' : 'rounded-lg'
            }`}
            style={{ backgroundColor: template.primaryColor }}
          >
            Fotoğraf Yükle
          </div>
        </div>

        {/* Gallery Preview */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-center">Fotoğraf Galerisi</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div 
                key={item}
                className={`aspect-square bg-gray-200 rounded-lg flex items-center justify-center ${
                  template.cardStyle === 'shadow' ? 'shadow-md' :
                  template.cardStyle === 'border' ? 'border' : ''
                }`}
              >
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm opacity-75 pt-6 border-t">
          Powered by MemoryQR
        </div>
      </div>
    </div>
  )
}
