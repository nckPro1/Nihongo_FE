import { adminApiClient } from '../adminClient'
import type {
  AdminDashboardStats,
  AdminUserPage,
  ApiResponse,
  LoginData,
  LoginPayload,
} from '../../types/admin'
import type { AuthUser } from '../../types/auth'

export const adminService = {
  async login(payload: LoginPayload): Promise<ApiResponse<LoginData>> {
    const { data } = await adminApiClient.post<ApiResponse<LoginData>>('/admin/auth/login', payload)
    return data
  },

  async me(): Promise<ApiResponse<AuthUser>> {
    const { data } = await adminApiClient.get<ApiResponse<AuthUser>>('/admin/auth/me')
    return data
  },

  async dashboardStats(): Promise<ApiResponse<AdminDashboardStats>> {
    const { data } = await adminApiClient.get<ApiResponse<AdminDashboardStats>>('/admin/dashboard/stats')
    return data
  },

  async listUsers(page: number, size: number): Promise<ApiResponse<AdminUserPage>> {
    const { data } = await adminApiClient.get<ApiResponse<AdminUserPage>>('/admin/users', {
      params: { page, size },
    })
    return data
  },

  async setUserActive(userId: string, active: boolean): Promise<ApiResponse<null>> {
    const { data } = await adminApiClient.patch<ApiResponse<null>>(`/admin/users/${userId}/active`, { active })
    return data
  },
}
