import axios from 'axios'
import { apiClient } from './client'

/**
 * Client gọi /api/admin/** — token lưu riêng {@link ADMIN_TOKEN_KEY}, không dùng chung session học viên.
 */
export const ADMIN_TOKEN_KEY = 'admin_token'
export const ADMIN_USER_KEY = 'admin_user'

export const adminApiClient = axios.create({
  baseURL: apiClient.defaults.baseURL,
})

adminApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  const data = config.data
  if (
    data !== undefined &&
    data !== null &&
    typeof data === 'object' &&
    !(data instanceof FormData) &&
    !(data instanceof URLSearchParams) &&
    !(data instanceof ArrayBuffer) &&
    !(data instanceof Blob)
  ) {
    config.headers['Content-Type'] = 'application/json'
  }
  return config
})
