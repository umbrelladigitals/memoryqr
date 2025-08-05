'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  ArrowLeft,
  QrCode, 
  Image, 
  Download, 
  Trash2, 
  Eye,
  Calendar,
  MapPin,
  Users,
  Share2,
  MoreVertical,
  Heart,
  User,
  Clock,
  ChevronLeft,
  ChevronRight,
  Crown,
  Cake,
  Building,
  Video,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Download as DownloadIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { getImageUrl } from '@/lib/image-utils'

interface Upload {
  id: string
  fileName: string
  originalName: string
  fileSize: number
  mimeType: string
  filePath: string
  thumbnailPath: string | null
  guestId: string | null
  guestName: string | null
  isApproved: boolean
  likes: number
  metadata: any
  createdAt: Date
  updatedAt: Date
}

interface Event {
  id: string
  title: string
  description: string | null
  date: Date
  location: string | null
  isActive: boolean
  qrCode: string
  maxUploads: number | null
  autoArchive: boolean
  archiveDate: Date | null
  bannerImage: string | null
  customLogo: string | null
  customColors: any | null
  selectedTemplate: string | null
  eventType: string | null
  participants: any | null
  customMessage: string | null
  createdAt: Date
  updatedAt: Date
  uploads: Upload[]
  customer: {
    name: string
    email: string
  }
  template?: {
    id: string
    name: string
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    textColor: string
    cardStyle: string
    buttonStyle: string
    headerStyle: string
  } | null
}

interface EventDetailClientProps {
  event: Event
  userId: string
}

