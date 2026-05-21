import { apiClient } from '../client'
import { adminApiClient } from '../adminClient'
import type {
  BlogPost,
  BlogPostPage,
  BlogCategory,
  BlogTag,
  BlogComment,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
  PostType,
  CommentStatus
} from '../../types/blog'
import type { ApiResponse } from '../../types/common'

// ==================== Public Blog Endpoints ====================

export const blogService = {
  // Get published posts (public)
  async getPublishedPosts(page = 0, size = 12): Promise<ApiResponse<BlogPostPage>> {
    const res = await apiClient.get('/blog/posts', { params: { page, size } })
    return res.data
  },

  // Get posts by type (public)
  async getPostsByType(
    type: PostType,
    page = 0,
    size = 12
  ): Promise<ApiResponse<BlogPostPage>> {
    const res = await apiClient.get(`/blog/posts/type/${type}`, { params: { page, size } })
    return res.data
  },

  // Search posts (public)
  async searchPosts(query: string, page = 0, size = 12): Promise<ApiResponse<BlogPostPage>> {
    const res = await apiClient.get('/blog/posts/search', { params: { q: query, page, size } })
    return res.data
  },

  // Get top viewed posts (public)
  async getTopViewedPosts(limit = 10): Promise<ApiResponse<BlogPostPage>> {
    const res = await apiClient.get('/blog/posts/top', { params: { limit } })
    return res.data
  },

  // Get single post by slug (public)
  async getPostBySlug(slug: string): Promise<ApiResponse<BlogPost>> {
    const res = await apiClient.get(`/blog/posts/${slug}`)
    return res.data
  },

  // Get post comments (public - approved only)
  async getPostComments(postId: number): Promise<ApiResponse<BlogComment[]>> {
    const res = await apiClient.get(`/blog/posts/${postId}/comments`)
    return res.data
  },

  // ==================== Premium/User Blog Endpoints ====================

  // React to a post (requires authenticated user)
  async reactToPost(slug: string, type: 'LIKE' | 'DISLIKE'): Promise<ApiResponse<BlogPost>> {
    const res = await apiClient.post(`/blog/posts/${slug}/react`, null, { params: { type } })
    return res.data
  },

  // Add comment (requires PREMIUM or ADMIN role)
  async addComment(postId: number, content: string): Promise<ApiResponse<BlogComment>> {
    const res = await apiClient.post(`/blog/posts/${postId}/comments`, { content })
    return res.data
  },

  // ==================== Admin Blog Endpoints ====================

  // Get all posts (admin)
  async getAllPosts(page = 0, size = 20): Promise<ApiResponse<BlogPostPage>> {
    const res = await adminApiClient.get('/blog/admin/posts', {
      params: { page, size }
    })
    return res.data
  },

  // Get post by ID (admin)
  async getPostById(id: number): Promise<ApiResponse<BlogPost>> {
    const res = await adminApiClient.get(`/blog/admin/posts/${id}`)
    return res.data
  },

  // Create post (admin)
  async createPost(data: CreateBlogPostRequest): Promise<ApiResponse<BlogPost>> {
    const res = await adminApiClient.post('/blog/admin/posts', data)
    return res.data
  },

  // Update post (admin)
  async updatePost(id: number, data: UpdateBlogPostRequest): Promise<ApiResponse<BlogPost>> {
    const res = await adminApiClient.put(`/blog/admin/posts/${id}`, data)
    return res.data
  },

  // Delete post (admin)
  async deletePost(id: number): Promise<ApiResponse<void>> {
    const res = await adminApiClient.delete(`/blog/admin/posts/${id}`)
    return res.data
  },

  // Get pending comments (admin)
  async getPendingComments(page = 0, size = 20): Promise<ApiResponse<BlogPostPage>> {
    const res = await adminApiClient.get('/blog/admin/comments/pending', {
      params: { page, size }
    })
    return res.data
  },

  // Moderate comment (admin)
  async moderateComment(
    commentId: number,
    status: CommentStatus
  ): Promise<ApiResponse<BlogComment>> {
    const res = await adminApiClient.patch(`/blog/admin/comments/${commentId}/status`, { status })
    return res.data
  },

  // Delete comment (admin)
  async deleteComment(commentId: number): Promise<ApiResponse<void>> {
    const res = await adminApiClient.delete(`/blog/admin/comments/${commentId}`)
    return res.data
  },

  // ==================== Categories & Tags (public/cached) ====================

  // Get all categories (public)
  async getCategories(): Promise<ApiResponse<BlogCategory[]>> {
    const res = await apiClient.get('/blog/categories')
    return res.data
  },

  // Get all tags (public)
  async getTags(): Promise<ApiResponse<BlogTag[]>> {
    const res = await apiClient.get('/blog/tags')
    return res.data
  }
}
