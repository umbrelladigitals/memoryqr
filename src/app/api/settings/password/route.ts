import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: 'Tüm şifre alanları zorunludur' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ message: 'Yeni şifre en az 6 karakter olmalıdır' }, { status: 400 })
    }

    // Get current user
    const customer = await prisma.customer.findUnique({
      where: {
        email: session.user.email
      }
    })

    if (!customer) {
      return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, customer.password)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ message: 'Mevcut şifre yanlış' }, { status: 400 })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.customer.update({
      where: {
        email: session.user.email
      },
      data: {
        password: hashedNewPassword
      }
    })

    return NextResponse.json({ message: 'Şifre başarıyla güncellendi' })

  } catch (error) {
    console.error('Password update error:', error)
    return NextResponse.json({ message: 'Şifre güncelleme hatası' }, { status: 500 })
  }
}
