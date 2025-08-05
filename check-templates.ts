import { prisma } from './src/lib/prisma'

async function checkTemplates() {
  try {
    const templates = await prisma.uploadTemplate.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        isDefault: true
      }
    })

    console.log('Current templates:', templates)
    console.log('Template count:', templates.length)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTemplates()
