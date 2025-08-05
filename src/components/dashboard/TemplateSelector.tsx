'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Palette, 
  Heart, 
  Cake, 
  Building, 
  Check, 
  Eye,
  Settings,
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

interface TemplateSelectorProps {
  templates: UploadTemplate[]
  selectedTemplateId?: string
  onTemplateSelect: (templateId: string) => void
  onCustomize?: (templateId: string) => void
  showPreview?: boolean
}

export default function TemplateSelector({ 
  templates, 
  selectedTemplateId, 
  onTemplateSelect, 
  onCustomize,
  showPreview = true 
}: TemplateSelectorProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)

  const getTemplateIcon = (name: string) => {
    switch (name) {
      case 'wedding': return Heart
      case 'birthday': return Cake
      case 'corporate': return Building
      default: return Palette
    }
  }

  const getPreviewStyle = (template: UploadTemplate) => ({
    backgroundColor: template.backgroundColor,
    color: template.textColor,
    borderColor: template.primaryColor
  })

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Yükleme Sayfası Teması Seçin
        </h3>
        <p className="text-gray-600">
          Etkinliğinize uygun tema seçin veya özelleştirin
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {templates.map((template) => {
          const IconComponent = getTemplateIcon(template.name)
          const isSelected = selectedTemplateId === template.id
          const isHovered = hoveredTemplate === template.id

          return (
            <Card 
              key={template.id}
              className={`relative group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                isSelected 
                  ? 'ring-2 ring-blue-500 shadow-xl' 
                  : 'hover:shadow-lg'
              }`}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              onClick={() => onTemplateSelect(template.id)}
            >
              {isSelected && (
                <div className="absolute -top-3 -right-3 z-10">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              {template.isDefault && (
                <div className="absolute -top-3 left-4 z-10">
                  <Badge className="bg-green-500 text-white">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Varsayılan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div 
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all overflow-hidden ${
                    isHovered ? 'scale-110' : ''
                  }`}
                  style={{ backgroundColor: template.primaryColor }}
                >
                  {template.logoImage ? (
                    <img 
                      src={template.logoImage} 
                      alt={template.displayName}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <IconComponent className="h-8 w-8 text-white" />
                  )}
                </div>
                
                <CardTitle className="text-xl mb-2">{template.displayName}</CardTitle>
                <CardDescription className="text-gray-600">
                  {template.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Color Palette Preview */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Renk Paleti:</p>
                  <div className="flex space-x-2">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-gray-200"
                      style={{ backgroundColor: template.primaryColor }}
                      title="Ana Renk"
                    />
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-gray-200"
                      style={{ backgroundColor: template.secondaryColor }}
                      title="İkincil Renk"
                    />
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-gray-200"
                      style={{ backgroundColor: template.backgroundColor }}
                      title="Arkaplan Rengi"
                    />
                  </div>
                </div>

                {/* Mini Preview */}
                {showPreview && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Önizleme:</p>
                    <div 
                      className="p-3 rounded-lg border text-center text-xs transition-all relative overflow-hidden"
                      style={getPreviewStyle(template)}
                    >
                      {template.heroImage && (
                        <div 
                          className="absolute inset-0 bg-cover bg-center opacity-20"
                          style={{ backgroundImage: `url(${template.heroImage})` }}
                        />
                      )}
                      <div className="relative z-10">
                        {template.logoImage && (
                          <img 
                            src={template.logoImage} 
                            alt="Logo" 
                            className="w-6 h-6 object-contain mx-auto mb-1"
                          />
                        )}
                        <div className="font-semibold mb-1">{template.displayName}</div>
                        <div className="opacity-75 mb-2 text-xs">{template.description}</div>
                        <div 
                          className="inline-block px-3 py-1 rounded text-white text-xs font-medium"
                          style={{ backgroundColor: template.primaryColor }}
                        >
                          Fotoğraf Yükle
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-4">
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      onTemplateSelect(template.id)
                    }}
                  >
                    {isSelected ? 'Seçili' : 'Seç'}
                  </Button>
                  
                  {onCustomize && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onCustomize(template.id)
                      }}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Preview functionality can be added here
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Custom Template Option */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Palette className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Özel Tema Oluştur</h3>
          <p className="text-gray-600 mb-4">
            Kendi özel temanızı sıfırdan oluşturun
          </p>
          <Button variant="outline">
            <Sparkles className="w-4 h-4 mr-2" />
            Özel Tema Oluştur
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
