import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Verificar se o usuário está autenticado e é admin
    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem ver estatísticas.' },
        { status: 403 }
      )
    }

    // Buscar estatísticas
    const [totalPosts, totalUsers, publishedPosts, draftPosts] = await Promise.all([
      prisma.post.count(),
      prisma.user.count(),
      prisma.post.count({
        where: {
          status: 'PUBLISHED'
        }
      }),
      prisma.post.count({
        where: {
          status: 'DRAFT'
        }
      })
    ])

    return NextResponse.json({
      totalPosts,
      totalUsers,
      publishedPosts,
      draftPosts
    })

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}