import { Post, User } from '@prisma/client'

export type { Post, User }

// Define PostStatus and Role manually since they're not enums in the schema
export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type Role = 'ADMIN' | 'EDITOR' | 'AUTHOR'

export interface PostWithAuthor extends Post {
  author: User
}

export interface CreatePostData {
  title: string
  slug: string
  content: string
  metaDescription?: string
  keywords?: string
  imageUrl?: string
  status: PostStatus
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: string
}

export interface AIGenerateRequest {
  destination: string
  season: string
  audience: string
  keywords: string
}

export interface AIGenerateResponse {
  title: string
  content: string
  metaDescription: string
  keywords: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  metaDescription?: string
  keywords?: string
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
  author: {
    email: string
  }
}