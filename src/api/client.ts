import axios from 'axios'

/**
 * Base URL phải kết thúc bằng /api vì mọi route backend là /api/...
 * (vd POST /vocabulary/quick-translate → gọi đầy đủ .../api/vocabulary/quick-translate).
 */
function resolveApiBase(): string {
  const fallback = 'http://localhost:8080/api'
  const raw = import.meta.env.VITE_API_BASE_URL?.trim()
  if (!raw) return fallback

  const t = raw.replace(/\/+$/, '')
  if (/\/api$/i.test(t)) return t

  // Chỉ origin + port, chưa có path → thêm /api (mọi host: dev, LAN, production)
  if (/^https?:\/\/[^/]+$/i.test(t)) {
    return `${t}/api`
  }

  return t
}

const API_BASE_URL = resolveApiBase()

/**
 * Không đặt Content-Type mặc định là application/json — FormData cần boundary do trình duyệt/axios tự gắn.
 * Với object JSON, interceptor bên dưới sẽ gắn application/json.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const data = config.data
  if (data instanceof FormData) {
    const h = config.headers
    if (h && typeof (h as { delete?: (key: string) => void }).delete === 'function') {
      ;(h as { delete: (key: string) => void }).delete('Content-Type')
      ;(h as { delete: (key: string) => void }).delete('content-type')
    } else {
      const plain = h as Record<string, unknown> | undefined
      if (plain) {
        delete plain['Content-Type']
        delete plain['content-type']
      }
    }
    return config
  }

  if (
    data !== undefined &&
    data !== null &&
    typeof data === 'object' &&
    !(data instanceof URLSearchParams) &&
    !(data instanceof ArrayBuffer) &&
    !(data instanceof Blob)
  ) {
    config.headers['Content-Type'] = 'application/json'
  }

  return config
})
