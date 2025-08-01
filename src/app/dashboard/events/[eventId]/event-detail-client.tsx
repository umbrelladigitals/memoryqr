'use client'

import { useState } from 'react'
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
  Clock
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
  createdAt: Date
  updatedAt: Date
  uploads: Upload[]
  customer: {
    name: string
    email: string
  }
}

interface EventDetailClientProps {
  event: Event
  userId: string
}

export default function EventDetailClient({ event, userId }: EventDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState<Upload | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGuest, setFilterGuest] = useState('')
  const [selectedUploads, setSelectedUploads] = useState<string[]>([])
  const router = useRouter()

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

  const filteredUploads = event.uploads.filter(upload => {
    const matchesSearch = upload.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (upload.guestName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesGuest = filterGuest === '' || upload.guestName === filterGuest
    return matchesSearch && matchesGuest
  })

  const uniqueGuests = [...new Set(event.uploads.map(u => u.guestName).filter(Boolean))]

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{event.title}</h1>
                <p className="text-gray-600">
                  {formatDate(event.date)} • {event.uploads.length} fotoğraf
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={event.isActive ? 'default' : 'secondary'}>
                {event.isActive ? 'Aktif' : 'Pasif'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleEventStatus}
              >
                {event.isActive ? 'Pasif Yap' : 'Aktif Yap'}
              </Button>
              <Link href={`/dashboard/events/${event.id}/qr`}>
                <Button variant="outline" size="sm">
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Kod
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Event Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Fotoğraf</p>
                  <p className="text-2xl font-bold">{event.uploads.length}</p>
                </div>
                <Image className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Benzersiz Misafir</p>
                  <p className="text-2xl font-bold">{uniqueGuests.length}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Boyut</p>
                  <p className="text-2xl font-bold">
                    {formatFileSize(event.uploads.reduce((total, upload) => total + upload.fileSize, 0))}
                  </p>
                </div>
                <Download className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">QR Kod</p>
                  <p className="text-sm font-mono break-all">{event.qrCode}</p>
                </div>
                <QrCode className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="p-6">
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
          </CardContent>
        </Card>

        {/* Photos Grid */}
        {filteredUploads.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Henüz fotoğraf yok</h3>
              <p className="text-gray-600 mb-4">
                Misafirleriniz QR kod okutup fotoğraf yüklediklerinde burada görünecek.
              </p>
              <Link href={`/dashboard/events/${event.id}/qr`}>
                <Button>
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Kodu Paylaş
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredUploads.map((upload) => (
              <div key={upload.id} className="relative group">
                <div 
                  className={`aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                    selectedUploads.includes(upload.id) 
                      ? 'ring-2 ring-blue-500' 
                      : 'hover:ring-2 hover:ring-gray-300'
                  }`}
                  onClick={() => setSelectedImage(upload)}
                >
                  <img
                    src={getImageUrl(upload.filePath)}
                    alt={upload.originalName}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        checked={selectedUploads.includes(upload.id)}
                        onChange={() => handleSelectUpload(upload.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4"
                      />
                    </div>
                    
                    <div className="absolute bottom-2 left-2 right-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="truncate">{upload.guestName || 'Anonim'}</p>
                      <p className="text-xs opacity-75">
                        {formatDate(upload.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{selectedImage.originalName}</DialogTitle>
              <DialogDescription>
                Yükleyen: {selectedImage.guestName || 'Anonim'} • 
                {formatDate(selectedImage.createdAt)} • 
                {formatFileSize(selectedImage.fileSize)}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center">
              <img
                src={getImageUrl(selectedImage.filePath)}
                alt={selectedImage.originalName}
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
              />
            </div>
            <div className="flex justify-between items-center pt-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{selectedImage.guestName || 'Anonim'}</span>
                <Clock className="h-4 w-4 ml-4" />
                <span className="text-sm">{formatDate(selectedImage.createdAt)}</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = selectedImage.filePath
                    link.download = selectedImage.originalName
                    link.click()
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
