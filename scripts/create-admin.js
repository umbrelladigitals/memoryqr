const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    // Create super admin user
    const admin = await prisma.admin.create({
      data: {
        name: 'Super Admin',
        email: 'admin@memoryqr.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
      }
    })
    
    console.log('✅ Super admin user created successfully!')
    console.log('📧 Email: admin@memoryqr.com')
    console.log('🔑 Password: admin123')
    console.log('🆔 ID:', admin.id)
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
