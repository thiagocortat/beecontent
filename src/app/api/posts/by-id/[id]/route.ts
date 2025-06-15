import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/utils'
import { PostStatus } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    console.log('GET /api/posts/[id] - Received params:', params)
    console.log('GET /api/posts/[id] - ID value:', id)
    
    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json(
        { error: 'ID do post é obrigatório' },
        { status: 400 }
      )
    }

    const post = await prisma.post.findUnique({
      where: {
        id: id
      },
      include: {
        author: {
          select: {
            email: true
          }
        }
      }
    })

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { id: postId } = params
    const {
      title,
      content,
      excerpt,
      metaDescription,
      keywords,
      status,
      featuredImage
    } = await request.json()

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      )
    }

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    // Generate new slug if title changed
    let slug = existingPost.slug
    if (title.trim() !== existingPost.title) {
      slug = generateSlug(title)
      let counter = 1
      
      while (await prisma.post.findFirst({ 
        where: { 
          slug,
          id: { not: postId }
        } 
      })) {
        slug = `${generateSlug(title)}-${counter}`
        counter++
      }
    }

    // Update the post
    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        title: title.trim(),
        slug,
        content: content || '',
        excerpt: excerpt || '',
        metaDescription: metaDescription || '',
        keywords: keywords || '',
        featuredImage: featuredImage || null,
        status: status as PostStatus
      },
      include: {
        author: {
          select: {
            email: true
          }
        }
      }
    })

    return NextResponse.json(post)

  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { id: postId } = params

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    // Delete the post
    await prisma.post.delete({
      where: { id: postId }
    })

    return NextResponse.json({ message: 'Post deletado com sucesso' })

  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}