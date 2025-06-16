import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

interface HotelData {
  name: string
  neighborhood: string
  city: string
  state: string
  country: string
  latitude?: number | null
  longitude?: number | null
}

interface ContextData {
  season: string
  travelType: string
  event: string
}

interface RequestBody {
  hotel: HotelData
  context: ContextData
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body: RequestBody = await request.json()
    const { hotel, context } = body

    if (!hotel || !hotel.name || !hotel.city || !hotel.state) {
      return NextResponse.json(
        { error: 'Dados do hotel são obrigatórios' },
        { status: 400 }
      )
    }

    // Gerar sugestões baseadas nos dados do hotel e contexto
    const suggestions = await generateArticleSuggestions(hotel, context)

    return NextResponse.json({
      suggestions,
      hotel: {
        name: hotel.name,
        location: `${hotel.city}, ${hotel.state}`
      }
    })
  } catch (error) {
    console.error('Erro ao gerar sugestões:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function generateArticleSuggestions(hotel: HotelData, context: ContextData) {
  // Aqui você pode integrar com uma API de IA como OpenAI, TogetherAI, etc.
  // Por enquanto, vou criar sugestões baseadas em templates
  
  const location = `${hotel.city}, ${hotel.state}`
  const neighborhood = hotel.neighborhood
  const season = context.season
  const travelType = context.travelType
  const event = context.event

  const suggestions = []

  // Sugestões baseadas no tipo de viagem
  if (travelType === 'familia' || travelType === 'all') {
    suggestions.push({
      title: `Roteiro de 3 dias em ${hotel.city} com crianças`,
      description: `Dicas de passeios e atrações familiares em ${hotel.city}, com foco em atividades para toda a família.`
    })
    
    suggestions.push({
      title: `Melhores praias e parques para famílias em ${hotel.city}`,
      description: `Guia completo dos locais mais seguros e divertidos para crianças na região de ${neighborhood}.`
    })
  }

  if (travelType === 'casal' || travelType === 'all') {
    suggestions.push({
      title: `Experiências românticas em ${hotel.city} no ${season}`,
      description: `Sugestões especiais para casais que visitam ${hotel.city} durante o ${season}.`
    })
    
    suggestions.push({
      title: `Jantar romântico: melhores restaurantes em ${neighborhood}`,
      description: `Seleção dos restaurantes mais charmosos e aconchegantes próximos ao ${hotel.name}.`
    })
  }

  if (travelType === 'negocios' || travelType === 'all') {
    suggestions.push({
      title: `Guia de negócios em ${hotel.city}: onde trabalhar e se reunir`,
      description: `Dicas para viajantes corporativos em ${hotel.city}, incluindo coworkings e espaços de reunião.`
    })
  }

  // Sugestões baseadas na estação
  if (season === 'verao') {
    suggestions.push({
      title: `Verão em ${hotel.city}: praias e atividades aquáticas`,
      description: `Aproveite o verão com as melhores opções de praia e esportes aquáticos em ${location}.`
    })
  } else if (season === 'inverno') {
    suggestions.push({
      title: `Inverno aconchegante em ${hotel.city}`,
      description: `Descubra o charme do inverno em ${hotel.city} com atividades indoor e experiências únicas.`
    })
  }

  // Sugestões baseadas em eventos
  if (event === 'carnaval') {
    suggestions.push({
      title: `Carnaval em ${hotel.city}: blocos e festas imperdíveis`,
      description: `Guia completo do carnaval em ${hotel.city} com dicas de blocos, festas e tradições locais.`
    })
  } else if (event === 'natal') {
    suggestions.push({
      title: `Natal mágico em ${hotel.city}: decorações e eventos`,
      description: `Celebre o Natal em ${hotel.city} com as melhores decorações, mercados natalinos e eventos especiais.`
    })
  } else if (event === 'reveillon') {
    suggestions.push({
      title: `Réveillon inesquecível em ${hotel.city}`,
      description: `Dicas para uma virada de ano perfeita em ${hotel.city} com festas, fogos e celebrações.`
    })
  }

  // Sugestões gerais sobre a região
  suggestions.push({
    title: `10 lugares imperdíveis em ${hotel.city}`,
    description: `Descubra os pontos turísticos mais importantes e atrações únicas de ${hotel.city}.`
  })

  suggestions.push({
    title: `Gastronomia local: sabores únicos de ${hotel.city}`,
    description: `Explore a culinária típica de ${hotel.city} com pratos tradicionais e restaurantes recomendados.`
  })

  suggestions.push({
    title: `Como chegar e se locomover em ${hotel.city}`,
    description: `Guia prático de transporte e locomoção para aproveitar ao máximo sua estadia em ${hotel.city}.`
  })

  // Sugestões específicas do bairro
  if (neighborhood) {
    suggestions.push({
      title: `Explorando ${neighborhood}: o coração de ${hotel.city}`,
      description: `Descubra os encantos do bairro ${neighborhood} e suas principais atrações e estabelecimentos.`
    })
  }

  // Retornar no máximo 8 sugestões aleatórias
  const shuffled = suggestions.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 8)
}