'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Lightbulb, Loader2, Sparkles, Filter } from 'lucide-react'
import { Hotel } from '@prisma/client'

interface ArticleSuggestion {
  title: string
  description: string
  content?: string
}

interface ArticleSuggestionsModalProps {
  onSelectSuggestion: (title: string, content: string, excerpt?: string, metaDescription?: string, keywords?: string) => void
  disabled?: boolean
}

interface FilterOptions {
  travelType: string
  season: string
  event: string
}

export function ArticleSuggestionsModal({ onSelectSuggestion, disabled }: ArticleSuggestionsModalProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingContent, setIsGeneratingContent] = useState(false)
  const [suggestions, setSuggestions] = useState<ArticleSuggestion[]>([])
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [isLoadingHotel, setIsLoadingHotel] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [hasTriedLoading, setHasTriedLoading] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    travelType: 'all',
    season: 'current',
    event: 'all'
  })

  // Carregar dados do hotel quando o modal abrir
  useEffect(() => {
    if (isOpen && session?.user?.hotelId) {
      console.log('🚀 Modal aberto, forçando carregamento do hotel...')
      
      // Sempre resetar o hotel e carregar novamente
      setHotel(null)
      setHasTriedLoading(false)
      
      // Delay maior para garantir estabilidade da sessão
      const timer = setTimeout(() => {
        setHasTriedLoading(true)
        loadHotelData()
      }, 800)
      
      return () => clearTimeout(timer)
    }
  }, [isOpen, session?.user?.hotelId])

  const loadHotelData = async (attempt = 1) => {
    setIsLoadingHotel(true)
    try {
      console.log(`🏨 === INÍCIO CARREGAMENTO HOTEL (Tentativa ${attempt}) ===`)
      console.log('🔍 Session completa:', JSON.stringify(session, null, 2))
      console.log('👤 User:', session?.user)
      console.log('🏨 HotelId:', session?.user?.hotelId)
      console.log('🔢 Tipo do hotelId:', typeof session?.user?.hotelId)
      console.log('✅ hotelId é truthy?', !!session?.user?.hotelId)
      console.log('🔢 hotelId convertido para Number:', Number(session?.user?.hotelId))
      console.log('❓ Number(hotelId) é NaN?', isNaN(Number(session?.user?.hotelId)))
      
      if (!session?.user?.hotelId) {
        console.error('❌ hotelId não encontrado na sessão')
        console.error('❌ Valores falsy detectados:')
        console.error('  - session existe?', !!session)
        console.error('  - session.user existe?', !!session?.user)
        console.error('  - session.user.hotelId existe?', !!session?.user?.hotelId)
        console.error('  - session.user.hotelId valor:', session?.user?.hotelId)
        toast({
          title: 'Erro',
          description: 'ID do hotel não encontrado na sessão',
          variant: 'destructive',
        })
        return
      }
      
      const hotelId = session.user.hotelId
      const url = `/api/hotels/${hotelId}`
      console.log('🌐 URL da requisição:', url)
      
      const response = await fetch(url)
      console.log('📡 Response status:', response.status)
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
      
      const responseText = await response.text()
      console.log('📄 Response text:', responseText)
      
      if (response.ok) {
        try {
          const hotelData = JSON.parse(responseText)
          console.log('✅ Dados do hotel carregados:', hotelData)
          
          // Verificar se os dados são válidos antes de definir
          if (hotelData && hotelData.id) {
            setHotel(hotelData)
            setRetryCount(0) // Reset retry count on success
            console.log('✅ Estado do hotel atualizado com sucesso')
          } else {
            console.error('❌ Dados do hotel inválidos:', hotelData)
            throw new Error('Dados do hotel inválidos')
          }
        } catch (parseError) {
          console.error('❌ Erro ao fazer parse do JSON:', parseError)
          if (attempt < 3) {
            console.log(`🔄 Tentando novamente em 500ms... (${attempt + 1}/3)`)
            setTimeout(() => loadHotelData(attempt + 1), 500)
            return
          }
          toast({
            title: 'Erro',
            description: 'Erro ao processar resposta do servidor',
            variant: 'destructive',
          })
        }
      } else {
        if (attempt < 3) {
          console.log(`🔄 Resposta não OK, tentando novamente em 500ms... (${attempt + 1}/3)`)
          setTimeout(() => loadHotelData(attempt + 1), 500)
          return
        }
        try {
          const errorData = JSON.parse(responseText)
          console.error('❌ Erro na resposta da API:', errorData)
          toast({
            title: 'Erro',
            description: errorData.error || 'Erro ao carregar dados do hotel',
            variant: 'destructive',
          })
        } catch (parseError) {
          console.error('❌ Erro ao fazer parse do erro:', parseError)
          console.error('❌ Response text bruto:', responseText)
          toast({
            title: 'Erro',
            description: 'Erro de comunicação com o servidor',
            variant: 'destructive',
          })
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do hotel:', error)
      if (attempt < 3) {
        console.log(`🔄 Erro de conexão, tentando novamente em 500ms... (${attempt + 1}/3)`)
        setTimeout(() => loadHotelData(attempt + 1), 500)
        return
      }
      toast({
        title: 'Erro',
        description: 'Erro de conexão ao carregar dados do hotel',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingHotel(false)
      console.log(`🏨 === FIM CARREGAMENTO HOTEL (Tentativa ${attempt}) ===`)
    }
  }

  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1
    if (month >= 12 || month <= 2) return 'verão'
    if (month >= 3 && month <= 5) return 'outono'
    if (month >= 6 && month <= 8) return 'inverno'
    return 'primavera'
  }

  const generateSuggestions = async () => {
    // Se não há dados do hotel, tentar carregar primeiro
    if (!hotel) {
      console.log('🔄 Hotel não carregado, tentando carregar antes de gerar sugestões...')
      setIsLoadingHotel(true)
      
      try {
        await loadHotelData()
        
        // Aguardar o estado ser atualizado com verificação em loop
        let attempts = 0
        const maxAttempts = 10
        while (!hotel && attempts < maxAttempts) {
          console.log(`⏳ Aguardando estado do hotel ser atualizado... (${attempts + 1}/${maxAttempts})`)
          await new Promise(resolve => setTimeout(resolve, 200))
          attempts++
        }
        
        // Verificar novamente após tentar carregar
        if (!hotel) {
          console.error('❌ Hotel ainda não carregado após todas as tentativas')
          toast({
            title: 'Erro',
            description: 'Não foi possível carregar os dados do hotel. Tente fechar e abrir o modal novamente.',
            variant: 'destructive',
          })
          return
        }
        
        console.log('✅ Hotel carregado com sucesso, prosseguindo com geração de sugestões')
      } finally {
        setIsLoadingHotel(false)
      }
    }

    setIsLoading(true)
    try {
      const currentSeason = getCurrentSeason()
      const requestData = {
        hotel: {
          name: hotel.name,
          neighborhood: hotel.neighborhood,
          city: hotel.city,
          state: hotel.state,
          country: hotel.country,
          latitude: hotel.latitude,
          longitude: hotel.longitude
        },
        context: {
          season: filters.season === 'current' ? currentSeason : filters.season,
          travelType: filters.travelType,
          event: filters.event
        }
      }

      const response = await fetch('/api/generate/article-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        const result = await response.json()
        setSuggestions(result.suggestions || [])
      } else {
        const error = await response.json()
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao gerar sugestões',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao gerar sugestões',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseSuggestion = async (suggestion: ArticleSuggestion) => {
    if (!hotel) return

    setIsGeneratingContent(true)
    try {
      const response = await fetch('/api/generate/full-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: suggestion.title,
          description: suggestion.description,
          hotel: {
            name: hotel.name,
            neighborhood: hotel.neighborhood,
            city: hotel.city,
            state: hotel.state,
            country: hotel.country
          }
        }),
      })

      if (response.ok) {
        const result = await response.json()
        onSelectSuggestion(suggestion.title, result.content, result.excerpt, result.metaDescription, result.keywords)
        setIsOpen(false)
        toast({
          title: 'Sucesso',
          description: 'Artigo gerado com sucesso!',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao gerar conteúdo completo',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao gerar conteúdo completo',
        variant: 'destructive',
      })
    } finally {
      setIsGeneratingContent(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && suggestions.length === 0) {
      generateSuggestions()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <Lightbulb className="h-4 w-4 mr-2" />
          Sugestões de Artigos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            Sugestões de Artigos com IA
          </DialogTitle>
          <DialogDescription>
            Sugestões personalizadas baseadas no seu hotel: {hotel?.name} em {hotel?.city}, {hotel?.state}
          </DialogDescription>
        </DialogHeader>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="text-sm font-medium mb-2 block">
              <Filter className="h-4 w-4 inline mr-1" />
              Tipo de Viagem
            </label>
            <Select
              value={filters.travelType}
              onValueChange={(value) => setFilters(prev => ({ ...prev, travelType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="familia">Família</SelectItem>
                <SelectItem value="casal">Casal</SelectItem>
                <SelectItem value="negocios">Negócios</SelectItem>
                <SelectItem value="aventura">Aventura</SelectItem>
                <SelectItem value="relaxamento">Relaxamento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Estação</label>
            <Select
              value={filters.season}
              onValueChange={(value) => setFilters(prev => ({ ...prev, season: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Estação Atual</SelectItem>
                <SelectItem value="verao">Verão</SelectItem>
                <SelectItem value="outono">Outono</SelectItem>
                <SelectItem value="inverno">Inverno</SelectItem>
                <SelectItem value="primavera">Primavera</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Evento</label>
            <Select
              value={filters.event}
              onValueChange={(value) => setFilters(prev => ({ ...prev, event: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os eventos</SelectItem>
                <SelectItem value="carnaval">Carnaval</SelectItem>
                <SelectItem value="ferias">Férias Escolares</SelectItem>
                <SelectItem value="reveillon">Réveillon</SelectItem>
                <SelectItem value="festa-junina">Festa Junina</SelectItem>
                <SelectItem value="natal">Natal</SelectItem>
                <SelectItem value="pascoa">Páscoa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {suggestions.length > 0 ? `${suggestions.length} sugestões encontradas` : 'Gerando sugestões...'}
          </p>
          <Button
            onClick={generateSuggestions}
            disabled={isLoading || isLoadingHotel}
            variant="outline"
            size="sm"
          >
            {isLoadingHotel ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {isLoadingHotel ? 'Carregando dados do hotel...' : isLoading ? 'Gerando...' : 'Gerar Novas Sugestões'}
          </Button>
        </div>

        {/* Lista de Sugestões */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Gerando sugestões personalizadas...</p>
              </div>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                  <CardDescription>{suggestion.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Badge variant="secondary">IA Gerado</Badge>
                      <Badge variant="outline">{hotel?.city}</Badge>
                    </div>
                    <Button
                      onClick={() => handleUseSuggestion(suggestion)}
                      disabled={isGeneratingContent}
                      size="sm"
                    >
                      {isGeneratingContent ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        'Usar este título'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhuma sugestão disponível no momento</p>
              <Button
                onClick={generateSuggestions}
                variant="outline"
                className="mt-4"
              >
                Tentar Novamente
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}