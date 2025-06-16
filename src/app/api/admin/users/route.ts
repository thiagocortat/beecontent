import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Verificar se o usuário está autenticado e é admin
    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem criar usuários.' },
        { status: 403 }
      )
    }

    const { email, password, hotelId } = await request.json()

  // Validação básica
  if (!email || !password || hotelId === undefined || hotelId === null) {
    return NextResponse.json(
      { error: 'Email, senha e hotelId são obrigatórios' },
      { status: 400 }
    )
  }

  // Converter hotelId para number se necessário
   const hotelIdNumber = typeof hotelId === 'string' ? parseInt(hotelId, 10) : hotelId
   if (isNaN(hotelIdNumber)) {
     return NextResponse.json(
       { error: 'hotelId deve ser um número válido' },
       { status: 400 }
     )
   }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário com este email já existe' },
        { status: 409 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Verificar se o hotel existe
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelIdNumber }
    })

    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel não encontrado' },
        { status: 404 }
      )
    }

    // Criar o usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'USER', // Por padrão, novos usuários são USER, não ADMIN
        hotelId: hotelIdNumber
      },
      select: {
        id: true,
        email: true,
        role: true,
        hotelId: true,
        createdAt: true,
        hotel: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user
    })

  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Verificar se o usuário está autenticado e é admin
    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem listar usuários.' },
        { status: 403 }
      )
    }

    // Buscar todos os usuários (sem a senha)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ users })

  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}