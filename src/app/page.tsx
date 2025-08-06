'use client';

import React, { useState, useEffect } from 'react';
import { Metadata } from 'next';
import Link from "next/link";
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  QrCode, 
  CloudUpload, 
  Users, 
  Shield, 
  Zap, 
  Star, 
  Check, 
  ArrowRight,
  Sparkles,
  Crown,
  Camera,
  Download,
  Globe,
  Clock,
  Award,
  Smartphone,
  Layers,
  TrendingUp,
  Heart,
  MessageSquare
} from "lucide-react";
import { AuroraBackground } from '@/components/AuroraBackground';
import { GlassCard } from '@/components/GlassCard';
import { FeatureShowcase } from '@/components/FeatureShowcase';
import { InteractiveQRDemo } from '@/components/InteractiveQRDemo';

// Plan interface
interface Plan {
  id: string
  name: string
  displayName: string
  description: string | null
  price: number
  currency: string
  maxEvents: number | null
  maxPhotosPerEvent: number | null
  maxStorageGB: number | null
  customBranding: boolean
  analytics: boolean
  prioritySupport: boolean
  whitelabel: boolean
  isActive: boolean
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/plans');
        if (response.ok) {
          const data = await response.json();
          setPlans(data.plans);
        } else {
          console.error('Failed to fetch plans');
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Modern Header with Glass Effect */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-0 border-b border-slate-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Snaprella
            </h1>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
              Özellikler
            </Link>
            <Link href="#pricing" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
              Fiyatlar
            </Link>
            <Link href="#how-it-works" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
              Nasıl Çalışır
            </Link>
          </nav>
          <div className="space-x-3">
            {session ? (
              // Giriş yapmış kullanıcılar için
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600 hidden sm:block">
                  Hoş geldin, {session.user?.name || session.user?.email}
                </span>
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all hover:from-blue-700 hover:to-purple-700">
                    Etkinlik Alanı'na Git
                  </Button>
                </Link>
              </div>
            ) : (
              // Giriş yapmamış kullanıcılar için
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost" className="text-slate-700 hover:text-blue-600 hover:bg-blue-50">
                    Giriş Yap
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all hover:from-blue-700 hover:to-purple-700">
                    Ücretsiz Başla
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Immersive Hero Section */}
      <section 
        className="pt-32 pb-20 relative min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)), url('/hero-bg.jpg')`
        }}
      >
        {/* Animated overlay elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
        </div>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 transition-colors">
                  <Sparkles className="w-3 h-3 mr-1" />
                  2025'in En Yenilikçi Çözümü
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-white">
                  Etkinlik Fotoğraflarını{" "}
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    QR Kod ile
                  </span>{" "}
                  Toplayın
                </h1>
                <p className="text-xl text-white/90 leading-relaxed max-w-2xl">
                  Düğün, doğum günü, kurumsal etkinlik - misafirleriniz QR kod okutup 
                  fotoğraflarını yükleyebilir. Siz de tüm fotoğrafları tek yerden yönetin.
                  <span className="font-semibold text-white"> Hiç bu kadar kolay olmamıştı!</span>
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all text-lg px-8 py-4 group hover:from-blue-700 hover:to-purple-700">
                    Ücretsiz Başla
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm text-white text-lg px-8 py-4 group border-2 border-white/30 hover:border-white/50 hover:bg-white/20 transition-all">
                    <Camera className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                    Nasıl Çalışır?
                  </Button>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center space-x-8 pt-8">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl border border-white/30 text-center">
                  <div className="text-2xl font-bold text-blue-400">10K+</div>
                  <div className="text-sm text-white/80">Etkinlik</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl border border-white/30 text-center">
                  <div className="text-2xl font-bold text-purple-400">1M+</div>
                  <div className="text-sm text-white/80">Fotoğraf</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl border border-white/30 text-center">
                  <div className="text-2xl font-bold text-pink-400">5K+</div>
                  <div className="text-sm text-white/80">Mutlu Müşteri</div>
                </div>
              </div>
            </div>

            {/* Right Column - 3D Bento Grid */}
            <div className="perspective-1000">
              <div className="grid grid-cols-6 grid-rows-4 gap-4 h-[600px] transform-3d rotate-y-12">
                {/* Large QR Code Demo */}
                <GlassCard className="col-span-3 row-span-2 aurora-bg text-white p-6 flex flex-col justify-center items-center">
                  <QrCode className="w-20 h-20 mb-4 floating-animation" />
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">QR Kod</h3>
                    <p className="text-white/80 text-sm">Anında Erişim</p>
                  </div>
                </GlassCard>

                {/* Upload Feature */}
                <GlassCard className="col-span-3 row-span-1 bg-gradient-to-r from-green-400 to-green-500 text-white p-4 flex items-center justify-center">
                  <CloudUpload className="w-8 h-8 mr-3 floating-animation" />
                  <div>
                    <h4 className="font-semibold">Hızlı Yükleme</h4>
                    <p className="text-green-100 text-xs">Drag & Drop</p>
                  </div>
                </GlassCard>

