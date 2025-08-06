'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy, Check } from 'lucide-react'

interface QRLinkShareCardProps {
  uploadUrl: string
  copiedLink: boolean
  onCopyLink: () => void
}

export default function QRLinkShareCard({
  uploadUrl,
  copiedLink,
  onCopyLink
}: QRLinkShareCardProps) {
  return (
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
            onClick={onCopyLink}
            className="flex items-center space-x-2"
          >
            {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copiedLink ? 'Kopyalandı' : 'Kopyala'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
