import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    console.log('🔍 Debug session API called')
    console.log('Session:', JSON.stringify(session, null, 2))
    
    if (!session?.user?.id) {
      return NextResponse.json({
        error: 'No session',
        session: null,
        timestamp: new Date().toISOString()
      })
    }

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: session.user.id }
    })
    
    return NextResponse.json({
      session: {
        user: session.user,
        hasCustomer: !!customer,
        customer: customer ? {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          isActive: customer.isActive
        } : null
      },
      sessionValid: !!customer,
      timestamp: new Date().toISOString(),
      recommendation: !customer ? 'Session invalid - customer not found. Please logout and login again.' : 'Session is valid'
    })
    
  } catch (error) {
    console.error('Debug session error:', error)
    return NextResponse.json(
      { 
        error: 'Internal error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
