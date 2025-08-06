import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

// GET - Fetch payment settings
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('adminToken')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let adminUser
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      adminUser = await prisma.admin.findUnique({
        where: { id: payload.sub as string }
      })
      
      if (!adminUser || !adminUser.isActive) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get payment settings (use any to bypass type checking)
    let paymentSettings = await (prisma as any).paymentSettings.findUnique({
      where: { id: 'default' }
    })

    // Create default settings if they don't exist
    if (!paymentSettings) {
      paymentSettings = await (prisma as any).paymentSettings.create({
        data: {
          id: 'default',
          bankTransferEnabled: true,
          bankName: '',
          bankAccountName: '',
          bankAccountNumber: '',
          bankIban: '',
          bankSwiftCode: '',
          bankBranch: '',
          paymentInstructions: 'Havale/EFT yaparken açıklama kısmına sipariş numaranızı yazınız. Ödemeniz onaylandıktan sonra planınız aktif edilecektir.',
          autoApprovalEnabled: false,
          manualApprovalRequired: true,
          paymentTimeoutHours: 24,
        }
      })
    }

    return NextResponse.json({
      settings: paymentSettings
    })
  } catch (error) {
    console.error('Payment settings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment settings' },
      { status: 500 }
    )
  }
}

// POST - Update payment settings
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('adminToken')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let adminUser
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      adminUser = await prisma.admin.findUnique({
        where: { id: payload.sub as string }
      })
      
      if (!adminUser || !adminUser.isActive) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    const {
      bankTransferEnabled,
      bankName,
      bankAccountName,
      bankAccountNumber,
      bankIban,
      bankSwiftCode,
      bankBranch,
      paymentInstructions,
      autoApprovalEnabled,
      manualApprovalRequired,
      paymentTimeoutHours,
    } = data

    const paymentSettings = await (prisma as any).paymentSettings.upsert({
      where: { id: 'default' },
      update: {
        bankTransferEnabled,
        bankName,
        bankAccountName,
        bankAccountNumber,
        bankIban,
        bankSwiftCode,
        bankBranch,
        paymentInstructions,
        autoApprovalEnabled,
        manualApprovalRequired,
        paymentTimeoutHours,
        updatedAt: new Date(),
      },
      create: {
        id: 'default',
        bankTransferEnabled,
        bankName,
        bankAccountName,
        bankAccountNumber,
        bankIban,
        bankSwiftCode,
        bankBranch,
        paymentInstructions,
        autoApprovalEnabled,
        manualApprovalRequired,
        paymentTimeoutHours,
      }
    })

    return NextResponse.json({
      message: 'Payment settings updated successfully',
      settings: paymentSettings
    })
  } catch (error) {
    console.error('Payment settings update error:', error)
    return NextResponse.json(
      { error: 'Failed to update payment settings' },
      { status: 500 }
    )
  }
}
