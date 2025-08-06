'use client'

import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QrCode, Download, Share2, Printer, ArrowLeft, Heart, Crown, Baby, Building, Star, Cake, Loader2, Eye, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import QRCodeLib from 'qrcode'

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

const eventTypeConfig = {
  wedding: {
    name: 'Düğün',
    icon: Heart,
    gradient: 'from-rose-100 via-pink-50 to-red-100',
    borderColor: 'border-rose-300',
    iconColor: 'text-rose-600',
    accentColor: 'bg-rose-500',
    pattern: '🌹',
    printBg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 25%, #fecaca 50%, #fda4af 75%, #fb7185 100%)',
    decorativeSvg: `
      <svg className="absolute inset-0 w-full h-full" style="z-index: 1;">
        <defs>
          <pattern id="wedding-roses" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <g opacity="0.15">
              <circle cx="15" cy="15" r="8" fill="#f43f5e" opacity="0.3"/>
              <circle cx="45" cy="45" r="6" fill="#ec4899" opacity="0.25"/>
              <path d="M30,10 Q35,15 30,20 Q25,15 30,10" fill="#f43f5e" opacity="0.2"/>
              <path d="M10,40 Q15,45 10,50 Q5,45 10,40" fill="#ec4899" opacity="0.2"/>
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wedding-roses)"/>
        <g className="corners">
          <path d="M0,0 L40,0 Q50,0 50,10 L50,40 L40,40 Q30,40 30,30 L30,10 Q30,0 20,0 L0,0" fill="rgba(244,63,94,0.1)"/>
          <path d="M100%,100% L60%,100% Q50%,100% 50%,90% L50%,60% L60%,60% Q70%,60% 70%,70% L70%,90% Q70%,100% 80%,100% L100%,100%" fill="rgba(244,63,94,0.1)" transform="rotate(180 50 50)"/>
        </g>
      </svg>
    `,
    decorativeElements: ['🌹', '💐', '🌸', '🌺']
  },
  engagement: {
    name: 'Nişan',
    icon: Crown,
    gradient: 'from-purple-100 via-violet-50 to-pink-100',
    borderColor: 'border-purple-300',
    iconColor: 'text-purple-600',
    accentColor: 'bg-purple-500',
    pattern: '💍',
    printBg: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 25%, #e9d5ff 50%, #d8b4fe 75%, #c084fc 100%)',
    decorativeSvg: `
      <svg className="absolute inset-0 w-full h-full" style="z-index: 1;">
        <defs>
          <pattern id="engagement-diamonds" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <g opacity="0.15">
              <polygon points="40,10 50,25 40,40 30,25" fill="#a855f7" opacity="0.3"/>
              <polygon points="20,50 25,60 20,70 15,60" fill="#8b5cf6" opacity="0.25"/>
              <polygon points="60,60 70,70 60,80 50,70" fill="#a855f7" opacity="0.2"/>
              <circle cx="25" cy="25" r="3" fill="#c084fc" opacity="0.4"/>
              <circle cx="65" cy="35" r="2" fill="#d8b4fe" opacity="0.3"/>
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#engagement-diamonds)"/>
        <g className="crown-corners">
          <path d="M10,10 L30,10 L35,5 L40,15 L45,5 L50,10 L30,10 L30,25 L10,25 Z" fill="rgba(168,85,247,0.15)"/>
          <path d="M90,90 L70,90 L65,95 L60,85 L55,95 L50,90 L70,90 L70,75 L90,75 Z" fill="rgba(168,85,247,0.15)"/>
        </g>
      </svg>
    `,
    decorativeElements: ['💎', '👑', '✨', '⭐']
  },
  birthday: {
    name: 'Doğum Günü',
    icon: Cake,
    gradient: 'from-amber-100 via-yellow-50 to-orange-100',
    borderColor: 'border-amber-300',
    iconColor: 'text-amber-600',
    accentColor: 'bg-amber-500',
    pattern: '🎂',
    printBg: 'linear-gradient(135deg, #fefbf1 0%, #fef3c7 25%, #fcd34d 50%, #f59e0b 75%, #d97706 100%)',
    decorativeSvg: `
      <svg className="absolute inset-0 w-full h-full" style="z-index: 1;">
        <defs>
          <pattern id="birthday-balloons" x="0" y="0" width="70" height="70" patternUnits="userSpaceOnUse">
            <g opacity="0.2">
              <ellipse cx="20" cy="25" rx="8" ry="12" fill="#f59e0b" opacity="0.4"/>
              <line x1="20" y1="37" x2="18" y2="50" stroke="#f59e0b" strokeWidth="2"/>
              <ellipse cx="50" cy="40" rx="6" ry="9" fill="#d97706" opacity="0.3"/>
              <line x1="50" y1="49" x2="48" y2="60" stroke="#d97706" strokeWidth="1.5"/>
              <circle cx="35" cy="60" r="4" fill="#fcd34d" opacity="0.3"/>
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#birthday-balloons)"/>
        <g className="party-corners">
          <path d="M0,20 Q10,10 20,20 Q30,30 40,20 L40,0 L0,0 Z" fill="rgba(245,158,11,0.2)"/>
          <path d="M100,80 Q90,90 80,80 Q70,70 60,80 L60,100 L100,100 Z" fill="rgba(245,158,11,0.2)"/>
        </g>
      </svg>
    `,
    decorativeElements: ['🎈', '🎉', '🎊', '🎁']
  },
  baby_shower: {
    name: 'Baby Shower',
    icon: Baby,
    gradient: 'from-blue-100 via-sky-50 to-cyan-100',
    borderColor: 'border-blue-300',
    iconColor: 'text-blue-600',
    accentColor: 'bg-blue-500',
    pattern: '👶',
    printBg: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #7dd3fc 50%, #38bdf8 75%, #0ea5e9 100%)',
    decorativeSvg: `
      <svg className="absolute inset-0 w-full h-full" style="z-index: 1;">
        <defs>
          <pattern id="baby-toys" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <g opacity="0.2">
              <circle cx="20" cy="20" r="6" fill="#0ea5e9" opacity="0.3"/>
              <circle cx="40" cy="40" r="4" fill="#38bdf8" opacity="0.25"/>
              <rect x="10" y="35" width="8" height="8" rx="2" fill="#7dd3fc" opacity="0.3"/>
              <path d="M35,15 Q40,10 45,15 Q40,20 35,15" fill="#0ea5e9" opacity="0.2"/>
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#baby-toys)"/>
        <g className="baby-corners">
          <circle cx="15" cy="15" r="10" fill="rgba(14,165,233,0.1)"/>
          <circle cx="85" cy="85" r="8" fill="rgba(14,165,233,0.1)"/>
        </g>
      </svg>
    `,
    decorativeElements: ['🍼', '🧸', '👶', '🎀']
  },
  corporate: {
    name: 'Kurumsal Etkinlik',
    icon: Building,
    gradient: 'from-slate-100 via-gray-50 to-zinc-100',
    borderColor: 'border-slate-400',
    iconColor: 'text-slate-700',
    accentColor: 'bg-slate-600',
    pattern: '🏢',
    printBg: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #cbd5e1 50%, #94a3b8 75%, #64748b 100%)',
    decorativeSvg: `
      <svg className="absolute inset-0 w-full h-full" style="z-index: 1;">
        <defs>
          <pattern id="corporate-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <g opacity="0.1">
              <rect x="5" y="5" width="30" height="30" fill="none" stroke="#64748b" strokeWidth="1"/>
              <line x1="0" y1="20" x2="40" y2="20" stroke="#64748b" strokeWidth="0.5"/>
              <line x1="20" y1="0" x2="20" y2="40" stroke="#64748b" strokeWidth="0.5"/>
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#corporate-grid)"/>
        <g className="corporate-corners">
          <rect x="5" y="5" width="20" height="15" rx="2" fill="rgba(100,116,139,0.1)"/>
          <rect x="75" y="80" width="20" height="15" rx="2" fill="rgba(100,116,139,0.1)"/>
        </g>
      </svg>
    `,
    decorativeElements: ['💼', '📊', '🎯', '⭐']
  },
  other: {
    name: 'Diğer Etkinlik',
    icon: Star,
    gradient: 'from-indigo-100 via-purple-50 to-pink-100',
    borderColor: 'border-indigo-300',
    iconColor: 'text-indigo-600',
    accentColor: 'bg-indigo-500',
    pattern: '⭐',
    printBg: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 25%, #c7d2fe 50%, #a5b4fc 75%, #818cf8 100%)',
    decorativeSvg: `
      <svg className="absolute inset-0 w-full h-full" style="z-index: 1;">
        <defs>
          <pattern id="other-stars" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <g opacity="0.15">
              <polygon points="25,5 27,15 37,15 29,22 32,32 25,27 18,32 21,22 13,15 23,15" fill="#6366f1" opacity="0.3"/>
              <polygon points="10,35 11,40 16,40 13,43 14,48 10,46 6,48 7,43 4,40 9,40" fill="#818cf8" opacity="0.25"/>
              <polygon points="40,35 41,38 44,38 42,40 43,43 40,42 37,43 38,40 36,38 39,38" fill="#a5b4fc" opacity="0.2"/>
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#other-stars)"/>
        <g className="star-corners">
          <polygon points="20,10 22,18 30,18 24,23 26,31 20,27 14,31 16,23 10,18 18,18" fill="rgba(99,102,241,0.1)"/>
          <polygon points="80,90 82,82 90,82 84,77 86,69 80,73 74,69 76,77 70,82 78,82" fill="rgba(99,102,241,0.1)"/>
        </g>
      </svg>
    `,
    decorativeElements: ['✨', '🌟', '💫', '🎊']
  }
}

