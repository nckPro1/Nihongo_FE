export type PostType = 'ARTICLE' | 'VIDEO_LESSON' | 'COURSE_AD' | 'NEWS' | 'TUTORIAL'
export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type CommentStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface BlogCategory {
  id: number
  name: string
  slug: string
  description: string | null
  parentId: number | null
  displayOrder: number
}

export interface BlogTag {
  id: number
  name: string
  slug: string
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: string | null
  postType: PostType
  status: PostStatus

  // Video-specific fields
  videoUrl: string | null
  videoDurationMinutes: number | null

  // Author
  authorId: string
  authorName: string

  // Tags
  tags: BlogTag[]

  // Metadata
  metaTitle: string | null
  metaDescription: string | null
  metaKeywords: string | null

  // Stats
  viewsCount: number
  likesCount: number
  dislikesCount: number
  userReaction: 'LIKE' | 'DISLIKE' | null

  // Timestamps
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}

export interface BlogPostListItem {
  id: number
  title: string
  slug: string
  excerpt: string
  featuredImage: string | null
  postType: PostType
  status: PostStatus
  authorName: string
  viewsCount: number
  likesCount: number
  dislikesCount: number
  publishedAt: string | null
  createdAt: string
}

export interface BlogComment {
  id: number
  postId: number
  userId: string
  userName: string
  userAvatar: string | null
  content: string
  status: CommentStatus
  createdAt: string
  updatedAt: string
}

export interface BlogPostPage {
  content: BlogPostListItem[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface CreateBlogPostRequest {
  title: string
  content: string
  excerpt: string
  postType: PostType
  tagIds: number[]
  featuredImage?: string
  videoUrl?: string
  videoDurationMinutes?: number
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  status: PostStatus
}

export interface UpdateBlogPostRequest extends CreateBlogPostRequest {
  id: number
}
