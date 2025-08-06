import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin-layout'
import PaymentSettingsClient from './payment-settings-client'
import { Loader2 } from 'lucide-react'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

async function AdminPaymentSettingsPage() {
  // Check admin authentication
  const cookieStore = await cookies()
  const token = cookieStore.get('adminToken')?.value

  if (!token) {
    redirect('/admin/login')
  }

  let adminUser
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    adminUser = await prisma.admin.findUnique({
      where: { id: payload.sub as string }
    })
    
    if (!adminUser || !adminUser.isActive) {
      redirect('/admin/login')
    }
  } catch (error) {
    console.error('JWT verification failed:', error)
    redirect('/admin/login')
  }

  return (
    <AdminLayout user={adminUser as any}>
      <div className="p-6">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Ödeme ayarları yükleniyor...</span>
          </div>
        }>
          <PaymentSettingsClient />
        </Suspense>
      </div>
    </AdminLayout>
  )
}

export default AdminPaymentSettingsPage
