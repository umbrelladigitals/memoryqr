'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Printer, Share, ArrowLeft, QrCode, Loader2 } from 'lucide-react'
import QRCode from 'qrcode'
import Link from 'next/link'

interface Event {
  id: string
  title: string
  description?: string
  date: Date
  location?: string
  eventType: 'wedding' | 'engagement' | 'birthday' | 'baby_shower' | 'corporate' | 'other'
  participants?: Record<string, any>
}

interface QRDisplayProps {
  event: Event
}

const eventTypeConfig = {
  wedding: {
    name: 'Düğün',
    gradient: 'from-pink-100 to-rose-100',
    borderColor: 'border-pink-300',
    iconColor: 'text-pink-600',
    accentColor: 'bg-pink-500',
    className: 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200'
  },
  engagement: {
    name: 'Nişan',
    gradient: 'from-purple-100 to-pink-100',
    borderColor: 'border-purple-300',
    iconColor: 'text-purple-600',
    accentColor: 'bg-purple-500',
    className: 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
  },
  birthday: {
    name: 'Doğum Günü',
    gradient: 'from-yellow-100 to-orange-100',
    borderColor: 'border-yellow-300',
    iconColor: 'text-yellow-600',
    accentColor: 'bg-yellow-500',
    className: 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
  },
  baby_shower: {
    name: 'Baby Shower',
    gradient: 'from-blue-100 to-cyan-100',
    borderColor: 'border-blue-300',
    iconColor: 'text-blue-600',
    accentColor: 'bg-blue-500',
    className: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
  },
  corporate: {
    name: 'Kurumsal',
    gradient: 'from-gray-100 to-slate-100',
    borderColor: 'border-gray-300',
    iconColor: 'text-gray-600',
    accentColor: 'bg-gray-500',
    className: 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'
  },
  other: {
    name: 'Diğer',
    gradient: 'from-indigo-100 to-purple-100',
    borderColor: 'border-indigo-300',
    iconColor: 'text-indigo-600',
    accentColor: 'bg-indigo-500',
    className: 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200'
  }
}

const paperSizes = {
  a4: { name: 'A4 (210×297mm)', width: '210mm', height: '297mm' },
  a5: { name: 'A5 (148×210mm)', width: '148mm', height: '210mm' },
  letter: { name: 'Letter (216×279mm)', width: '8.5in', height: '11in' }
}

const layoutOptions = {
  a4: [
    { value: '8', label: '4×2 (8 kart)', cols: 4, rows: 2 },
    { value: '12', label: '4×3 (12 kart)', cols: 4, rows: 3 },
    { value: '15', label: '5×3 (15 kart)', cols: 5, rows: 3 }
  ],
  a5: [
    { value: '4', label: '2×2 (4 kart)', cols: 2, rows: 2 },
    { value: '6', label: '3×2 (6 kart)', cols: 3, rows: 2 }
  ],
  letter: [
    { value: '8', label: '4×2 (8 kart)', cols: 4, rows: 2 },
    { value: '12', label: '4×3 (12 kart)', cols: 4, rows: 3 }
  ]
}

