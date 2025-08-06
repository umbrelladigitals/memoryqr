import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch public payment settings (for customers)
export async function GET(request: NextRequest) {
  try {
    // Check customer authentication
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get payment settings (use any to bypass type checking)
    let paymentSettings = await (prisma as any).paymentSettings.findUnique({
      where: { id: 'default' }
    })

    // Return only public information needed for payments
    const publicSettings = paymentSettings ? {
      bankTransferEnabled: paymentSettings.bankTransferEnabled,
      bankName: paymentSettings.bankName,
      bankAccountName: paymentSettings.bankAccountName,
      bankAccountNumber: paymentSettings.bankAccountNumber,
      bankIban: paymentSettings.bankIban,
      bankSwiftCode: paymentSettings.bankSwiftCode,
      bankBranch: paymentSettings.bankBranch,
      paymentInstructions: paymentSettings.paymentInstructions,
      paymentTimeoutHours: paymentSettings.paymentTimeoutHours
    } : {
      bankTransferEnabled: false,
      bankName: null,
      bankAccountName: null,
      bankAccountNumber: null,
      bankIban: null,
      bankSwiftCode: null,
      bankBranch: null,
      paymentInstructions: null,
      paymentTimeoutHours: 24
    }

    return NextResponse.json({
      success: true,
      settings: publicSettings
    })
  } catch (error) {
    console.error('Payment settings fetch error:', error)
    return NextResponse.json(
      { error: 'Payment settings alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
