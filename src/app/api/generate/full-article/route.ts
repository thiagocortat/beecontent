import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import Groq from 'groq-sdk'

interface HotelData {
  name: string
  neighborhood: string
  city: string
  state: string
  country: string
}

interface RequestBody {
  title: string
  description: string
  hotel: HotelData
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

    // Verificar se a API key do Groq está configurada
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Chave da API Groq não configurada. Configure GROQ_API_KEY no arquivo .env' },
        { status: 500 }
      )
    }

    const body: RequestBody = await request.json()
    const { title, description, hotel } = body

    if (!title || !description || !hotel) {
      return NextResponse.json(
        { error: 'Título, descrição e dados do hotel são obrigatórios' },
        { status: 400 }
      )
    }

    // Inicializar o cliente Groq
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })

    // Gerar conteúdo completo do artigo usando IA
    const result = await generateFullArticleWithAI(groq, title, description, hotel)

    return NextResponse.json({
      content: result.content,
      title: result.title,
      excerpt: result.excerpt,
      metaDescription: result.metaDescription,
      keywords: result.keywords
    })
  } catch (error) {
    console.error('Erro ao gerar artigo completo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function generateFullArticleWithAI(groq: Groq, title: string, description: string, hotel: HotelData) {
  const location = `${hotel.city}, ${hotel.state}`
  const hotelName = hotel.name
  const neighborhood = hotel.neighborhood

  const prompt = `Você é um especialista em turismo e redação de conteúdo para blogs de viagem. Crie um artigo completo e detalhado sobre o tema solicitado.

TÍTULO: ${title}
DESCRIÇÃO: ${description}
LOCALIZAÇÃO: ${location}
HOTEL: ${hotelName} (localizado em ${neighborhood})

Crie um artigo completo seguindo EXATAMENTE este formato:

TÍTULO: [título do artigo]

CONTEÚDO:
[Artigo completo em markdown com pelo menos 800 palavras, incluindo:
- Introdução envolvente
- Seções bem estruturadas com subtítulos
- Informações práticas e úteis
- Menções naturais ao hotel e localização
- Conclusão inspiradora
- Use formatação markdown (##, ###, -, *, etc.)]

EXCERPT:
[Resumo atrativo do artigo em 2-3 frases, máximo 150 caracteres]

META_DESCRIPTION:
[Meta descrição otimizada para SEO, entre 140-160 caracteres, incluindo palavras-chave relevantes]

KEYWORDS:
[5-8 palavras-chave separadas por vírgula, relevantes para o tema e localização]

IMPORTANTE:
- O conteúdo deve ser original, informativo e envolvente
- Inclua dicas práticas e informações úteis
- Mantenha um tom amigável e acessível
- Otimize para SEO naturalmente
- Todos os campos devem ser preenchidos obrigatoriamente`

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 4000,
    })

    const response = completion.choices[0]?.message?.content || ''
    
    // Extrair campos usando regex mais robustas
    const titleMatch = response.match(/TÍTULO:\s*(.+?)(?=\n|$)/)
    const contentMatch = response.match(/CONTEÚDO:\s*([\s\S]*?)(?=\n\s*EXCERPT:|$)/)
    const excerptMatch = response.match(/EXCERPT:\s*([\s\S]*?)(?=\n\s*META_DESCRIPTION:|$)/)
    const metaDescriptionMatch = response.match(/META_DESCRIPTION:\s*([\s\S]*?)(?=\n\s*KEYWORDS:|$)/)
    const keywordsMatch = response.match(/KEYWORDS:\s*([\s\S]*?)(?=\n\s*[A-Z_]+:|$)/)

    return {
      title: titleMatch?.[1]?.trim() || title,
      content: contentMatch?.[1]?.trim() || `# ${title}\n\n${description}\n\nConteúdo gerado automaticamente.`,
      excerpt: excerptMatch?.[1]?.trim() || '',
      metaDescription: metaDescriptionMatch?.[1]?.trim() || '',
      keywords: keywordsMatch?.[1]?.trim() || ''
    }
  } catch (error) {
    console.error('Erro ao gerar conteúdo com IA:', error)
    // Fallback para conteúdo básico
    return {
      title,
      content: `# ${title}\n\n${description}\n\nEste é um artigo sobre ${title} em ${location}.`,
      excerpt: '',
      metaDescription: '',
      keywords: ''
    }
  }
}