export default function QRDisplay({ event }: QRDisplayProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [selectedPaperSize, setSelectedPaperSize] = useState('a4')
  const [selectedLayout, setSelectedLayout] = useState('8')
  
  const uploadUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/event/${event.id}/upload`
  const eventConfig = eventTypeConfig[event.eventType]

  useEffect(() => {
    const generateQR = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(uploadUrl, {
          width: 256,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        setQrCodeDataUrl(dataUrl)
      } catch (error) {
        console.error('QR code generation error:', error)
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
    const currentLayout = layoutOptions[selectedPaperSize as keyof typeof layoutOptions].find(
      layout => layout.value === selectedLayout
    ) || layoutOptions[selectedPaperSize as keyof typeof layoutOptions][0]
    
    const { cols, rows } = currentLayout
    const totalCards = parseInt(currentLayout.value)
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${event.title} - QR Kodları</title>
          <style>
            @page {
              size: ${selectedPaperSize};
              margin: 8mm;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .print-grid {
              display: grid;
              grid-template-columns: repeat(${cols}, 1fr);
              grid-template-rows: repeat(${rows}, 1fr);
              gap: 4mm;
              height: 100vh;
              padding: 4mm;
            }
            .qr-card {
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              padding: 12px;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              background: white;
              position: relative;
              overflow: hidden;
            }
            .qr-card.wedding {
              background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fdf2f8 100%);
              border-color: #f472b6;
            }
            .qr-card.engagement {
              background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 50%, #f3e8ff 100%);
              border-color: #a855f7;
            }
            .qr-card.birthday {
              background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fffbeb 100%);
              border-color: #f59e0b;
            }
            .qr-card.baby_shower {
              background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #eff6ff 100%);
              border-color: #3b82f6;
            }
            .qr-card.corporate {
              background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 50%, #f9fafb 100%);
              border-color: #6b7280;
            }
            .qr-card.other {
              background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #eef2ff 100%);
              border-color: #6366f1;
            }
            .qr-card h2 {
              font-size: 16px;
              margin: 8px 0;
              font-weight: bold;
            }
            .qr-card img {
              max-width: 120px;
              height: auto;
              margin: 8px 0;
            }
            .qr-card p {
              font-size: 12px;
              margin: 4px 0;
              line-height: 1.4;
            }
            .qr-card .event-details {
              font-size: 10px;
              color: #666;
              margin-top: 8px;
            }
          </style>
        </head>
        <body>
          <div class="print-grid">
            ${Array.from({ length: totalCards }, (_, index) => `
              <div class="qr-card ${event.eventType}">
                <div class="event-header">
                  <h2>${event.title}</h2>
                </div>
                <div class="qr-code-container">
                  <img src="${qrCodeDataUrl}" alt="QR Kod" />
                </div>
                ${event.description ? `<p class="description">${event.description}</p>` : ''}
                <p class="instructions">QR kodu tarayarak etkinlik fotoğraflarını görüntüleyin ve paylaşın</p>
                <div class="event-details">
                  <p><strong>Tarih:</strong> ${new Date(event.date).toLocaleDateString('tr-TR')}</p>
                  ${event.location ? `<p><strong>Konum:</strong> ${event.location}</p>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.print()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${event.title} - Fotoğraf Yükleme`,
          text: `${event.title} etkinliğine fotoğraf yüklemek için QR kodu okutun!`,
          url: uploadUrl,
        })
      } catch (error) {
        console.error('Share error:', error)
      }
    } else {
      navigator.clipboard.writeText(uploadUrl)
      alert('Link kopyalandı!')
    }
  }

  const formatEventDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* QR Kod Önizlemesi */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">QR Kod Önizlemesi</h3>
        
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <div className={`inline-block p-4 rounded-lg border-2 ${eventConfig.className}`}>
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
              
              <div className="qr-code-container">
                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Kod" 
                    className="mx-auto"
                    style={{ width: '160px', height: '160px' }}
                  />
                ) : (
                  <div className="w-40 h-40 mx-auto bg-gray-200 rounded flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                )}
              </div>
              
              {event.description && (
                <p className="text-sm text-gray-600 max-w-xs mx-auto">{event.description}</p>
              )}
              
              <p className="text-xs text-gray-500">
                QR kodu tarayarak etkinlik fotoğraflarını görüntüleyin ve paylaşın
              </p>
              
              <div className="text-xs text-gray-400 space-y-1">
                <p><strong>Tarih:</strong> {formatEventDate(event.date)}</p>
                {event.location && <p><strong>Konum:</strong> {event.location}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Yazdırma Seçenekleri */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Yazdırma Seçenekleri</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kağıt Boyutu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kağıt Boyutu</label>
            <select
              value={selectedPaperSize}
              onChange={(e) => setSelectedPaperSize(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(paperSizes).map(([key, size]) => (
                <option key={key} value={key}>{size.name}</option>
              ))}
            </select>
          </div>

          {/* Düzen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sayfa Düzeni</label>
            <select
              value={selectedLayout}
              onChange={(e) => setSelectedLayout(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {layoutOptions[selectedPaperSize as keyof typeof layoutOptions]?.map((layout) => (
                <option key={layout.value} value={layout.value}>
                  {layout.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <Button onClick={handlePrint} className="flex-1">
            <Printer className="h-4 w-4 mr-2" />
            Yazdır
          </Button>
          <Button onClick={handleDownload} variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            İndir
          </Button>
          <Button onClick={handleShare} variant="outline" className="flex-1">
            <Share className="h-4 w-4 mr-2" />
            Paylaş
          </Button>
        </div>
      </div>
    </div>
  )
}
