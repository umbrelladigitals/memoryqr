import { prisma } from './src/lib/prisma'

async function checkExistingQRCodes() {
  try {
    const events = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        qrCode: true
      }
    })

    console.log('Current events with QR codes:')
    events.forEach(event => {
      console.log(`${event.title}: ${event.qrCode}`)
    })

    console.log(`\nTotal events: ${events.length}`)
    console.log('\nEvent URLs will be:')
    events.forEach(event => {
      console.log(`${event.title}: http://localhost:3000/event/${event.qrCode}`)
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkExistingQRCodes()
