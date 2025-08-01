'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import TemplateSelector from '@/components/dashboard/TemplateSelector'
import TemplateCustomizer from '@/components/dashboard/TemplateCustomizer'
import { 
  Settings, 
  Palette, 
  Eye, 
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  Sparkles
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

interface TemplateManagementProps {
  userId: string
  eventId?: string
}

export default function TemplateManagement({ userId, eventId }: TemplateManagementProps) {
  const [templates, setTemplates] = useState<UploadTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [customizingTemplate, setCustomizingTemplate] = useState<UploadTemplate | null>(null)
  const [currentView, setCurrentView] = useState<'select' | 'customize'>('select')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setIsLoading(true)
      // Load base templates and user's customized templates for this event
      const response = await fetch(`/api/templates?userId=${userId}&eventId=${eventId || ''}`)
      if (!response.ok) throw new Error('Şablonlar yüklenemedi')
      
      const data = await response.json()
      setTemplates(data.templates)
      
      // If this is for a specific event, load the current template selection
      if (eventId) {
        const eventResponse = await fetch(`/api/events/${eventId}`)
        if (eventResponse.ok) {
          const eventData = await eventResponse.json()
          if (eventData.event.templateId) {
            setSelectedTemplateId(eventData.event.templateId)
          }
        }
      }
      
      // Set default selected template if none is selected
      if (!selectedTemplateId) {
        const defaultTemplate = data.templates.find((t: UploadTemplate) => t.isDefault)
        if (defaultTemplate) {
          setSelectedTemplateId(defaultTemplate.id)
        }
      }
    } catch (error) {
      console.error('Template loading error:', error)
      setMessage({ type: 'error', text: 'Şablonlar yüklenirken hata oluştu' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId)
    setMessage({ type: 'success', text: 'Şablon seçildi' })
  }

  const handleCustomize = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setCustomizingTemplate(template)
      setCurrentView('customize')
    }
  }

  const handleSaveCustomization = async (customizedTemplate: UploadTemplate) => {
    try {
      setIsSaving(true)
      
      if (!eventId) {
        setMessage({ type: 'error', text: 'Şablon özelleştirmesi için önce bir etkinlik seçin veya oluşturun' })
        return
      }

      // Save customization directly to event (no new template creation)
      const response = await fetch(`/api/events/${eventId}/template`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: customizedTemplate.id, // Base template ID
          customColors: {
            primaryColor: customizedTemplate.primaryColor,
            secondaryColor: customizedTemplate.secondaryColor,
            backgroundColor: customizedTemplate.backgroundColor,
            textColor: customizedTemplate.textColor
          },
          customLogo: customizedTemplate.logoImage,
          customStyles: {
            headerStyle: customizedTemplate.headerStyle,
            buttonStyle: customizedTemplate.buttonStyle,
            cardStyle: customizedTemplate.cardStyle
          },
          userId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Özelleştirme kaydedilemedi')
      }
      
      setMessage({ type: 'success', text: 'Şablon özelleştirmesi kaydedildi' })
      setCurrentView('select')
      setCustomizingTemplate(null)
      
      // Reload templates to show updated customization
      await loadTemplates()
      
    } catch (error) {
      console.error('Save customization error:', error)
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Özelleştirme kaydedilirken hata oluştu' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleApplyTemplate = async () => {
    if (!selectedTemplateId || !eventId) return

    try {
      setIsSaving(true)
      
      const selectedTemplate = templates.find(t => t.id === selectedTemplateId)
      
      const response = await fetch(`/api/events/${eventId}/template`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          customColors: selectedTemplate ? {
            primaryColor: selectedTemplate.primaryColor,
            secondaryColor: selectedTemplate.secondaryColor,
            backgroundColor: selectedTemplate.backgroundColor,
            textColor: selectedTemplate.textColor
          } : null,
          customLogo: selectedTemplate?.logoImage,
          userId
        })
      })

      if (!response.ok) throw new Error('Şablon uygulanamadı')

      setMessage({ type: 'success', text: 'Şablon etkinliğe başarıyla uygulandı' })
      
    } catch (error) {
      console.error('Apply template error:', error)
      setMessage({ type: 'error', text: 'Şablon uygulanırken hata oluştu' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelCustomization = () => {
    setCurrentView('select')
    setCustomizingTemplate(null)
  }

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Şablonlar yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {currentView === 'select' ? 'Şablon Yönetimi' : 'Şablon Özelleştirme'}
          </h2>
          <p className="text-gray-600 mt-1">
            {currentView === 'select' 
              ? 'Yükleme sayfanız için tema seçin ve özelleştirin'
              : 'Seçtiğiniz şablonu ihtiyaçlarınıza göre özelleştirin'
            }
          </p>
        </div>

        {currentView === 'select' && selectedTemplate && (
          <div className="flex space-x-3">
            {eventId ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => handleCustomize(selectedTemplateId)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Özelleştir
                </Button>
                
                <Button 
                  onClick={handleApplyTemplate}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Şablonu Uygula
                </Button>
              </>
            ) : (
              <div className="text-sm text-gray-500 text-center">
                <p>Şablon özelleştirmek için önce bir etkinlik seçin</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Messages */}
      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Current Selection Info */}
      {currentView === 'select' && selectedTemplate && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: selectedTemplate.primaryColor }}
                >
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Seçili Şablon: {selectedTemplate.displayName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedTemplate.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {selectedTemplate.isDefault && (
                  <Badge variant="secondary">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Varsayılan
                  </Badge>
                )}
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Önizle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {currentView === 'select' ? (
        <TemplateSelector
          templates={templates}
          selectedTemplateId={selectedTemplateId}
          onTemplateSelect={handleTemplateSelect}
          onCustomize={handleCustomize}
          showPreview={true}
        />
      ) : customizingTemplate ? (
        <TemplateCustomizer
          template={customizingTemplate}
          onSave={handleSaveCustomization}
          onCancel={handleCancelCustomization}
          isLoading={isSaving}
        />
      ) : null}

      {/* Footer Info */}
      {currentView === 'select' && (
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <h4 className="font-semibold text-gray-900">
                💡 İpucu
              </h4>
              <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                Şablonları seçtikten sonra özelleştirebilir, renklerini değiştirebilir ve 
                etkinliğinize uygun hale getirebilirsiniz. Değişiklikler anında önizlemede görünür.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
