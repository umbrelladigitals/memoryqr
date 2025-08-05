'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Eye, 
  Ban, 
  CheckCircle, 
  Calendar, 
  CreditCard,
  Mail,
  User,
  Users
} from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  plan: {
    name: string
    displayName: string
    price: number
  } | null
  isActive: boolean
  createdAt: string
  lastLogin: string | null
  _count: {
    events: number
    payments: number
  }
  subscription: {
    id: string
    status: string
    startDate: string
    endDate: string | null
  } | null
}

interface CustomerManagementClientProps {
  customers: Customer[]
}

export default function CustomerManagementClient({ customers }: CustomerManagementClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlan, setFilterPlan] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlan = filterPlan === 'all' || (customer.plan && customer.plan.name === filterPlan)
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && customer.isActive) ||
                         (filterStatus === 'inactive' && !customer.isActive)
    
    return matchesSearch && matchesPlan && matchesStatus
  })

  const getPlanColor = (plan: { name: string; displayName: string; price: number } | null) => {
    if (!plan) return 'bg-gray-100 text-gray-800'
    switch (plan.name) {
      case 'FREE': return 'bg-gray-100 text-gray-800'
      case 'PRO': return 'bg-blue-100 text-blue-800'
      case 'ENTERPRISE': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'EXPIRED': return 'bg-red-100 text-red-800'
      case 'CANCELLED': return 'bg-orange-100 text-orange-800'
      case 'PAST_DUE': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Calculate stats
  const totalCustomers = customers.length
  const activeCustomers = customers.filter(c => c.isActive).length
  const totalEvents = customers.reduce((sum, c) => sum + c._count.events, 0)
  const totalPayments = customers.reduce((sum, c) => sum + c._count.payments, 0)

  return (
    <AdminLayout
      user={{
        id: 'admin',
        name: 'Admin',
        email: 'admin@memoryqr.com',
        role: 'ADMIN'
      }}
      title="Müşteri Yönetimi"
      description="Tüm müşterilerin yönetimi ve takibi"
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg p-3 bg-blue-50">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Toplam Müşteri</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg p-3 bg-green-50">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Aktif Müşteri</p>
                  <p className="text-2xl font-semibold text-gray-900">{activeCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg p-3 bg-purple-50">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Toplam Etkinlik</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg p-3 bg-orange-50">
                  <CreditCard className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Toplam Ödeme</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalPayments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Müşteri ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tüm Planlar</option>
                <option value="FREE">Free</option>
                <option value="PRO">Pro</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>

              <div className="flex items-center justify-end">
                <span className="text-sm text-gray-600">
                  {filteredCustomers.length} sonuç
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer List */}
        <div className="space-y-4">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Mail className="h-4 w-4" />
                        <span>{customer.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Status */}
                    <Badge className={getStatusColor(customer.isActive)}>
                      {customer.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>

                    {/* Plan */}
                    <Badge className={getPlanColor(customer.plan)}>
                      {customer.plan ? customer.plan.displayName : 'Plan Yok'}
                    </Badge>

                    {/* Subscription Status */}
                    {customer.subscription && (
                      <Badge className={getSubscriptionStatusColor(customer.subscription.status)}>
                        {customer.subscription.status}
                      </Badge>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Görüntüle
                      </Button>
                      {customer.isActive ? (
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Ban className="h-4 w-4 mr-1" />
                          Devre Dışı
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aktifleştir
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customer Stats */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">{customer._count.events}</p>
                    <p className="text-sm text-gray-500">Etkinlik</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">{customer._count.payments}</p>
                    <p className="text-sm text-gray-500">Ödeme</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(customer.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                    <p className="text-sm text-gray-500">Kayıt Tarihi</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                      {customer.lastLogin 
                        ? new Date(customer.lastLogin).toLocaleDateString('tr-TR')
                        : 'Hiç'
                      }
                    </p>
                    <p className="text-sm text-gray-500">Son Giriş</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredCustomers.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Müşteri bulunamadı
                </h3>
                <p className="text-gray-500">
                  Arama kriterlerinize uygun müşteri bulunmuyor.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
