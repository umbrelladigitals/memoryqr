import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return hardcoded templates with rich data for development
    const templates = [
      {
        id: 'elegant-classic',
        name: 'elegant-classic',
        displayName: 'Elegant Classic',
        description: 'Zarif ve klasik tasarım, düğün ve özel etkinlikler için mükemmel',
        previewImage: 'https://picsum.photos/400/300?random=1',
        heroImage: 'https://picsum.photos/800/400?random=2',
        primaryColor: '#8B5CF6',
        secondaryColor: '#A78BFA',
        backgroundColor: '#FAFAFA',
        textColor: '#1F2937',
        headerStyle: 'elegant',
        buttonStyle: 'rounded',
        cardStyle: 'shadow',
        isDefault: true,
        category: 'wedding',
        tags: ['elegant', 'classic', 'sophisticated', 'formal'],
        features: ['Photo Gallery', 'RSVP Form', 'Event Details', 'Guest Messages'],
        popularity: 95
      },
      {
        id: 'modern-minimal',
        name: 'modern-minimal',
        displayName: 'Modern Minimal',
        description: 'Sade ve modern tasarım, her türlü etkinlik için uygun',
        previewImage: 'https://picsum.photos/400/300?random=7',
        heroImage: 'https://picsum.photos/800/400?random=8',
        primaryColor: '#10B981',
        secondaryColor: '#34D399',
        backgroundColor: '#FFFFFF',
        textColor: '#111827',
        headerStyle: 'minimal',
        buttonStyle: 'square',
        cardStyle: 'border',
        category: 'corporate',
        tags: ['modern', 'minimal', 'clean', 'professional'],
        features: ['Clean Layout', 'Mobile First', 'Fast Loading', 'SEO Optimized'],
        popularity: 88,
        isDefault: false
      },
      {
        id: 'vibrant-party',
        name: 'vibrant-party',
        displayName: 'Vibrant Party',
        description: 'Renkli ve eğlenceli tasarım, doğum günü ve parti etkinlikleri için',
        previewImage: 'https://picsum.photos/400/300?random=9',
        heroImage: 'https://picsum.photos/800/400?random=10',
        primaryColor: '#F59E0B',
        secondaryColor: '#FBBF24',
        backgroundColor: '#FEF3C7',
        textColor: '#92400E',
        headerStyle: 'playful',
        buttonStyle: 'rounded',
        cardStyle: 'colorful',
        category: 'birthday',
        tags: ['colorful', 'fun', 'energetic', 'celebration'],
        features: ['Interactive Elements', 'Animation Effects', 'Social Sharing', 'Music Player'],
        popularity: 82,
        isDefault: false
      },
      {
        id: 'luxury-gold',
        name: 'luxury-gold',
        displayName: 'Luxury Gold',
        description: 'Lüks altın temalı tasarım, prestijli etkinlikler için',
        previewImage: 'https://picsum.photos/400/300?random=11',
        heroImage: 'https://picsum.photos/800/400?random=12',
        primaryColor: '#F59E0B',
        secondaryColor: '#D97706',
        backgroundColor: '#1F2937',
        textColor: '#F9FAFB',
        headerStyle: 'luxury',
        buttonStyle: 'elegant',
        cardStyle: 'gold',
        category: 'corporate',
        tags: ['luxury', 'premium', 'gold', 'exclusive'],
        features: ['Premium Design', 'VIP Access', 'Exclusive Content', 'Personal Concierge'],
        popularity: 76,
        isDefault: false
      },
      {
        id: 'nature-green',
        name: 'nature-green',
        displayName: 'Nature Green',
        description: 'Doğa temalı yeşil tasarım, açık hava etkinlikleri için',
        previewImage: 'https://picsum.photos/400/300?random=13',
        heroImage: 'https://picsum.photos/800/400?random=14',
        primaryColor: '#059669',
        secondaryColor: '#10B981',
        backgroundColor: '#ECFDF5',
        textColor: '#064E3B',
        headerStyle: 'natural',
        buttonStyle: 'organic',
        cardStyle: 'natural',
        category: 'other',
        tags: ['nature', 'green', 'organic', 'outdoor'],
        features: ['Eco-Friendly', 'Nature Sounds', 'Weather Widget', 'Location Map'],
        popularity: 71,
        isDefault: false
      },
      {
        id: 'romantic-pink',
        name: 'romantic-pink',
        displayName: 'Romantic Pink',
        description: 'Romantik pembe tasarım, düğün ve nişan törenleri için',
        previewImage: 'https://picsum.photos/400/300?random=15',
        heroImage: 'https://picsum.photos/800/400?random=16',
        primaryColor: '#EC4899',
        secondaryColor: '#F472B6',
        backgroundColor: '#FDF2F8',
        textColor: '#831843',
        headerStyle: 'romantic',
        buttonStyle: 'soft',
        cardStyle: 'romantic',
        category: 'wedding',
        tags: ['romantic', 'pink', 'feminine', 'love'],
        features: ['Love Story Timeline', 'Couple Gallery', 'Wedding Registry', 'Guest Book'],
        popularity: 89,
        isDefault: false
      }
    ]

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Templates API error:', error)
    return NextResponse.json(
      { error: 'Şablonlar yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}