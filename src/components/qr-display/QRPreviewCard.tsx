import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QrCode, Loader2 } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

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

interface EventConfig {
  name: string
  icon: LucideIcon
  gradient: string
  borderColor: string
  iconColor: string
  accentColor: string
  pattern: string
  printBg: string
  decorativeSvg: string
  decorativeElements: string[]
}

interface QRPreviewCardProps {
  event: Event
  qrDataUrl: string
  isGenerating: boolean
  config: EventConfig
  IconComponent: LucideIcon
}

export default function QRPreviewCard({
  event,
  qrDataUrl,
  isGenerating,
  config,
  IconComponent
}: QRPreviewCardProps) {
  return (
    <Card className={`bg-gradient-to-br ${config.gradient} border-2 ${config.borderColor}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
          QR Kod Önizleme
          <Badge variant="secondary" className="ml-auto">
            {config.name}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-4 border-white">
            {isGenerating ? (
              <div className="w-48 h-48 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">QR kod oluşturuluyor...</p>
                </div>
              </div>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Kod"
                className="w-48 h-48 object-contain"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <QrCode className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">QR kod yüklenemiyor</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Decorative elements around QR */}
          <div className="absolute -top-2 -left-2 text-2xl opacity-60">
            {config.pattern}
          </div>
          <div className="absolute -top-2 -right-2 text-2xl opacity-60">
            {config.pattern}
          </div>
          <div className="absolute -bottom-2 -left-2 text-2xl opacity-60">
            {config.pattern}
          </div>
          <div className="absolute -bottom-2 -right-2 text-2xl opacity-60">
            {config.pattern}
          </div>
        </div>

        <div className="text-center">
          <h3 className="font-semibold text-lg text-gray-800 mb-1">
            {event.title}
          </h3>
          <p className="text-sm text-gray-600">
            Bu QR kodu tarayarak etkinliğe fotoğraf yükleyebilirsiniz
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
