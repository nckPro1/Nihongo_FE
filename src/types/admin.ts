import type { ApiResponse, AuthUser, LoginPayload } from './auth'

export interface LoginData {
  token: string
  user: AuthUser
}

export interface AdminDashboardStats {
  totalUsers: number
  activeUsers: number
}

export interface AdminUserRow {
  id: string
  email: string
  name: string
  role: string
  jlptLevel: string | null
  active: boolean
  emailVerified: boolean
  createdAt: string
}

export interface AdminUserPage {
  content: AdminUserRow[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export type { ApiResponse, LoginPayload }