export default function EventDetailClient({ event, userId }: EventDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState<Upload | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGuest, setFilterGuest] = useState('')
  const [filterApproved, setFilterApproved] = useState<'all' | 'approved' | 'pending'>('all')
  const [filterMediaType, setFilterMediaType] = useState<'all' | 'images' | 'videos'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest')
  const [selectedUploads, setSelectedUploads] = useState<string[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [videoPlaying, setVideoPlaying] = useState<{ [key: string]: boolean }>({})
  const [videoVolume, setVideoVolume] = useState<{ [key: string]: number }>({})
  const router = useRouter()

  // Utility functions
  const isVideo = (mimeType: string) => mimeType.startsWith('video/')
  const isImage = (mimeType: string) => mimeType.startsWith('image/')

  // Filter and sort uploads
  const filteredUploads = React.useMemo(() => {
    let filtered = [...event.uploads]

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(upload => 
        upload.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (upload.guestName && upload.guestName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Guest filter
    if (filterGuest) {
      filtered = filtered.filter(upload => upload.guestName === filterGuest)
    }

    // Media type filter
    if (filterMediaType === 'images') {
      filtered = filtered.filter(upload => isImage(upload.mimeType))
    } else if (filterMediaType === 'videos') {
      filtered = filtered.filter(upload => isVideo(upload.mimeType))
    }

    // Approval status filter
    if (filterApproved === 'approved') {
      filtered = filtered.filter(upload => upload.isApproved)
    } else if (filterApproved === 'pending') {
      filtered = filtered.filter(upload => !upload.isApproved)
    }

    // Sort
    switch (sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'name':
        filtered.sort((a, b) => a.originalName.localeCompare(b.originalName))
        break
      case 'size':
        filtered.sort((a, b) => b.fileSize - a.fileSize)
        break
      default: // newest
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return filtered
  }, [event.uploads, searchTerm, filterGuest, filterMediaType, filterApproved, sortBy])

  // Get unique guests for filter
  const uniqueGuests = React.useMemo(() => {
    const guests = event.uploads
      .map(upload => upload.guestName)
      .filter((name, index, arr) => arr.indexOf(name) === index)
      .sort()
    return guests
  }, [event.uploads])

  // CSS for floating animation
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        33% { transform: translateY(-10px) rotate(1deg); }
        66% { transform: translateY(-5px) rotate(-1deg); }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])



  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Navigation functions for modal
  const goToPrevious = () => {
    if (currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1
      setCurrentImageIndex(newIndex)
      setSelectedImage(filteredUploads[newIndex])
    }
  }

  const goToNext = () => {
    if (currentImageIndex < filteredUploads.length - 1) {
      const newIndex = currentImageIndex + 1
      setCurrentImageIndex(newIndex)
      setSelectedImage(filteredUploads[newIndex])
    }
  }

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (selectedImage) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToNext()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setSelectedImage(null)
      }
    }
  }

  // Add keyboard event listener
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedImage, currentImageIndex, filteredUploads])

  // Mobile detection
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Touch/Swipe handlers for mobile
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && currentImageIndex < filteredUploads.length - 1) {
      goToNext()
    }
    if (isRightSwipe && currentImageIndex > 0) {
      goToPrevious()
    }
  }

  const handleSelectUpload = (uploadId: string) => {
    setSelectedUploads(prev => 
      prev.includes(uploadId) 
        ? prev.filter(id => id !== uploadId)
        : [...prev, uploadId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUploads.length === filteredUploads.length) {
      setSelectedUploads([])
    } else {
      setSelectedUploads(filteredUploads.map(u => u.id))
    }
  }

  const handleDownloadSelected = async () => {
    if (selectedUploads.length === 0) {
      toast.error('Lütfen indirmek için fotoğraf seçin')
      return
    }

    try {
      const response = await fetch('/api/downloads/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uploadIds: selectedUploads,
          eventId: event.id,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${event.title}-photos.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Fotoğraflar indiriliyor...')
      } else {
        toast.error('İndirme hatası')
      }
    } catch (error) {
      toast.error('İndirme sırasında hata oluştu')
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedUploads.length === 0) {
      toast.error('Lütfen silmek için fotoğraf seçin')
      return
    }

    if (!confirm(`${selectedUploads.length} fotoğrafı silmek istediğinizden emin misiniz?`)) {
      return
    }

    try {
      const response = await fetch('/api/uploads/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uploadIds: selectedUploads,
          eventId: event.id,
        }),
      })

      if (response.ok) {
        toast.success('Fotoğraflar silindi')
        setSelectedUploads([])
        router.refresh()
      } else {
        toast.error('Silme hatası')
      }
    } catch (error) {
      toast.error('Silme sırasında hata oluştu')
    }
  }

  const handleToggleEventStatus = async () => {
    try {
      const response = await fetch(`/api/events/${event.id}/toggle`, {
        method: 'PATCH',
      })

      if (response.ok) {
        toast.success(`Etkinlik ${event.isActive ? 'pasif' : 'aktif'} duruma getirildi`)
        router.refresh()
      } else {
        toast.error('Durum değiştirme hatası')
      }
    } catch (error) {
      toast.error('Hata oluştu')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 touch-manipulation">
      {/* Header - Mobile Optimized */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="px-2 sm:px-4">
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold truncate">{event.title}</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {isMobile 
                    ? `${event.uploads.length} fotoğraf`
                    : `${formatDate(event.date)} • ${event.uploads.length} fotoğraf`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <Badge variant={event.isActive ? 'default' : 'secondary'} className="text-xs">
                {event.isActive ? 'Aktif' : 'Pasif'}
              </Badge>
              {!isMobile && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleEventStatus}
                  >
                    {event.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                  </Button>
                  <Link href={`/dashboard/events/${event.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Etkinlik Düzenle
                    </Button>
                  </Link>
                  <Link href={`/dashboard/events/${event.id}/template`}>
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      Şablon Düzenle
                    </Button>
                  </Link>
                  <Link href={`/dashboard/events/${event.id}/qr`}>
                    <Button variant="outline" size="sm">
                      <QrCode className="h-4 w-4 mr-2" />
                      QR Kod
                    </Button>
                  </Link>
                </>
              )}
              {isMobile && (
                <div className="flex space-x-1">
                  <Link href={`/dashboard/events/${event.id}/edit`}>
                    <Button variant="outline" size="sm" className="px-2">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/dashboard/events/${event.id}/template`}>
                    <Button variant="outline" size="sm" className="px-2">
                      <Users className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/dashboard/events/${event.id}/qr`}>
                    <Button variant="outline" size="sm" className="px-2">
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Facebook-style Banner and Logo Section */}
        <div className="relative">
          {/* Banner Image */}
          {event.bannerImage ? (
            <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden">
              <img 
                src={getImageUrl(event.bannerImage)} 
                alt="Etkinlik Banner" 
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Event Info Overlay on Banner - Logo ile çakışmayı önle */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className={`space-y-3 ${event.customLogo ? 'ml-28 sm:ml-36' : ''}`}>
                  <h1 className="text-2xl sm:text-4xl font-bold drop-shadow-2xl text-white">{event.title}</h1>
                  {event.description && (
                    <p className="text-sm sm:text-lg drop-shadow-lg text-white/95 line-clamp-2 font-medium">{event.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-lg px-2 py-1">
                      <Calendar className="h-4 w-4 text-white" />
                      <span className="text-white font-medium">{formatDate(event.date)}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-lg px-2 py-1">
                        <MapPin className="h-4 w-4 text-white" />
                        <span className="text-white font-medium">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* No Banner - Use Template Colors with Better Gradient */
            <div 
              className="relative h-48 sm:h-64 md:h-80 overflow-hidden"
              style={{ backgroundColor: event.template?.primaryColor || event.customColors?.primary || '#3B82F6' }}
            >
              {/* Enhanced Gradient Background */}
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${event.template?.primaryColor || event.customColors?.primary || '#3B82F6'} 0%, ${event.template?.secondaryColor || event.customColors?.secondary || '#1D4ED8'} 50%, ${event.template?.primaryColor || event.customColors?.primary || '#3B82F6'} 100%)`
                }}
              />
              
              {/* Modern Pattern Overlay */}
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full" style={{
                  backgroundImage: `
                    radial-gradient(circle at 20% 50%, white 2px, transparent 2px),
                    radial-gradient(circle at 80% 50%, white 1px, transparent 1px),
                    radial-gradient(circle at 40% 20%, white 1px, transparent 1px),
                    radial-gradient(circle at 60% 80%, white 1px, transparent 1px)
                  `,
                  backgroundSize: '60px 60px, 40px 40px, 30px 30px, 50px 50px',
                  animation: 'float 20s ease-in-out infinite'
                }} />
              </div>
              
              {/* Additional Overlay for Better Text Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
              
              {/* Event Info on Colored Background */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="space-y-3">
                  <h1 className="text-2xl sm:text-4xl font-bold drop-shadow-2xl text-white">{event.title}</h1>
                  {event.description && (
                    <p className="text-sm sm:text-lg drop-shadow-lg text-white/95 line-clamp-2 font-medium">{event.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                      <Calendar className="h-4 w-4 text-white" />
                      <span className="text-white font-medium">{formatDate(event.date)}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                        <MapPin className="h-4 w-4 text-white" />
                        <span className="text-white font-medium">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Logo - Facebook Style Positioning */}
          {event.customLogo && (
            <div className="absolute -bottom-8 left-4 sm:left-6">
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl p-2 shadow-xl border-4 border-white">
                  <img 
                    src={getImageUrl(event.customLogo)} 
                    alt="Logo" 
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Content with proper spacing for logo */}
        <div className={`p-2 sm:p-6 ${event.customLogo ? 'pt-12 sm:pt-16' : 'pt-4'}`}>
          {/* Event Info Cards - Only show if no banner (to avoid duplication) */}
          {!event.bannerImage && (
            <div className="mb-6">
              <div className="space-y-4">
                {/* Event Title and Description */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
                  {event.description && (
                    <p className="text-gray-600 text-sm sm:text-base">{event.description}</p>
                  )}
                </div>
                
                {/* Event Details */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-2 sm:p-6 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-6 mb-3 sm:mb-8">
          <Card className="overflow-hidden">
            <CardContent className="p-2 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Fotoğraf</p>
                  <p className="text-sm sm:text-2xl font-bold">
                    {event.uploads.filter(u => isImage(u.mimeType)).length}
                  </p>
                </div>
                <Image className="h-4 w-4 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardContent className="p-2 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Video</p>
                  <p className="text-sm sm:text-2xl font-bold">
                    {event.uploads.filter(u => isVideo(u.mimeType)).length}
                  </p>
                </div>
                <Video className="h-4 w-4 sm:h-8 sm:w-8 text-red-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardContent className="p-2 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Misafir</p>
                  <p className="text-sm sm:text-2xl font-bold">{uniqueGuests.length}</p>
                </div>
                <Users className="h-4 w-4 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardContent className="p-2 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Boyut</p>
                  <p className="text-xs sm:text-2xl font-bold truncate">
                    {formatFileSize(event.uploads.reduce((total, upload) => total + upload.fileSize, 0))}
                  </p>
                </div>
                <Download className="h-4 w-4 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0 ml-1" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardContent className="p-2 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">QR Kod</p>
                  <p className="text-xs font-mono break-all">{event.qrCode.substring(0, 8)}...</p>
                </div>
                <QrCode className="h-4 w-4 sm:h-8 sm:w-8 text-orange-600 flex-shrink-0 ml-1" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Participants Information */}
        {event.participants && Object.values(event.participants).some((value: any) => value) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Katılımcı Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {event.participants.bride && (
                  <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
                    <Heart className="h-5 w-5 text-pink-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Gelin</p>
                      <p className="text-lg font-semibold text-pink-700">{event.participants.bride}</p>
                    </div>
                  </div>
                )}
                {event.participants.groom && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Crown className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Damat</p>
                      <p className="text-lg font-semibold text-blue-700">{event.participants.groom}</p>
                    </div>
                  </div>
                )}
                {event.participants.celebrant && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Cake className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Kutlanan Kişi</p>
                      <p className="text-lg font-semibold text-purple-700">{event.participants.celebrant}</p>
                    </div>
                  </div>
                )}
                {event.participants.organizer && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Building className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Organizatör</p>
                      <p className="text-lg font-semibold text-green-700">{event.participants.organizer}</p>
                    </div>
                  </div>
                )}
                {event.participants.parents && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <Users className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Ebeveynler</p>
                      <p className="text-lg font-semibold text-orange-700">{event.participants.parents}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Actions - Mobile Ultra Fixed */}
        <Card className="mb-3 sm:mb-6">
          <CardContent className="p-1.5 sm:p-6">
            {/* Mobile: Minimal Layout */}
            {isMobile ? (
              <div className="space-y-2">
                {/* Search Bar - Ultra Compact */}
                <Input
                  placeholder="Ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs py-1.5 px-2 h-8 border border-gray-300 rounded"
                />
                
                {/* Filters - Very Compact */}
                <div className="grid grid-cols-4 gap-1">
                  <select
                    value={filterGuest}
                    onChange={(e) => setFilterGuest(e.target.value)}
                    className="w-full px-1 py-1.5 border border-gray-300 rounded text-xs bg-white h-8"
                  >
                    <option value="">Misafir</option>
                    {uniqueGuests.map(guest => (
                      <option key={guest || 'anonymous'} value={guest || ''}>
                        {guest ? (guest.length > 6 ? guest.substring(0, 6) + '...' : guest) : 'Anonim'}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={filterMediaType}
                    onChange={(e) => setFilterMediaType(e.target.value as 'all' | 'images' | 'videos')}
                    className="w-full px-1 py-1.5 border border-gray-300 rounded text-xs bg-white h-8"
                  >
                    <option value="all">Tümü</option>
                    <option value="images">📷 Foto</option>
                    <option value="videos">🎥 Video</option>
                  </select>
                  
                  <select
                    value={filterApproved}
                    onChange={(e) => setFilterApproved(e.target.value as 'all' | 'approved' | 'pending')}
                    className="w-full px-1 py-1.5 border border-gray-300 rounded text-xs bg-white h-8"
                  >
                    <option value="all">Durum</option>
                    <option value="approved">✓ Onay</option>
                    <option value="pending">⏳ Bekle</option>
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name' | 'size')}
                    className="w-full px-1 py-1.5 border border-gray-300 rounded text-xs bg-white h-8"
                  >
                    <option value="newest">↓ Yeni</option>
                    <option value="oldest">↑ Eski</option>
                    <option value="name">A-Z</option>
                    <option value="size">Boyut</option>
                  </select>
                </div>
                
                {/* Actions - Minimal */}
                {filteredUploads.length > 0 && (
                  <div className="bg-blue-50 rounded p-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">
                        {filteredUploads.length} foto
                        {selectedUploads.length > 0 && ` • ${selectedUploads.length} seçili`}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        className="px-1.5 py-0.5 text-xs h-5 min-h-0"
                      >
                        {selectedUploads.length === filteredUploads.length ? 'X' : '✓'}
                      </Button>
                    </div>
                    
                    {selectedUploads.length > 0 && (
                      <div className="flex space-x-1 mt-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadSelected}
                          className="flex-1 py-1 text-xs bg-white h-6"
                        >
                          ↓ {selectedUploads.length}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDeleteSelected}
                          className="flex-1 py-1 text-xs h-6"
                        >
                          🗑 {selectedUploads.length}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Desktop: Original Layout */
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <Input
                    placeholder="Fotoğraf veya misafir ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <select
                    value={filterGuest}
                    onChange={(e) => setFilterGuest(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="">Tüm Misafirler</option>
                    {uniqueGuests.map(guest => (
                      <option key={guest || 'anonymous'} value={guest || ''}>{guest || 'Anonim'}</option>
                    ))}
                  </select>
                  <select
                    value={filterMediaType}
                    onChange={(e) => setFilterMediaType(e.target.value as 'all' | 'images' | 'videos')}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">Tüm Medya</option>
                    <option value="images">📷 Fotoğraflar</option>
                    <option value="videos">🎥 Videolar</option>
                  </select>
                  <select
                    value={filterApproved}
                    onChange={(e) => setFilterApproved(e.target.value as 'all' | 'approved' | 'pending')}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">Tüm Durumlar</option>
                    <option value="approved">Onaylanmış</option>
                    <option value="pending">Beklemede</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name' | 'size')}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="newest">En Yeni</option>
                    <option value="oldest">En Eski</option>
                    <option value="name">İsme Göre</option>
                    <option value="size">Boyuta Göre</option>
                  </select>
                </div>
                
                {filteredUploads.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      {selectedUploads.length === filteredUploads.length ? 'Hiçbirini Seçme' : 'Tümünü Seç'}
                    </Button>
                    {selectedUploads.length > 0 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadSelected}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          İndir ({selectedUploads.length})
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDeleteSelected}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Sil ({selectedUploads.length})
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photos Grid - Mobile Enhanced */}
        {filteredUploads.length === 0 ? (
          <Card>
            <CardContent className="p-8 sm:p-12 text-center">
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || filterGuest || filterApproved !== 'all' 
                  ? 'Filtre kriterlerine uygun fotoğraf bulunamadı' 
                  : 'Henüz fotoğraf yok'
                }
              </h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                {searchTerm || filterGuest || filterApproved !== 'all' 
                  ? 'Farklı filtre seçeneklerini deneyebilirsiniz.'
                  : 'Misafirleriniz QR kod okutup fotoğraf yüklediklerinde burada görünecek.'
                }
              </p>
              {!(searchTerm || filterGuest || filterApproved !== 'all') && (
                <Link href={`/dashboard/events/${event.id}/qr`}>
                  <Button className="w-full sm:w-auto">
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Kodu Paylaş
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div>
            {/* Mobile Results Header - Compact */}
            {isMobile && (
              <div className="mb-2 p-2 bg-gray-100 rounded text-center">
                <span className="text-xs text-gray-600">
                  {filteredUploads.length} fotoğraf
                  {selectedUploads.length > 0 && ` • ${selectedUploads.length} seçili`}
                </span>
              </div>
            )}
            
            <div className={`grid gap-1 sm:gap-4 ${
              isMobile 
                ? 'grid-cols-3' 
                : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6'
            }`}>
              {filteredUploads.map((upload, index) => (
                <div key={upload.id} className="relative group">
                  <div 
                    className={`${
                      isMobile ? 'aspect-square' : 'aspect-square'
                    } rounded-lg overflow-hidden cursor-pointer transition-all border-2 bg-gray-100 ${
                      selectedUploads.includes(upload.id) 
                        ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                    }`}
                    onClick={() => {
                      setSelectedImage(upload)
                      setCurrentImageIndex(index)
                    }}
                  >
                    {/* Loading placeholder */}
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                      {isVideo(upload.mimeType) ? (
                        <Video className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-gray-400`} />
                      ) : (
                        <Image className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-gray-400`} />
                      )}
                    </div>
                    
                    {/* Video or Image */}
                    {isVideo(upload.mimeType) ? (
                      <div className="relative w-full h-full">
                        <video
                          src={getImageUrl(upload.filePath)}
                          className="w-full h-full object-cover relative z-10"
                          preload="metadata"
                          onLoadedData={(e) => {
                            const placeholder = (e.target as HTMLElement).parentElement?.previousElementSibling as HTMLElement
                            if (placeholder) placeholder.style.display = 'none'
                          }}
                        />
                        {/* Video Play Icon Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                          <div className="bg-black/50 rounded-full p-2">
                            <Play className="w-6 h-6 text-white fill-white" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={getImageUrl(upload.filePath)}
                        alt={upload.originalName}
                        className="w-full h-full object-cover relative z-10"
                        loading="lazy"
                        onLoad={(e) => {
                          const placeholder = (e.target as HTMLElement).previousElementSibling as HTMLElement
                          if (placeholder) placeholder.style.display = 'none'
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    )}
                    
                    {/* Mobile: Compact overlay */}
                    {isMobile ? (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-active:bg-opacity-20 transition-all duration-200">
                        {/* Checkbox - Small and positioned */}
                        <div className="absolute top-1 left-1">
                          <input
                            type="checkbox"
                            checked={selectedUploads.includes(upload.id)}
                            onChange={() => handleSelectUpload(upload.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 text-blue-600 bg-white border border-gray-300 rounded"
                          />
                        </div>
                        
                        {/* Guest name overlay - smaller */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-1 py-0.5">
                          <p className="text-white text-xs truncate">
                            {upload.guestName || 'Anonim'}
                          </p>
                        </div>
                      </div>
                    ) : (
                    /* Desktop: Full overlay */
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
                      <div className="absolute top-2 left-2">
                        <input
                          type="checkbox"
                          checked={selectedUploads.includes(upload.id)}
                          onChange={() => handleSelectUpload(upload.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <p className="font-medium truncate">{upload.guestName || 'Anonim'}</p>
                        <p className="text-xs opacity-90">
                          {formatDate(upload.createdAt)}
                        </p>
                        <p className="text-xs opacity-75">
                          {formatFileSize(upload.fileSize)}
                        </p>
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>      {/* Image Modal - Mobile Optimized */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className={`${
            isMobile 
              ? 'max-w-[100vw] max-h-[100vh] w-full h-full p-1 m-0 rounded-none' 
              : 'max-w-4xl max-h-[90vh]'
          }`}>
            <DialogHeader className={isMobile ? 'px-1 py-1' : ''}>
              <DialogTitle className="flex items-center justify-between text-sm sm:text-base">
                <span className="truncate pr-2 text-sm">{selectedImage.originalName}</span>
                <span className="text-xs font-normal text-gray-500 flex-shrink-0">
                  {currentImageIndex + 1} / {filteredUploads.length}
                </span>
              </DialogTitle>
              <DialogDescription className={`text-xs sm:text-sm ${isMobile ? 'space-y-1' : 'flex items-center space-x-2'}`}>
                Yükleyen: {selectedImage.guestName || 'Anonim'}
                {!isMobile && ' • '}
                {formatDate(selectedImage.createdAt)}
                {!isMobile && ' • '}
                {formatFileSize(selectedImage.fileSize)}
                {isMobile && (
                  <span className="block text-center text-xs text-gray-400 mt-1">
                    ← Sola kaydır: Sonraki • Sağa kaydır: Önceki →
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div 
              className="relative flex justify-center"
              onTouchStart={isMobile ? onTouchStart : undefined}
              onTouchMove={isMobile ? onTouchMove : undefined}
              onTouchEnd={isMobile ? onTouchEnd : undefined}
            >
              {/* Navigation Buttons */}
              {!isMobile && currentImageIndex > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              
              {/* Mobile: Small navigation dots */}
              {isMobile && filteredUploads.length > 1 && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="flex space-x-1 bg-black/60 rounded-full px-2 py-1">
                    {filteredUploads.map((_, index) => (
                      <div
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              
              {/* Media Content - Video or Image */}
              {isVideo(selectedImage.mimeType) ? (
                <video
                  src={getImageUrl(selectedImage.filePath)}
                  controls
                  autoPlay={false}
                  className={`${
                    isMobile 
                      ? 'w-full h-auto max-w-full max-h-[70vh] object-contain' 
                      : 'max-w-full max-h-[60vh] object-contain rounded-lg'
                  }`}
                  crossOrigin="anonymous"
                  preload="metadata"
                />
              ) : (
                <img
                  src={getImageUrl(selectedImage.filePath)}
                  alt={selectedImage.originalName}
                  className={`${
                    isMobile 
                      ? 'w-full h-auto max-w-full max-h-[70vh] object-contain' 
                      : 'max-w-full max-h-[60vh] object-contain rounded-lg'
                  }`}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                />
              )}
              
              {!isMobile && currentImageIndex < filteredUploads.length - 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className={`flex ${isMobile ? 'justify-center px-1 pb-1' : 'justify-between items-center'} pt-2 sm:pt-4`}>
              {!isMobile && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{selectedImage.guestName || 'Anonim'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{formatDate(selectedImage.createdAt)}</span>
                  </div>
                  <div className="text-xs text-gray-500 hidden md:block">
                    ← → ok tuşları ile geçiş yapın • ESC ile kapat
                  </div>
                </div>
              )}
              
              <div className={`flex ${isMobile ? 'justify-center' : 'space-x-2'}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className={isMobile ? 'w-full' : ''}
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/images/${encodeURIComponent(selectedImage.filePath)}`)
                      if (response.ok) {
                        const blob = await response.blob()
                        const url = window.URL.createObjectURL(blob)
                        const link = document.createElement('a')
                        link.href = url
                        link.download = selectedImage.originalName
                        document.body.appendChild(link)
                        link.click()
                        window.URL.revokeObjectURL(url)
                        document.body.removeChild(link)
                        toast.success('Fotoğraf indiriliyor...')
                      } else {
                        toast.error('İndirme hatası')
                      }
                    } catch (error) {
                      toast.error('İndirme sırasında hata oluştu')
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  İndir
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
