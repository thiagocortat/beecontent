# Estrutura de Hotel - Documentação

## Visão Geral

Este projeto agora implementa uma estrutura multi-tenant baseada em hotéis, onde cada usuário está vinculado a um hotel específico e todos os conteúdos são organizados por hotel.

## Entidades

### Hotel

A entidade `Hotel` contém as seguintes informações:

- `id`: Identificador único (String, CUID)
- `chainId`: Identificador da rede hoteleira (obrigatório)
- `name`: Nome do hotel
- `address`: Endereço completo
- `neighborhood`: Bairro
- `city`: Cidade
- `state`: Estado
- `country`: País
- `latitude`: Coordenada geográfica (opcional)
- `longitude`: Coordenada geográfica (opcional)
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização

### Relacionamentos

- **Hotel → Users**: Um hotel pode ter múltiplos usuários
- **Hotel → Posts**: Um hotel pode ter múltiplos posts
- **User → Hotel**: Cada usuário pertence a um único hotel
- **Post → Hotel**: Cada post pertence a um único hotel
- **Post → User**: Cada post tem um autor (usuário)

## Funcionalidades Implementadas

### 1. Isolamento por Hotel

- **Usuários não-admin**: Visualizam apenas conteúdos do seu hotel
- **Usuários admin**: Podem visualizar conteúdos de todos os hotéis
- **Posts**: Automaticamente associados ao hotel do usuário que os cria

### 2. APIs Atualizadas

#### Criação de Posts
- Automaticamente inclui o `hotelId` do usuário logado
- Retorna informações do hotel junto com o post

#### Dashboard de Posts
- Filtra posts por hotel (exceto para admins)
- Inclui informações do hotel nos resultados

#### Criação de Usuários (Admin)
- Requer `hotelId` obrigatório
- Valida se o hotel existe antes de criar o usuário

### 3. Autenticação

- Sessão inclui `hotelId` do usuário
- JWT token inclui informações do hotel
- Middleware atualizado para suportar multi-tenancy

## Tipos TypeScript

Novos tipos foram adicionados para facilitar o desenvolvimento:

```typescript
// Tipos básicos
export type { Hotel, User, Post }

// Tipos com relacionamentos
export interface PostWithAuthorAndHotel extends Post {
  author: User
  hotel: Hotel
}

export interface UserWithHotel extends User {
  hotel: Hotel
}

export interface HotelWithUsers extends Hotel {
  users: User[]
}

export interface HotelWithPosts extends Hotel {
  posts: Post[]
}
```

## Configuração Inicial

### 1. Criar Hotel e Admin

Use o script atualizado para criar um usuário administrador:

```bash
node scripts/create-admin.js admin@hotel.com senha123 "Nome do Hotel"
```

Este comando irá:
- Criar um hotel com o nome especificado (ou usar existente)
- Criar um usuário admin vinculado ao hotel
- Configurar as credenciais de acesso

### 2. Migração do Banco

A migração `20250615183436_add_hotel_entity` foi aplicada e inclui:
- Criação da tabela `Hotel`
- Adição do campo `hotelId` na tabela `User`
- Adição do campo `hotelId` na tabela `Post`
- Configuração das foreign keys e relacionamentos

## Casos de Uso Futuros

### 1. Listar Usuários de um Hotel

```typescript
const hotelUsers = await prisma.hotel.findUnique({
  where: { id: hotelId },
  include: {
    users: {
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    }
  }
})
```

### 2. Listar Conteúdos de um Hotel

```typescript
const hotelPosts = await prisma.hotel.findUnique({
  where: { id: hotelId },
  include: {
    posts: {
      include: {
        author: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }
  }
})
```

### 3. Estatísticas por Hotel

```typescript
const hotelStats = await prisma.hotel.findMany({
  include: {
    _count: {
      select: {
        users: true,
        posts: true
      }
    }
  }
})
```

## Considerações de Segurança

1. **Isolamento de Dados**: Usuários só acessam dados do seu hotel
2. **Validação de Hotel**: Sempre validar se o hotel existe antes de operações
3. **Permissões de Admin**: Admins podem gerenciar múltiplos hotéis
4. **Auditoria**: Todos os relacionamentos são rastreáveis

## Próximos Passos

1. Implementar APIs específicas para gerenciamento de hotéis
2. Adicionar dashboard de estatísticas por hotel
3. Implementar sistema de convites para novos usuários
4. Adicionar validações geográficas para latitude/longitude
5. Implementar sistema de backup por hotel