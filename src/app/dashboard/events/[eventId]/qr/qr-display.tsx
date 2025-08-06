'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { toast } from 'sonner'
import { eventTypeConfig } from '@/lib/eventTypeConfig'
import QRPreviewCard from '@/components/qr-display/QRPreviewCard'
import QRActionsCard from '@/components/qr-display/QRActionsCard'
import QRLinkShareCard from '@/components/qr-display/QRLinkShareCard'
import EventDetailsCard from '@/components/qr-display/EventDetailsCard'
import UsageInstructionsCard from '@/components/qr-display/UsageInstructionsCard'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Event {
  id: string
  title: string
  description: string | null
  date: Date
  location: string | null
  qrCode: string
  eventType?: string | null
  participants?: any
  customer: {
    name: string
  }
}

interface QRCodeDisplayProps {
  event: Event
  uploadUrl: string
}

// Format date function
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function QRCodeDisplay({ event, uploadUrl }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [printQuantity, setPrintQuantity] = useState<number>(6) // Varsayılan 6'lı
  
  const eventType = event.eventType as keyof typeof eventTypeConfig || 'other'
  const config = eventTypeConfig[eventType]
  const IconComponent = config.icon

  // Generate QR code
  useEffect(() => {
    const generateQR = async () => {
      if (!uploadUrl) return
      
      setIsGenerating(true)
      try {
        const qrDataUrl = await QRCode.toDataURL(uploadUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        })
        setQrDataUrl(qrDataUrl)
      } catch (error) {
        console.error('QR kod oluşturulurken hata:', error)
        toast.error('QR kod oluşturulurken hata oluştu')
      } finally {
        setIsGenerating(false)
      }
    }

    generateQR()
  }, [uploadUrl])

  // Print function with enhanced styling
  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Print penceresi açılamadı')
      return
    }

    // Get special title and description from config
    const participants = event.participants || {}
    const printTitle = config.printTemplate?.title 
      ? (typeof config.printTemplate.title === 'function' 
          ? config.printTemplate.title(participants) 
          : config.printTemplate.title)
      : event.title
      
    const eventDescription = event.description || 'QR kodunu tarayın ve bu özel günde yakaladığınız en güzel anları, yıllar sonra bile mutlulukla hatırlayacak birer değeri hatıra olacak.'

    // Calculate layout based on quantity
    const getCardLayout = (quantity: number) => {
      switch(quantity) {
        case 6: return { cols: 2, rows: 3, cardWidth: '90mm', cardHeight: '85mm' }
        case 12: return { cols: 3, rows: 4, cardWidth: '65mm', cardHeight: '65mm' }
        case 24: return { cols: 4, rows: 6, cardWidth: '48mm', cardHeight: '45mm' }
        default: return { cols: 2, rows: 3, cardWidth: '90mm', cardHeight: '85mm' }
      }
    }
    
    const layout = getCardLayout(printQuantity)

    // Enhanced print HTML with multiple cards
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>QR Kodlar - ${event.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Dancing+Script:wght@400;500;600;700&display=swap');
            
            @media print {
              @page { 
                size: A4; 
                margin: 0; 
                background: white;
              }
              
              body { 
                margin: 0; 
                padding: 0; 
                font-family: 'Inter', system-ui, sans-serif;
                background: white;
              }
              
              .print-container {
                width: 210mm;
                height: 297mm;
                position: relative;
                overflow: hidden;
                background: white;
                display: grid;
                grid-template-columns: repeat(${layout.cols}, 1fr);
                grid-template-rows: repeat(${layout.rows}, 1fr);
                gap: 2mm;
                padding: 10mm;
                box-sizing: border-box;
              }
              
              .qr-card {
                position: relative;
                background: ${config.printBg};
                border-radius: 8px;
                overflow: hidden;
                border: 1px solid rgba(0, 0, 0, 0.1);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: ${printQuantity >= 24 ? '8px' : '12px'};
                box-sizing: border-box;
              }
              
              .qr-code-wrapper {
                background: white;
                padding: ${printQuantity >= 24 ? '6px' : '8px'};
                border-radius: 6px;
                display: inline-block;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                margin-bottom: ${printQuantity >= 24 ? '6px' : '10px'};
                z-index: 10;
                position: relative;
              }
              
              .qr-code-wrapper img {
                display: block;
                width: ${printQuantity >= 24 ? '35px' : printQuantity >= 12 ? '45px' : '60px'};
                height: ${printQuantity >= 24 ? '35px' : printQuantity >= 12 ? '45px' : '60px'};
              }
              
              .event-title {
                font-size: ${printQuantity >= 24 ? '8pt' : printQuantity >= 12 ? '10pt' : '14pt'};
                font-weight: 600;
                margin: 0 0 ${printQuantity >= 24 ? '3px' : '6px'} 0;
                color: #1a1a1a;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.05);
                letter-spacing: -0.2px;
                font-family: 'Inter', sans-serif;
                line-height: 1.1;
                z-index: 10;
                position: relative;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: ${printQuantity >= 24 ? '1' : '2'};
                -webkit-box-orient: vertical;
              }
              
              .simple-description {
                font-size: ${printQuantity >= 24 ? '6pt' : printQuantity >= 12 ? '7pt' : '9pt'};
                color: #666;
                line-height: 1.3;
                margin: 0;
                font-family: 'Inter', sans-serif;
                z-index: 10;
                position: relative;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: ${printQuantity >= 24 ? '2' : printQuantity >= 12 ? '3' : '4'};
                -webkit-box-orient: vertical;
              }
              
              .decorative-corner {
                position: absolute;
                width: ${printQuantity >= 24 ? '15px' : printQuantity >= 12 ? '20px' : '25px'};
                height: ${printQuantity >= 24 ? '15px' : printQuantity >= 12 ? '20px' : '25px'};
                opacity: 0.2;
                z-index: 2;
                font-size: ${printQuantity >= 24 ? '10px' : printQuantity >= 12 ? '12px' : '16px'};
              }
              
              .decorative-corner.top-left {
                top: 2px;
                left: 2px;
              }
              
              .decorative-corner.bottom-right {
                bottom: 2px;
                right: 2px;
                transform: rotate(180deg);
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${Array.from({ length: printQuantity }, (_, index) => `
              <div class="qr-card">
                <div class="decorative-corner top-left">❀</div>
                <div class="decorative-corner bottom-right">❀</div>
                
                <h1 class="event-title">${printTitle}</h1>
                
                <div class="qr-code-wrapper">
                  <img src="${qrDataUrl}" alt="QR Kod" />
                </div>
                
                <div class="simple-description">
                  ${eventDescription}
                </div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printHTML)
    printWindow.document.close()
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        printWindow.onafterprint = () => {
          printWindow.close()
        }
      }, 500)
    }
    
    toast.success('Print hazırlandı!')
  }

  // Download QR code
  const handleDownload = () => {
    if (!qrDataUrl) {
      toast.error('QR kod henüz hazır değil')
      return
    }

    const link = document.createElement('a')
    link.download = `qr-kod-${event.title.replace(/[^a-zA-Z0-9]/g, '-')}.png`
    link.href = qrDataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('QR kod indirildi!')
  }

  // Copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(uploadUrl)
      setCopiedLink(true)
      toast.success('Link kopyalandı!')
      setTimeout(() => setCopiedLink(false), 2000)
    } catch (error) {
      toast.error('Link kopyalanamadı')
    }
  }

  // Share function
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${event.title} - Fotoğraf Paylaşım`,
          text: `${event.title} etkinliği için fotoğraflarınızı paylaşın!`,
          url: uploadUrl
        })
        toast.success('Paylaşım başarılı!')
      } catch (error) {
        // Kullanıcı paylaşımı iptal etti
      }
    } else {
      // Fallback: Link'i kopyala
      handleCopyLink()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/events/${event.id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Etkinliğe Dön
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">QR Kod Paylaşım</h1>
            <p className="text-gray-600">QR kodunuzu yazdırın, indirin veya paylaşın</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* QR Preview */}
            <QRPreviewCard
              event={event}
              qrDataUrl={qrDataUrl}
              isGenerating={isGenerating}
              config={config}
              IconComponent={IconComponent}
            />

            {/* Actions */}
            <QRActionsCard
              onPrint={handlePrint}
              onDownload={handleDownload}
              onShare={handleShare}
              printQuantity={printQuantity}
              onQuantityChange={setPrintQuantity}
              disabled={!qrDataUrl}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Event Details */}
            <EventDetailsCard
              event={event}
              config={config}
              IconComponent={IconComponent}
              formatDate={formatDate}
            />

            {/* Link Share */}
            <QRLinkShareCard
              uploadUrl={uploadUrl}
              onCopyLink={handleCopyLink}
              copiedLink={copiedLink}
            />

            {/* Usage Instructions */}
            <UsageInstructionsCard />
          </div>
        </div>
      </div>
    </div>
  )
}