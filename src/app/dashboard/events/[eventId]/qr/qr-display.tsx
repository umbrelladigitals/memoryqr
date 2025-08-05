'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QrCode, Download, Share2, Printer, ArrowLeft, Heart, Crown, Baby, Building, Star, Cake } from 'lucide-react'
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
    message: 'En güzel anlarınızı bizimle paylaşın',
    backgroundPattern: `
      <pattern id="wedding-pattern" patternUnits="userSpaceOnUse" width="100" height="100">
        <path d="M0,50 Q25,10 50,50 T100,50" stroke="rgba(251,113,133,0.1)" strokeWidth="2" fill="none"/>
        <path d="M0,25 Q25,0 50,25 T100,25" stroke="rgba(251,113,133,0.08)" strokeWidth="1.5" fill="none"/>
        <path d="M0,75 Q25,60 50,75 T100,75" stroke="rgba(251,113,133,0.08)" strokeWidth="1.5" fill="none"/>
        <circle cx="20" cy="30" r="2" fill="rgba(251,113,133,0.15)"/>
        <circle cx="80" cy="70" r="1.5" fill="rgba(251,113,133,0.12)"/>
        <circle cx="60" cy="20" r="1" fill="rgba(251,113,133,0.1)"/>
      </pattern>
    `
  },
  engagement: {
    name: 'Nişan',
    icon: Crown,
    gradient: 'from-purple-100 via-violet-50 to-pink-100',
    borderColor: 'border-purple-300',
    iconColor: 'text-purple-600',
    accentColor: 'bg-purple-500',
    pattern: '💍',
    decorativeElements: ['✨', '💎', '👑', '🌟'],
    message: 'Bu özel günün anılarını paylaşalım',
    backgroundPattern: `
      <pattern id="engagement-pattern" patternUnits="userSpaceOnUse" width="80" height="80">
        <path d="M40,20 L50,35 L40,50 L30,35 Z" stroke="rgba(147,51,234,0.12)" strokeWidth="1" fill="rgba(147,51,234,0.05)"/>
        <circle cx="20" cy="20" r="3" stroke="rgba(147,51,234,0.1)" strokeWidth="1" fill="none"/>
        <circle cx="60" cy="60" r="2" stroke="rgba(147,51,234,0.08)" strokeWidth="1" fill="none"/>
        <path d="M10,70 Q40,60 70,70" stroke="rgba(147,51,234,0.08)" strokeWidth="1.5" fill="none"/>
      </pattern>
    `
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
        <circle cx="30" cy="30" r="15" stroke="rgba(251,146,60,0.1)" strokeWidth="2" fill="none"/>
        <circle cx="60" cy="60" r="8" stroke="rgba(251,146,60,0.08)" strokeWidth="1.5" fill="none"/>
        <path d="M15,75 Q45,65 75,75" stroke="rgba(251,146,60,0.12)" strokeWidth="2" fill="none"/>
        <rect x="40" y="10" width="3" height="8" fill="rgba(251,146,60,0.1)"/>
        <circle cx="45" cy="70" r="1.5" fill="rgba(251,146,60,0.15)"/>
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
      <pattern id="baby-pattern" patternUnits="userSpaceOnUse" width="70" height="70">
        <circle cx="35" cy="35" r="12" stroke="rgba(59,130,246,0.1)" strokeWidth="1.5" fill="none"/>
        <path d="M20,50 Q35,40 50,50" stroke="rgba(59,130,246,0.08)" strokeWidth="1" fill="none"/>
        <path d="M20,20 Q35,30 50,20" stroke="rgba(59,130,246,0.08)" strokeWidth="1" fill="none"/>
        <circle cx="25" cy="25" r="2" fill="rgba(59,130,246,0.12)"/>
        <circle cx="45" cy="45" r="1.5" fill="rgba(59,130,246,0.1)"/>
      </pattern>
    `
  },
  corporate: {
    name: 'Kurumsal Etkinlik',
    icon: Building,
    gradient: 'from-gray-100 via-slate-50 to-zinc-100',
    borderColor: 'border-gray-300',
    iconColor: 'text-gray-600',
    accentColor: 'bg-gray-500',
    pattern: '🏢',
    decorativeElements: ['📊', '🤝', '💼', '📈'],
    message: 'Etkinlik anılarını paylaşın',
    backgroundPattern: `
      <pattern id="corporate-pattern" patternUnits="userSpaceOnUse" width="60" height="60">
        <rect x="20" y="20" width="20" height="20" stroke="rgba(107,114,128,0.08)" strokeWidth="1" fill="none"/>
        <path d="M10,50 L50,10" stroke="rgba(107,114,128,0.06)" strokeWidth="1"/>
        <path d="M10,10 L50,50" stroke="rgba(107,114,128,0.06)" strokeWidth="1"/>
        <circle cx="15" cy="45" r="1" fill="rgba(107,114,128,0.1)"/>
        <circle cx="45" cy="15" r="1" fill="rgba(107,114,128,0.1)"/>
      </pattern>
    `
  },
  other: {
    name: 'Diğer',
    icon: Star,
    gradient: 'from-indigo-100 via-purple-50 to-violet-100',
    borderColor: 'border-indigo-300',
    iconColor: 'text-indigo-600',
    accentColor: 'bg-indigo-500',
    pattern: '✨',
    decorativeElements: ['⭐', '✨', '🌟', '💫'],
    message: 'Bu özel anları paylaşın',
    backgroundPattern: `
      <pattern id="other-pattern" patternUnits="userSpaceOnUse" width="75" height="75">
        <polygon points="37.5,10 45,25 60,25 50,35 55,50 37.5,40 20,50 25,35 15,25 30,25" 
                 stroke="rgba(99,102,241,0.1)" strokeWidth="1" fill="rgba(99,102,241,0.05)"/>
        <circle cx="20" cy="60" r="2" stroke="rgba(99,102,241,0.08)" strokeWidth="1" fill="none"/>
        <circle cx="55" cy="15" r="1.5" fill="rgba(99,102,241,0.1)"/>
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
              background: white;
              line-height: 1.4;
            }
            .print-container {
              width: 100%;
              height: 100vh;
              display: grid;
              grid-template-columns: repeat(${cols}, 1fr);
              grid-template-rows: repeat(${rows}, 1fr);
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
            
            /* Event type specific backgrounds with elegant patterns */
            .qr-card.wedding {
              background: 
                radial-gradient(circle at 20% 80%, rgba(252, 231, 243, 0.4) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(253, 242, 248, 0.4) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(251, 113, 133, 0.1) 0%, transparent 50%),
                linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fdf2f8 100%);
              border: 2px solid #f9a8d4;
              position: relative;
            }
            
            .qr-card.wedding::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M20,80 Q50,60 80,80' stroke='%23f9a8d4' stroke-width='0.5' fill='none' opacity='0.3'/%3E%3Cpath d='M10,20 Q30,10 50,20 Q70,30 90,20' stroke='%23f9a8d4' stroke-width='0.5' fill='none' opacity='0.2'/%3E%3Ccircle cx='25' cy='25' r='2' fill='%23f9a8d4' opacity='0.4'/%3E%3Ccircle cx='75' cy='75' r='1.5' fill='%23f9a8d4' opacity='0.3'/%3E%3Cpath d='M15,60 Q25,50 35,60' stroke='%23f9a8d4' stroke-width='0.3' fill='none' opacity='0.2'/%3E%3C/svg%3E");
              background-size: 80px 80px;
              background-repeat: repeat;
              opacity: 0.6;
              z-index: 0;
            }
            
            .qr-card.engagement {
              background: 
                radial-gradient(circle at 30% 70%, rgba(233, 213, 255, 0.4) 0%, transparent 50%),
                radial-gradient(circle at 70% 30%, rgba(243, 232, 255, 0.4) 0%, transparent 50%),
                linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 50%, #f3e8ff 100%);
              border: 2px solid #c4b5fd;
            }
            
            .qr-card.engagement::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpolygon points='50,20 60,35 50,50 40,35' stroke='%23c4b5fd' stroke-width='0.5' fill='none' opacity='0.3'/%3E%3Ccircle cx='25' cy='75' r='3' stroke='%23c4b5fd' stroke-width='0.5' fill='none' opacity='0.2'/%3E%3Ccircle cx='75' cy='25' r='2' stroke='%23c4b5fd' stroke-width='0.5' fill='none' opacity='0.2'/%3E%3Cpath d='M10,10 L20,10 L20,20' stroke='%23c4b5fd' stroke-width='0.3' fill='none' opacity='0.3'/%3E%3C/svg%3E");
              background-size: 60px 60px;
              background-repeat: repeat;
              opacity: 0.5;
              z-index: 0;
            }
            
            .qr-card.birthday {
              background: 
                radial-gradient(circle at 25% 75%, rgba(254, 243, 199, 0.4) 0%, transparent 50%),
                radial-gradient(circle at 75% 25%, rgba(255, 251, 235, 0.4) 0%, transparent 50%),
                linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fffbeb 100%);
              border: 2px solid #fbbf24;
            }
            
            .qr-card.birthday::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='30' cy='30' r='8' stroke='%23fbbf24' stroke-width='0.5' fill='none' opacity='0.2'/%3E%3Ccircle cx='70' cy='70' r='5' stroke='%23fbbf24' stroke-width='0.5' fill='none' opacity='0.15'/%3E%3Cpath d='M20,80 Q50,70 80,80' stroke='%23fbbf24' stroke-width='0.4' fill='none' opacity='0.2'/%3E%3Crect x='45' y='15' width='2' height='8' fill='%23fbbf24' opacity='0.3'/%3E%3C/svg%3E");
              background-size: 70px 70px;
              background-repeat: repeat;
              opacity: 0.6;
              z-index: 0;
            }
            
            .qr-card.baby_shower {
              background: 
                radial-gradient(circle at 35% 65%, rgba(219, 234, 254, 0.4) 0%, transparent 50%),
                radial-gradient(circle at 65% 35%, rgba(239, 246, 255, 0.4) 0%, transparent 50%),
                linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #eff6ff 100%);
              border: 2px solid #93c5fd;
            }
            
            .qr-card.baby_shower::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='35' cy='35' r='6' stroke='%2393c5fd' stroke-width='0.5' fill='none' opacity='0.2'/%3E%3Cpath d='M20,50 Q35,40 50,50' stroke='%2393c5fd' stroke-width='0.4' fill='none' opacity='0.2'/%3E%3Cpath d='M50,20 Q65,30 80,20' stroke='%2393c5fd' stroke-width='0.4' fill='none' opacity='0.15'/%3E%3Ccircle cx='25' cy='75' r='1.5' fill='%2393c5fd' opacity='0.2'/%3E%3C/svg%3E");
              background-size: 60px 60px;
              background-repeat: repeat;
              opacity: 0.5;
              z-index: 0;
            }
            
            .qr-card.corporate {
              background: 
                linear-gradient(135deg, #f9fafb 0%, #f3f4f6 50%, #f9fafb 100%);
              border: 2px solid #d1d5db;
            }
            
            .qr-card.corporate::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='20' y='20' width='15' height='15' stroke='%23d1d5db' stroke-width='0.5' fill='none' opacity='0.15'/%3E%3Cpath d='M10,90 L90,10' stroke='%23d1d5db' stroke-width='0.3' opacity='0.1'/%3E%3Cpath d='M10,10 L90,90' stroke='%23d1d5db' stroke-width='0.3' opacity='0.1'/%3E%3C/svg%3E");
              background-size: 50px 50px;
              background-repeat: repeat;
              opacity: 0.4;
              z-index: 0;
            }
            
            .qr-card.other {
              background: 
                radial-gradient(circle at 40% 60%, rgba(224, 231, 255, 0.4) 0%, transparent 50%),
                radial-gradient(circle at 60% 40%, rgba(238, 242, 255, 0.4) 0%, transparent 50%),
                linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #eef2ff 100%);
              border: 2px solid #a5b4fc;
            }
            
            .qr-card.other::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpolygon points='50,20 55,35 70,35 60,45 65,60 50,50 35,60 40,45 30,35 45,35' stroke='%23a5b4fc' stroke-width='0.5' fill='none' opacity='0.2'/%3E%3Ccircle cx='20' cy='80' r='2' stroke='%23a5b4fc' stroke-width='0.4' fill='none' opacity='0.15'/%3E%3C/svg%3E");
              background-size: 70px 70px;
              background-repeat: repeat;
              opacity: 0.5;
              z-index: 0;
            }
            
            /* Decorative elements with elegant corner designs */
            .qr-card .event-header,
            .qr-card .qr-code-container,
            .qr-card .description,
            .qr-card .instructions,
            .qr-card .event-details,
            .qr-card .logo-area {
              position: relative;
              z-index: 2;
            }
            
            /* Elegant corner decorations */
            .qr-card::after {
              content: '';
              position: absolute;
              top: 8px;
              right: 8px;
              width: 30px;
              height: 30px;
              border-top: 2px solid currentColor;
              border-right: 2px solid currentColor;
              border-top-right-radius: 8px;
              opacity: 0.2;
              z-index: 1;
            }
            
            .qr-card.wedding::after {
              border-color: #f9a8d4;
            }
            
            .qr-card.engagement::after {
              border-color: #c4b5fd;
            }
            
            .qr-card.birthday::after {
              border-color: #fbbf24;
            }
            
            .qr-card.baby_shower::after {
              border-color: #93c5fd;
            }
            
            .qr-card.corporate::after {
              border-color: #d1d5db;
            }
            
            .qr-card.other::after {
              border-color: #a5b4fc;
            }
            
            /* Bottom left corner decoration */
            .qr-card .logo-area::after {
              content: '';
              position: absolute;
              bottom: -8px;
              left: -8px;
              width: 25px;
              height: 25px;
              border-bottom: 2px solid currentColor;
              border-left: 2px solid currentColor;
              border-bottom-left-radius: 6px;
              opacity: 0.15;
            }
            
            .qr-card.wedding .logo-area::after {
              border-color: #f9a8d4;
            }
            
            .qr-card.engagement .logo-area::after {
              border-color: #c4b5fd;
            }
            
            .qr-card.birthday .logo-area::after {
              border-color: #fbbf24;
            }
            
            .qr-card.baby_shower .logo-area::after {
              border-color: #93c5fd;
            }
            
            .qr-card.corporate .logo-area::after {
              border-color: #d1d5db;
            }
            
            .qr-card.other .logo-area::after {
              border-color: #a5b4fc;
            }
            
            /* Decorative corner elements like in your image */
            .qr-card::before,
            .qr-card::after {
              content: '';
              position: absolute;
              width: 40px;
              height: 40px;
              background-image: 
                radial-gradient(circle at 50% 50%, #e5e7eb 2px, transparent 2px),
                radial-gradient(circle at 25% 25%, #f3f4f6 1px, transparent 1px);
              background-size: 8px 8px, 4px 4px;
              opacity: 0.6;
            }
            
            .qr-card::before {
              top: 8px;
              left: 8px;
              border-radius: 0 0 20px 0;
            }
            
            .qr-card::after {
              bottom: 8px;
              right: 8px;
              border-radius: 20px 0 0 0;
            }
            
            .decorative-corner {
              position: absolute;
              width: 60px;
              height: 60px;
              background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'%3E%3Cpath d='M10 10 L50 10 L50 50 L40 50 L40 20 L10 20 Z' fill='%23f3f4f6' opacity='0.5'/%3E%3Cpath d='M5 5 L25 5 L25 25 L15 25 L15 15 L5 15 Z' fill='%23e5e7eb' opacity='0.7'/%3E%3C/svg%3E") no-repeat center;
              background-size: contain;
            }
            
            .corner-top-left {
              top: 0;
              left: 0;
            }
            
            .corner-bottom-right {
              bottom: 0;
              right: 0;
              transform: rotate(180deg);
            }
            
            .event-header {
              margin-bottom: 12px;
              z-index: 2;
              position: relative;
            }
            
            .event-title {
              font-size: 18px;
              font-weight: bold;
              color: #111827;
              margin-bottom: 6px;
              line-height: 1.2;
              letter-spacing: -0.025em;
            }
            
            .participants {
              font-size: 14px;
              color: #4b5563;
              margin-bottom: 8px;
              font-weight: 500;
            }
            
            .qr-code-container {
              margin: 12px 0;
              padding: 12px;
              background: #ffffff;
              border: 2px solid #f3f4f6;
              border-radius: 12px;
              box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
            }
            
            .qr-code img {
              width: 110px;
              height: 110px;
              border-radius: 4px;
            }
            
            .description {
              font-size: 11px;
              color: #6b7280;
              margin: 12px 0 8px 0;
              line-height: 1.4;
              max-width: 90%;
              text-align: center;
            }
            
            .instructions {
              font-size: 10px;
              color: #9ca3af;
              margin-top: 8px;
              line-height: 1.3;
              font-weight: 600;
            }
            
            .event-details {
              font-size: 9px;
              color: #6b7280;
              margin-top: 10px;
              padding-top: 8px;
              border-top: 1px solid #f3f4f6;
              width: 100%;
            }
            
            .logo-area {
              position: absolute;
              bottom: 8px;
              left: 8px;
              font-size: 8px;
              color: #9ca3af;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${Array.from({ length: totalCards }, (_, index) => `
              <div class="qr-card ${event.eventType || 'other'}">
                <div class="decorative-corner corner-top-left"></div>
                <div class="decorative-corner corner-bottom-right"></div>
                
                <div class="event-header">
                  <div class="event-title">${event.title}</div>
                  ${getParticipantsText() ? `
                    <div class="participants">${getParticipantsText()}</div>
                  ` : ''}
                </div>
                
                ${qrCodeDataUrl ? `
                  <div class="qr-code-container">
                    <div class="qr-code">
                      <img 
                        src="${qrCodeDataUrl}" 
                        alt="QR Code"
                      />
                    </div>
                  </div>
                ` : ''}

                <div class="description">
                  ${event.description || eventConfig.message}
                </div>

                <div class="instructions">
                  QR kodu telefonunuzla okutun
                </div>

                <div class="event-details">
                  <div>📅 ${new Date(event.date).toLocaleDateString('tr-TR')}</div>
                  ${event.location ? `<div>📍 ${event.location}</div>` : ''}
                </div>

                <div class="logo-area">
                  MemoryQR
                </div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getParticipantsText = () => {
    if (!event.participants) return ''
    
    const participants = event.participants as any
    if (event.eventType === 'wedding') {
      return `${participants.bride || ''} & ${participants.groom || ''}`.trim()
    } else if (event.eventType === 'engagement') {
      return `${participants.bride || ''} & ${participants.groom || ''}`.trim()
    } else if (event.eventType === 'birthday') {
      return participants.celebrant || ''
    } else if (event.eventType === 'baby_shower') {
      return participants.parents || ''
    }
    return participants.organizer || ''
  }

  const IconComponent = eventConfig.icon

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 no-print">
          <Link href="/dashboard">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard'a Dön
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* QR Code Preview Card */}
          <Card className="no-print">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="h-6 w-6" />
                <span>QR Kod Önizleme</span>
              </CardTitle>
              <CardDescription>
                QR kodunuz nasıl görünecek
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={`p-6 rounded-xl bg-gradient-to-br ${eventConfig.gradient} border-2 ${eventConfig.borderColor}`}>
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <IconComponent className={`h-5 w-5 ${eventConfig.iconColor}`} />
                    <Badge variant="secondary" className={`${eventConfig.accentColor} text-white`}>
                      {eventConfig.name}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-800">{event.title}</h3>
                  
                  {getParticipantsText() && (
                    <p className="text-sm text-gray-600 font-medium">
                      {getParticipantsText()}
                    </p>
                  )}

                  {qrCodeDataUrl && (
                    <div className="flex justify-center">
                      <div className="bg-white p-3 rounded-lg shadow-sm border">
                        <img 
                          src={qrCodeDataUrl} 
                          alt="QR Code"
                          className="w-32 h-32"
                        />
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-600">
                    {event.description || eventConfig.message}
                  </p>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>📅 {formatDate(event.date)}</p>
                    {event.location && <p>📍 {event.location}</p>}
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 break-all bg-gray-100 p-3 rounded-lg">
                <strong>Link:</strong> {uploadUrl}
              </div>
            </CardContent>
          </Card>

          {/* Event Info Card */}
          <Card className="no-print">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconComponent className={`h-6 w-6 ${eventConfig.iconColor}`} />
                <span>{event.title}</span>
              </CardTitle>
              <CardDescription>Etkinlik Bilgileri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong className="text-sm">Etkinlik Türü:</strong>
                <p className="text-gray-700">{eventConfig.name}</p>
              </div>

              {getParticipantsText() && (
                <div>
                  <strong className="text-sm">Katılımcılar:</strong>
                  <p className="text-gray-700">{getParticipantsText()}</p>
                </div>
              )}
              
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
                  <li>1. QR kodları yazdırın ve misafirlerinizin görebileceği yerlere yerleştirin</li>
                  <li>2. Misafirler telefon kamerasıyla QR kodu okutacak</li>
                  <li>3. Otomatik olarak fotoğraf yükleme sayfasına yönlendirilecekler</li>
                  <li>4. Fotoğraflarını kolayca yükleyebilecekler</li>
                  <li>5. Tüm fotoğrafları dashboard'tan yönetebilirsiniz</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card className="no-print mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Printer className="h-6 w-6" />
              <span>İşlemler</span>
            </CardTitle>
            <CardDescription>
              QR kodunuzu paylaşın veya yazdırın
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={handleDownload} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Tek QR İndir
              </Button>
              
              <Button onClick={handleShare} variant="outline" className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Paylaş
              </Button>
              
              <Button 
                onClick={() => setShowPrintOptions(!showPrintOptions)} 
                className="w-full"
              >
                <Printer className="h-4 w-4 mr-2" />
                Yazdırma Seçenekleri
              </Button>
            </div>

            {/* Print Options Panel */}
            {showPrintOptions && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-semibold mb-4">Yazdırma Ayarları</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Kağıt Boyutu</label>
                    <select 
                      value={selectedPaperSize}
                      onChange={(e) => setSelectedPaperSize(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      {Object.entries(paperSizes).map(([key, size]) => (
                        <option key={key} value={key}>{size.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Layout</label>
                    <select 
                      value={selectedLayout}
                      onChange={(e) => setSelectedLayout(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      {layoutOptions[selectedPaperSize as keyof typeof layoutOptions].map((layout) => (
                        <option key={layout.value} value={layout.value}>
                          {layout.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    {paperSizes[selectedPaperSize as keyof typeof paperSizes].name} - 
                    {layoutOptions[selectedPaperSize as keyof typeof layoutOptions].find(l => l.value === selectedLayout)?.label}
                  </p>
                  <Button onClick={handlePrint} className="flex items-center">
                    <Printer className="h-4 w-4 mr-2" />
                    Yazdır
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Print Layout - Hidden on screen */}
        <div ref={printRef} style={{ display: 'none' }}>
          <div className="print-container">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className={`qr-card ${event.eventType || 'other'}`}>
                <div className="decorative-corner corner-top-left"></div>
                <div className="decorative-corner corner-bottom-right"></div>
                
                <div className="event-header">
                  <div className="event-title">{event.title}</div>
                  {getParticipantsText() && (
                    <div className="participants">{getParticipantsText()}</div>
                  )}
                </div>
                
                {qrCodeDataUrl && (
                  <div className="qr-code-container">
                    <div className="qr-code">
                      <img 
                        src={qrCodeDataUrl} 
                        alt="QR Code"
                      />
                    </div>
                  </div>
                )}

                <div className="description">
                  {event.description || eventConfig.message}
                </div>

                <div className="instructions">
                  QR kodu telefonunuzla okutun
                </div>

                <div className="event-details">
                  <div>📅 {new Date(event.date).toLocaleDateString('tr-TR')}</div>
                  {event.location && <div>📍 {event.location}</div>}
                </div>

                <div className="logo-area">
                  MemoryQR
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
