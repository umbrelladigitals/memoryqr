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
  RefreshCw, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Filter
} from 'lucide-react'

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  paymentMethod: string
  createdAt: string
  updatedAt: string
  customer: {
    id: string
    name: string
    email: string
    plan: {
      name: string
      displayName: string
    } | null
  }
}

interface PaymentStats {
  totalRevenue: number
  monthlyRevenue: number
  lastMonthRevenue: number
  successfulPayments: number
  failedPayments: number
  pendingPayments: number
  totalPayments: number
  growthRate: number
}

interface PaymentManagementClientProps {
  payments: Payment[]
  stats: PaymentStats
}

export default function PaymentManagementClient({ payments, stats }: PaymentManagementClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMethod, setFilterMethod] = useState('all')

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus
    const matchesMethod = filterMethod === 'all' || payment.paymentMethod === filterMethod
    
    return matchesSearch && matchesStatus && matchesMethod
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      case 'FAILED': return <XCircle className="h-4 w-4" />
      case 'PENDING': return <Clock className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD': return 'bg-blue-100 text-blue-800'
      case 'BANK_TRANSFER': return 'bg-purple-100 text-purple-800'
      case 'PAYPAL': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AdminLayout
      user={{
        id: 'admin',
        name: 'Admin',
        email: 'admin@memoryqr.com',
        role: 'ADMIN'
      }}
      title="Ödeme Yönetimi"
      description="Tüm ödemelerin yönetimi ve gelir analizi"
    >
      <div className="space-y-6">
        {/* Revenue Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg p-3 bg-green-50">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Toplam Gelir</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg p-3 bg-blue-50">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Aylık Gelir</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(stats.monthlyRevenue)}
                  </p>
                  {stats.growthRate !== 0 && (
                    <div className={`flex items-center text-sm ${stats.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.growthRate > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      %{Math.abs(stats.growthRate).toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg p-3 bg-purple-50">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Başarılı Ödeme</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.successfulPayments}</p>
                  <p className="text-sm text-gray-500">
                    %{((stats.successfulPayments / stats.totalPayments) * 100).toFixed(1)} başarı oranı
                  </p>
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
                  <p className="text-sm font-medium text-gray-500">Toplam İşlem</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalPayments}</p>
                  <div className="flex space-x-2 text-sm text-gray-500">
                    <span className="text-red-600">{stats.failedPayments} başarısız</span>
                    <span className="text-yellow-600">{stats.pendingPayments} beklemede</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Ödeme ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="COMPLETED">Tamamlandı</option>
                  <option value="PENDING">Beklemede</option>
                  <option value="FAILED">Başarısız</option>
                  <option value="CANCELLED">İptal Edildi</option>
                </select>

                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Tüm Yöntemler</option>
                  <option value="CREDIT_CARD">Kredi Kartı</option>
                  <option value="BANK_TRANSFER">Banka Havalesi</option>
                  <option value="PAYPAL">PayPal</option>
                </select>

                <div className="flex items-center justify-end">
                  <span className="text-sm text-gray-600">
                    {filteredPayments.length} sonuç
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Rapor İndir
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Yenile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment List */}
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">
                          {formatCurrency(payment.amount, payment.currency)}
                        </h3>
                        <Badge className={getStatusColor(payment.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(payment.status)}
                            <span>{payment.status}</span>
                          </div>
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{payment.customer.name}</span>
                        <span>•</span>
                        <span>{payment.customer.email}</span>
                        <span>•</span>
                        <span>#{payment.id.slice(-8)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Payment Method */}
                    <Badge className={getMethodColor(payment.paymentMethod)}>
                      {payment.paymentMethod.replace('_', ' ')}
                    </Badge>

                    {/* Customer Plan */}
                    <Badge variant="outline">
                      {payment.customer.plan?.displayName || 'No Plan'}
                    </Badge>

                    {/* Date */}
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(payment.createdAt)}
                      </p>
                      {payment.createdAt !== payment.updatedAt && (
                        <p className="text-xs text-gray-500">
                          Güncellendi: {formatDate(payment.updatedAt)}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Detay
                      </Button>
                      {payment.status === 'PENDING' && (
                        <Button variant="outline" size="sm" className="text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Onayla
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredPayments.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ödeme bulunamadı
                </h3>
                <p className="text-gray-500">
                  Arama kriterlerinize uygun ödeme işlemi bulunmuyor.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
