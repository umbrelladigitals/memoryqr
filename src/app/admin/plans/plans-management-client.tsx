'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Plus,
  Edit,
  Trash2,
  Settings,
  Users,
  Star,
  DollarSign,
  Check,
  X,
  TrendingUp,
  Crown,
  Zap
} from 'lucide-react'

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
  customDomain: boolean
  analytics: boolean
  prioritySupport: boolean
  apiAccess: boolean
  whitelabel: boolean
  isActive: boolean
  isPopular: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  _count: {
    customers: number
  }
}

interface PlanStats {
  totalPlans: number
  activePlans: number
  totalCustomers: number
  planDistribution: Array<{
    plan: string
    count: number
  }>
}

interface PlansManagementClientProps {
  plans: Plan[]
  stats: PlanStats
}

export default function PlansManagementClient({ plans, stats }: PlansManagementClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    price: 0,
    currency: 'USD',
    maxEvents: '',
    maxPhotosPerEvent: '',
    maxStorageGB: '',
    customDomain: false,
    analytics: false,
    prioritySupport: false,
    apiAccess: false,
    whitelabel: false,
    isActive: true,
    isPopular: false,
    sortOrder: 0
  })

  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreatePlan = async () => {
    try {
      const response = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          maxEvents: formData.maxEvents ? parseInt(formData.maxEvents) : null,
          maxPhotosPerEvent: formData.maxPhotosPerEvent ? parseInt(formData.maxPhotosPerEvent) : null,
          maxStorageGB: formData.maxStorageGB ? parseInt(formData.maxStorageGB) : null,
        }),
      })

      if (response.ok) {
        setIsCreateDialogOpen(false)
        setFormData({
          name: '',
          displayName: '',
          description: '',
          price: 0,
          currency: 'USD',
          maxEvents: '',
          maxPhotosPerEvent: '',
          maxStorageGB: '',
          customDomain: false,
          analytics: false,
          prioritySupport: false,
          apiAccess: false,
          whitelabel: false,
          isActive: true,
          isPopular: false,
          sortOrder: 0
        })
        window.location.reload()
      }
    } catch (error) {
      console.error('Error creating plan:', error)
    }
  }

  const handleUpdatePlan = async () => {
    if (!editingPlan) return

    try {
      const response = await fetch(`/api/admin/plans/${editingPlan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          maxEvents: formData.maxEvents ? parseInt(formData.maxEvents) : null,
          maxPhotosPerEvent: formData.maxPhotosPerEvent ? parseInt(formData.maxPhotosPerEvent) : null,
          maxStorageGB: formData.maxStorageGB ? parseInt(formData.maxStorageGB) : null,
        }),
      })

      if (response.ok) {
        setEditingPlan(null)
        window.location.reload()
      }
    } catch (error) {
      console.error('Error updating plan:', error)
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Bu planı silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/admin/plans/${planId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error deleting plan:', error)
    }
  }

  const openEditDialog = (plan: Plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      displayName: plan.displayName,
      description: plan.description || '',
      price: plan.price,
      currency: plan.currency,
      maxEvents: plan.maxEvents?.toString() || '',
      maxPhotosPerEvent: plan.maxPhotosPerEvent?.toString() || '',
      maxStorageGB: plan.maxStorageGB?.toString() || '',
      customDomain: plan.customDomain,
      analytics: plan.analytics,
      prioritySupport: plan.prioritySupport,
      apiAccess: plan.apiAccess,
      whitelabel: plan.whitelabel,
      isActive: plan.isActive,
      isPopular: plan.isPopular,
      sortOrder: plan.sortOrder
    })
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getPlanIcon = (planName: string) => {
    switch (planName.toUpperCase()) {
      case 'FREE': return <Zap className="h-5 w-5" />
      case 'PRO': return <TrendingUp className="h-5 w-5" />
      case 'ENTERPRISE': return <Crown className="h-5 w-5" />
      default: return <Settings className="h-5 w-5" />
    }
  }

  const getPlanColor = (planName: string) => {
    switch (planName.toUpperCase()) {
      case 'FREE': return 'bg-gray-100 text-gray-800'
      case 'PRO': return 'bg-blue-100 text-blue-800'
      case 'ENTERPRISE': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <AdminLayout
      user={{
        id: 'admin',
        name: 'Admin',
        email: 'admin@memoryqr.com',
        role: 'ADMIN'
      }}
      title="Plan Yönetimi"
      description="Abonelik planlarının yönetimi ve düzenlenmesi"
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg p-3 bg-blue-50">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Toplam Plan</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalPlans}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg p-3 bg-green-50">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Aktif Plan</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.activePlans}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg p-3 bg-purple-50">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Toplam Müşteri</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg p-3 bg-orange-50">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Aylık Gelir</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(
                      filteredPlans.reduce((sum, plan) => sum + (plan.price * plan._count.customers), 0)
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header with Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Plan ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4"
            />
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Yeni Plan Oluştur</DialogTitle>
              </DialogHeader>
              <PlanForm formData={formData} setFormData={setFormData} onSubmit={handleCreatePlan} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.isPopular ? 'ring-2 ring-purple-500' : ''}`}>
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Popüler
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className="flex items-center justify-center space-x-2">
                  {getPlanIcon(plan.name)}
                  <CardTitle className="text-xl">{plan.displayName}</CardTitle>
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {formatCurrency(plan.price, plan.currency)}
                  <span className="text-sm font-normal text-gray-500">/ay</span>
                </div>
                {plan.description && (
                  <p className="text-sm text-gray-600">{plan.description}</p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Etkinlik Limiti</span>
                    <span className="font-medium">
                      {plan.maxEvents ? plan.maxEvents.toLocaleString() : 'Sınırsız'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Fotoğraf/Etkinlik</span>
                    <span className="font-medium">
                      {plan.maxPhotosPerEvent ? plan.maxPhotosPerEvent.toLocaleString() : 'Sınırsız'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Depolama</span>
                    <span className="font-medium">
                      {plan.maxStorageGB ? `${plan.maxStorageGB} GB` : 'Sınırsız'}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-2 text-sm">
                    {plan.customDomain && (
                      <div className="flex items-center text-green-600">
                        <Check className="h-4 w-4 mr-2" />
                        Özel Domain
                      </div>
                    )}
                    {plan.analytics && (
                      <div className="flex items-center text-green-600">
                        <Check className="h-4 w-4 mr-2" />
                        Gelişmiş Analitik
                      </div>
                    )}
                    {plan.prioritySupport && (
                      <div className="flex items-center text-green-600">
                        <Check className="h-4 w-4 mr-2" />
                        Öncelikli Destek
                      </div>
                    )}
                    {plan.apiAccess && (
                      <div className="flex items-center text-green-600">
                        <Check className="h-4 w-4 mr-2" />
                        API Erişimi
                      </div>
                    )}
                    {plan.whitelabel && (
                      <div className="flex items-center text-green-600">
                        <Check className="h-4 w-4 mr-2" />
                        White Label
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Count */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-gray-500">Müşteri Sayısı</span>
                  <Badge className={getPlanColor(plan.name)}>
                    {plan._count.customers} müşteri
                  </Badge>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Durum</span>
                  <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                    {plan.isActive ? 'Aktif' : 'Pasif'}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(plan)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Düzenle
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Plan Düzenle: {plan.displayName}</DialogTitle>
                      </DialogHeader>
                      <PlanForm formData={formData} setFormData={setFormData} onSubmit={handleUpdatePlan} />
                    </DialogContent>
                  </Dialog>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeletePlan(plan.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPlans.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Plan bulunamadı
              </h3>
              <p className="text-gray-500">
                Arama kriterlerinize uygun plan bulunmuyor.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}

// Plan Form Component
function PlanForm({ formData, setFormData, onSubmit }: {
  formData: any
  setFormData: (data: any) => void
  onSubmit: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Plan Kodu</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="FREE, PRO, ENTERPRISE"
          />
        </div>
        <div>
          <Label htmlFor="displayName">Görünen Ad</Label>
          <Input
            id="displayName"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            placeholder="Free Plan, Pro Plan"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Açıklama</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Plan açıklaması"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Fiyat</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="currency">Para Birimi</Label>
          <select
            id="currency"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="TRY">TRY</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="maxEvents">Max Etkinlik</Label>
          <Input
            id="maxEvents"
            type="number"
            value={formData.maxEvents}
            onChange={(e) => setFormData({ ...formData, maxEvents: e.target.value })}
            placeholder="Boş = Sınırsız"
          />
        </div>
        <div>
          <Label htmlFor="maxPhotosPerEvent">Max Fotoğraf/Etkinlik</Label>
          <Input
            id="maxPhotosPerEvent"
            type="number"
            value={formData.maxPhotosPerEvent}
            onChange={(e) => setFormData({ ...formData, maxPhotosPerEvent: e.target.value })}
            placeholder="Boş = Sınırsız"
          />
        </div>
        <div>
          <Label htmlFor="maxStorageGB">Max Depolama (GB)</Label>
          <Input
            id="maxStorageGB"
            type="number"
            value={formData.maxStorageGB}
            onChange={(e) => setFormData({ ...formData, maxStorageGB: e.target.value })}
            placeholder="Boş = Sınırsız"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Özellikler</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="customDomain"
              checked={formData.customDomain}
              onCheckedChange={(checked: boolean) => setFormData({ ...formData, customDomain: checked })}
            />
            <Label htmlFor="customDomain">Özel Domain</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="analytics"
              checked={formData.analytics}
              onCheckedChange={(checked: boolean) => setFormData({ ...formData, analytics: checked })}
            />
            <Label htmlFor="analytics">Gelişmiş Analitik</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="prioritySupport"
              checked={formData.prioritySupport}
              onCheckedChange={(checked: boolean) => setFormData({ ...formData, prioritySupport: checked })}
            />
            <Label htmlFor="prioritySupport">Öncelikli Destek</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="apiAccess"
              checked={formData.apiAccess}
              onCheckedChange={(checked: boolean) => setFormData({ ...formData, apiAccess: checked })}
            />
            <Label htmlFor="apiAccess">API Erişimi</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="whitelabel"
              checked={formData.whitelabel}
              onCheckedChange={(checked: boolean) => setFormData({ ...formData, whitelabel: checked })}
            />
            <Label htmlFor="whitelabel">White Label</Label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked: boolean) => setFormData({ ...formData, isActive: checked })}
          />
          <Label htmlFor="isActive">Aktif</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isPopular"
            checked={formData.isPopular}
            onCheckedChange={(checked: boolean) => setFormData({ ...formData, isPopular: checked })}
          />
          <Label htmlFor="isPopular">Popüler</Label>
        </div>
        <div>
          <Label htmlFor="sortOrder">Sıralama</Label>
          <Input
            id="sortOrder"
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={() => {}}>
          İptal
        </Button>
        <Button onClick={onSubmit}>
          Kaydet
        </Button>
      </div>
    </div>
  )
}
