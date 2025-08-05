'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  Image, 
  Video, 
  HardDrive, 
  Save, 
  AlertTriangle,
  Trash2,
  RefreshCw,
  Database
} from 'lucide-react'

interface UploadSettingsProps {
  settings: any
  onSettingsChange: (key: string, value: any) => void
  hasChanges: boolean
  onSave: () => void
  saving: boolean
}

export default function UploadSettings({ 
  settings, 
  onSettingsChange, 
  hasChanges, 
  onSave, 
  saving 
}: UploadSettingsProps) {

  // Mock storage data - bu gerçek uygulamada API'den gelecek
  const storageStats = {
    used: 2.3, // GB
    total: 10, // GB
    files: 1247,
    images: 1089,
    videos: 158
  }

  const cleanupOldFiles = async () => {
    try {
      const response = await fetch('/api/admin/cleanup-files', {
        method: 'POST',
      })
      if (response.ok) {
        // Refresh storage stats
      }
    } catch (error) {
      console.error('Cleanup error:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      {hasChanges && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-800 font-medium">Kaydedilmemiş değişiklikler var</span>
              </div>
              <Button size="sm" onClick={onSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Storage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HardDrive className="h-5 w-5 mr-2" />
            Depolama Kullanımı
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Kullanılan Alan</span>
              <span className="text-sm text-gray-500">
                {storageStats.used}GB / {storageStats.total}GB
              </span>
            </div>
            <Progress value={(storageStats.used / storageStats.total) * 100} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{storageStats.files}</div>
              <div className="text-sm text-blue-700">Toplam Dosya</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{storageStats.images}</div>
              <div className="text-sm text-green-700">Fotoğraf</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{storageStats.videos}</div>
              <div className="text-sm text-purple-700">Video</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Dosya Yükleme Ayarları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableImageUploads" className="flex items-center">
                  <Image className="h-4 w-4 mr-2" />
                  Fotoğraf Yükleme
                </Label>
                <Switch
                  id="enableImageUploads"
                  checked={settings?.enableImageUploads || false}
                  onCheckedChange={(checked) => onSettingsChange('enableImageUploads', checked)}
                />
              </div>
              <p className="text-sm text-gray-500">
                Kullanıcıların fotoğraf yüklemesine izin ver
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableVideoUploads" className="flex items-center">
                  <Video className="h-4 w-4 mr-2" />
                  Video Yükleme
                </Label>
                <Switch
                  id="enableVideoUploads"
                  checked={settings?.enableVideoUploads || false}
                  onCheckedChange={(checked) => onSettingsChange('enableVideoUploads', checked)}
                />
              </div>
              <p className="text-sm text-gray-500">
                Kullanıcıların video yüklemesine izin ver
              </p>
            </div>
          </div>

          <Separator />

          {/* File Size Limits */}
          <div className="space-y-4">
            <h4 className="font-medium">Dosya Boyutu Limitleri</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="maxImageSizeMB">Maksimum Fotoğraf Boyutu (MB)</Label>
                <Input
                  id="maxImageSizeMB"
                  type="number"
                  min="1"
                  max="100"
                  value={settings?.maxImageSizeMB || 10}
                  onChange={(e) => onSettingsChange('maxImageSizeMB', parseInt(e.target.value))}
                  disabled={!settings?.enableImageUploads}
                />
                <p className="text-sm text-gray-500">
                  Tek fotoğraf için maksimum dosya boyutu
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxVideoSizeMB">Maksimum Video Boyutu (MB)</Label>
                <Input
                  id="maxVideoSizeMB"
                  type="number"
                  min="1"
                  max="1000"
                  value={settings?.maxVideoSizeMB || 100}
                  onChange={(e) => onSettingsChange('maxVideoSizeMB', parseInt(e.target.value))}
                  disabled={!settings?.enableVideoUploads}
                />
                <p className="text-sm text-gray-500">
                  Tek video için maksimum dosya boyutu
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* File Formats */}
          <div className="space-y-4">
            <h4 className="font-medium">İzin Verilen Dosya Formatları</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="allowedImageFormats">Fotoğraf Formatları</Label>
                <Input
                  id="allowedImageFormats"
                  value={settings?.allowedImageFormats || 'jpg,jpeg,png,gif,webp'}
                  onChange={(e) => onSettingsChange('allowedImageFormats', e.target.value)}
                  placeholder="jpg,jpeg,png,gif,webp"
                  disabled={!settings?.enableImageUploads}
                />
                <p className="text-sm text-gray-500">
                  Virgülle ayrılmış format listesi
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowedVideoFormats">Video Formatları</Label>
                <Input
                  id="allowedVideoFormats"
                  value={settings?.allowedVideoFormats || 'mp4,mov,avi,mkv,webm,m4v'}
                  onChange={(e) => onSettingsChange('allowedVideoFormats', e.target.value)}
                  placeholder="mp4,mov,avi,mkv,webm,m4v"
                  disabled={!settings?.enableVideoUploads}
                />
                <p className="text-sm text-gray-500">
                  Virgülle ayrılmış format listesi
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Event Limits */}
          <div className="space-y-4">
            <h4 className="font-medium">Etkinlik Limitleri</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="maxUploadsPerEvent">Etkinlik Başına Maksimum Dosya</Label>
                <Input
                  id="maxUploadsPerEvent"
                  type="number"
                  min="1"
                  max="1000"
                  value={settings?.maxUploadsPerEvent || 100}
                  onChange={(e) => onSettingsChange('maxUploadsPerEvent', parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500">
                  Bir etkinlikte maksimum dosya sayısı
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="autoDeleteAfterDays">Otomatik Silme (Gün)</Label>
                <Input
                  id="autoDeleteAfterDays"
                  type="number"
                  min="1"
                  max="365"
                  value={settings?.autoDeleteAfterDays || ''}
                  onChange={(e) => onSettingsChange('autoDeleteAfterDays', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Boş bırakın (otomatik silme kapalı)"
                />
                <p className="text-sm text-gray-500">
                  Dosyalar bu süre sonra otomatik silinir
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Depolama Yönetimi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Eski Dosyaları Temizle</h4>
              <p className="text-sm text-gray-500">
                30 günden eski geçici dosyaları sil
              </p>
              <Button variant="outline" onClick={cleanupOldFiles} className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Temizlik Başlat
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">İstatistikleri Yenile</h4>
              <p className="text-sm text-gray-500">
                Depolama istatistiklerini yeniden hesapla
              </p>
              <Button variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Yenile
              </Button>
            </div>
          </div>

          <Separator />

          {/* Backup Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Yedekleme Ayarları</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoBackup">Otomatik Yedekleme</Label>
                  <Switch
                    id="autoBackup"
                    checked={false}
                    onCheckedChange={(checked) => {}}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Dosyaların günlük otomatik yedeklenmesi
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cloudBackup">Bulut Yedekleme</Label>
                  <Switch
                    id="cloudBackup"
                    checked={false}
                    onCheckedChange={(checked) => {}}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  AWS S3/Google Cloud desteği
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
