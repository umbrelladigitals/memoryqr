"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2, HardDrive } from 'lucide-react'

interface SystemSettings {
  id: number
  max_file_size_mb: number
  allowed_file_types: string
  auto_cleanup_enabled: boolean
  cleanup_days: number
  upload_path: string
  require_auth: boolean
  [key: string]: any
}

interface UploadSettingsProps {
  settings: SystemSettings
  onUpdate: (settings: Partial<SystemSettings>) => Promise<void>
  loading: boolean
}

export function UploadSettings({ settings, onUpdate, loading }: UploadSettingsProps) {
  const [formData, setFormData] = useState({
    max_file_size_mb: settings?.max_file_size_mb || 10,
    allowed_file_types: settings?.allowed_file_types || 'jpg,jpeg,png,gif,mp4,mov,avi',
    auto_cleanup_enabled: settings?.auto_cleanup_enabled || false,
    cleanup_days: settings?.cleanup_days || 30,
    upload_path: settings?.upload_path || 'uploads',
    require_auth: settings?.require_auth || true
  })

  const [cleanupLoading, setCleanupLoading] = useState(false)

  // Update form data when settings prop changes
  useEffect(() => {
    setFormData({
      max_file_size_mb: settings?.max_file_size_mb || 10,
      allowed_file_types: settings?.allowed_file_types || 'jpg,jpeg,png,gif,mp4,mov,avi',
      auto_cleanup_enabled: settings?.auto_cleanup_enabled || false,
      cleanup_days: settings?.cleanup_days || 30,
      upload_path: settings?.upload_path || 'uploads',
      require_auth: settings?.require_auth || true
    })
  }, [settings])

  const handleInputChange = (name: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    await onUpdate(formData)
  }

  const runCleanup = async () => {
    setCleanupLoading(true)
    try {
      const response = await fetch('/api/admin/cleanup-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          days: formData.cleanup_days
        }),
      })

      if (!response.ok) {
        throw new Error('Temizlik işlemi başarısız')
      }

      const data = await response.json()
      alert(`${data.deletedCount} dosya temizlendi.`)
    } catch (error) {
      console.error('Cleanup error:', error)
      alert('Temizlik işlemi sırasında bir hata oluştu')
    } finally {
      setCleanupLoading(false)
    }
  }

  const getFileTypeArray = () => {
    return formData.allowed_file_types.split(',').map(type => type.trim()).filter(type => type)
  }

  const addFileType = (type: string) => {
    const types = getFileTypeArray()
    if (!types.includes(type)) {
      types.push(type)
      handleInputChange('allowed_file_types', types.join(','))
    }
  }

  const removeFileType = (type: string) => {
    const types = getFileTypeArray().filter(t => t !== type)
    handleInputChange('allowed_file_types', types.join(','))
  }

  const commonFileTypes = [
    { category: 'Resim', types: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'] },
    { category: 'Video', types: ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'] },
    { category: 'Ses', types: ['mp3', 'wav', 'ogg', 'aac', 'm4a'] },
    { category: 'Doküman', types: ['pdf', 'doc', 'docx', 'txt', 'rtf'] },
    { category: 'Arşiv', types: ['zip', 'rar', '7z', 'tar', 'gz'] }
  ]

  return (
    <div className="space-y-6">
      {/* Dosya Boyutu Ayarları */}
      <Card>
        <CardHeader>
          <CardTitle>Dosya Boyutu Limitleri</CardTitle>
          <CardDescription>Yüklenebilecek maksimum dosya boyutunu belirleyin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="max_file_size_mb">Maksimum Dosya Boyutu (MB)</Label>
            <Input
              id="max_file_size_mb"
              type="number"
              min="1"
              max="1000"
              value={formData.max_file_size_mb}
              onChange={(e) => handleInputChange('max_file_size_mb', parseInt(e.target.value))}
            />
            <p className="text-xs text-gray-500">
              Önerilen: Resimler için 10MB, videolar için 100MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dosya Türleri */}
      <Card>
        <CardHeader>
          <CardTitle>İzin Verilen Dosya Türleri</CardTitle>
          <CardDescription>Hangi dosya türlerinin yüklenebileceğini belirleyin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Aktif Dosya Türleri</Label>
            <div className="flex flex-wrap gap-2">
              {getFileTypeArray().map(type => (
                <div
                  key={type}
                  className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                >
                  <span>.{type}</span>
                  <button
                    onClick={() => removeFileType(type)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {commonFileTypes.map(category => (
              <div key={category.category} className="space-y-2">
                <Label className="text-sm font-medium">{category.category}</Label>
                <div className="flex flex-wrap gap-2">
                  {category.types.map(type => {
                    const isActive = getFileTypeArray().includes(type)
                    return (
                      <button
                        key={type}
                        onClick={() => isActive ? removeFileType(type) : addFileType(type)}
                        className={`px-3 py-1 rounded-md text-sm border transition-colors ${
                          isActive 
                            ? 'bg-green-100 border-green-300 text-green-800' 
                            : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        .{type}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_type">Özel Dosya Türü Ekle</Label>
            <div className="flex space-x-2">
              <Input
                id="custom_type"
                placeholder="Örn: pdf"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement
                    const value = input.value.trim().toLowerCase()
                    if (value) {
                      addFileType(value)
                      input.value = ''
                    }
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={() => {
                  const input = document.getElementById('custom_type') as HTMLInputElement
                  const value = input.value.trim().toLowerCase()
                  if (value) {
                    addFileType(value)
                    input.value = ''
                  }
                }}
              >
                Ekle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Güvenlik Ayarları */}
      <Card>
        <CardHeader>
          <CardTitle>Güvenlik Ayarları</CardTitle>
          <CardDescription>Dosya yükleme güvenlik ayarları</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="require_auth">Kimlik Doğrulama Gerektir</Label>
              <p className="text-sm text-gray-500">
                Dosya yüklemek için kullanıcının oturum açması gereksin
              </p>
            </div>
            <Switch
              id="require_auth"
              checked={formData.require_auth}
              onCheckedChange={(checked) => handleInputChange('require_auth', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Otomatik Temizlik */}
      <Card>
        <CardHeader>
          <CardTitle>Otomatik Temizlik</CardTitle>
          <CardDescription>Eski dosyaları otomatik olarak temizleyin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto_cleanup_enabled">Otomatik Temizlik</Label>
              <p className="text-sm text-gray-500">
                Belirtilen günden eski dosyaları otomatik sil
              </p>
            </div>
            <Switch
              id="auto_cleanup_enabled"
              checked={formData.auto_cleanup_enabled}
              onCheckedChange={(checked) => handleInputChange('auto_cleanup_enabled', checked)}
            />
          </div>

          {formData.auto_cleanup_enabled && (
            <div className="space-y-2">
              <Label htmlFor="cleanup_days">Temizlik Gün Sayısı</Label>
              <Input
                id="cleanup_days"
                type="number"
                min="1"
                max="365"
                value={formData.cleanup_days}
                onChange={(e) => handleInputChange('cleanup_days', parseInt(e.target.value))}
              />
              <p className="text-xs text-gray-500">
                Bu günden eski dosyalar silinecek
              </p>
            </div>
          )}

          <Alert>
            <HardDrive className="h-4 w-4" />
            <AlertDescription>
              Temizlik işlemi geri alınamaz. Önemli dosyalarınızı yedeklediğinizden emin olun.
            </AlertDescription>
          </Alert>

          <Button
            variant="outline"
            onClick={runCleanup}
            disabled={cleanupLoading}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {cleanupLoading ? 'Temizleniyor...' : 'Manuel Temizlik Başlat'}
          </Button>
        </CardContent>
      </Card>

      {/* Depolama Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle>Depolama Yolu</CardTitle>
          <CardDescription>Dosyaların saklandığı klasör yolu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="upload_path">Yükleme Klasörü</Label>
            <Input
              id="upload_path"
              value={formData.upload_path}
              onChange={(e) => handleInputChange('upload_path', e.target.value)}
              placeholder="uploads"
            />
            <p className="text-xs text-gray-500">
              public/ klasörüne göre relatif yol
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Kaydet Butonu */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={loading}
          className="min-w-[120px]"
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>
    </div>
  )
}
