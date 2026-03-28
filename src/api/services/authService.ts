import { apiClient } from '../client'
import type {
  ApiResponse,
  AuthUser,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  GoogleCodeLoginPayload,
  GoogleLoginPayload,
  LoginData,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  TransactionItem,
  UpdateProfilePayload,
} from '../../types/auth'

export const authService = {
  async login(payload: LoginPayload): Promise<ApiResponse<LoginData>> {
    const { data } = await apiClient.post<ApiResponse<LoginData>>('/auth/login', payload)
    return data
  },

  async register(payload: RegisterPayload): Promise<ApiResponse<AuthUser>> {
    const { data } = await apiClient.post<ApiResponse<AuthUser>>('/auth/register', payload)
    return data
  },

  async loginWithGoogle(payload: GoogleLoginPayload): Promise<ApiResponse<LoginData>> {
    const { data } = await apiClient.post<ApiResponse<LoginData>>('/auth/google', payload)
    return data
  },

  async loginWithGoogleCode(payload: GoogleCodeLoginPayload): Promise<ApiResponse<LoginData>> {
    const { data } = await apiClient.post<ApiResponse<LoginData>>('/auth/google/code', payload)
    return data
  },

  async me(): Promise<ApiResponse<AuthUser>> {
    const { data } = await apiClient.get<ApiResponse<AuthUser>>('/auth/me')
    return data
  },

  async uploadAvatar(file: File): Promise<ApiResponse<AuthUser>> {
    const form = new FormData()
    form.append('file', file, file.name)
    const { data } = await apiClient.post<ApiResponse<AuthUser>>('/users/me/avatar', form)
    return data
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<AuthUser>> {
    const { data } = await apiClient.patch<ApiResponse<AuthUser>>('/users/me', payload)
    return data
  },

  async changePassword(payload: ChangePasswordPayload): Promise<ApiResponse<null>> {
    const { data } = await apiClient.post<ApiResponse<null>>('/users/me/change-password', payload)
    return data
  },

  async getTransactions(): Promise<ApiResponse<TransactionItem[]>> {
    const { data } = await apiClient.get<ApiResponse<TransactionItem[]>>('/users/me/transactions')
    return data
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<ApiResponse<null>> {
    const { data } = await apiClient.post<ApiResponse<null>>('/auth/forgot-password', payload)
    return data
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse<null>> {
    const { data } = await apiClient.post<ApiResponse<null>>('/auth/reset-password', payload)
    return data
  },
}
