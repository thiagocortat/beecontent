import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    console.log('API [slug] - Searching for slug:', slug)

    const post = await prisma.post.findFirst({
      where: {
        slug,
        status: 'PUBLISHED'
      },
      include: {
        author: {
          select: {
            email: true
          }
        }
      }
    })

    console.log('API [slug] - Post found:', post ? 'YES' : 'NO')
    if (post) {
      console.log('API [slug] - Post details:', { id: post.id, title: post.title, slug: post.slug, status: post.status })
    }

    if (!post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}