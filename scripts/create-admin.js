const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    const email = process.argv[2]
    const password = process.argv[3]

    if (!email || !password) {
      console.log('Uso: node scripts/create-admin.js <email> <senha>')
      console.log('Exemplo: node scripts/create-admin.js admin@hotel.com minhasenha123')
      process.exit(1)
    }

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log(`⚠️  Usuário com email ${email} já existe. Atualizando...`)
      // Deletar usuário existente
      await prisma.user.delete({
        where: { email }
      })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Criar usuário administrador
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log('✅ Usuário administrador criado com sucesso!')
    console.log(`📧 Email: ${admin.email}`)
    console.log(`👤 Role: ${admin.role}`)
    console.log(`🆔 ID: ${admin.id}`)
    console.log('')
    console.log('Agora você pode fazer login no sistema com essas credenciais.')
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário administrador:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()