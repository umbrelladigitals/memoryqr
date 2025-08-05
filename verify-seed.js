const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifySeed() {
  console.log('🔍 Verifying seeded data...\n')

  try {
    // Check admin users
    const adminCount = await prisma.admin.count()
    console.log(`✅ Admin users: ${adminCount}`)

    // Check plans
    const planCount = await prisma.plan.count()
    const plans = await prisma.plan.findMany({ select: { name: true, price: true } })
    console.log(`✅ Plans: ${planCount}`)
    plans.forEach(plan => console.log(`   - ${plan.name}: $${plan.price}`))

    // Check customers
    const customerCount = await prisma.customer.count()
    const customers = await prisma.customer.findMany({ 
      select: { name: true, email: true },
      include: { plan: { select: { name: true } } }
    })
    console.log(`\n✅ Customers: ${customerCount}`)
    customers.forEach(customer => 
      console.log(`   - ${customer.name} (${customer.email}) - Plan: ${customer.plan?.name || 'No Plan'}`)
    )

    // Check events
    const eventCount = await prisma.event.count()
    const events = await prisma.event.findMany({ 
      select: { title: true, location: true }
    })
    console.log(`\n✅ Events: ${eventCount}`)
    events.forEach(event => console.log(`   - ${event.title} (${event.location})`))

    // Check uploads
    const uploadCount = await prisma.upload.count()
    console.log(`\n✅ Uploads: ${uploadCount}`)

    // Check payments
    const paymentCount = await prisma.payment.count()
    const totalRevenue = await prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true }
    })
    console.log(`\n✅ Payments: ${paymentCount}`)
    console.log(`💰 Total Revenue: $${totalRevenue._sum.amount || 0}`)

    // Check analytics
    const analyticsCount = await prisma.analytics.count()
    console.log(`\n✅ Analytics records: ${analyticsCount}`)

    // Check notifications
    const notificationCount = await prisma.notification.count()
    console.log(`✅ Notifications: ${notificationCount}`)

    console.log('\n🎉 Seed verification completed successfully!')

  } catch (error) {
    console.error('❌ Error verifying seed data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifySeed()
