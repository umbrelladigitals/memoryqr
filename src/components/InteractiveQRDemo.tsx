'use client';

import React, { useState } from 'react';
import { QrCode, Smartphone, Camera, Check, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from './GlassCard';

export function InteractiveQRDemo() {
  const [step, setStep] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  const steps = [
    { icon: QrCode, title: 'QR Kod Tarama', description: 'Telefon kameranızla QR kodu okutun' },
    { icon: Smartphone, title: 'Web Sayfası Açılır', description: 'Otomatik olarak yükleme sayfası açılır' },
    { icon: Camera, title: 'Fotoğraf Seçin', description: 'Galerinizden veya kamerayla çekin' },
    { icon: Upload, title: 'Anında Yükle', description: 'Fotoğrafınız etkinlik galerisine eklenir' }
  ];

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setStep((prev) => (prev + 1) % steps.length);
    }, 2000);
  };

  return (
    <GlassCard className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gradient-aurora mb-4">
          Canlı QR Demo
        </h3>
        <p className="text-muted-foreground">
          QR kod tarama sürecini deneyimleyin
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* QR Code Section */}
        <div className="text-center">
          <div className="relative">
            <div className={`w-48 h-48 bg-white rounded-2xl p-4 mx-auto mb-4 transition-all duration-500 ${isScanning ? 'pulse-glow scale-110' : ''}`}>
              <QrCode className="w-full h-full text-gray-900" />
            </div>
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-4 border-aurora-blue rounded-2xl animate-pulse"></div>
              </div>
            )}
          </div>
          <Button 
            onClick={handleScan}
            disabled={isScanning}
            className="glass-button text-white"
          >
            {isScanning ? 'Taranıyor...' : 'QR Kodu Tara'}
          </Button>
        </div>

        {/* Steps Section */}
        <div className="space-y-4">
          {steps.map((stepItem, index) => {
            const Icon = stepItem.icon;
            const isActive = index === step;
            const isCompleted = index < step;
            
            return (
              <div 
                key={index}
                className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-500 ${
                  isActive ? 'bg-aurora-blue/20 scale-105' : 
                  isCompleted ? 'bg-green-500/20' : 'bg-gray-100/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive ? 'bg-aurora-blue text-white pulse-glow' :
                  isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className={`font-semibold transition-colors ${isActive ? 'text-aurora-blue' : ''}`}>
                    {stepItem.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {stepItem.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}