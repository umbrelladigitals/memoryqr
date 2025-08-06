'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { QrCode, Mail, ArrowLeft, Sparkles, Send, Camera } from 'lucide-react'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Here you would typically send a request to your forgot password API
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      setEmailSent(true)
      toast.success('Şifre sıfırlama bağlantısı email adresinize gönderildi!')
    } catch (error) {
      toast.error('Bir hata oluştu, lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo Section */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center justify-center space-x-3 group">
            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <Sparkles className="h-4 w-4 text-purple-300 absolute -top-1 -right-1 animate-ping" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
              Snaprella
            </span>
          </Link>
        </div>

        {/* Main Card */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardHeader className="space-y-3 text-center">
            <CardTitle className="text-3xl font-bold text-white">
              {emailSent ? 'Email Gönderildi' : 'Şifremi Unuttum'}
            </CardTitle>
            <CardDescription className="text-gray-300 text-base">
              {emailSent 
                ? 'Şifre sıfırlama bağlantısı email adresinize gönderildi'
                : 'Email adresinizi girin, size şifre sıfırlama bağlantısı gönderelim'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {emailSent ? (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Send className="h-10 w-10 text-green-300" />
                </div>
                <div className="space-y-2">
                  <p className="text-white font-medium">Email gönderildi!</p>
                  <p className="text-gray-300 text-sm">
                    <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderdik.
                    Email'inizi kontrol edin ve bağlantıya tıklayarak şifrenizi sıfırlayın.
                  </p>
                </div>
                <div className="space-y-3">
                  <Button 
                    onClick={() => setEmailSent(false)}
                    variant="outline"
                    className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                  >
                    Tekrar Gönder
                  </Button>
                  <Link href="/auth/signin">
                    <Button 
                      variant="outline"
                      className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Giriş Sayfasına Dön
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white font-medium">
                    Email Adresi
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20 h-12"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Gönderiliyor...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Send className="h-4 w-4" />
                      <span>Şifre Sıfırlama Bağlantısı Gönder</span>
                    </div>
                  )}
                </Button>

                {/* Back to Login */}
                <div className="text-center pt-4 border-t border-white/10">
                  <Link 
                    href="/auth/signin" 
                    className="inline-flex items-center space-x-2 text-purple-300 hover:text-purple-200 font-medium transition-colors duration-300"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Giriş sayfasına dön</span>
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm">
          <p>© 2025 Snaprella. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  )
}
