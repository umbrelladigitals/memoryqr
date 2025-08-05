'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Download, 
  Search, 
  Filter, 
  Calendar,
  FolderArchive,
  HardDrive,
  FileImage,
  Users,
  Clock,
  CheckCircle,
  Archive,
  Trash2,
  Eye,
  MoreVertical
} from 'lucide-react'
import { toast } from 'sonner'

interface Upload {
  id: string
  fileName: string
  originalName: string
  fileSize: number
  filePath: string
  guestName: string | null
  createdAt: Date
}

interface Event {
  id: string
  title: string
  description: string | null
  date: Date
  location: string | null
  isActive: boolean
  uploads: Upload[]
  _count: {
    uploads: number
  }
}

interface DownloadsClientProps {
  events: Event[]
  totalStorageUsed: number
}

export default function DownloadsClient({ events, totalStorageUsed }: DownloadsClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [downloading, setDownloading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filter and sort uploads
  const allUploads = events.flatMap(event => 
    event.uploads.map(upload => ({ ...upload, eventTitle: event.title, eventId: event.id }))
  )

  const filteredUploads = allUploads
    .filter(upload => {
      const matchesSearch = upload.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (upload.guestName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                           upload.eventTitle.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesEvent = selectedEvent === 'all' || upload.eventId === selectedEvent
      
      return matchesSearch && matchesEvent
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'name':
          return a.originalName.localeCompare(b.originalName)
        case 'size':
          return b.fileSize - a.fileSize
        default:
          return 0
      }
    })

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredUploads.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(filteredUploads.map(upload => upload.id))
    }
  }

  const downloadSingle = async (upload: any) => {
    try {
      setDownloading(true)
      const response = await fetch(`/api/images/${encodeURIComponent(upload.filePath)}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = upload.originalName
        document.body.appendChild(link)
        link.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)
        toast.success('Dosya indiriliyor...')
      } else {
        toast.error('İndirme hatası')
      }
    } catch (error) {
      toast.error('İndirme sırasında hata oluştu')
    } finally {
      setDownloading(false)
    }
  }

  const downloadSelected = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Lütfen indirmek için dosya seçin')
      return
    }

    try {
      setDownloading(true)
      const response = await fetch('/api/downloads/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uploadIds: selectedFiles,
          eventId: selectedEvent !== 'all' ? selectedEvent : undefined
        }),
      })

      if (response.ok) {
        // ZIP dosyası döndü, blob olarak indir
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `selected-files-${Date.now()}.zip`
        document.body.appendChild(a)
        a.click()
        
        // Clean up
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast.success(`${selectedFiles.length} dosya ZIP olarak indiriliyor...`)
        setSelectedFiles([])
      } else {
        const error = await response.json()
        toast.error(error.error || 'İndirme hatası')
      }
    } catch (error) {
      toast.error('İndirme sırasında hata oluştu')
    } finally {
      setDownloading(false)
    }
  }

  const downloadEvent = async (eventId: string, eventTitle: string) => {
    try {
      setDownloading(true)
      const response = await fetch('/api/downloads/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
        }),
      })

      if (response.ok) {
        // ZIP dosyası döndü, blob olarak indir
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}-photos.zip`
        document.body.appendChild(a)
        a.click()
        
        // Clean up
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast.success(`${eventTitle} etkinliği ZIP olarak indiriliyor...`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'İndirme hatası')
      }
    } catch (error) {
      toast.error('İndirme sırasında hata oluştu')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">📥 İndirmeler</h1>
              <p className="text-gray-600 text-sm sm:text-base">Fotoğraflarınızı indirin ve yönetin</p>
            </div>
            
            {selectedFiles.length > 0 && (
              <Button 
                onClick={downloadSelected} 
                disabled={downloading}
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                {downloading ? 'İndiriliyor...' : `Seçili Dosyaları İndir (${selectedFiles.length})`}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Toplam Etkinlik</p>
                  <p className="text-lg sm:text-2xl font-bold">{events.length}</p>
                </div>
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Toplam Fotoğraf</p>
                  <p className="text-lg sm:text-2xl font-bold">{allUploads.length}</p>
                </div>
                <FileImage className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Toplam Boyut</p>
                  <p className="text-lg sm:text-2xl font-bold">{formatBytes(totalStorageUsed)}</p>
                </div>
                <HardDrive className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Aktif Etkinlik</p>
                  <p className="text-lg sm:text-2xl font-bold">{events.filter(e => e.isActive).length}</p>
                </div>
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="events">Etkinlik Bazında</TabsTrigger>
            <TabsTrigger value="files">Dosya Bazında</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            {/* Events Download */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Etkinlik Fotoğrafları</CardTitle>
                <CardDescription>Etkinliklerinizi toplu olarak indirin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map(event => (
                    <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1 mb-3 sm:mb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm sm:text-base">{event.title}</h3>
                          <Badge variant={event.isActive ? 'default' : 'secondary'} className="text-xs">
                            {event.isActive ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">
                          {formatDate(event.date)} {event.location && `• ${event.location}`}
                        </p>
                        <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500">
                          <span>{event._count.uploads} fotoğraf</span>
                          <span>{formatBytes(event.uploads.reduce((total, upload) => total + upload.fileSize, 0))}</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadEvent(event.id, event.title)}
                        disabled={downloading || event._count.uploads === 0}
                        className="w-full sm:w-auto"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {downloading ? 'İndiriliyor...' : 'İndir'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            {/* File Filters */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Dosya, misafir veya etkinlik ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:flex gap-2">
                    <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Etkinlikler</SelectItem>
                        {events.map(event => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title.length > 20 ? event.title.substring(0, 20) + '...' : event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy as any}>
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Tarih</SelectItem>
                        <SelectItem value="name">İsim</SelectItem>
                        <SelectItem value="size">Boyut</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {filteredUploads.length > 0 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedFiles.length === filteredUploads.length}
                        onCheckedChange={handleSelectAll}
                      />
                      <span className="text-sm text-gray-600">
                        {filteredUploads.length} dosya bulundu
                        {selectedFiles.length > 0 && ` • ${selectedFiles.length} seçili`}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Files List */}
            {filteredUploads.length === 0 ? (
              <Card>
                <CardContent className="p-8 sm:p-12 text-center">
                  <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Fotoğraf bulunamadı</h3>
                  <p className="text-gray-600">
                    Filtre kriterlerinizi değiştirmeyi deneyin.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="space-y-0">
                    {filteredUploads.map((upload, index) => (
                      <div 
                        key={upload.id} 
                        className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                          index !== filteredUploads.length - 1 ? 'border-b' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Checkbox
                            checked={selectedFiles.includes(upload.id)}
                            onCheckedChange={() => handleSelectFile(upload.id)}
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{upload.originalName}</p>
                                <p className="text-xs text-gray-500">
                                  {upload.eventTitle} • {upload.guestName || 'Anonim'}
                                </p>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>{formatBytes(upload.fileSize)}</span>
                                <span>{formatDate(upload.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadSingle(upload)}
                          disabled={downloading}
                          className="ml-2 flex-shrink-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
