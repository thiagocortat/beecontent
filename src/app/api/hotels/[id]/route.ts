import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 API /hotels/[id] - Iniciando requisição para ID:', params.id)
    
    const session = await getServerSession(authOptions)
    console.log('👤 Sessão encontrada:', {
      userId: session?.user?.id,
      userRole: session?.user?.role,
      userHotelId: session?.user?.hotelId
    })
    
    if (!session?.user) {
      console.log('❌ Usuário não autenticado')
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const hotelId = parseInt(params.id)
    console.log('🏨 Hotel ID parseado:', hotelId)
    
    if (isNaN(hotelId)) {
      console.log('❌ ID do hotel inválido:', params.id)
      return NextResponse.json(
        { error: 'ID do hotel inválido' },
        { status: 400 }
      )
    }

    // Verificar se o usuário tem acesso ao hotel
    // Admins podem acessar qualquer hotel, outros usuários apenas o seu próprio
    if (session.user.role !== 'ADMIN' && session.user.hotelId !== hotelId) {
      console.log('❌ Acesso negado - Role:', session.user.role, 'User hotelId:', session.user.hotelId, 'Requested hotelId:', hotelId)
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }
    
    console.log('✅ Verificações de autorização passaram')

    console.log('🔍 Buscando hotel no banco de dados com ID:', hotelId)
    
    const hotel = await prisma.hotel.findUnique({
      where: {
        id: hotelId
      },
      select: {
        id: true,
        chainId: true,
        name: true,
        address: true,
        neighborhood: true,
        city: true,
        state: true,
        country: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        updatedAt: true
      }
    })

    console.log('🏨 Resultado da consulta do hotel:', hotel)

    if (!hotel) {
      console.log('❌ Hotel não encontrado no banco de dados')
      return NextResponse.json(
        { error: 'Hotel não encontrado' },
        { status: 404 }
      )
    }

    console.log('✅ Hotel encontrado, retornando dados')
    return NextResponse.json(hotel)
  } catch (error) {
    console.error('Erro ao buscar hotel:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}