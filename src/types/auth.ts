export interface AuthUser {
  id: string
  email: string
  name: string
  /** URL ảnh đại diện; có thể null/undefined nếu chưa có */
  avatar?: string | null
  jlptLevel?: string | null
  /** Có thể đăng nhập bằng mật khẩu (đã đặt mật khẩu) */
  hasPassword?: boolean
  role: string
  isPro: boolean
}

export interface TransactionItem {
  id: string
  description: string
  amount: string
  status: string
  createdAt?: string | null
}

export interface UpdateProfilePayload {
  name?: string
  jlptLevel?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface LoginPayload {
  email: string
  password: string
}

export interface GoogleLoginPayload {
  idToken: string
}

export interface GoogleCodeLoginPayload {
  code: string
  redirectUri: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  password: string
  confirmPassword: string
}

export interface LoginData {
  token: string
  user: AuthUser
}
