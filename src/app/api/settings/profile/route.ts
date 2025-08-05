import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { name, email, subdomain } = await request.json()

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ message: 'İsim ve email alanları zorunludur' }, { status: 400 })
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.customer.findFirst({
      where: {
        email: email,
        NOT: {
          email: session.user.email
        }
      }
    })

    if (existingUser) {
      return NextResponse.json({ message: 'Bu email adresi zaten kullanılıyor' }, { status: 400 })
    }

    // Check if subdomain is already taken
    if (subdomain && subdomain.trim()) {
      const existingSubdomain = await prisma.customer.findFirst({
        where: {
          subdomain: subdomain.trim().toLowerCase(),
          NOT: {
            email: session.user.email
          }
        }
      })

      if (existingSubdomain) {
        return NextResponse.json({ message: 'Bu alt domain zaten kullanılıyor' }, { status: 400 })
      }
    }

    // Update customer profile
    const updatedCustomer = await prisma.customer.update({
      where: {
        email: session.user.email
      },
      data: {
        name: name.trim(),
        email: email.trim(),
        subdomain: subdomain?.trim().toLowerCase() || null
      }
    })

    return NextResponse.json({ 
      message: 'Profil başarıyla güncellendi',
      customer: {
        id: updatedCustomer.id,
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        subdomain: updatedCustomer.subdomain
      }
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ message: 'Profil güncelleme hatası' }, { status: 500 })
  }
}
