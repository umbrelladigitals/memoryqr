'use client'

import AdminLayout from '@/components/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Calendar, 
  Image,
  UserCheck,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import Link from 'next/link'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
}

interface Customer {
  id: string
  name: string
  email: string
  plan: string
  createdAt: string
  isActive: boolean
  _count: {
    events: number
    payments: number
  }
}

interface Event {
  id: string
  title: string
  createdAt: string
  customer: {
    name: string
    email: string
  }
  _count: {
    uploads: number
  }
}

interface Stats {
  totalCustomers: number
  activeCustomers: number
  totalEvents: number
  totalUploads: number
  recentCustomers: Customer[]
  recentEvents: Event[]
  subscriptionStats: Array<{
    plan: string
    _count: { id: number }
  }>
}

interface AdminDashboardClientProps {
  stats: Stats
  user: AdminUser
}

const statCards = [
  {
    name: 'Toplam Müşteri',
    stat: 'totalCustomers',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    change: '+4.75%',
    changeType: 'positive',
  },
  {
    name: 'Aktif Müşteri',
    stat: 'activeCustomers', 
    icon: UserCheck,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    change: '+2.02%',
    changeType: 'positive',
  },
  {
    name: 'Toplam Etkinlik',
    stat: 'totalEvents',
    icon: Calendar,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    change: '+8.12%',
    changeType: 'positive',
  },
  {
    name: 'Toplam Fotoğraf',
    stat: 'totalUploads',
    icon: Image,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    change: '+12.4%',
    changeType: 'positive',
  },
]

export default function AdminDashboardClient({ stats, user }: AdminDashboardClientProps) {
  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'bg-gray-100 text-gray-800'
      case 'PRO': return 'bg-blue-100 text-blue-800'
      case 'ENTERPRISE': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <AdminLayout 
      user={user}
      title="Genel Bakış"
      description="Platform performansı ve son aktivitelerin özeti"
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((item) => {
            const value = stats[item.stat as keyof Stats] as number
            return (
              <Card key={item.name} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`rounded-lg p-3 ${item.bgColor}`}>
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {item.name}
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {typeof value === 'number' ? value.toLocaleString() : '0'}
                          </div>
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.changeType === 'positive' ? (
                              <ArrowUpRight className="h-4 w-4 flex-shrink-0 self-center" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 flex-shrink-0 self-center" />
                            )}
                            <span className="sr-only">
                              {item.changeType === 'positive' ? 'Increased' : 'Decreased'} by
                            </span>
                            {item.change}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Customers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Son Müşteriler</CardTitle>
              <Link 
                href="/admin/customers"
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                Tümünü Gör
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentCustomers.slice(0, 5).map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-600">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getPlanColor(customer.plan)}>
                        {customer.plan}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {customer._count.events} etkinlik
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Son Etkinlikler</CardTitle>
              <Link 
                href="/admin/events"
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                Tümünü Gör
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-500">{event.customer.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {event._count.uploads} fotoğraf
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
              Abonelik Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.subscriptionStats.map((stat) => (
                <div key={stat.plan} className="text-center">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {stat._count.id}
                    </div>
                    <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      {stat.plan}
                    </div>
                    <div className="mt-2">
                      <Badge className={getPlanColor(stat.plan)}>
                        {((stat._count.id / stats.totalCustomers) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
