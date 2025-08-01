'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { QrCode, Download, Share2, Printer, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import QRCodeLib from 'qrcode'
import { useEffect, useState } from 'react'

interface Event {
  id: string
  title: string
  description: string | null
  date: Date
  location: string | null
  qrCode: string
  customer: {
    name: string
  }
}

interface QRCodeDisplayProps {
  event: Event
  uploadUrl: string
}

export default function QRCodeDisplay({ event, uploadUrl }: QRCodeDisplayProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const generateQR = async () => {
      try {
        const dataUrl = await QRCodeLib.toDataURL(uploadUrl, {
          width: 300,
          margin: 2,
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
    window.print()
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
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(uploadUrl)
      alert('Link kopyalandı!')
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 no-print">
          <Link href="/dashboard">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard'a Dön
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Card */}
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <QrCode className="h-6 w-6" />
                <span>QR Kod</span>
              </CardTitle>
              <CardDescription>
                Misafirlerinizin fotoğraf yüklemesi için bu QR kodu kullanın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div ref={qrRef} className="flex justify-center">
                {qrCodeDataUrl && (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code"
                    className="border rounded-lg shadow-sm"
                  />
                )}
              </div>
              
              <div className="space-y-2 no-print">
                <div className="flex space-x-2">
                  <Button onClick={handleDownload} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    İndir
                  </Button>
                  <Button onClick={handleShare} variant="outline" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Paylaş
                  </Button>
                </div>
                <Button onClick={handlePrint} variant="outline" className="w-full">
                  <Printer className="h-4 w-4 mr-2" />
                  Yazdır
                </Button>
              </div>

              <div className="text-sm text-gray-600 break-all">
                <strong>Link:</strong> {uploadUrl}
              </div>
            </CardContent>
          </Card>

          {/* Event Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>{event.title}</CardTitle>
              <CardDescription>Etkinlik Bilgileri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong className="text-sm">Etkinlik Sahibi:</strong>
                <p className="text-gray-700">{event.customer.name}</p>
              </div>
              
              <div>
                <strong className="text-sm">Tarih:</strong>
                <p className="text-gray-700">{formatDate(event.date)}</p>
              </div>
              
              {event.location && (
                <div>
                  <strong className="text-sm">Konum:</strong>
                  <p className="text-gray-700">{event.location}</p>
                </div>
              )}
              
              {event.description && (
                <div>
                  <strong className="text-sm">Açıklama:</strong>
                  <p className="text-gray-700">{event.description}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Kullanım Talimatları:</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. QR kodu yazdırın veya dijital ekranda gösterin</li>
                  <li>2. Misafirleriniz telefon kamerasıyla QR kodu okutacak</li>
                  <li>3. Otomatik olarak fotoğraf yükleme sayfasına gidecekler</li>
                  <li>4. Fotoğrafları yükleyebilecekler</li>
                  <li>5. Tüm fotoğrafları dashboard'tan yönetebilirsiniz</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  )
}
