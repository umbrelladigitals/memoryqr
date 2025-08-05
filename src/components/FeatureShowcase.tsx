'use client';

import React from 'react';
import { QrCode, CloudUpload, Users, Shield, Zap, Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: QrCode,
    title: 'QR Kod ile Kolay Erişim',
    description: 'Misafirleriniz sadece QR kod okutup fotoğraf yükleyebilir. Uygulama indirme gerekmiyor.',
    gradient: 'from-blue-500 to-blue-600',
    delay: '0ms'
  },
  {
    icon: CloudUpload,
    title: 'Hızlı Yükleme',
    description: 'Drag & drop ile birden fazla fotoğraf yükleme. Otomatik boyutlandırma ve optimize etme.',
    gradient: 'from-green-500 to-green-600',
    delay: '100ms'
  },
  {
    icon: Users,
    title: 'Merkezi Yönetim',
    description: 'Tüm fotoğrafları admin panelinden görün, seçin ve indirin. Toplu işlemler desteklenir.',
    gradient: 'from-purple-500 to-purple-600',
    delay: '200ms'
  },
  {
    icon: Shield,
    title: 'Güvenli ve Gizli',
    description: 'Her etkinlik izole bir alan. Sadece etkinlik sahibi ve katılımcılar erişebilir.',
    gradient: 'from-red-500 to-red-600',
    delay: '300ms'
  },
  {
    icon: Zap,
    title: 'Otomatik Arşivleme',
    description: 'Etkinlik sonrası fotoğraflar otomatik arşivlenir. ZIP dosyası olarak indirin.',
    gradient: 'from-yellow-500 to-orange-600',
    delay: '400ms'
  },
  {
    icon: Star,
    title: 'Beğeni ve Sıralama',
    description: 'En iyi fotoğrafları beğeni sistemi ile bulun. Tarih/saat sıralaması mevcut.',
    gradient: 'from-pink-500 to-red-600',
    delay: '500ms'
  }
];

export function FeatureShowcase() {
  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <Badge className="bg-purple-100 text-purple-700 border-purple-200 mb-4">
            <Star className="w-3 h-3 mr-1" />
            Özellikler
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Neden MemoryQR?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Modern etkinlik yönetimi için ihtiyacınız olan her şey
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <Card 
                key={index}
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 shadow-lg bg-white/80 backdrop-blur-sm animate-fade-in-up"
                style={{ animationDelay: feature.delay }}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 floating-animation`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2 group-hover:text-aurora-blue transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}