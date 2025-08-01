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
  const [templates, setTemplates] = useState<Template[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    templateId: '',
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
          setFormData(prev => ({ ...prev, templateId: defaultTemplate.id }))
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
          templateId: ''
        })
        router.refresh()
      } else {
        toast.error(data.error || 'Bir hata oluştu')
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
                    onClick={() => handleChange('templateId', template.id)}
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
