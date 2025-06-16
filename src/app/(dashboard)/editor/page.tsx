'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Save, 
  Wand2, 
  ArrowLeft,
  Eye,
  FileText
} from 'lucide-react'
import { ImageUpload } from '@/components/ui/image-upload'
import { ArticleSuggestionsModal } from '@/components/ui/article-suggestions-modal'

interface PostData {
  title: string
  content: string
  excerpt: string
  status: 'DRAFT' | 'PUBLISHED'
  metaDescription: string
  keywords: string
  featuredImage: string
}

export default function EditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const postId = searchParams.get('id')
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [postData, setPostData] = useState<PostData>({
    title: '',
    content: '',
    excerpt: '',
    status: 'DRAFT',
    metaDescription: '',
    keywords: '',
    featuredImage: ''
  })

  useEffect(() => {
    if (postId) {
      loadPost(postId)
    }
  }, [postId])

  const loadPost = async (id: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/posts/by-id/${id}`)
      if (response.ok) {
        const post = await response.json()
        setPostData({
          title: post.title,
          content: post.content,
          excerpt: post.excerpt || '',
          status: post.status,
          metaDescription: post.metaDescription || '',
          keywords: post.keywords || '',
          featuredImage: post.featuredImage || ''
        })
      } else {
        toast({
          title: 'Erro',
          description: 'Post não encontrado',
          variant: 'destructive',
        })
        router.push('/dashboard')
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar post',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!postData.title.trim()) {
      toast({
        title: 'Erro',
        description: 'Título é obrigatório',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const url = postId ? `/api/posts/by-id/${postId}` : '/api/posts'
      const method = postId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'Sucesso',
          description: postId ? 'Post atualizado com sucesso!' : 'Post criado com sucesso!',
        })
        
        if (!postId && result.id) {
          router.push(`/editor?id=${result.id}`)
        }
      } else {
        const error = await response.json()
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao salvar post',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar post',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateContent = async () => {
    if (!postData.title.trim()) {
      toast({
        title: 'Erro',
        description: 'Digite um título primeiro para gerar conteúdo',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: postData.title,
          tone: 'professional',
          length: 'medium'
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setPostData(prev => ({
          ...prev,
          content: result.content,
          excerpt: result.excerpt || prev.excerpt,
          metaDescription: result.metaDescription || prev.metaDescription,
          keywords: result.keywords || prev.keywords
        }))
        
        toast({
          title: 'Sucesso',
          description: 'Conteúdo gerado com IA!',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao gerar conteúdo',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao gerar conteúdo',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectSuggestion = (title: string, content: string) => {
    setPostData(prev => ({
      ...prev,
      title,
      content
    }))
    
    toast({
      title: 'Sucesso',
      description: 'Título e conteúdo preenchidos automaticamente!',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {postId ? 'Editar Post' : 'Novo Post'}
            </h1>
            <p className="text-muted-foreground">
              {postId ? 'Edite seu post existente' : 'Crie um novo post para seu blog'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <ArticleSuggestionsModal
            onSelectSuggestion={handleSelectSuggestion}
            disabled={isSaving || isGenerating}
          />
          
          <Button
            variant="outline"
            onClick={handleGenerateContent}
            disabled={isGenerating || !postData.title.trim()}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            {isGenerating ? 'Gerando...' : 'Gerar com IA'}
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Conteúdo Principal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={postData.title}
                  onChange={(e) => setPostData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Digite o título do post..."
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="excerpt">Resumo</Label>
                <Textarea
                  id="excerpt"
                  value={postData.excerpt}
                  onChange={(e) => setPostData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Breve descrição do post..."
                  rows={3}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea
                  id="content"
                  value={postData.content}
                  onChange={(e) => setPostData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Escreva o conteúdo do seu post aqui..."
                  rows={15}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Publicação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={postData.status}
                  onValueChange={(value: 'DRAFT' | 'PUBLISHED') => 
                    setPostData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">
                      <div className="flex items-center">
                        <Badge variant="secondary" className="mr-2">Rascunho</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="PUBLISHED">
                      <div className="flex items-center">
                        <Badge variant="default" className="mr-2">Publicado</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Imagem Destacada</CardTitle>
              <CardDescription>
                Adicione uma imagem para destacar seu post
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={postData.featuredImage}
                onChange={(url) => setPostData(prev => ({ ...prev, featuredImage: url }))}
                disabled={isSaving}
              />
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
              <CardDescription>
                Otimize seu post para mecanismos de busca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaDescription">Meta Descrição</Label>
                <Textarea
                  id="metaDescription"
                  value={postData.metaDescription}
                  onChange={(e) => setPostData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="Descrição para mecanismos de busca..."
                  rows={3}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {postData.metaDescription.length}/160 caracteres
                </p>
              </div>
              
              <div>
                <Label htmlFor="keywords">Palavras-chave</Label>
                <Input
                  id="keywords"
                  value={postData.keywords}
                  onChange={(e) => setPostData(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="palavra1, palavra2, palavra3"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separe as palavras-chave com vírgulas
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}