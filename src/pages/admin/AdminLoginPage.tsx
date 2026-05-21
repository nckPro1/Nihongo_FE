import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuthStore } from '../../store/adminAuthStore'
import './admin.css'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const login = useAdminAuthStore((s) => s.login)
  const loading = useAdminAuthStore((s) => s.loading)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login({ email: email.trim(), password })
      navigate('/admin/dashboard', { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập thất bại'
      setError(msg)
    }
  }

  return (
    <div className="admin-shell admin-login">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-logo">禅</div>
          <h1>Zenigo Admin</h1>
          <p className="admin-muted">
            Đăng nhập vào trang quản trị để quản lý người dùng, nội dung và thống kê
          </p>
        </div>
        {error ? <p className="admin-err">{error}</p> : null}
        <form onSubmit={(e) => void onSubmit(e)}>
          <div className="admin-field">
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              placeholder="admin@zenigo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="admin-field">
            <label htmlFor="admin-password">Mật khẩu</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="admin-btn" disabled={loading}>
            {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  )
}
