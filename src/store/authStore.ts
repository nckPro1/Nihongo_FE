import { create } from 'zustand'
import { authService } from '../api/services/authService'
import type { AuthUser, GoogleCodeLoginPayload, GoogleLoginPayload, LoginPayload, RegisterPayload } from '../types/auth'

type AuthState = {
  token: string | null
  user: AuthUser | null
  loading: boolean
  initialized: boolean
  setAuth: (token: string, user: AuthUser) => void
  setUser: (user: AuthUser) => void
  logout: () => void
  initialize: () => Promise<void>
  login: (payload: LoginPayload) => Promise<void>
  loginWithGoogle: (payload: GoogleLoginPayload) => Promise<void>
  loginWithGoogleCode: (payload: GoogleCodeLoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
}

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem(TOKEN_KEY),
  user: getStoredUser(),
  loading: false,
  initialized: false,

  setAuth: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ token, user })
  },

  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ user })
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ token: null, user: null })
  },

  initialize: async () => {
    const token = get().token
    if (!token) {
      set({ initialized: true })
      return
    }
    try {
      const response = await authService.me()
      localStorage.setItem(USER_KEY, JSON.stringify(response.data))
      set({ user: response.data, initialized: true })
    } catch {
      get().logout()
      set({ initialized: true })
    }
  },

  login: async (payload) => {
    set({ loading: true })
    try {
      const response = await authService.login(payload)
      get().setAuth(response.data.token, response.data.user)
    } finally {
      set({ loading: false })
    }
  },

  loginWithGoogle: async (payload) => {
    set({ loading: true })
    try {
      const response = await authService.loginWithGoogle(payload)
      get().setAuth(response.data.token, response.data.user)
    } finally {
      set({ loading: false })
    }
  },

  loginWithGoogleCode: async (payload) => {
    set({ loading: true })
    try {
      const response = await authService.loginWithGoogleCode(payload)
      get().setAuth(response.data.token, response.data.user)
    } finally {
      set({ loading: false })
    }
  },

  register: async (payload) => {
    set({ loading: true })
    try {
      await authService.register(payload)
    } finally {
      set({ loading: false })
    }
  },
}))
