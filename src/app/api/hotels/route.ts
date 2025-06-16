import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se o usuário é admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem listar hotéis.' },
        { status: 403 }
      )
    }

    // Buscar todos os hotéis
    const hotels = await prisma.hotel.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        country: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(hotels)
  } catch (error) {
    console.error('Erro ao buscar hotéis:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}