'use client'

import { useState, useRef, useEffect } from 'react'
import { Event } from '@prisma/client'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Download, Printer as PrinterIcon, Share2, QrCode, FileImage, Heart, Gem, Gift, Baby, Building, Star } from 'lucide-react'

interface QRCodeDisplayProps {
  event: Event
  uploadUrl: string
}

const eventTypeConfig = {
  wedding: {
    name: 'Düğün',
    icon: Heart,
    gradient: 'from-pink-100 via-rose-50 to-red-100',
    borderColor: 'border-pink-300',
    iconColor: 'text-pink-600',
    accentColor: 'bg-pink-500',
    pattern: '🌹',
    decorativeElements: ['🌺', '🌸', '💐', '🌷'],
    message: 'En güzel anlarınızı bizimle paylaşın'
  },
  engagement: {
    name: 'Nişan',
    icon: Gem,
    gradient: 'from-purple-100 via-violet-50 to-indigo-100',
    borderColor: 'border-purple-300',
    iconColor: 'text-purple-600',
    accentColor: 'bg-purple-500',
    pattern: '💍',
    decorativeElements: ['💎', '✨', '💜', '🎀'],
    message: 'Nişan anılarınızı bizimle paylaşın'
  },
  birthday: {
    name: 'Doğum Günü',
    icon: Gift,
    gradient: 'from-yellow-100 via-orange-50 to-amber-100',
    borderColor: 'border-yellow-300',
    iconColor: 'text-yellow-600',
    accentColor: 'bg-yellow-500',
    pattern: '🎂',
    decorativeElements: ['🎈', '🎉', '🎁', '🍰'],
    message: 'Doğum günü anılarınızı bizimle paylaşın'
  },
  baby_shower: {
    name: 'Baby Shower',
    icon: Baby,
    gradient: 'from-blue-100 via-sky-50 to-cyan-100',
    borderColor: 'border-blue-300',
    iconColor: 'text-blue-600',
    accentColor: 'bg-blue-500',
    pattern: '👶',
    decorativeElements: ['🍼', '🧸', '👶', '💙'],
    message: 'Baby shower anılarınızı bizimle paylaşın'
  },
  corporate: {
    name: 'Kurumsal Etkinlik',
    icon: Building,
    gradient: 'from-gray-100 via-slate-50 to-zinc-100',
    borderColor: 'border-gray-400',
    iconColor: 'text-gray-700',
    accentColor: 'bg-gray-600',
    pattern: '🏢',
    decorativeElements: ['💼', '📊', '🎯', '⭐'],
    message: 'Kurumsal etkinlik anılarınızı paylaşın'
  },
  other: {
    name: 'Diğer Etkinlik',
    icon: Star,
    gradient: 'from-indigo-100 via-purple-50 to-pink-100',
    borderColor: 'border-indigo-300',
    iconColor: 'text-indigo-600',
    accentColor: 'bg-indigo-500',
    pattern: '⭐',
    decorativeElements: ['✨', '🌟', '💫', '🎊'],
    message: 'Özel anlarınızı bizimle paylaşın'
  }
}

