const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkData() {
  try {
    const [customers, events, uploads, plans, admins, templates, payments, analytics] = await Promise.all([
      prisma.customer.count(),
      prisma.event.count(),
      prisma.upload.count(),
      prisma.plan.count(),
      prisma.admin.count(),
      prisma.uploadTemplate.count(),
      prisma.payment.count(),
      prisma.analytics.count()
    ])

    console.log('📊 DATABASE RECORD COUNTS:')
    console.log('👥 Customers:', customers)
    console.log('📅 Events:', events)
    console.log('📁 Uploads:', uploads)
    console.log('💳 Plans:', plans)
    console.log('👨‍💼 Admins:', admins)
    console.log('🎨 Templates:', templates)
    console.log('💰 Payments:', payments)
    console.log('📈 Analytics:', analytics)

    // Sample data preview
    const sampleCustomer = await prisma.customer.findFirst({
      include: { plan: true, events: true }
    })

    const sampleEvent = await prisma.event.findFirst({
      include: { uploads: true }
    })

    console.log('\n📝 SAMPLE DATA:')
    console.log('Customer:', sampleCustomer?.name, '| Plan:', sampleCustomer?.plan?.displayName)
    console.log('Event:', sampleEvent?.title, '| Uploads:', sampleEvent?.uploads?.length)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkData()
