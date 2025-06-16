const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    const email = process.argv[2]
    const password = process.argv[3]
    const hotelName = process.argv[4] || 'Hotel Administração'

    if (!email || !password) {
      console.log('Uso: node scripts/create-admin.js <email> <senha> [nome-do-hotel]')
      console.log('Exemplo: node scripts/create-admin.js admin@hotel.com minhasenha123 "Meu Hotel"')
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

    // Criar hotel padrão se não existir
    let hotel = await prisma.hotel.findFirst({
      where: {
        name: hotelName
      }
    })

    if (!hotel) {
      hotel = await prisma.hotel.create({
        data: {
          chainId: 'ADMIN_CHAIN',
          name: hotelName,
          address: 'Endereço não informado',
          neighborhood: 'Centro',
          city: 'Cidade',
          state: 'Estado',
          country: 'Brasil'
        }
      })
      console.log(`🏨 Hotel "${hotel.name}" criado com ID: ${hotel.id}`)
    } else {
      console.log(`🏨 Usando hotel existente: "${hotel.name}" (ID: ${hotel.id})`)
    }

    // Criar usuário administrador
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
        hotelId: hotel.id
      }
    })

    console.log('✅ Usuário administrador criado com sucesso!')
    console.log(`📧 Email: ${admin.email}`)
    console.log(`👤 Role: ${admin.role}`)
    console.log(`🏨 Hotel: ${hotel.name}`)
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