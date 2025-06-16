import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/utils'
import { PostStatus } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as PostStatus || 'PUBLISHED'
    const limit = parseInt(searchParams.get('limit') || '10')
    const tag = searchParams.get('tag')
    const hotelId = searchParams.get('hotel_id')

    const where: any = {
      status: status
    }

    if (tag) {
      where.keywords = {
        contains: tag,
        mode: 'insensitive'
      }
    }

    // Future implementation for hotel_id filtering
    if (hotelId) {
      // where.hotelId = hotelId
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return NextResponse.json({
      posts,
      total: posts.length
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const {
      title,
      content,
      excerpt,
      metaDescription,
      keywords,
      status = 'DRAFT',
      featuredImage
    } = await request.json()

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      )
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Generate unique slug
    let slug = generateSlug(title)
    let counter = 1
    
    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${generateSlug(title)}-${counter}`
      counter++
    }

    // Create the post
    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        slug,
        content: content || '',
        excerpt: excerpt || '',
        metaDescription: metaDescription || '',
        keywords: keywords || '',
        featuredImage: featuredImage || null,
        status: status as PostStatus,
        authorId: user.id,
        hotelId: user.hotelId
      },
      include: {
        author: {
          select: {
            email: true
          }
        },
        hotel: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(post)

  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}