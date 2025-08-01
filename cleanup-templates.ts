import { prisma } from './src/lib/prisma'

async function cleanupTemplates() {
  try {
    // Check current templates
    const templates = await prisma.uploadTemplate.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        isDefault: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    console.log('Current templates:', templates)

    // Keep only the base 3 templates - delete extras
    const baseTemplateNames = ['wedding', 'birthday', 'corporate']
    const templatesToDelete = templates.filter(t => !baseTemplateNames.includes(t.name))

    if (templatesToDelete.length > 0) {
      console.log('Templates to delete:', templatesToDelete)
      
      // Delete extra templates
      for (const template of templatesToDelete) {
        await prisma.uploadTemplate.delete({
          where: { id: template.id }
        })
        console.log(`Deleted template: ${template.displayName}`)
      }
    }

    console.log('Template cleanup completed!')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupTemplates()