                {/* Stats */}
                <GlassCard className="col-span-2 row-span-1 bg-white/90 p-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-aurora-blue">99.9%</div>
                    <div className="text-xs text-muted-foreground">Uptime</div>
                  </div>
                </GlassCard>

                {/* Security */}
                <GlassCard className="col-span-1 row-span-1 bg-gradient-to-br from-red-400 to-red-500 text-white p-3 flex items-center justify-center">
                  <Shield className="w-6 h-6 pulse-glow" />
                </GlassCard>

                {/* Management */}
                <GlassCard className="col-span-2 row-span-1 bg-gradient-to-r from-purple-400 to-purple-500 text-white p-4 flex items-center">
                  <Users className="w-6 h-6 mr-2" />
                  <div>
                    <h4 className="font-semibold text-sm">Merkezi Yönetim</h4>
                    <p className="text-purple-100 text-xs">Kolay Kontrol</p>
                  </div>
                </GlassCard>

                {/* Awards */}
                <GlassCard className="col-span-4 row-span-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-4 flex items-center justify-center">
                  <Award className="w-8 h-8 mr-3 floating-animation" />
                  <div>
                    <h4 className="font-semibold">2025 Innovation Award</h4>
                    <p className="text-yellow-100 text-sm">En İyi Etkinlik Teknolojisi</p>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeatureShowcase />

      {/* Modern Pricing Section */}
      <section id="pricing" className="py-24 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 opacity-30" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="glass-card bg-green-100/80 text-green-700 border-green-200 mb-4">
              <Crown className="w-3 h-3 mr-1" />
              Fiyatlandırma
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              İhtiyacınıza Uygun Plan Seçin
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Küçük etkinliklerden büyük organizasyonlara kadar her ölçekte çözüm
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded mb-6"></div>
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              plans.map((plan: Plan, index: number) => {
                const isPopular = plan.name === 'PRO';
                const planIcon = plan.name === 'FREE' ? Globe : plan.name === 'PRO' ? Zap : Crown;
                const PlanIcon = planIcon;
                
                return (
                  <GlassCard 
                    key={plan.id} 
                    className={`relative group ${
                      isPopular 
                        ? 'ring-2 ring-blue-500 bg-blue-50/50 border-blue-200' 
                        : 'bg-white/80'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 text-sm font-semibold">
                        <Sparkles className="w-3 h-3 mr-1" />
                        En Popüler
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform floating-animation ${
                      plan.name === 'FREE' ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                      plan.name === 'PRO' ? 'aurora-bg' :
                      'bg-gradient-to-br from-purple-400 to-purple-600'
                    }`}>
                      <PlanIcon className="h-8 w-8 text-white" />
                    </div>
                    
                    <CardTitle className="text-2xl mb-2">{plan.displayName}</CardTitle>
                    <div className="mb-4">
                      {plan.price === 0 ? (
                        <div className="text-4xl font-bold text-gray-900">Ücretsiz</div>
                      ) : (
                        <>
                          <div className="text-4xl font-bold text-gray-900">
                            ₺{plan.price}
                            <span className="text-lg font-normal text-muted-foreground">/ay</span>
                          </div>
                        </>
                      )}
                    </div>
                    <CardDescription className="text-muted-foreground">
                      {plan.name === 'FREE' && 'Küçük etkinlikler için ideal başlangıç'}
                      {plan.name === 'PRO' && 'Profesyonel etkinlikler için tam özellikli'}
                      {plan.name === 'ENTERPRISE' && 'Büyük organizasyonlar için premium'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm">
                          {plan.maxEvents === null ? 'Sınırsız' : plan.maxEvents} etkinlik
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm">
                          Etkinlik başına {plan.maxPhotosPerEvent === null ? 'sınırsız' : plan.maxPhotosPerEvent} fotoğraf
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm">
                          {plan.maxStorageGB === null ? 'Sınırsız' : `${plan.maxStorageGB} GB`} depolama
                        </span>
                      </div>

                      {plan.customBranding && (
                        <div className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm">Özel markalama</span>
                        </div>
                      )}

                      {plan.analytics && (
                        <div className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm">Gelişmiş analitik</span>
                        </div>
                      )}

                      {plan.prioritySupport && (
                        <div className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm">Öncelikli destek</span>
                        </div>
                      )}

                      {plan.whitelabel && (
                        <div className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm">Beyaz etiket çözümü</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-6">
                      <Link href={session ? `/dashboard?selectPlan=${plan.id}` : "/auth/signup"}>
                        <Button 
                          className={`w-full ${
                            isPopular 
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700' 
                              : 'bg-slate-900 text-white hover:bg-slate-800'
                          } transition-all group`}
                        >
                          {session 
                            ? (plan.price === 0 ? 'Bu Plana Geç' : 'Bu Planı Seç') 
                            : (plan.price === 0 ? 'Ücretsiz Başla' : 'Plan Seç')
                          }
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </GlassCard>
              );
            })
            )}
          </div>

          <div className="text-center mt-16">
            <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-xl">
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">Kurumsal Çözümler</h3>
                <p className="text-blue-100 mb-6 text-lg">
                  Büyük organizasyonlar için özel çözümler sunuyoruz. 
                  Özelleştirilmiş özellikler ve dedicated destek ile ihtiyaçlarınızı karşılıyoruz.
                </p>
                <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                  Bizimle İletişime Geçin
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works with Interactive Timeline */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 mb-4">
              <Clock className="w-3 h-3 mr-1" />
              Nasıl Çalışır
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              3 Basit Adımda Başlayın
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Dakikalar içinde kurulum, anında kullanıma hazır
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connection Lines */}
              <div className="hidden md:block absolute top-24 left-1/6 w-2/3 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
              
