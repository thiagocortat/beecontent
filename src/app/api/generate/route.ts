import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Groq from 'groq-sdk'
import { generateSlug } from '@/lib/utils'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Chave da API Groq não configurada. Configure GROQ_API_KEY no arquivo .env' },
        { status: 500 }
      )
    }

    const { title, tone = 'professional', length = 'medium' } = await request.json()

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      )
    }

    // Determine word count based on length
    const wordCounts = {
      short: '400-600',
      medium: '800-1200',
      long: '1500-2000'
    }
    
    const wordCount = wordCounts[length as keyof typeof wordCounts] || '800-1200'
    
    // Determine tone description
    const toneDescriptions = {
      professional: 'profissional e informativo',
      casual: 'casual e amigável',
      formal: 'formal e técnico',
      creative: 'criativo e envolvente'
    }
    
    const toneDescription = toneDescriptions[tone as keyof typeof toneDescriptions] || 'profissional e informativo'

    const prompt = `
Crie um artigo de blog completo baseado no título: "${title}"

O artigo deve:
- Ter um conteúdo de ${wordCount} palavras
- Ser escrito em português brasileiro
- Ter um tom ${toneDescription}
- Incluir informações relevantes e úteis sobre o tópico
- Ser bem estruturado com subtítulos
- Incluir uma introdução envolvente e uma conclusão
- Ser otimizado para SEO

Formato de resposta:
TÍTULO: [título otimizado]
CONTEÚDO: [conteúdo completo em markdown]
EXCERPT: [resumo de 2-3 frases]
META_DESCRIPTION: [descrição de até 160 caracteres]
KEYWORDS: [palavras-chave separadas por vírgula]
`

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em marketing de conteúdo para hotéis e turismo. Crie conteúdo envolvente e otimizado para SEO."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content
    
    if (!response) {
      throw new Error('Resposta vazia da IA')
    }

    // Parse the response
    const titleMatch = response.match(/TÍTULO:\s*(.+)/)
    const contentMatch = response.match(/CONTEÚDO:\s*([\s\S]*?)(?=EXCERPT:|META_DESCRIPTION:|$)/)
    const excerptMatch = response.match(/EXCERPT:\s*([\s\S]*?)(?=META_DESCRIPTION:|$)/)
    const metaMatch = response.match(/META_DESCRIPTION:\s*(.+)/)
    const keywordsMatch = response.match(/KEYWORDS:\s*(.+)/)

    const generatedTitle = titleMatch?.[1]?.trim() || title
    const content = contentMatch?.[1]?.trim() || response
    const excerpt = excerptMatch?.[1]?.trim() || ''
    const metaDescription = metaMatch?.[1]?.trim() || ''
    const generatedKeywords = keywordsMatch?.[1]?.trim() || ''

    return NextResponse.json({
      title: generatedTitle,
      slug: generateSlug(generatedTitle),
      content,
      excerpt,
      metaDescription,
      keywords: generatedKeywords
    })

  } catch (error) {
    console.error('Error generating content:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar conteúdo com IA' },
      { status: 500 }
    )
  }
}