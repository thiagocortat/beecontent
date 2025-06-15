import Link from 'next/link'
import { Calendar, User, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

async function getPosts(): Promise<BlogPost[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/posts?status=PUBLISHED`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return []
    }
    
    const data = await response.json()
    return data.posts || []
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

export default async function BlogPage() {
  const posts = await getPosts()
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const truncateContent = (content: string, maxLength: number = 150) => {
    // Convert markdown to HTML first, then strip HTML tags
    const htmlContent = marked.parse(content) as string
    const textContent = htmlContent.replace(/<[^>]*>/g, '')
    if (textContent.length <= maxLength) return textContent
    return textContent.substring(0, maxLength) + '...'
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubra artigos interessantes e mantenha-se atualizado com as últimas novidades.
          </p>
        </div>
        
        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum artigo publicado
            </h3>
            <p className="text-gray-600">
              Volte em breve para ver novos conteúdos!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                {post.featuredImage && (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="line-clamp-2">
                    {post.title}
                  </CardTitle>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{post.author.email.split('@')[0]}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt || truncateContent(post.content)}
                  </p>
                  
                  {post.tags && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.split(',').slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <Link href={`/blog/${post.slug}`}>
                    <Button variant="outline" className="w-full">
                      Ler artigo
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Pagination could be added here in the future */}
      </div>
    </div>
  )
}