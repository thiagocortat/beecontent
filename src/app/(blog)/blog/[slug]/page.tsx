import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { marked } from 'marked'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  metaDescription?: string
  keywords?: string
  featuredImage?: string
  status: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
  author: {
    email: string
  }
  tags?: string
}

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/posts/${slug}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    return response.json()
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export async function generateMetadata(
  { params }: BlogPostPageProps
): Promise<Metadata> {
  const post = await getPost(params.slug)
  
  if (!post) {
    return {
      title: 'Post não encontrado'
    }
  }
  
  return {
    title: post.title,
    description: post.metaDescription || post.excerpt || 'Leia este artigo interessante',
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.metaDescription || post.excerpt || 'Leia este artigo interessante',
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPost(params.slug)
  
  if (!post) {
    notFound()
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/blog">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Blog
            </Button>
          </Link>
          
          {post.featuredImage && (
            <div className="mb-6">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-6">
              {post.excerpt}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{post.author.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            </div>
          </div>
          
          {post.tags && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.split(',').map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: marked.parse(post.content) as string }}
          />
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <Link href="/blog">
            <Button>
              Ver mais artigos
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}