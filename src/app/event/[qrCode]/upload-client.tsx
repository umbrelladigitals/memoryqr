'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { 
  Upload, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle,
  Heart,
  Camera,
  Calendar,
  MapPin,
  Video
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
  logoImage?: string
  heroImage?: string
}

interface Event {
  id: string
  title: string
  description: string | null
  date: Date
  location: string | null
  qrCode: string
  bannerImage: string | null
  customLogo: string | null
  customColors: any | null
}

interface UploadClientProps {
  event: Event
  template: UploadTemplate | null
  uploadCount: number
  maxUploads: number | null
}

export default function UploadClient({ event, template, uploadCount, maxUploads }: UploadClientProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [showNameInput, setShowNameInput] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  // Format date function
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

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
      toast.error(`Maksimum ${maxUploads} dosya yükleyebilirsiniz`)
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
        if (guestName.trim()) {
          formData.append('guestName', guestName.trim())
        }

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const result = await response.json()
        setUploadedFiles(prev => [...prev, result.url])
        setUploadProgress(((i + 1) / acceptedFiles.length) * 100)
      }

      setShowSuccessPopup(true)
      setTimeout(() => {
        window.location.reload() // Refresh to update count
      }, 3000)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Yükleme sırasında hata oluştu')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [event.id, guestName, maxUploads, uploadCount])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v']
    },
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB video için daha büyük boyut
    disabled: uploading
  })

  const pageStyle = {
    background: currentTemplate.headerStyle === 'gradient' 
      ? `linear-gradient(135deg, ${currentTemplate.primaryColor} 0%, ${currentTemplate.secondaryColor} 100%)`
      : `linear-gradient(to bottom right, ${currentTemplate.backgroundColor} 0%, ${currentTemplate.primaryColor}15 50%, ${currentTemplate.secondaryColor}10 100%)`,
    minHeight: '100vh'
  }

  const getButtonStyle = () => {
    const baseStyle = 'px-6 py-3 font-semibold transition-all'
    
    switch (currentTemplate.buttonStyle) {
      case 'rounded':
        return `${baseStyle} rounded-full`
      case 'square':
        return `${baseStyle} rounded-none`
      case 'minimal':
        return `${baseStyle} rounded-sm`
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
        {/* Facebook-style Header */}
        <header className="relative max-w-6xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          {/* Banner/Background */}
          {event.bannerImage ? (
            <div className="relative h-40 sm:h-48 md:h-64 lg:h-80 overflow-hidden rounded-lg sm:rounded-2xl shadow-2xl">
              <img 
                src={getImageUrl(event.bannerImage)} 
                alt="Etkinlik Banner" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-lg sm:rounded-2xl" />
              
              {/* Event Info - Logo ile çakışmayı önle */}
              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 text-white">
                <div className={`space-y-2 sm:space-y-3 ${event.customLogo ? 'ml-20 sm:ml-28 md:ml-36' : ''}`}>
                  {/* Title with strong background */}
                  <div className="bg-black/70 backdrop-blur-lg rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 border border-white/20">
                    <h1 className="text-lg sm:text-2xl md:text-4xl font-bold text-white leading-tight">{event.title}</h1>
                  </div>
                  
                  {/* Description with background */}
                  {event.description && (
                    <div className="bg-black/60 backdrop-blur-lg rounded-lg sm:rounded-xl px-3 sm:px-4 py-2">
                      <p className="text-xs sm:text-sm md:text-lg text-white line-clamp-2 font-medium">{event.description}</p>
                    </div>
                  )}
                  
                  {/* Date and Location with enhanced background */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div 
                      className="flex items-center gap-1 sm:gap-2 backdrop-blur-sm rounded-md sm:rounded-lg px-2 sm:px-4 py-1 sm:py-2 border"
                      style={{
                        backgroundColor: `${currentTemplate.primaryColor}90`,
                        borderColor: `${currentTemplate.primaryColor}`,
                        boxShadow: `0 4px 12px ${currentTemplate.primaryColor}40`
                      }}
                    >
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      <span className="text-white font-semibold">{formatDate(event.date)}</span>
                    </div>
                    {event.location && (
                      <div 
                        className="flex items-center gap-1 sm:gap-2 backdrop-blur-sm rounded-md sm:rounded-lg px-2 sm:px-4 py-1 sm:py-2 border"
                        style={{
                          backgroundColor: `${currentTemplate.secondaryColor}90`,
                          borderColor: `${currentTemplate.secondaryColor}`,
                          boxShadow: `0 4px 12px ${currentTemplate.secondaryColor}40`
                        }}
                      >
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        <span className="text-white font-semibold">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div 
              className="relative h-40 sm:h-48 md:h-64 lg:h-80 overflow-hidden rounded-lg sm:rounded-2xl shadow-2xl"
              style={{ backgroundColor: currentTemplate.primaryColor || '#3B82F6' }}
            >
              <div 
                className="absolute inset-0 rounded-lg sm:rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${currentTemplate.primaryColor || '#3B82F6'} 0%, ${currentTemplate.secondaryColor || '#1D4ED8'} 100%)`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 rounded-lg sm:rounded-2xl" />
              
              {/* Event Info - Logo ile çakışmayı önle */}
              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 text-white">
                <div className={`space-y-2 sm:space-y-3 ${event.customLogo ? 'ml-20 sm:ml-28 md:ml-36' : ''}`}>
                  {/* Title with strong background */}
                  <div className="bg-black/70 backdrop-blur-lg rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 border border-white/20">
                    <h1 className="text-lg sm:text-2xl md:text-4xl font-bold text-white leading-tight">{event.title}</h1>
                  </div>
                  
                  {/* Description with background */}
                  {event.description && (
                    <div className="bg-black/60 backdrop-blur-lg rounded-lg sm:rounded-xl px-3 sm:px-4 py-2">
                      <p className="text-xs sm:text-sm md:text-lg text-white line-clamp-2 font-medium">{event.description}</p>
                    </div>
                  )}
                  
                  {/* Date and Location with enhanced background */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div 
                      className="flex items-center gap-1 sm:gap-2 backdrop-blur-sm rounded-md sm:rounded-lg px-2 sm:px-4 py-1 sm:py-2 border"
                      style={{
                        backgroundColor: `${currentTemplate.backgroundColor}90`,
                        borderColor: `${currentTemplate.primaryColor}50`,
                        boxShadow: `0 4px 12px ${currentTemplate.primaryColor}30`
                      }}
                    >
                      <Calendar 
                        className="h-3 w-3 sm:h-4 sm:w-4"
                        style={{ color: currentTemplate.textColor }}
                      />
                      <span 
                        className="font-semibold"
                        style={{ color: currentTemplate.textColor }}
                      >
                        {formatDate(event.date)}
                      </span>
                    </div>
                    {event.location && (
                      <div 
                        className="flex items-center gap-1 sm:gap-2 backdrop-blur-sm rounded-md sm:rounded-lg px-2 sm:px-4 py-1 sm:py-2 border"
                        style={{
                          backgroundColor: `${currentTemplate.backgroundColor}90`,
                          borderColor: `${currentTemplate.secondaryColor}50`,
                          boxShadow: `0 4px 12px ${currentTemplate.secondaryColor}30`
                        }}
                      >
                        <MapPin 
                          className="h-3 w-3 sm:h-4 sm:w-4"
                          style={{ color: currentTemplate.textColor }}
                        />
                        <span 
                          className="font-semibold"
                          style={{ color: currentTemplate.textColor }}
                        >
                          {event.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Logo - Facebook Style - Fixed positioning and z-index */}
          {event.customLogo && (
            <div className="absolute top-2 sm:top-4 left-4 sm:left-8 md:left-10 z-30">
              <div 
                className="relative w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-white rounded-xl sm:rounded-2xl p-1 sm:p-2 shadow-2xl border-2 sm:border-4 border-white transform hover:scale-105 transition-transform duration-300"
                style={{
                  boxShadow: `0 20px 40px ${currentTemplate.primaryColor}30, 0 0 0 2px ${currentTemplate.primaryColor}20`
                }}
              >
                <img 
                  src={getImageUrl(event.customLogo)} 
                  alt="Logo" 
                  className="w-full h-full object-contain rounded-lg sm:rounded-xl"
                />
                {/* Logo border glow effect */}
                <div 
                  className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${currentTemplate.primaryColor}20, ${currentTemplate.secondaryColor}20)`
                  }}
                />
              </div>
            </div>
          )}
        </header>

        {/* Call to Action */}
        <div className={`${event.customLogo ? 'pt-8 sm:pt-12 md:pt-16' : 'pt-4 sm:pt-8'} px-2 sm:px-4 md:px-6 lg:px-8 text-center mb-6 sm:mb-8 md:mb-12`}>
          <div className="max-w-4xl mx-auto">
            <div 
              className="relative backdrop-blur-xl rounded-2xl sm:rounded-3xl px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 border shadow-xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${currentTemplate.primaryColor}20, ${currentTemplate.secondaryColor}15)`,
                borderColor: `${currentTemplate.primaryColor}30`,
                boxShadow: `0 20px 40px ${currentTemplate.primaryColor}20`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
              <div className="relative z-10">
                <p 
                  className="text-base sm:text-lg md:text-xl lg:text-2xl mb-3 sm:mb-4 font-bold leading-relaxed"
                  style={{ color: currentTemplate.textColor }}
                >
                  ✨ Etkinlik fotoğraflarınızı yükleyin ve anılarınızı paylaşın
                </p>
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <div 
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full animate-pulse shadow-lg"
                    style={{ backgroundColor: currentTemplate.primaryColor }}
                  />
                  <span 
                    className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1 sm:py-2 rounded-full"
                    style={{ 
                      color: currentTemplate.textColor,
                      backgroundColor: `${currentTemplate.backgroundColor}80`
                    }}
                  >
                    Hemen başlayın
                  </span>
                  <div 
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full animate-pulse shadow-lg"
                    style={{ backgroundColor: currentTemplate.secondaryColor }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="px-2 sm:px-4 md:px-6 lg:px-8 pb-8 sm:pb-12 md:pb-16">
          <div className="max-w-4xl mx-auto">
            {/* Upload Progress Stats */}
            <div className="text-center mb-6 sm:mb-8 md:mb-12">
              <div className="relative inline-block">
                <div 
                  className="absolute inset-0 rounded-2xl sm:rounded-3xl blur-xl"
                  style={{
                    background: `linear-gradient(45deg, ${currentTemplate.primaryColor}40, ${currentTemplate.secondaryColor}30)`
                  }}
                />
                <div 
                  className="relative backdrop-blur-xl rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-3 sm:py-4 border shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, ${currentTemplate.primaryColor}15, ${currentTemplate.secondaryColor}10)`,
                    borderColor: `${currentTemplate.primaryColor}40`
                  }}
                >
                  <p 
                    className="text-base sm:text-lg md:text-xl font-bold mb-2"
                    style={{ color: currentTemplate.textColor }}
                  >
                    📸 {uploadCount} fotoğraf yüklenmiş
                    {maxUploads && ` / ${maxUploads} maksimum`}
                  </p>
                  {maxUploads && (
                    <div className="relative w-full bg-gray-200/50 rounded-full h-2 sm:h-3 overflow-hidden border border-white/30">
                      <div 
                        className="h-full transition-all duration-500 rounded-full shadow-lg"
                        style={{ 
                          width: `${(uploadCount / maxUploads) * 100}%`,
                          background: `linear-gradient(90deg, ${currentTemplate.primaryColor}, ${currentTemplate.secondaryColor})`
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Guest Info Card */}
            <div className="mb-6 sm:mb-8 md:mb-12 relative">
              <div 
                className="absolute inset-0 rounded-2xl sm:rounded-3xl blur-xl"
                style={{
                  background: `linear-gradient(135deg, ${currentTemplate.primaryColor}25, ${currentTemplate.secondaryColor}20)`
                }}
              />
              <div 
                className="relative backdrop-blur-xl rounded-2xl sm:rounded-3xl border overflow-hidden shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${currentTemplate.backgroundColor}40, ${currentTemplate.primaryColor}10)`,
                  borderColor: `${currentTemplate.primaryColor}30`
                }}
              >
                <div 
                  className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-b"
                  style={{
                    borderColor: `${currentTemplate.primaryColor}20`,
                    background: `linear-gradient(90deg, ${currentTemplate.primaryColor}15, transparent)`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div 
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${currentTemplate.primaryColor}, ${currentTemplate.secondaryColor})`
                        }}
                      >
                        <span className="text-lg sm:text-xl">👤</span>
                      </div>
                      <h3 
                        className="text-base sm:text-lg md:text-xl font-bold"
                        style={{ color: currentTemplate.textColor }}
                      >
                        Misafir Bilgileri
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowNameInput(!showNameInput)}
                      className="group relative px-3 sm:px-4 py-2 backdrop-blur-xl rounded-lg sm:rounded-xl border transition-all duration-300 hover:scale-105"
                      style={{
                        background: `${currentTemplate.backgroundColor}60`,
                        borderColor: `${currentTemplate.primaryColor}30`,
                        boxShadow: `0 4px 12px ${currentTemplate.primaryColor}20`
                      }}
                    >
                      <span 
                        className="text-xs sm:text-sm font-medium group-hover:opacity-80"
                        style={{ color: currentTemplate.textColor }}
                      >
                        {showNameInput ? 'Gizle' : 'İsim Ekle'}
                      </span>
                    </button>
                  </div>
                </div>
                
                {showNameInput && (
                  <div className="p-4 sm:p-6 md:p-8">
                    <div className="space-y-3 sm:space-y-4">
                      <label 
                        htmlFor="guestName" 
                        className="block text-sm font-semibold mb-2"
                        style={{ color: currentTemplate.textColor }}
                      >
                        İsminiz (İsteğe bağlı)
                      </label>
                      <div className="relative">
                        <input
                          id="guestName"
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Adınızı ve soyadınızı yazın"
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 backdrop-blur-xl border rounded-lg sm:rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:border-opacity-60 text-sm sm:text-base"
                          style={{
                            background: `${currentTemplate.backgroundColor}50`,
                            borderColor: `${currentTemplate.primaryColor}40`,
                            color: currentTemplate.textColor,
                            '--tw-ring-color': currentTemplate.primaryColor
                          } as React.CSSProperties}
                        />
                        <div 
                          className="absolute inset-0 rounded-lg sm:rounded-xl pointer-events-none opacity-20"
                          style={{
                            background: `linear-gradient(135deg, ${currentTemplate.primaryColor}10, transparent)`
                          }}
                        />
                      </div>
                      <p 
                        className="text-xs rounded-lg px-2 sm:px-3 py-1 sm:py-2 border"
                        style={{
                          color: currentTemplate.textColor,
                          background: `${currentTemplate.backgroundColor}70`,
                          borderColor: `${currentTemplate.primaryColor}30`
                        }}
                      >
                        ✨ İsminizi yazarsanız, fotoğraflarınız bu isimle etiketlenecektir
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Card */}
            <div className="relative mb-6 sm:mb-8 md:mb-12">
              <div 
                className="absolute inset-0 rounded-2xl sm:rounded-3xl blur-2xl"
                style={{
                  background: `linear-gradient(135deg, ${currentTemplate.primaryColor}40, ${currentTemplate.secondaryColor}30)`
                }}
              />
              
              <div 
                className="relative backdrop-blur-xl rounded-2xl sm:rounded-3xl border overflow-hidden shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${currentTemplate.backgroundColor}50, ${currentTemplate.primaryColor}15)`,
                  borderColor: `${currentTemplate.primaryColor}40`
                }}
              >
                <div 
                  className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 border-b"
                  style={{
                    borderColor: `${currentTemplate.primaryColor}30`,
                    background: `linear-gradient(90deg, ${currentTemplate.primaryColor}20, transparent)`
                  }}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative">
                      <div 
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${currentTemplate.primaryColor}, ${currentTemplate.secondaryColor})`
                        }}
                      >
                        <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div 
                        className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white shadow-sm animate-bounce"
                        style={{ backgroundColor: currentTemplate.secondaryColor }}
                      />
                    </div>
                    <div>
                      <h2 
                        className="text-lg sm:text-xl md:text-2xl font-bold mb-1"
                        style={{ color: currentTemplate.textColor }}
                      >
                        📸 Fotoğraf Yükle
                      </h2>
                      <p 
                        className="text-xs sm:text-sm opacity-80"
                        style={{ color: currentTemplate.textColor }}
                      >
                        Birden fazla fotoğraf seçebilirsiniz
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 md:p-8">
                  <div
                    {...getRootProps()}
                    className={`
                      relative border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center cursor-pointer transition-all duration-300
                      ${uploading ? 'pointer-events-none opacity-50' : ''}
                      group overflow-hidden
                    `}
                    style={{
                      borderColor: isDragActive ? currentTemplate.primaryColor : `${currentTemplate.primaryColor}60`,
                      backgroundColor: isDragActive 
                        ? `${currentTemplate.primaryColor}20` 
                        : 'transparent'
                    }}
                  >
                    <input {...getInputProps()} />
                    
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `linear-gradient(135deg, ${currentTemplate.primaryColor}10, ${currentTemplate.secondaryColor}05)`
                      }}
                    />
                    
                    <div className="relative z-10">
                      {uploading ? (
                        <div className="space-y-3 sm:space-y-4">
                          <div 
                            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg animate-pulse"
                            style={{
                              background: `linear-gradient(135deg, ${currentTemplate.primaryColor}, ${currentTemplate.secondaryColor})`
                            }}
                          >
                            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                          <div>
                            <h3 
                              className="text-lg sm:text-xl font-bold mb-2"
                              style={{ color: currentTemplate.textColor }}
                            >
                              Yükleniyor...
                            </h3>
                            <div className="max-w-xs mx-auto">
                              <div 
                                className="w-full rounded-full h-2 sm:h-3 overflow-hidden border"
                                style={{
                                  backgroundColor: `${currentTemplate.backgroundColor}40`,
                                  borderColor: `${currentTemplate.primaryColor}30`
                                }}
                              >
                                <div 
                                  className="h-full transition-all duration-300 rounded-full shadow-lg"
                                  style={{ 
                                    width: `${uploadProgress}%`,
                                    background: `linear-gradient(90deg, ${currentTemplate.primaryColor}, ${currentTemplate.secondaryColor})`
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 sm:space-y-6">
                          <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24">
                            <div 
                              className="w-full h-full rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-300"
                              style={{
                                background: `linear-gradient(135deg, ${currentTemplate.primaryColor}, ${currentTemplate.secondaryColor})`
                              }}
                            >
                              <Camera className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                            </div>
                            <div 
                              className="absolute -inset-2 border-2 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 animate-ping"
                              style={{ borderColor: `${currentTemplate.primaryColor}50` }}
                            />
                          </div>
                          
                          <div className="space-y-2 sm:space-y-3">
                            <h3 
                              className="text-lg sm:text-xl md:text-2xl font-bold"
                              style={{ color: currentTemplate.textColor }}
                            >
                              {isDragActive ? '📁 Dosyaları bırakın' : '�🎥 Fotoğraf ve Videolarınızı seçin'}
                            </h3>
                            <p 
                              className="text-sm sm:text-base max-w-md mx-auto leading-relaxed opacity-90"
                              style={{ color: currentTemplate.textColor }}
                            >
                              {isDragActive 
                                ? 'Fotoğraf ve videoları buraya bırakabilirsiniz' 
                                : 'Fotoğraf ve videoları sürükleyip bırakın veya dosya seçmek için tıklayın'
                              }
                            </p>
                            
                            <div className="pt-3 sm:pt-4">
                              <div 
                                className="inline-flex items-center gap-2 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                                style={{
                                  background: `linear-gradient(135deg, ${currentTemplate.primaryColor}, ${currentTemplate.secondaryColor})`,
                                  boxShadow: `0 10px 30px ${currentTemplate.primaryColor}40`
                                }}
                              >
                                <div className="flex items-center gap-1">
                                  <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                                  <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                Fotoğraf & Video Yükle
                              </div>
                            </div>
                          </div>
                          
                          <div 
                            className="pt-3 sm:pt-4 border-t"
                            style={{ borderColor: `${currentTemplate.primaryColor}30` }}
                          >
                            <div className="space-y-2">
                              <p 
                                className="text-xs font-medium opacity-75"
                                style={{ color: currentTemplate.textColor }}
                              >
                                � Fotoğraf: JPG, PNG, WEBP, GIF (Max 10MB)
                              </p>
                              <p 
                                className="text-xs font-medium opacity-75"
                                style={{ color: currentTemplate.textColor }}
                              >
                                🎥 Video: MP4, MOV, AVI, MKV, WEBM (Max 100MB)
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div 
                    className="p-4 sm:p-6 md:p-8 border-t"
                    style={{
                      borderColor: `${currentTemplate.primaryColor}30`,
                      background: `linear-gradient(135deg, ${currentTemplate.primaryColor}20, ${currentTemplate.secondaryColor}15)`
                    }}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div 
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${currentTemplate.primaryColor}, ${currentTemplate.secondaryColor})`
                        }}
                      >
                        <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 
                          className="text-base sm:text-lg font-bold mb-1 sm:mb-2"
                          style={{ color: currentTemplate.textColor }}
                        >
                          ✅ Yükleme Başarılı!
                        </h3>
                        <p 
                          className="text-sm leading-relaxed opacity-90"
                          style={{ color: currentTemplate.textColor }}
                        >
                          {uploadedFiles.length} fotoğraf başarıyla yüklendi. Fotoğraflarınız etkinlik galerisine eklenmiştir.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300 p-4">
          <div 
            className="rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 md:p-12 text-center max-w-sm sm:max-w-md mx-auto transform transition-all scale-100 opacity-100 animate-in fade-in-0 zoom-in-95 border"
            style={{
              background: `linear-gradient(135deg, ${currentTemplate.backgroundColor}, ${currentTemplate.primaryColor}15)`,
              borderColor: `${currentTemplate.primaryColor}40`,
              boxShadow: `0 25px 50px ${currentTemplate.primaryColor}30`
            }}
          >
            <div className="relative inline-block">
              <CheckCircle 
                className="w-20 h-20 sm:w-24 sm:h-24"
                style={{ color: currentTemplate.primaryColor }}
              />
              <div 
                className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full animate-ping"
                style={{ backgroundColor: `${currentTemplate.primaryColor}40` }}
              />
              <div 
                className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full animate-pulse"
                style={{ backgroundColor: `${currentTemplate.primaryColor}60` }}
              />
            </div>
            <h2 
              className="text-2xl sm:text-3xl font-bold mt-6 sm:mt-8"
              style={{ color: currentTemplate.textColor }}
            >
              Yükleme Başarılı!
            </h2>
            <p 
              className="mt-2 sm:mt-3 text-base sm:text-lg opacity-90 leading-relaxed"
              style={{ color: currentTemplate.textColor }}
            >
              Fotoğraflarınız galeriye eklendi. Sayfa şimdi yenilenecek.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
