'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  QrCode, 
  Calendar, 
  BarChart3,
  Crown,
  Settings, 
  LogOut,
  Download,
  Menu,
  X,
  CreditCard
} from 'lucide-react'

interface DashboardNavbarProps {
  user: {
    name: string
    plan?: {
      name: string
      displayName: string
    } | null
  }
}

export default function DashboardNavbar({ user }: DashboardNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    {
      name: 'Genel Bakış',
      href: '/dashboard',
      icon: BarChart3,
      current: pathname === '/dashboard'
    },
    {
      name: 'Etkinlikler',
      href: '/dashboard/events',
      icon: Calendar,
      current: pathname?.startsWith('/dashboard/events') || false
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      current: pathname?.startsWith('/dashboard/analytics') || false
    },
    {
      name: 'Plan & Faturalandırma',
      href: '/dashboard/billing',
      icon: CreditCard,
      current: pathname?.startsWith('/dashboard/billing') || false
    },
    {
      name: 'İndirmeler',
      href: '/dashboard/downloads',
      icon: Download,
      current: pathname?.startsWith('/dashboard/downloads') || false
    },
    {
      name: 'Ayarlar',
      href: '/dashboard/settings',
      icon: Settings,
      current: pathname?.startsWith('/dashboard/settings') || false
    }
  ]

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  const getPlanBadge = (planName: string) => {
    const colors = {
      FREE: 'bg-gray-100 text-gray-800',
      PRO: 'bg-blue-100 text-blue-800',
      ENTERPRISE: 'bg-purple-100 text-purple-800'
    }
    return colors[planName as keyof typeof colors] || colors.FREE
  }

  return (
    <nav className="bg-white border-b">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <QrCode className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">MemoryQR</span>
            </Link>
            <Badge className={getPlanBadge(user.plan?.name || 'FREE')}>
              {user.plan?.displayName || 'FREE'}
            </Badge>
            {user.plan?.name === 'ENTERPRISE' && (
              <Crown className="h-5 w-5 text-purple-600" />
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${item.current 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>

            <div className="flex items-center space-x-4 border-l pl-4">
              <span className="text-sm text-gray-600">
                Hoş geldiniz, {user.name}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 border-t pt-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium
                      ${item.current 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-gray-600">{user.name}</span>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