              <div className="text-center relative">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg hover:scale-110 transition-transform">
                    1
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200">
                  <h3 className="text-xl font-semibold mb-3 text-slate-900">Etkinlik Oluştur</h3>
                  <p className="text-slate-600">
                    Hesap açın, etkinliğinizi tanımlayın ve QR kodunuzu alın. 
                    Tüm süreç 2 dakikadan az sürer.
                  </p>
                </div>
              </div>
              
              <div className="text-center relative">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-3xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg hover:scale-110 transition-transform">
                    2
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <QrCode className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200">
                  <h3 className="text-xl font-semibold mb-3 text-slate-900">QR Kod Paylaş</h3>
                  <p className="text-slate-600">
                    QR kodu yazdırın, masalara koyun veya dijital ekranlarda gösterin. 
                    Misafirler anında erişebilir.
                  </p>
                </div>
              </div>
              
              <div className="text-center relative">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-3xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg hover:scale-110 transition-transform">
                    3
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <Camera className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200">
                  <h3 className="text-xl font-semibold mb-3 text-slate-900">Fotoğrafları Topla</h3>
                  <p className="text-slate-600">
                    Misafirler fotoğraf yükler, siz admin panelinden yönetirsiniz. 
                    Otomatik sıralama ve indirme.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Demo */}
          <div className="mt-16">
            <InteractiveQRDemo />
          </div>
        </div>
      </section>

      {/* Trust & Security Showcase */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
              <Shield className="w-3 h-3 mr-1" />
              Güven & Güvenlik
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Verileriniz Güvende
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Endüstri standardı güvenlik önlemleri ile verilerinizi koruyoruz
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-slate-900">SSL Şifreleme</h3>
              <p className="text-sm text-slate-600">256-bit SSL ile tüm veriler şifrelenir</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-slate-900">GDPR Uyumlu</h3>
              <p className="text-sm text-slate-600">Avrupa veri koruma standartları</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-slate-900">99.9% Uptime</h3>
              <p className="text-sm text-slate-600">Kesintisiz hizmet garantisi</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-slate-900">24/7 Destek</h3>
              <p className="text-sm text-slate-600">Her zaman yanınızdayız</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Gradient Background */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/20 backdrop-blur-sm text-white border border-white/30 inline-flex items-center px-3 py-1 rounded-full text-sm mb-6">
              <Sparkles className="w-3 h-3 mr-1" />
              Hemen Başlayın
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              Bir Sonraki Etkinliğinize Hazır mısınız?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Ücretsiz hesap açın ve ilk etkinliğinizi 5 dakikada kurun. 
              Kredi kartı bilgisi gerekmez, hemen başlayın!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/auth/signup">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 shadow-xl group">
                  Hemen Başla - Ücretsiz
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button size="lg" className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 text-lg px-8 py-4">
                  Fiyatları İncele
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-80">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl text-center">
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-sm">Uptime</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl text-center">
                <div className="text-2xl font-bold">SSL</div>
                <div className="text-sm">Güvenli</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl text-center">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm">Destek</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl text-center">
                <div className="text-2xl font-bold">GDPR</div>
                <div className="text-sm">Uyumlu</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-4 gap-8 py-16">
            {/* Brand Column */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="relative">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Snaprella
                </h3>
              </div>
              <p className="text-gray-400 text-lg mb-6 max-w-md">
                QR kod teknolojisi ile etkinlik fotoğraflarını toplama konusunda 
                Türkiye'nin en yenilikçi platformu.
              </p>
              <div className="flex space-x-4">
                <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                  <Award className="w-3 h-3 mr-1" />
                  2025 Innovation Award
                </Badge>
                <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                  <Shield className="w-3 h-3 mr-1" />
                  GDPR Uyumlu
                </Badge>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Platform</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="#features" className="text-gray-400 hover:text-blue-400 transition-colors">
                    Özellikler
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-gray-400 hover:text-blue-400 transition-colors">
                    Fiyatlandırma
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="text-gray-400 hover:text-blue-400 transition-colors">
                    Nasıl Çalışır
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="text-gray-400 hover:text-blue-400 transition-colors">
                    Ücretsiz Deneme
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Şirket</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-blue-400 transition-colors">
                    Hakkımızda
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-blue-400 transition-colors">
                    İletişim
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors">
                    Gizlilik Politikası
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-blue-400 transition-colors">
                    Kullanım Şartları
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 mb-4 md:mb-0">
                © 2025 Snaprella. Tüm hakları saklıdır.
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Tüm sistemler çalışıyor</span>
                </div>
                <div className="text-gray-400 text-sm">
                  Türkiye'de ❤️ ile yapıldı
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}