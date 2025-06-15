import { Post, User, PostStatus, Role } from '@prisma/client'

export type { Post, User, PostStatus, Role }

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