'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileQuestion className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-gray-800">404 - Sayfa Bulunamadı</CardTitle>
          <CardDescription className="text-base">
            Aradığınız sayfa bulunamadı veya taşınmış olabilir.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            <p>Şunları deneyebilirsiniz:</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• URL'yi doğru yazdığınızdan emin olun</li>
              <li>• Ana sayfaya giderek menüden gezinin</li>
              <li>• Geri butonunu kullanarak önceki sayfaya dönün</li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={() => window.history.back()}
              className="flex-1"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri Dön
            </Button>
            <Button 
              asChild
              className="flex-1"
              variant="default"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Ana Sayfa
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
