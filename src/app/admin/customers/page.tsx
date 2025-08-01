import { prisma } from '@/lib/prisma'
import CustomerManagementClient from './customer-management-client'

export default async function CustomerManagementPage() {
  // Get all customers with their statistics
  let customers: any[]
  try {
    customers = await prisma.customer.findMany({
      include: {
        plan: {
          select: {
            name: true,
            displayName: true,
            price: true
          }
        },
        _count: {
          select: {
            events: true,
            payments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  } catch (error) {
    console.error('Customers fetch error:', error)
    customers = []
  }

  return (
    <CustomerManagementClient customers={customers} />
  )
}
