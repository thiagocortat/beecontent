'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Users, Settings, Database, Shield } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [selectedHotelId, setSelectedHotelId] = useState('')
  const [hotels, setHotels] = useState<Array<{id: number, name: string, city: string, state: string, country: string}>>([])
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    publishedPosts: 0,
    draftPosts: 0
  })

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }

    if (session.user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    // Carregar estatísticas e hotéis
    loadStats()
    loadHotels()
  }, [session, status, router])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const loadHotels = async () => {
    try {
      const response = await fetch('/api/hotels')
      if (response.ok) {
        const data = await response.json()
        setHotels(data)
      }
    } catch (error) {
      console.error('Erro ao carregar hotéis:', error)
      toast({
        title: 'Erro ao carregar hotéis',
        description: 'Não foi possível carregar a lista de hotéis',
        variant: 'destructive',
      })
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          hotelId: parseInt(selectedHotelId),
        }),
      })

      if (response.ok) {
        toast({
          title: 'Usuário criado com sucesso',
          description: `Usuário ${newUserEmail} foi criado.`,
        })
        setNewUserEmail('')
        setNewUserPassword('')
        setSelectedHotelId('')
        // Recarregar estatísticas após criar usuário
        loadStats()
      } else {
        const error = await response.json()
        toast({
          title: 'Erro ao criar usuário',
          description: error.error || 'Erro desconhecido',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro ao criar usuário',
        description: 'Erro de conexão',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Painel de Administração</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Estatísticas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Posts</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              Posts no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuários registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts Publicados</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedPosts}</div>
            <p className="text-xs text-muted-foreground">
              Posts públicos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Criar Usuário */}
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Usuário</CardTitle>
          <CardDescription>
            Adicione um novo usuário ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="usuario@exemplo.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="Senha segura"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hotel">Hotel</Label>
              <Select value={selectedHotelId} onValueChange={setSelectedHotelId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um hotel" />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map((hotel) => (
                    <SelectItem key={hotel.id} value={hotel.id.toString()}>
                      {hotel.name} - {hotel.city}, {hotel.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isLoading || !selectedHotelId}>
              {isLoading ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Configurações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Sistema</CardTitle>
          <CardDescription>
            Configurações gerais da aplicação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Backup do Banco de Dados</h3>
                <p className="text-sm text-muted-foreground">
                  Faça backup dos dados do sistema
                </p>
              </div>
              <Button variant="outline">
                Fazer Backup
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Limpar Cache</h3>
                <p className="text-sm text-muted-foreground">
                  Limpe o cache da aplicação
                </p>
              </div>
              <Button variant="outline">
                Limpar Cache
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}