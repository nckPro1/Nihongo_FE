import axios from 'axios'
import { create } from 'zustand'
import { ADMIN_TOKEN_KEY, ADMIN_USER_KEY } from '../api/adminClient'
import { adminService } from '../api/services/adminService'
import type { AuthUser } from '../types/auth'
import type { LoginPayload } from '../types/auth'

type AdminAuthState = {
  token: string | null
  user: AuthUser | null
  loading: boolean
  initialized: boolean
  setAuth: (token: string, user: AuthUser) => void
  logout: () => void
  initialize: () => Promise<void>
  login: (payload: LoginPayload) => Promise<void>
}

const readStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(ADMIN_USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
  token: localStorage.getItem(ADMIN_TOKEN_KEY),
  user: readStoredUser(),
  loading: false,
  initialized: false,

  setAuth: (token, user) => {
    localStorage.setItem(ADMIN_TOKEN_KEY, token)
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user))
    set({ token, user })
  },

  logout: () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    localStorage.removeItem(ADMIN_USER_KEY)
    set({ token: null, user: null })
  },

  initialize: async () => {
    const token = get().token
    if (!token) {
      set({ initialized: true })
      return
    }
    try {
      const res = await adminService.me()
      if (res.success && res.data) {
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(res.data))
        set({ user: res.data, initialized: true })
      } else {
        get().logout()
        set({ initialized: true })
      }
    } catch {
      get().logout()
      set({ initialized: true })
    }
  },

  login: async (payload) => {
    set({ loading: true })
    try {
      const res = await adminService.login(payload)
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Đăng nhập thất bại')
      }
      get().setAuth(res.data.token, res.data.user)
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const msg = (e.response?.data as { message?: string } | undefined)?.message
        throw new Error(msg || 'Đăng nhập thất bại')
      }
      throw e
    } finally {
      set({ loading: false })
    }
  },
}))
