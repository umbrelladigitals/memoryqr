'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { 
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  DollarSign,
  User,
  Calendar,
  Loader2,
  Search,
  Filter,
  RefreshCw,
  Download,
  AlertTriangle,
  CreditCard,
  Building2,
  Plus
} from 'lucide-react'

interface Payment {
  id: string
  amount: number
  currency: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  paymentMethod: string
  transactionId?: string
  description?: string
  createdAt: string
  updatedAt: string
  customer: {
    id: string
    name: string
    email: string
  }
  subscription?: {
    id: string
    plan: {
      id: string
      displayName: string
      price: number
      currency: string
    }
  }
}

interface PaymentStats {
  totalPending: number
  totalCompleted: number
  totalFailed: number
  totalAmount: number
  monthlyRevenue: number
  pendingAmount: number
}

export default function PaymentManagementClient() {
  const [activeTab, setActiveTab] = useState('payments')
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    totalPending: 0,
    totalCompleted: 0,
    totalFailed: 0,
    totalAmount: 0,
    monthlyRevenue: 0,
    pendingAmount: 0
  })
  
  // Payment management states
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve')
  const [transactionId, setTransactionId] = useState('')
  const [notes, setNotes] = useState('')
  const [processing, setProcessing] = useState(false)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 0, limit: 10 })

  useEffect(() => {
    fetchPayments()
    fetchStats()
  }, [statusFilter, page])

  const fetchPayments = async () => {
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        page: page.toString(),
        limit: '10'
      })
      
      const response = await fetch(`/api/admin/payments?${params}`)
      if (!response.ok) throw new Error('Failed to fetch payments')
      
      const data = await response.json()
      setPayments(data.payments || [])
      setPagination(data.pagination || { total: 0, pages: 0, limit: 10 })
    } catch (error) {
      toast.error('Ödemeler yüklenirken hata oluştu')
      console.error('Fetch payments error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/payments/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      
      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error('Fetch stats error:', error)
    }
  }

  const handleApproval = async () => {
    if (!selectedPayment) return
    
    setProcessing(true)
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          action: approvalAction,
          transactionId: approvalAction === 'approve' ? transactionId : undefined,
          notes
        })
      })

      if (!response.ok) throw new Error('Failed to process payment')

      toast.success(`Ödeme ${approvalAction === 'approve' ? 'onaylandı' : 'reddedildi'}`)

      setShowApprovalDialog(false)
      setSelectedPayment(null)
      setTransactionId('')
      setNotes('')
      fetchPayments()
      fetchStats()
    } catch (error) {
      toast.error('Ödeme işlenirken hata oluştu')
      console.error('Payment approval error:', error)
    } finally {
      setProcessing(false)
    }
  }

  const openApprovalDialog = (payment: Payment, action: 'approve' | 'reject') => {
    setSelectedPayment(payment)
    setApprovalAction(action)
    setShowApprovalDialog(true)
  }

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'TRY'
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { variant: 'secondary' as const, label: 'Bekliyor', icon: Clock, color: 'text-yellow-600' },
      COMPLETED: { variant: 'default' as const, label: 'Tamamlandı', icon: CheckCircle, color: 'text-green-600' },
      FAILED: { variant: 'destructive' as const, label: 'Başarısız', icon: XCircle, color: 'text-red-600' },
      REFUNDED: { variant: 'outline' as const, label: 'İade Edildi', icon: DollarSign, color: 'text-blue-600' },
    }
    
    const config = variants[status as keyof typeof variants] || variants.PENDING
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const exportPayments = async () => {
    try {
      const response = await fetch(`/api/admin/payments/export?status=${statusFilter}`)
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payments-${statusFilter}-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.success('Ödemeler başarıyla dışa aktarıldı')
    } catch (error) {
      toast.error('Dışa aktarma başarısız')
    }
  }

  const filteredPayments = payments.filter(payment => {
    const searchLower = searchQuery.toLowerCase()
    return payment.customer?.name?.toLowerCase().includes(searchLower) ||
           payment.customer?.email?.toLowerCase().includes(searchLower) ||
           payment.id.toLowerCase().includes(searchLower)
  })

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ödeme Yönetimi</h1>
          <p className="text-gray-600">Müşteri ödemelerini yönetin ve onaylayın</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchPayments}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Yenile
          </Button>
          <Button 
            variant="outline" 
            onClick={exportPayments}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Bekleyen Ödemeler</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.totalPending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {formatCurrency(stats.pendingAmount)} bekliyor
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Tamamlanan</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalCompleted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Bu ay: {formatCurrency(stats.monthlyRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Başarısız</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalFailed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              İnceleme gerekli
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Toplam Gelir</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Tüm zamanlar
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payments">Ödeme Listesi</TabsTrigger>
          <TabsTrigger value="bulk">Toplu İşlemler</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filtreler</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="status">Durum</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Bekleyen</SelectItem>
                      <SelectItem value="COMPLETED">Tamamlanan</SelectItem>
                      <SelectItem value="FAILED">Başarısız</SelectItem>
                      <SelectItem value="REFUNDED">İade Edilen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="search">Arama</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Müşteri adı, email veya ödeme ID'si"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={() => {
                      setPage(1)
                      fetchPayments()
                    }}
                    className="w-full"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Filtrele
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Ödemeler ({pagination.total})</CardTitle>
              <CardDescription>
                {statusFilter === 'PENDING' && 'Onay bekleyen ödemeler'}
                {statusFilter === 'COMPLETED' && 'Tamamlanan ödemeler'}
                {statusFilter === 'FAILED' && 'Başarısız ödemeler'}
                {statusFilter === 'REFUNDED' && 'İade edilen ödemeler'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPayments.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Bu durumda ödeme bulunamadı</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Müşteri</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Tutar</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Tarih</TableHead>
                        <TableHead>İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{payment.customer?.name || 'N/A'}</p>
                              <p className="text-sm text-gray-500">{payment.customer?.email || 'N/A'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{payment.subscription?.plan?.displayName || 'N/A'}</p>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{formatCurrency(payment.amount, payment.currency)}</p>
                            <p className="text-sm text-gray-500">{payment.paymentMethod}</p>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(payment.status)}
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">
                              {new Date(payment.createdAt).toLocaleDateString('tr-TR')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(payment.createdAt).toLocaleTimeString('tr-TR')}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {payment.status === 'PENDING' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => openApprovalDialog(payment, 'approve')}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Onayla
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => openApprovalDialog(payment, 'reject')}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reddet
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedPayment(payment)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex items-center justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        Önceki
                      </Button>
                      <span className="text-sm text-gray-500">
                        Sayfa {page} / {pagination.pages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setPage(page + 1)}
                        disabled={page === pagination.pages}
                      >
                        Sonraki
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Toplu İşlemler</CardTitle>
              <CardDescription>
                Birden fazla ödemeyi aynı anda yönetin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Seçilenleri Onayla
                  </Button>
                  <Button variant="destructive">
                    <XCircle className="w-4 h-4 mr-2" />
                    Seçilenleri Reddet
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Seçilenleri Dışa Aktar
                  </Button>
                </div>
                
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Toplu işlemler yakında eklenecek</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Ödemeyi Onayla' : 'Ödemeyi Reddet'}
            </DialogTitle>
            <DialogDescription>
              {selectedPayment && (
                <div className="space-y-2 mt-4">
                  <p><strong>Müşteri:</strong> {selectedPayment.customer?.name || 'N/A'}</p>
                  <p><strong>Tutar:</strong> {formatCurrency(selectedPayment.amount, selectedPayment.currency)}</p>
                  <p><strong>Plan:</strong> {selectedPayment.subscription?.plan?.displayName || 'N/A'}</p>
                  <p><strong>Ödeme ID:</strong> {selectedPayment.id}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {approvalAction === 'approve' && (
              <div>
                <Label htmlFor="transactionId">İşlem ID (Opsiyonel)</Label>
                <Input
                  id="transactionId"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Banka işlem numarası"
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes">
                {approvalAction === 'approve' ? 'Notlar (Opsiyonel)' : 'Red Sebebi'}
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  approvalAction === 'approve' 
                    ? 'Ek notlar...' 
                    : 'Ödeme red sebebini belirtin...'
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApprovalDialog(false)}
              disabled={processing}
            >
              İptal
            </Button>
            <Button
              onClick={handleApproval}
              disabled={processing}
              className={approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={approvalAction === 'reject' ? 'destructive' : 'default'}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                <>
                  {approvalAction === 'approve' ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Onayla
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Reddet
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}