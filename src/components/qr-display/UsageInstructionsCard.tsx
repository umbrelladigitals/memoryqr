'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function UsageInstructionsCard() {
  return (
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
  )
}
