'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle,
  Heart,
  Camera
} from 'lucide-react'
import { toast } from 'sonner'
import { getImageUrl } from '@/lib/image-utils'

interface UploadTemplate {
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
  qrCode: string
}

interface UploadClientProps {
  event: Event
  template: UploadTemplate | null
  uploadCount: number
  maxUploads: number | null
}

export default function UploadClient({ event, template, uploadCount, maxUploads }: UploadClientProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

    // Use default template if none is set
  const currentTemplate = template || {
    id: 'default',
    name: 'default',
    displayName: 'Varsayılan',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    backgroundColor: '#F8FAFC',
    textColor: '#1F2937',
    headerStyle: 'minimal',
    buttonStyle: 'rounded',
    cardStyle: 'shadow'
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    // Check upload limit
    if (maxUploads && uploadCount + acceptedFiles.length > maxUploads) {
      toast.error(`Maksimum ${maxUploads} fotoğraf yükleyebilirsiniz`)
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]
        
        const formData = new FormData()
        formData.append('file', file)
        formData.append('eventId', event.id)
        formData.append('qrCode', event.qrCode)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const result = await response.json()
        setUploadedFiles(prev => [...prev, result.fileName])
        
        // Update progress
        setUploadProgress(((i + 1) / acceptedFiles.length) * 100)
      }

      toast.success(`${acceptedFiles.length} fotoğraf başarıyla yüklendi!`)
      
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Fotoğraf yüklenirken hata oluştu')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [event.id, event.qrCode, maxUploads, uploadCount])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    disabled: uploading
  })

  const pageStyle = {
    backgroundColor: currentTemplate.backgroundColor,
    color: currentTemplate.textColor,
    minHeight: '100vh'
  }

  const getHeaderStyle = () => {
    const baseStyle = 'p-6 mb-8'
    
    switch (currentTemplate.headerStyle) {
      case 'gradient':
        return `${baseStyle} bg-gradient-to-r from-purple-500 to-blue-600 text-white`
      case 'glass':
        return `${baseStyle} backdrop-blur-sm bg-white/20`
      case 'image':
        return currentTemplate.heroImage 
          ? `${baseStyle} bg-cover bg-center text-white relative`
          : `${baseStyle} bg-gray-100`
      default:
        return `${baseStyle} border-b`
    }
  }

  const getButtonStyle = () => {
    const baseStyle = 'px-8 py-4 font-semibold text-white transition-all hover:scale-105'
    
    switch (currentTemplate.buttonStyle) {
      case 'rounded':
        return `${baseStyle} rounded-2xl`
      case 'square':
        return `${baseStyle} rounded-none`
      case 'pill':
        return `${baseStyle} rounded-full`
      default:
        return `${baseStyle} rounded-lg`
    }
  }

  const getCardStyle = () => {
    const baseStyle = 'transition-all'
    
    switch (currentTemplate.cardStyle) {
      case 'shadow':
        return `${baseStyle} shadow-xl`
      case 'border':
        return `${baseStyle} border-2 border-gray-200`
      case 'glass':
        return `${baseStyle} backdrop-blur-sm bg-white/10`
      default:
        return `${baseStyle} shadow-lg`
    }
  }

  return (
    <div style={pageStyle} className="min-h-screen">
      {/* Background Image */}
      {currentTemplate.heroImage && currentTemplate.headerStyle === 'image' && (
        <div 
          className="fixed inset-0 bg-cover bg-center opacity-20 z-0"
          style={{ backgroundImage: `url(${getImageUrl(currentTemplate.heroImage)})` }}
        />
      )}

      <div className="relative z-10">
        {/* Header */}
        <header 
          className={getHeaderStyle()}
          style={currentTemplate.headerStyle === 'image' && currentTemplate.heroImage ? {
            backgroundImage: `url(${getImageUrl(currentTemplate.heroImage)})`
          } : {}}
        >
          {currentTemplate.headerStyle === 'image' && currentTemplate.heroImage && (
            <div className="absolute inset-0 bg-black/50" />
          )}
          
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            {/* Logo */}
            {currentTemplate.logoImage && (
              <div className="mb-6">
                <img 
                  src={getImageUrl(currentTemplate.logoImage)} 
                  alt="Logo" 
                  className="w-24 h-24 object-contain mx-auto rounded-lg"
                />
              </div>
            )}

            {/* Event Title */}
            <h1 className="text-4xl font-bold mb-4">
              {event.title}
            </h1>
            
            {/* Event Description */}
            {event.description && (
              <p className="text-xl opacity-90 mb-4">
                {event.description}
              </p>
            )}
            
            {/* Event Date */}
            <p className="text-lg opacity-75 mb-2">
              📅 {new Date(event.date).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            
            {/* Event Location */}
            {event.location && (
              <p className="text-lg opacity-75 mb-4">
                📍 {event.location}
              </p>
            )}
            
            {/* Upload instruction */}
            <p className="text-base opacity-70">
              Etkinlik fotoğraflarınızı yükleyin ve anılarınızı paylaşın
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 pb-12">
          <div className="max-w-2xl mx-auto">
            {/* Upload Stats */}
            <div className="text-center mb-8">
              <p className="text-lg opacity-75">
                {uploadCount} fotoğraf yüklenmiş
                {maxUploads && ` / ${maxUploads} maksimum`}
              </p>
              {maxUploads && (
                <Progress 
                  value={(uploadCount / maxUploads) * 100} 
                  className="mt-2"
                />
              )}
            </div>

            {/* Upload Area */}
            <Card className={getCardStyle()}>
              <CardContent className="p-8">
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
                    ${isDragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                    ${uploading ? 'pointer-events-none opacity-50' : ''}
                  `}
                  style={{ borderColor: isDragActive ? currentTemplate.primaryColor : undefined }}
                >
                  <input {...getInputProps()} />
                  
                  {uploading ? (
                    <div className="space-y-4">
                      <Upload className="w-16 h-16 mx-auto animate-pulse" />
                      <h3 className="text-xl font-semibold">Yükleniyor...</h3>
                      <Progress value={uploadProgress} className="max-w-xs mx-auto" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Camera className="w-16 h-16 mx-auto opacity-60" />
                      <h3 className="text-xl font-semibold">
                        {isDragActive ? 'Fotoğrafları buraya bırakın' : 'Fotoğraf Yükleyin'}
                      </h3>
                      <p className="text-gray-600">
                        Dosyalarınızı sürükleyip bırakın veya seçmek için tıklayın
                      </p>
                      <Button
                        type="button"
                        className={getButtonStyle()}
                        style={{ backgroundColor: currentTemplate.primaryColor }}
                      >
                        Fotoğraf Yükle
                      </Button>
                    </div>
                  )}
                </div>

                {/* Upload Success */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">
                        {uploadedFiles.length} fotoğraf başarıyla yüklendi!
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
