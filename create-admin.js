const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: 'admin@memoryqr.com' }
    })

    if (existingAdmin) {
      console.log('Admin user already exists!')
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const admin = await prisma.admin.create({
      data: {
        name: 'Admin',
        email: 'admin@memoryqr.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
      }
    })

    console.log('Admin user created successfully!')
    console.log('Email: admin@memoryqr.com')
    console.log('Password: admin123')
    console.log('Admin ID:', admin.id)
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