export default function QRCodeDisplay({ event, uploadUrl }: QRCodeDisplayProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [showPrintOptions, setShowPrintOptions] = useState(false)
  const [selectedPaperSize, setSelectedPaperSize] = useState('A4')
  const [selectedLayout, setSelectedLayout] = useState('6')
  const printRef = useRef<HTMLDivElement>(null)

  const eventConfig = eventTypeConfig[event.eventType as keyof typeof eventTypeConfig] || eventTypeConfig.other

  const paperSizes = {
    A4: { width: 210, height: 297, name: 'A4 (21cm x 29.7cm)' },
    A3: { width: 297, height: 420, name: 'A3 (29.7cm x 42cm)' },
    A5: { width: 148, height: 210, name: 'A5 (14.8cm x 21cm)' },
    Letter: { width: 216, height: 279, name: 'Letter (21.6cm x 27.9cm)' }
  }

  const layoutOptions = {
    A4: [
      { value: '6', label: '6 QR Kod (2x3)', cols: 2, rows: 3 },
      { value: '8', label: '8 QR Kod (2x4)', cols: 2, rows: 4 },
      { value: '12', label: '12 QR Kod (3x4)', cols: 3, rows: 4 },
      { value: '16', label: '16 QR Kod (4x4)', cols: 4, rows: 4 }
    ],
    A3: [
      { value: '12', label: '12 QR Kod (3x4)', cols: 3, rows: 4 },
      { value: '16', label: '16 QR Kod (4x4)', cols: 4, rows: 4 },
      { value: '20', label: '20 QR Kod (4x5)', cols: 4, rows: 5 },
      { value: '24', label: '24 QR Kod (4x6)', cols: 4, rows: 6 }
    ],
    A5: [
      { value: '2', label: '2 QR Kod (1x2)', cols: 1, rows: 2 },
      { value: '4', label: '4 QR Kod (2x2)', cols: 2, rows: 2 },
      { value: '6', label: '6 QR Kod (2x3)', cols: 2, rows: 3 }
    ],
    Letter: [
      { value: '6', label: '6 QR Kod (2x3)', cols: 2, rows: 3 },
      { value: '8', label: '8 QR Kod (2x4)', cols: 2, rows: 4 },
      { value: '12', label: '12 QR Kod (3x4)', cols: 3, rows: 4 }
    ]
  }

  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrData = await QRCode.toDataURL(uploadUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        setQrCodeDataUrl(qrData)
      } catch (error) {
        console.error('QR kod oluşturulurken hata:', error)
      }
    }
    generateQR()
  }, [uploadUrl])

  const handleDownload = () => {
    if (!qrCodeDataUrl) return
    
    const link = document.createElement('a')
    link.download = `${event.title}-qr-kod.png`
    link.href = qrCodeDataUrl
    link.click()
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${event.title} - QR Kod`,
          text: `${event.title} etkinliği için QR kodunu görüntüleyin`,
          url: uploadUrl
        })
      } catch (error) {
        console.error('Paylaşım hatası:', error)
      }
    } else {
      // Fallback: kopyala
      navigator.clipboard.writeText(uploadUrl)
      alert('QR kod bağlantısı kopyalandı!')
    }
  }

  const selectedLayoutData = layoutOptions[selectedPaperSize as keyof typeof layoutOptions]?.find(
    layout => layout.value === selectedLayout
  )

  return (
    <div className="space-y-6">
      {/* QR Kod Önizleme */}
      <Card className={`${eventConfig.gradient} ${eventConfig.borderColor} border-2`}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <eventConfig.icon className={`h-6 w-6 ${eventConfig.iconColor}`} />
            QR Kod - {event.title}
          </CardTitle>
          <CardDescription>
            {eventConfig.message}
          </CardDescription>
          <Badge variant="secondary" className="w-fit mx-auto">
            {eventConfig.name}
          </Badge>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {qrCodeDataUrl ? (
            <div className="flex flex-col items-center space-y-4">
              <div className={`p-4 bg-white rounded-lg shadow-lg ${eventConfig.borderColor} border`}>
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Kod" 
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <p className="text-sm text-gray-600 max-w-md">
                Bu QR kodu telefonunuzla taratarak etkinlik fotoğraflarını paylaşabilir ve görüntüleyebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48">
              <QrCode className="h-8 w-8 animate-spin" />
              <span className="ml-2">QR kod oluşturuluyor...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Aksiyonlar */}
      <Card>
        <CardHeader>
          <CardTitle>QR Kod İşlemleri</CardTitle>
          <CardDescription>QR kodunuzu indirin, yazdırın veya paylaşın</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={handleDownload} disabled={!qrCodeDataUrl} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              İndir (.PNG)
            </Button>
            <Button 
              onClick={() => setShowPrintOptions(!showPrintOptions)} 
              disabled={!qrCodeDataUrl} 
              variant="outline"
              className="w-full"
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Yazdır
            </Button>
            <Button onClick={handleShare} disabled={!qrCodeDataUrl} variant="outline" className="w-full">
              <Share2 className="h-4 w-4 mr-2" />
              Paylaş
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Yazdırma Seçenekleri */}
      {showPrintOptions && (
        <Card>
          <CardHeader>
            <CardTitle>Yazdırma Seçenekleri</CardTitle>
            <CardDescription>Kağıt boyutu ve düzen seçin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Kağıt Boyutu</label>
                <Select value={selectedPaperSize} onValueChange={setSelectedPaperSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(paperSizes).map(([key, size]) => (
                      <SelectItem key={key} value={key}>
                        {size.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Düzen</label>
                <Select value={selectedLayout} onValueChange={setSelectedLayout}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {layoutOptions[selectedPaperSize as keyof typeof layoutOptions]?.map((layout) => (
                      <SelectItem key={layout.value} value={layout.value}>
                        {layout.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handlePrint} className="w-full">
              <PrinterIcon className="h-4 w-4 mr-2" />
              Yazdır ({selectedLayoutData?.label})
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Yazdırma İçeriği */}
      <div id="print-content" ref={printRef} className="hidden print:block">
        <style jsx>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #print-content,
            #print-content * {
              visibility: visible;
            }
            #print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .print-layout-grid {
              display: grid;
              grid-template-columns: repeat(${selectedLayoutData?.cols || 2}, 1fr);
              grid-template-rows: repeat(${selectedLayoutData?.rows || 3}, 1fr);
              gap: 4mm;
              padding: 2mm;
            }
            .qr-card {
              border: 1px solid #d1d5db;
              border-radius: 16px;
              padding: 16px;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              background: #ffffff;
              position: relative;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            /* Enhanced floral decorative patterns for event types */
            .qr-card.wedding {
              background: 
                radial-gradient(circle at 15% 85%, rgba(252, 231, 243, 0.6) 0%, transparent 40%),
                radial-gradient(circle at 85% 15%, rgba(253, 242, 248, 0.6) 0%, transparent 40%),
                linear-gradient(135deg, #fdf2f8 0%, #fce7f3 30%, #fbb6ce 50%, #fce7f3 70%, #fdf2f8 100%);
              border: 3px solid #f472b6;
              box-shadow: 0 4px 6px rgba(244, 114, 182, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6);
            }
            
            .qr-card.wedding::before {
              content: '🌸';
              position: absolute;
              top: 12px;
              right: 12px;
              font-size: 20px;
              opacity: 0.7;
              z-index: 3;
            }
            
            .qr-card.engagement {
              background: 
                radial-gradient(circle at 20% 20%, rgba(233, 213, 255, 0.7) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(243, 232, 255, 0.7) 0%, transparent 50%),
                linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 30%, #c4b5fd 50%, #e9d5ff 70%, #f3e8ff 100%);
              border: 3px solid #a855f7;
              box-shadow: 0 4px 6px rgba(168, 85, 247, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6);
            }
            
            .qr-card.engagement::before {
              content: '💍';
              position: absolute;
              top: 12px;
              right: 12px;
              font-size: 18px;
              opacity: 0.8;
              z-index: 3;
            }
            
            .qr-card.birthday {
              background: 
                radial-gradient(circle at 25% 75%, rgba(254, 243, 199, 0.7) 0%, transparent 50%),
                radial-gradient(circle at 75% 25%, rgba(255, 237, 213, 0.7) 0%, transparent 50%),
                linear-gradient(135deg, #fffbeb 0%, #fef3c7 30%, #fbbf24 50%, #fef3c7 70%, #fffbeb 100%);
              border: 3px solid #f59e0b;
              box-shadow: 0 4px 6px rgba(245, 158, 11, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6);
            }
            
            .qr-card.birthday::before {
              content: '🎂';
              position: absolute;
              top: 12px;
              right: 12px;
              font-size: 18px;
              opacity: 0.8;
              z-index: 3;
            }
            
            .qr-card.baby_shower {
              background: 
                radial-gradient(circle at 30% 70%, rgba(219, 234, 254, 0.7) 0%, transparent 50%),
                radial-gradient(circle at 70% 30%, rgba(239, 246, 255, 0.7) 0%, transparent 50%),
                linear-gradient(135deg, #eff6ff 0%, #dbeafe 30%, #93c5fd 50%, #dbeafe 70%, #eff6ff 100%);
              border: 3px solid #3b82f6;
              box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6);
            }
            
            .qr-card.baby_shower::before {
              content: '👶';
              position: absolute;
              top: 12px;
              right: 12px;
              font-size: 18px;
              opacity: 0.8;
              z-index: 3;
            }
            
            .qr-card.corporate {
              background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 30%, #e5e7eb 50%, #f3f4f6 70%, #f9fafb 100%);
              border: 3px solid #6b7280;
              box-shadow: 0 4px 6px rgba(107, 114, 128, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8);
            }
            
            .qr-card.corporate::before {
              content: '🏢';
              position: absolute;
              top: 12px;
              right: 12px;
              font-size: 18px;
              opacity: 0.7;
              z-index: 3;
            }
            
            .qr-card.other {
              background: 
                radial-gradient(circle at 40% 60%, rgba(224, 231, 255, 0.7) 0%, transparent 50%),
                radial-gradient(circle at 60% 40%, rgba(238, 242, 255, 0.7) 0%, transparent 50%),
                linear-gradient(135deg, #eef2ff 0%, #e0e7ff 30%, #a5b4fc 50%, #e0e7ff 70%, #eef2ff 100%);
              border: 3px solid #6366f1;
              box-shadow: 0 4px 6px rgba(99, 102, 241, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6);
            }
            
            .qr-card.other::before {
              content: '✨';
              position: absolute;
              top: 12px;
              right: 12px;
              font-size: 18px;
              opacity: 0.8;
              z-index: 3;
            }
            
            /* Content positioning */
            .qr-card .event-header,
            .qr-card .qr-code-container,
            .qr-card .description,
            .qr-card .instructions,
            .qr-card .event-details,
            .qr-card .logo-area {
              position: relative;
              z-index: 5;
            }
            
            /* Text styling for all content */
            .qr-card h2,
            .qr-card p,
            .qr-card span {
              position: relative;
              z-index: 5;
              text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
            }
          }
        `}</style>

        <div className="print-layout-grid">
          {Array.from({ length: parseInt(selectedLayout) }, (_, index) => (
            <div key={index} className={`qr-card ${event.eventType}`}>
              <div className="event-header mb-3">
                <h2 className="text-lg font-bold text-gray-800">{event.title}</h2>
                <p className="text-sm text-gray-600">{eventConfig.name}</p>
              </div>
              
              <div className="qr-code-container mb-3">
                {qrCodeDataUrl && (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Kod" 
                    className="w-24 h-24 mx-auto bg-white p-1 rounded"
                  />
                )}
              </div>
              
              <div className="description mb-2">
                <p className="text-xs text-gray-700 leading-tight">
                  QR kodu taratarak fotoğrafları görüntüleyebilir ve paylaşabilirsiniz
                </p>
              </div>
              
              <div className="instructions text-xs text-gray-600">
                <p>📱 Kameranızı QR koda tutun</p>
                <p>📸 Anılarınızı paylaşın</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