export default function QRCodeDisplay({ event, uploadUrl }: QRCodeDisplayProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const eventConfig = eventTypeConfig[event.eventType as keyof typeof eventTypeConfig] || eventTypeConfig.other
  const IconComponent = eventConfig.icon

  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrDataUrl = await QRCodeLib.toDataURL(uploadUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#1f2937',
            light: '#ffffff'
          }
        })
        setQrCodeDataUrl(qrDataUrl)
      } catch (error) {
        console.error('QR kod oluşturma hatası:', error)
      }
    }
    generateQR()
  }, [uploadUrl])

  const getParticipantsText = () => {
    if (!event.participants) return null
    
    if (event.eventType === 'wedding') {
      return `${event.participants.groom || ''} & ${event.participants.bride || ''}`
    } else if (event.eventType === 'engagement') {
      return `${event.participants.groom || ''} & ${event.participants.bride || ''}`
    } else if (event.eventType === 'birthday') {
      return `${event.participants.birthdayPerson || ''}`
    } else if (event.eventType === 'baby_shower') {
      return `${event.participants.parentNames || ''}`
    }
    
    return null
  }

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>QR Kodları - ${event.title}</title>
          <style>
            @media print {
              @page { 
                size: A4; 
                margin: 15mm; 
              }
              body { 
                margin: 0; 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              }
            }
            
            .print-container {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              width: 100%;
              max-width: 210mm;
            }
            
            .qr-card {
              position: relative;
              width: 90mm;
              height: 110mm;
              border: 3px solid ${eventConfig.borderColor.replace('border-', '#')};
              border-radius: 20px;
              padding: 15px;
              box-sizing: border-box;
              page-break-inside: avoid;
              background: ${eventConfig.printBg};
              overflow: hidden;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .decorative-bg {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              z-index: 1;
              opacity: 0.6;
            }
            
            .card-content {
              position: relative;
              z-index: 10;
              text-align: center;
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
            }
            
            .event-header {
              text-align: center;
              margin-bottom: 8px;
            }
            
            .event-type-badge {
              background: ${eventConfig.accentColor.replace('bg-', '#')};
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 600;
              margin-bottom: 8px;
              display: inline-block;
            }
            
            .event-title {
              font-size: 16px;
              font-weight: 700;
              color: #1f2937;
              margin: 6px 0;
              line-height: 1.2;
              max-width: 100%;
              word-wrap: break-word;
            }
            
            .participants {
              font-size: 13px;
              color: #4b5563;
              font-weight: 500;
              margin-bottom: 4px;
            }
            
            .qr-code-container {
              background: white;
              padding: 8px;
              border-radius: 12px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              margin: 10px 0;
            }
            
            .qr-code {
              width: 70mm;
              height: 70mm;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .qr-code img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            
            .event-info {
              text-align: center;
              margin-top: 8px;
            }
            
            .event-date {
              font-size: 12px;
              color: #374151;
              font-weight: 600;
              margin-bottom: 4px;
            }
            
            .event-location {
              font-size: 11px;
              color: #6b7280;
              margin-bottom: 6px;
            }
            
            .instructions {
              font-size: 10px;
              color: #9ca3af;
              text-align: center;
              margin-top: 6px;
              line-height: 1.3;
            }
            
            .logo-area {
              position: absolute;
              bottom: 8px;
              right: 12px;
              font-size: 10px;
              color: #9ca3af;
              font-weight: 600;
              z-index: 15;
            }
            
            .decorative-elements {
              position: absolute;
              font-size: 14px;
              opacity: 0.3;
              z-index: 5;
            }
            
            .element-1 { top: 10px; left: 10px; }
            .element-2 { top: 10px; right: 10px; }
            .element-3 { bottom: 10px; left: 10px; }
            .element-4 { bottom: 10px; right: 10px; }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${Array.from({ length: 6 }, (_, index) => `
              <div class="qr-card">
                <div class="decorative-bg">${eventConfig.decorativeSvg}</div>
                
                ${eventConfig.decorativeElements.map((element, idx) => 
                  `<div class="decorative-elements element-${idx + 1}">${element}</div>`
                ).join('')}
                
                <div class="card-content">
                  <div class="event-header">
                    <div class="event-type-badge">${eventConfig.pattern} ${eventConfig.name}</div>
                    <div class="event-title">${event.title}</div>
                    ${getParticipantsText() ? `<div class="participants">${getParticipantsText()}</div>` : ''}
                  </div>
                  
                  <div class="qr-code-container">
                    <div class="qr-code">
                      ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" alt="QR Code">` : ''}
                    </div>
                  </div>
                  
                  <div class="event-info">
                    <div class="event-date">📅 ${formatDate(event.date)}</div>
                    ${event.location ? `<div class="event-location">📍 ${event.location}</div>` : ''}
                    <div class="instructions">QR kodu tarayarak<br>fotoğrafları paylaşın</div>
                  </div>
                </div>
                
                <div class="logo-area">MemoryQR</div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  const handleDownload = async () => {
    if (!qrCodeDataUrl) return
    
    const link = document.createElement('a')
    link.download = `qr-code-${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`
    link.href = qrCodeDataUrl
    link.click()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${event.title} - QR Kod`,
          text: `${event.title} etkinliği için QR kodu`,
          url: uploadUrl
        })
      } catch (error) {
        console.error('Paylaşım hatası:', error)
      }
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(uploadUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">QR Kod Paylaşımı</h1>
                <p className="text-gray-600">QR kodunuzu paylaşın veya yazdırın</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPrintPreview(!showPrintPreview)}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Önizleme</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Panel - QR Kod Önizleme */}
          <div className="lg:col-span-2 space-y-6">
            {/* Modern QR Kod Kartı */}
            <Card className="relative overflow-hidden border-0 shadow-2xl">
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${eventConfig.gradient} opacity-90`}
                dangerouslySetInnerHTML={{ __html: eventConfig.decorativeSvg }}
              />
              
              <CardContent className="relative z-10 p-8">
                <div className="text-center space-y-6">
                  {/* Etkinlik Türü Badge */}
                  <div className="flex items-center justify-center">
                    <Badge 
                      className={`${eventConfig.accentColor} text-white px-4 py-2 text-sm font-semibold flex items-center space-x-2`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{eventConfig.name}</span>
                    </Badge>
                  </div>
                  
                  {/* Etkinlik Başlığı */}
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h2>
                    {getParticipantsText() && (
                      <p className="text-lg text-gray-700 font-medium">{getParticipantsText()}</p>
                    )}
                  </div>

                  {/* QR Kod */}
                  <div className="flex justify-center">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border-4 border-white">
                      {qrCodeDataUrl ? (
                        <img 
                          src={qrCodeDataUrl} 
                          alt="QR Code"
                          className="w-48 h-48"
                        />
                      ) : (
                        <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Açıklama */}
                  <div className="space-y-3">
                    {event.description && (
                      <p className="text-gray-700 text-lg max-w-lg mx-auto">{event.description}</p>
                    )}
                    
                    <p className="text-gray-600">
                      QR kodu tarayarak etkinlik fotoğraflarını görüntüleyin ve paylaşın
                    </p>
                    
                    <div className="text-gray-600 space-y-1">
                      <p className="flex items-center justify-center space-x-2">
                        <span>📅</span>
                        <span className="font-medium">{formatDate(event.date)}</span>
                      </p>
                      {event.location && (
                        <p className="flex items-center justify-center space-x-2">
                          <span>📍</span>
                          <span className="font-medium">{event.location}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dekoratif Elementler */}
                  <div className="absolute top-4 left-4 text-2xl opacity-30">
                    {eventConfig.decorativeElements[0]}
                  </div>
                  <div className="absolute top-4 right-4 text-2xl opacity-30">
                    {eventConfig.decorativeElements[1]}
                  </div>
                  <div className="absolute bottom-4 left-4 text-2xl opacity-30">
                    {eventConfig.decorativeElements[2]}
                  </div>
                  <div className="absolute bottom-4 right-4 text-2xl opacity-30">
                    {eventConfig.decorativeElements[3]}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Aksiyon Butonları */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={handleDownload} variant="outline" className="h-12">
                    <Download className="h-5 w-5 mr-2" />
                    Tek QR İndir
                  </Button>
                  
                  <Button onClick={handleShare} variant="outline" className="h-12">
                    <Share2 className="h-5 w-5 mr-2" />
                    Paylaş
                  </Button>
                  
                  <Button onClick={handlePrint} className="h-12">
                    <Printer className="h-5 w-5 mr-2" />
                    6'lı Yazdır
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Link Paylaşımı */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Direkt Link</CardTitle>
                <CardDescription>Bu linki paylaşarak misafirlerinizin fotoğraf yüklemesini sağlayın</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <div className="flex-1 bg-gray-100 rounded-lg p-3 text-sm font-mono break-all">
                    {uploadUrl}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="flex items-center space-x-2"
                  >
                    {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copiedLink ? 'Kopyalandı' : 'Kopyala'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sağ Panel - Etkinlik Bilgileri */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <IconComponent className={`h-6 w-6 ${eventConfig.iconColor}`} />
                  <span>Etkinlik Detayları</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Etkinlik Türü</span>
                  <p className="text-gray-900 font-medium">{eventConfig.name}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">Etkinlik Sahibi</span>
                  <p className="text-gray-900 font-medium">{event.customer.name}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Tarih</span>
                  <p className="text-gray-900 font-medium">{formatDate(event.date)}</p>
                </div>
                
                {event.location && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Konum</span>
                    <p className="text-gray-900 font-medium">{event.location}</p>
                  </div>
                )}
                
                {event.description && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Açıklama</span>
                    <p className="text-gray-900">{event.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kullanım Talimatları</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                    <span>QR kodları yazdırın ve misafirlerinizin görebileceği yerlere yerleştirin</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                    <span>Misafirler telefon kamerasıyla QR kodu okutacak</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                    <span>Otomatik olarak fotoğraf yükleme sayfasına yönlendirilecekler</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                    <span>Fotoğraflarını kolayca yükleyebilecekler</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">5</span>
                    <span>Tüm fotoğrafları dashboard'tan yönetebilirsiniz</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  },
  birthday: {
    name: 'Doğum Günü',
    icon: Cake,
    gradient: 'from-yellow-100 via-amber-50 to-orange-100',
    borderColor: 'border-orange-300',
    iconColor: 'text-orange-600',
    accentColor: 'bg-orange-500',
    pattern: '🎂',
    decorativeElements: ['🎈', '🎉', '🎊', '🎁'],
    message: 'Doğum günü anılarını paylaşın',
    backgroundPattern: `
      <pattern id="birthday-pattern" patternUnits="userSpaceOnUse" width="90" height="90">
        <circle cx="30" cy="30" r="18" stroke="rgba(251,146,60,0.15)" strokeWidth="3" fill="none"/>
        <circle cx="60" cy="60" r="10" stroke="rgba(251,146,60,0.12)" strokeWidth="2" fill="none"/>
        <path d="M15,75 Q45,65 75,75" stroke="rgba(251,146,60,0.18)" strokeWidth="4" fill="none"/>
        <!-- Balon desenler -->
        <g transform="translate(45,15)">
          <ellipse cx="0" cy="0" rx="3" ry="5" fill="rgba(251,146,60,0.2)"/>
          <path d="M0,5 Q0,8 -1,10" stroke="rgba(251,146,60,0.3)" strokeWidth="1"/>
        </g>
        <g transform="translate(20,50)">
          <ellipse cx="0" cy="0" rx="2.5" ry="4" fill="rgba(251,146,60,0.15)"/>
          <path d="M0,4 Q0,6 1,8" stroke="rgba(251,146,60,0.25)" strokeWidth="1"/>
        </g>
        <circle cx="70" cy="25" r="2" fill="rgba(251,146,60,0.2)"/>
        <circle cx="25" cy="70" r="1.5" fill="rgba(251,146,60,0.18)"/>
      </pattern>
    `
  },
  baby_shower: {
    name: 'Baby Shower',
    icon: Baby,
    gradient: 'from-blue-100 via-sky-50 to-cyan-100',
    borderColor: 'border-blue-300',
    iconColor: 'text-blue-600',
    accentColor: 'bg-blue-500',
    pattern: '👶',
    decorativeElements: ['🍼', '🧸', '👶', '🎀'],
    message: 'Küçük mucize için fotoğraflarınızı paylaşın',
    backgroundPattern: `
      <pattern id="baby-pattern" patternUnits="userSpaceOnUse" width="80" height="80">
        <circle cx="35" cy="35" r="15" stroke="rgba(59,130,246,0.15)" strokeWidth="2" fill="rgba(59,130,246,0.03)"/>
        <path d="M20,50 Q35,40 50,50" stroke="rgba(59,130,246,0.12)" strokeWidth="2" fill="none"/>
        <path d="M20,20 Q35,30 50,20" stroke="rgba(59,130,246,0.12)" strokeWidth="2" fill="none"/>
        <!-- Kalp desenler -->
        <g transform="translate(25,25)">
          <path d="M0,2 C0,0 -2,0 -2,2 C-2,0 -4,0 -4,2 C-4,4 0,8 0,8 C0,8 4,4 4,2 C4,0 2,0 2,2 C2,0 0,0 0,2" fill="rgba(59,130,246,0.15)"/>
        </g>
        <g transform="translate(55,55)">
          <path d="M0,1.5 C0,0 -1.5,0 -1.5,1.5 C-1.5,0 -3,0 -3,1.5 C-3,3 0,6 0,6 C0,6 3,3 3,1.5 C3,0 1.5,0 1.5,1.5 C1.5,0 0,0 0,1.5" fill="rgba(59,130,246,0.12)"/>
        </g>
        <circle cx="60" cy="20" r="2" fill="rgba(59,130,246,0.15)"/>
        <circle cx="20" cy="60" r="1.5" fill="rgba(59,130,246,0.12)"/>
      </pattern>
    `
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
    message: 'Kurumsal etkinlik anılarınızı paylaşın',
    backgroundPattern: `
      <pattern id="corporate-pattern" patternUnits="userSpaceOnUse" width="100" height="100">
        <rect x="20" y="20" width="20" height="20" stroke="rgba(75,85,99,0.12)" strokeWidth="2" fill="rgba(75,85,99,0.03)" rx="2"/>
        <rect x="60" y="60" width="15" height="15" stroke="rgba(75,85,99,0.1)" strokeWidth="1.5" fill="rgba(75,85,99,0.02)" rx="1.5"/>
        <path d="M10,90 L90,10" stroke="rgba(75,85,99,0.08)" strokeWidth="1" opacity="0.5"/>
        <path d="M10,10 L90,90" stroke="rgba(75,85,99,0.08)" strokeWidth="1" opacity="0.5"/>
        <!-- Geometrik desenler -->
        <g transform="translate(45,45)">
          <polygon points="0,-5 4,-2 2,3 -2,3 -4,-2" stroke="rgba(75,85,99,0.15)" strokeWidth="1" fill="rgba(75,85,99,0.05)"/>
        </g>
        <circle cx="25" cy="75" r="3" stroke="rgba(75,85,99,0.1)" strokeWidth="1" fill="none"/>
        <circle cx="75" cy="25" r="2" stroke="rgba(75,85,99,0.08)" strokeWidth="1" fill="none"/>
      </pattern>
    `
  },
  other: {
    name: 'Diğer Etkinlik',
    icon: Star,
    gradient: 'from-indigo-100 via-purple-50 to-pink-100',
    borderColor: 'border-indigo-300',
    iconColor: 'text-indigo-600',
    accentColor: 'bg-indigo-500',
    pattern: '⭐',
    decorativeElements: ['✨', '�', '💫', '🎊'],
    message: 'Özel anlarınızı bizimle paylaşın',
    backgroundPattern: `
      <pattern id="other-pattern" patternUnits="userSpaceOnUse" width="90" height="90">
        <!-- Çiçek desenler -->
        <g transform="translate(30,30)">
          <circle cx="0" cy="0" r="4" fill="rgba(99,102,241,0.1)"/>
          <circle cx="-3" cy="-3" r="2.5" fill="rgba(99,102,241,0.08)"/>
          <circle cx="3" cy="-3" r="2.5" fill="rgba(99,102,241,0.08)"/>
          <circle cx="-3" cy="3" r="2.5" fill="rgba(99,102,241,0.08)"/>
          <circle cx="3" cy="3" r="2.5" fill="rgba(99,102,241,0.08)"/>
          <circle cx="0" cy="-4" r="1.5" fill="rgba(99,102,241,0.12)"/>
          <circle cx="0" cy="4" r="1.5" fill="rgba(99,102,241,0.12)"/>
          <circle cx="-4" cy="0" r="1.5" fill="rgba(99,102,241,0.12)"/>
          <circle cx="4" cy="0" r="1.5" fill="rgba(99,102,241,0.12)"/>
        </g>
        <g transform="translate(70,70)">
          <circle cx="0" cy="0" r="3" fill="rgba(99,102,241,0.08)"/>
          <circle cx="-2" cy="-2" r="2" fill="rgba(99,102,241,0.06)"/>
          <circle cx="2" cy="-2" r="2" fill="rgba(99,102,241,0.06)"/>
          <circle cx="-2" cy="2" r="2" fill="rgba(99,102,241,0.06)"/>
          <circle cx="2" cy="2" r="2" fill="rgba(99,102,241,0.06)"/>
        </g>
        <path d="M10,80 Q45,70 80,80" stroke="rgba(99,102,241,0.12)" strokeWidth="2" fill="none"/>
        <path d="M20,10 Q45,20 70,10" stroke="rgba(99,102,241,0.1)" strokeWidth="1.5" fill="none"/>
        <circle cx="15" cy="50" r="1.5" fill="rgba(99,102,241,0.1)"/>
        <circle cx="75" cy="40" r="1" fill="rgba(99,102,241,0.08)"/>
      </pattern>
    `
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
        const dataUrl = await QRCodeLib.toDataURL(uploadUrl, {
          width: 200,
          margin: 1,
          color: {
            dark: '#1f2937',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'M'
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
          <title>${event.title} - QR Kodları (${paperSizes[selectedPaperSize as keyof typeof paperSizes].name})</title>
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
                  <p><strong>Tarih:</strong> ${formatDate(event.date)}</p>
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

  return (
    <div className="space-y-6">
      {/* QR Kod Önizlemesi */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">QR Kod Önizlemesi</h3>
        
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <div className={`inline-block p-4 rounded-lg border-2 ${eventTypeConfig[event.eventType]?.className || ''}`}>
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
                <p><strong>Tarih:</strong> {formatDate(event.date)}</p>
                {event.location && <p><strong>Konum:</strong> {event.location}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
