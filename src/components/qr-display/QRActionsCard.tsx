import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Printer, Share2 } from 'lucide-react'

interface QRActionsCardProps {
  onPrint: () => void
  onDownload: () => void
  onShare: () => void
  printQuantity: number
  onQuantityChange: (quantity: number) => void
  disabled?: boolean
}

export default function QRActionsCard({
  onPrint,
  onDownload,
  onShare,
  printQuantity,
  onQuantityChange,
  disabled = false
}: QRActionsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          İşlemler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Print Quantity Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Yazdırma Miktarı
          </label>
          <Select
            value={printQuantity.toString()}
            onValueChange={(value) => onQuantityChange(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Miktar seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6'lı (2x3 - Büyük)</SelectItem>
              <SelectItem value="12">12'li (3x4 - Orta)</SelectItem>
              <SelectItem value="24">24'lü (4x6 - Küçük)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button
          onClick={onPrint}
          disabled={disabled}
          className="w-full justify-start"
          variant="outline"
        >
          <Printer className="w-4 h-4 mr-2" />
          Yazdır ({printQuantity} adet)
        </Button>
        
        <Button
          onClick={onDownload}
          disabled={disabled}
          className="w-full justify-start"
          variant="outline"
        >
          <Download className="w-4 h-4 mr-2" />
          QR Kodu İndir
        </Button>
        
        <Button
          onClick={onShare}
          disabled={disabled}
          className="w-full justify-start"
          variant="outline"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Paylaş
        </Button>
      </CardContent>
    </Card>
  )
}
